import {LitElement, html} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat.js';
import './component-detail.js';

class NodeView extends LitElement {
	static get properties () {
		return {
			nodes: {type: Array},
			components: {type: Array},
			pipes: {type: Array},
			route: {type: Object}
		};
	}

	render () {
		let detail;
		if (this.route.nodeId && this.route.componentId && this.components.length) {
			const component = this.components.find((c) => c.opts.id === this.route.componentId);
			detail = html`<component-detail .component="${component}" .pipes="${this.pipes}" .components="${this.components}"></component-detail>`;
		} else {
			detail = html`<p class="text-muted">Please select a component ...</p>`;
		}

		return html`
			<link rel="stylesheet" href="node_modules/bootstrap/dist/css/bootstrap.min.css">
			<style>
				.ftrm-sidebar {
					position: sticky;
					overflow-y: auto;
					max-height: calc(100vh - 56px);
					min-height: calc(100vh - 56px);
					border-right: 1px solid rgba(0,0,0,.1);
				}
				.ftrm-node {
					font-weight: 600;
					margin-top: 16px;
					margin-bottom: 0px;
				}
			</style>

			<div class="container-fluid">
				<div class="row flex-xl-nowrap">
					<div class="col-12 col-3 col-md-3 col-xl-2 py-md-3 ftrm-sidebar">
						${repeat(this.nodes, (n) => html`
							<p class="ftrm-node"><a href="#nodes/${n.nodeId}" class="${(this.route.nodeId === n.nodeId) ? '' : 'text-dark'}">${n.nodeName}</a></p>
							${(this.route.nodeId === n.nodeId) ? html`
								<ul class="nav flex-column">
									${repeat(this.components.filter((c) => c.nodeName === n.nodeName), (c) => html`
										<li class="nav-item"><a href="#nodes/${n.nodeId}/${c.opts.id}" class="text-nowrap ${(this.route.componentId === c.opts.id) ? '' : 'text-dark'}">${c.opts.name}</a></li>
									`)}
								</ul>
							` : html``}
						`)}
					</div>
					<div class="col-12 col-9 col-md-9 col-xl-10 py-md-3 pl-md-5">
						${detail}
					</div>
				</div>
			</div>
		`;
	}
}

customElements.define('node-view', NodeView);
