import {LitElement, html} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat.js';
import '@vaadin/vaadin-list-box';
import '@vaadin/vaadin-item';
import '@alenaksu/json-viewer';

class NodeView extends LitElement {
	static get properties () {
		return {
			nodes: {type: Array},
			components: {type: Array},
			component: {type: Object}
		};
	}

	constructor () {
		super();
	}

	selectNode (e) {
		console.log(this.nodes, e.target.value);
		this.components = this.nodes[parseInt(e.target.value)].components;
	}

	selectComponent (e) {
		this.component = this.components[parseInt(e.target.value)];
	}

	render () {
		return html`
			<style>
				#container {
					display: flex;
					flex-wrap: nowrap;
					height: 100%;
				}

				#selector {
					flex-basis: 30%;
				}

				#viewer {
					flex-basis: 70%;
					position: relative;
				}

				json-viewer {
					position: absolute;
					top: 0px;
					right: 0px;
					bottom: 0px;
					left: 5px;
				}

				.label {
					margin: 30px 0px 3px 3px;
					font-family: -apple-system, BlinkMacSystemFont, "Roboto", "Segoe UI", Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
				}
			</style>
			<div id="container">
				<div id="selector">
					<p class="label">Select node:</p>
					<vaadin-list-box @click="${this.selectNode}">
						${this.nodes.map((n, i) => html`<vaadin-item value="${i}">${n.nodeName}</vaadin-item>`)}
					</vaadin-list-box>
					${(this.components) && html`
						<p class="label">Select component:</p>
						<vaadin-list-box @click="${this.selectComponent}">
							${this.components.map((c, i) => html`<vaadin-item value="${i}">${c.opts.name}</vaadin-item>`)}
						</vaadin-list-box>
					`}
				</div>
				<div id="viewer">
					${(this.component) && html`
						<json-viewer .data="${this.component}"></json-viewer>
					`}
				</div>
			</div>
		`;
	}
}

customElements.define('node-view', NodeView);
