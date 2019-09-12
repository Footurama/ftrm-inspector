import {LitElement, html} from '@polymer/lit-element';
import Navigo from 'navigo';

import '@vaadin/vaadin-tabs';
import './pipe-view.js';
import './node-view.js';

class InspectorApp extends LitElement {
	static get properties () {
		return {
			pipes: {type: Array},
			nodes: {type: Array},
			route: {type: String}
		};
	}

	constructor() {
		super();

		// Setup routing
		const router = new Navigo(null, true, "#");
		router.on('node-view/:nodeId/:componentId', (params) => {
			this.route = 'node-view';
		}).on('node-view', () => {
			this.route = 'node-view';
		}).on('*', () => {
			this.route = 'pipe-view';
		}).resolve();

		// Setup socket.io
		this.pipes = [];
		this.nodes = [];
		const script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.setAttribute('src', '/socket.io/socket.io.js');
		this.appendChild(script);
		script.onload = () => {
			io.connect().on('pipe', (p) => {
				// Convert timestamp to Date object
				p.timestamp = new Date(p.timestamp).toISOString();

				// Make value human-readable
				if (typeof p.value === 'number') {
					p.value = p.value.toFixed(2);
				} else if (p.value === undefined) {
					p.value = 'undefined'
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
			}).on('adv', (n) => {
				this.nodes = [...this.nodes, n];
			});
		};
	}

	go (e) {
		window.location.href = window.location.href
			.replace(new RegExp('#.*$'), '') + '#' + e.target.getAttribute('route');
	}

	static get tabs () {
		return [
			{title: 'Pipe View', route: 'pipe-view'},
			{title: 'Node View', route: 'node-view'}
		];
	}

	render() {
		let mainView;
		if (this.route === 'pipe-view') {
			mainView = html`<pipe-view .pipes="${this.pipes}"></pipe-view>`;
		} else if (this.route === 'node-view') {
			mainView = html`<node-view .pipes="${this.pipes}" .nodes="${this.nodes}"></node-view>`;
		}
		const selectedTab = InspectorApp.tabs.findIndex((t) => this.route === t.route);
		return html`
			<style>
				header {
					position: absolute;
					top: 0px;
					left: 0px;
					right: 0px;
					height: 50px;
				}
				main {
					position: absolute;
					top: 50px;
					left: 0px;
					right: 0px;
					bottom: 0px;
				}
			</style>
			<header>
				<vaadin-tabs selected="${selectedTab}">
					${InspectorApp.tabs.map((t) => html`<vaadin-tab route="${t.route}" @click="${this.go}">${t.title}</vaadin-tab>`)}
				</vaadin-tabs>
			</header>
			<main>
				${mainView}
			</main>
		`;
	}
}

customElements.define('inspector-app', InspectorApp);
