import {LitElement, html} from '@polymer/lit-element';
import '@vaadin/vaadin-grid';
import '@vaadin/vaadin-grid/vaadin-grid-filter-column';

class PipeView extends LitElement {
	static get properties () {
		return {
			pipes: {type: Array}
		};
	}

	render () {
		return html`
			<style>
				vaadin-grid {
					height: 100%;
				}
			</style>
			<vaadin-grid .items="${this.pipes}">
				<vaadin-grid-column path="timestamp" header="Received" resizable .flexGrow="${0}" .width="${'250px'}"></vaadin-grid-column>
				<vaadin-grid-filter-column path="pipe" header="Pipe" resizable .flexGrow="${3}"></vaadin-grid-filter-column>
				<vaadin-grid-column path="value" header="Value" .textAlign="${'end'}" resizable .flexGrow="${1}"></vaadin-grid-column>
			</vaadin-grid>
		`;
	}
}

customElements.define('pipe-view', PipeView);
