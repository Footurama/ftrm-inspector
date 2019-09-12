import {LitElement, html} from '@polymer/lit-element';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

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
				if (typeof p.value === 'number') {
					p.value = p.value.toFixed(2);
				} else if (p.value === undefined) {
					p.value = 'undefined'
				} else if (typeof p.value === 'object') {
					p.value = JSON.stringify(p.value);
				}
				let found = false;
				const items = this.items.map((i) => {
					if (i.pipe !== p.pipe) return i;
					found = true;
					return p;
				});
				this.items = (found) ? items : [...items, p].sort((a, b) => {
					if (a.pipe < b.pipe) return -1;
					if (a.pipe > b.pipe) return 1;
					return 0;
				});
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
				<vaadin-grid-column path="timestamp" header="Received" resizable .flexGrow="${0}" .width="${'250px'}"></vaadin-grid-column>
				<vaadin-grid-filter-column path="pipe" header="Pipe" resizable .flexGrow="${3}"></vaadin-grid-filter-column>
				<vaadin-grid-column path="value" header="Value" .textAlign="${'end'}" resizable .flexGrow="${1}"></vaadin-grid-column>
			</vaadin-grid>
		`;
	}
}

customElements.define('my-app', MyApp);
