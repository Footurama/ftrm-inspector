import {LitElement, html} from '@polymer/lit-element';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-sort-column';

class MyApp extends LitElement {
	static get properties () {
		return {
			items: {type: Array}
		};
	}

	constructor () {
		super();
		const script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.setAttribute('src', '/socket.io/socket.io.js');
		this.appendChild(script);
		script.onload = () => {
			const socket = io.connect();
			socket.on('pipe', (p) => {
				p.timestamp = new Date(p.timestamp).toISOString();
				let found = false;
				const items = this.items.map((i) => {
					if (i.pipe !== p.pipe) return i;
					found = true;
					return p;
				});
				this.items = (found) ? items : [...items, p];
			});
		};
		this.items = [];
	}

	render () {
		return html`
			<style>
				vaadin-grid {
					height: 100%;
				}
			</style>
			<vaadin-grid .items="${this.items}">
				<vaadin-grid-sort-column path="timestamp" header="Received" resizable></vaadin-grid-sort-column>
				<vaadin-grid-sort-column path="pipe" header="Pipe" resizable></vaadin-grid-sort-column>
				<vaadin-grid-column path="value" header="Value" resizable></vaadin-grid-column>
			</vaadin-grid>
		`;
	}
}

customElements.define('my-app', MyApp);
