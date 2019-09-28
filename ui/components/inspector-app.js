import {LitElement, html} from '@polymer/lit-element';
import Navigo from 'navigo';

import './socket-io.js';
import './nav-bar.js';
import './pipe-view.js';
import './node-view.js';

class InspectorApp extends LitElement {
	static get properties () {
		return {
			pipes: {type: Array},
			nodes: {type: Array},
			route: {type: Object}
		};
	}

	constructor () {
		super();

		// Setup routing
		const router = new Navigo(null, true, '#');
		router.on('nodes/:nodeId/:componentId', (params) => {
			this.route = {
				view: 'nodes',
				...params
			};
		}).on('nodes', () => {
			this.route = {
				view: 'nodes'
			};
		}).on('pipes', () => {
			this.route = {
				view: 'pipes'
			};
		}).on('*', () => {
			this.route = {
				view: 'pipes'
			};
		}).resolve();

		this.pipes = [];
		this.nodes = [];
	}

	updatePipe (p) {
		// Make value human-readable
		if (typeof p.value === 'number') {
			p.value = p.value.toFixed(2);
		} else if (p.value === undefined) {
			p.value = 'undefined';
		} else if (typeof p.value === 'object') {
			p.value = JSON.stringify(p.value);
		}

		// Update / insert pipe
		let found = false;
		const pipes = this.pipes.map((i) => {
			if (i.pipe !== p.pipe) return i;
			found = true;
			return p;
		});
		this.pipes = (found) ? pipes : [...pipes, p].sort((a, b) => {
			if (a.pipe < b.pipe) return -1;
			if (a.pipe > b.pipe) return 1;
			return 0;
		});
	}

	updateNode (n) {
		this.nodes = [...this.nodes, n];
	}

	handleMsg (e) {
		const {type, data} = e.detail;
		if (type === 'pipe') return this.updatePipe(data);
		if (type === 'adv') return this.updateNode(data);
	}

	render () {
		const main = (view) => {
			switch (view) {
				case 'pipes': return html`<pipe-view .pipes="${this.pipes}"></pipe-view>`;
				case 'nodes': return html`<node-view .pipes="${this.pipes}" .nodes="${this.nodes}" .route="${this.route}"></node-view>`;
			}
		};

		return html`
			<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
			<style>
				#main {
					margin-top: 56px;
				}
			</style>
			<nav-bar .route="${this.route}" .pipes="${this.pipes}" .nodes="${this.nodes}"></nav-bar>
			<div id="main" class="container-fluid">
				${main(this.route.view)}
			</div>
			<socket-io @msg="${this.handleMsg}"></socket-io>
		`;
	}
}

customElements.define('inspector-app', InspectorApp);
