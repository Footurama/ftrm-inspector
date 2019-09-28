import {LitElement, html} from '@polymer/lit-element';
import {repeat} from 'lit-html/directives/repeat.js';
import Popper from 'popper.js';
import '@kuscamara/code-sample';
import {github} from '@kuscamara/code-sample/themes/github.js';

const pipeRegExp = Symbol();

class ComponentDetail extends LitElement {
	static get properties () {
		return {
			node: {type: Object},
			component: {type: Object},
			pipes: {type: Array},
			nodes: {type: Array},
			sinkSouceList: {type: Array}
		};
	}

	getPipe (pipe) {
		const p = this.pipes.find((p) => p.pipe === pipe);
		return (p !== undefined) ? p.value : '';
	}

	showDst (pipe, target) {
		this.sinkSouceList = this.nodes.reduce((list, n) => {
			const nodeName = n.nodeName;
			const nodeId = n.nodeId;
			return list.concat(n.components.filter((c) => {
				return c.opts.input.find((i) => {
					if (!i.pipe || i.spy) return false;
					if (!i[pipeRegExp]) {
						i[pipeRegExp] = new RegExp('^' + i.pipe
							.replace(/\./g, '\\.')
							.replace(/\$/g, '\\$')
							.replace(/\+/g, '[^\\.]*')
							.replace(/#/g, '[^$]*') + '$');
					}
					return i[pipeRegExp].test(pipe);
				}) !== undefined;
			}).map((c) => ({
				nodeId,
				nodeName,
				componentId: c.opts.id,
				componentName: c.opts.name
			})));
		}, []);
		const poppover = this.shadowRoot.querySelector('#poppover');
		poppover.classList.remove('invisible');
		new Popper(target, poppover); // eslint-disable-line no-new
	}

	showSrc (pipe, target) {
		pipe = new RegExp('^' + pipe
			.replace(/\./g, '\\.')
			.replace(/\$/g, '\\$')
			.replace(/\+/g, '[^\\.]*')
			.replace(/#/g, '[^$]*') + '$');
		this.sinkSouceList = this.nodes.reduce((list, n) => {
			const nodeName = n.nodeName;
			const nodeId = n.nodeId;
			return list.concat(n.components.filter((c) => {
				return c.opts.output.find((o) => o.pipe && pipe.test(o.pipe)) !== undefined;
			}).map((c) => ({
				nodeId,
				nodeName,
				componentId: c.opts.id,
				componentName: c.opts.name
			})));
		}, []);
		const poppover = this.shadowRoot.querySelector('#poppover');
		poppover.classList.remove('invisible');
		new Popper(target, poppover); // eslint-disable-line no-new
	}

	hidePoppover (e) {
		this.sinkSouceList = [];
	}

	updated(changedProperties) {
		/* Trigger update manuelly ... the code component does not react to the changed template ... */
		if (!changedProperties.has('component')) return;
		this.shadowRoot.querySelector('code-sample')._updateContent();
	}

	render () {
		const classLink = (this.component.lib.name) ? html`
			<a class="text-muted" href="${this.component.lib.url}">[${this.component.lib.name}]</a>
		` : html``;
		return html`
			<link href="node_modules/open-iconic/font/css/open-iconic-bootstrap.css" rel="stylesheet">
			<link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">
			<style>
				table {
					margin: auto;
				}
				#poppover {
					position: absolute;
					top: 0px;
					left: 0px;
					margin-top: 3px;
					z-index: 999;
				}
				a {
					cursor: pointer;
				}
			</style>

			<div class="card text-center">
				<div class="card-header">
					<strong>${this.node.nodeName}:${this.component.opts.name}</strong>
					${classLink}
				</div>
				<div class="card-body">
					<h6>Inputs / Outputs</h6>
					<table style="margin-left: 0;">
						${repeat(this.component.opts.input, (i, n) => html`
							<tr>
								<td class="text-right pr-1 border-right">
									${(i.pipe) ? html`
										<a @click="${(e) => this.showSrc(i.pipe, e.target)}" class="badge badge-pill badge-light">
											<span class="oi oi-chevron-right"></span>
											${i.pipe}
										</a>
										<span class="badge badge-pill badge-dark">${this.getPipe(i.pipe)}</span>
									` : html`
										<span class="badge badge-pill badge-dark">${i.value}</span>
									`}
								</td>
								<td class="text-left pl-1">
									<span class="badge badge-pill badge-primary">${i.name || '[' + n + ']'}</span
								></td>
							</tr>
						`)}
					</table>
					<table style="margin-right: 0;">
						${repeat(this.component.opts.output, (o, n) => html`
							<tr>
								<td class="text-right pr-1 border-right">
									<span class="badge badge-pill badge-primary">${o.name || '[' + n + ']'}</span>
								</td>
								<td class="text-left pl-1">
									${(o.pipe) ? html`
										<span class="badge badge-pill badge-dark">${this.getPipe(o.pipe)}</span>
										<a @click="${(e) => this.showDst(o.pipe, e.target)}" class="badge badge-pill badge-light">
											${o.pipe}
											<span class="oi oi-chevron-right"></span>
										</a>
									` : html`
										<span class="badge badge-pill badge-dark">${o.value}</span>
									`}
								</td>
							</tr>
						`)}
					</table>

					<span class="shadow-sm list-group ${(this.sinkSouceList && this.sinkSouceList.length) ? 'visible' : 'invisible'}" id="poppover" @mouseleave="${this.hidePoppover}">
						${repeat(this.sinkSouceList || [], (i) => html`
							<a href="#nodes/${i.nodeId}/${i.componentId}" class="list-group-item list-group-item-action pt-1 pb-1" @click="${this.hidePoppover}">${i.nodeName}:${i.componentName}</a>
						`)}
					</span>
				</div>
				<div class="card-body">
					<h6>Options</h6>
					<code-sample type="json" class="text-left" .theme="${github}">
						<template preserve-content .innerHTML="${JSON.stringify(this.component.opts, null, '  ').replace(/\\n/g, '\n').replace(/\\t/g, '  ')}"></template>
					</code-sample>
				</div>
			</div>
		`;
	}
}

customElements.define('component-detail', ComponentDetail);
