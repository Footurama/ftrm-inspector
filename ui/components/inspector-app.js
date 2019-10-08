import {LitElement, html} from '@polymer/lit-element';
import Navigo from 'navigo';

import './socket-io.js';
import './nav-bar.js';
import './pipe-view.js';
import './node-view.js';

function addOrUpdate (arr, newItem, cmpFn, sortFn) {
	let found = false;
	let a = arr.map((i) => {
		if (!cmpFn(newItem, i)) return i;
		found = true;
		return newItem;
	});
	if (!found) {
		a.push(newItem);
		if (sortFn) a = a.sort(sortFn);
	}
	return a;
}

class InspectorApp extends LitElement {
	static get properties () {
		return {
			pipes: {type: Array},
			nodes: {type: Array},
			components: {type: Array},
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
		}).on('nodes/:nodeId', (params) => {
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
		this.components = [];
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
		this.pipes = addOrUpdate(
			this.pipes,
			p,
			(a, b) => a.pipe === b.pipe,
			(a, b) => {
				if (a.pipe < b.pipe) return -1;
				if (a.pipe > b.pipe) return 1;
				return 0;
			}
		);
	}

	updateComponent (data) {
		// Add node if not present
		if (!this.nodes.find((n) => n.nodeId === data.nodeId)) {
			this.nodes = [...this.nodes, {
				nodeId: data.nodeId,
				nodeName: data.nodeName
			}];
		}

		// Update component
		this.components = addOrUpdate(
			this.components,
			data,
			(a, b) => a.opts.id === b.opts.id,
			(a, b) => {
				if (a.nodeName < b.nodeName) return -1;
				if (a.nodeName > b.nodeName) return 1;
				if (a.opts.name < b.opts.name) return -1;
				if (a.opts.name > b.opts.name) return 1;
				return 0;
			}
		);
	}

	removeNode (data) {
		this.nodes = this.nodes.filter((n) => n.nodeId === data.id);
		this.components = this.components.filter((c) => c.nodeId === data.id);
	}

	handleMsg (e) {
		const {type, data} = e.detail;
		if (type === 'pipe') return this.updatePipe(data);
		if (type === 'adv') return this.updateComponent(data);
		if (type === 'nodeRemove') return this.removeNode(data);
	}

	render () {
		const main = (view) => {
			switch (view) {
				case 'pipes': return html`<pipe-view .pipes="${this.pipes}"></pipe-view>`;
				case 'nodes': return html`<node-view .pipes="${this.pipes}" .nodes="${this.nodes}" .components="${this.components}" .route="${this.route}"></node-view>`;
			}
		};

		return html`
			<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
			<style>
				#main {
					margin-top: 56px;
				}
			</style>
			<nav-bar .route="${this.route}" .pipes="${this.pipes}" .nodes="${this.nodes}" .components="${this.components}"></nav-bar>
			<div id="main" class="container-fluid">
				${main(this.route.view)}
			</div>
			<socket-io @msg="${this.handleMsg}"></socket-io>
		`;
	}
}

customElements.define('inspector-app', InspectorApp);
