import {LitElement, html} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat.js';
import './from-now.js';

class PipeView extends LitElement {
	static get properties () {
		return {
			pipes: {type: Array},
			filter: {type: String}
		};
	}

	constructor () {
		super();
		this.filter = '';
	}

	updateFilter (e) {
		this.filter = e.target.value;
	}

	render () {
		const pipes = this.pipes.filter((p) => p.pipe.indexOf(this.filter) !== -1);
		return html`
			<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
			<style>
				form {
					padding-top: 28px;
				}
			</style>

			<form>
				<div class="form-group row">
					<label for="inputFilter" class="col-sm-3 col-form-label">Filter by pipe name</label>
					<div class="col-sm-9">
						<input type="text" class="form-control" id="inputFilter" @input="${this.updateFilter}">
					</div>
				</div>
			</form>

			<table class="table table-striped">
				<thead>
					<tr>
						<th scope="col" style="width: 15%">Last update</th>
						<th scope="col" style="width: 15%">Source</th>
						<th scope="col">Pipe</th>
						<th scope="col" style="text-align: right;">Value</th>
					</tr>
				</thead>
				<tbody>
					${repeat(pipes, (p) => html`
						<tr>
							<td><from-now .timestamp="${p.timestamp}"></from-now></td>
							<td><a href="#nodes/${p.nodeId}/${p.componentId}">${p.nodeName}:${p.componentName}</a></td>
							<td>${p.pipe}</td>
							<td style="text-align: right;">${p.value}</td>
						</tr>
					`)}
				</tbody>
			</table>
		`;
	}
}

customElements.define('pipe-view', PipeView);
