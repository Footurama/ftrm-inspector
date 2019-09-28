import {LitElement, html} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat.js';
import './component-detail.js';

class NodeView extends LitElement {
	static get properties () {
		return {
			nodes: {type: Array},
			pipes: {type: Array},
			route: {type: Object}
		};
	}

	selectNode (e) {
		console.log(this.nodes, e.target.value);
		this.components = this.nodes[parseInt(e.target.value)].components;
	}

	selectComponent (e) {
		this.component = this.components[parseInt(e.target.value)];
	}

	render () {
		let detail;
		if (this.route.nodeId && this.nodes.length) {
			const node = this.nodes.find((n) => n.nodeId === this.route.nodeId);
			if (node) {
				const component = node.components.find((c) => c.opts.id === this.route.componentId);
				detail = html`<component-detail .node="${node}" .component="${component}" .pipes="${this.pipes}" .nodes="${this.nodes}"></component-detail>`;
			}
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
					margin-top: 28px;
					margin-bottom: 8px;
				}
			</style>

			<div class="container-fluid">
				<div class="row flex-xl-nowrap">
					<div class="col-12 col-3 col-md-3 col-xl-2 py-md-3 ftrm-sidebar">
						${repeat(this.nodes, (n) => html`
							<label class="ftrm-node">${n.nodeName}</label>
							<ul class="nav flex-column">
								${repeat(n.components, (c) => html`
									<li class="nav-item"><a href="#nodes/${n.nodeId}/${c.opts.id}" class="text-nowrap">${c.opts.name}</a></li>
								`)}
							</ul>
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
