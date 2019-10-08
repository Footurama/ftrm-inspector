import {LitElement, html} from '@polymer/lit-element';
import {classMap} from 'lit-html/directives/class-map.js';
import {repeat} from 'lit-html/directives/repeat.js';

class NavBar extends LitElement {
	static get properties () {
		return {
			route: {type: Object},
			pipes: {type: Array},
			nodes: {type: Array},
			components: {type: Array}
		};
	}

	static get items () {
		return [
			{view: 'pipes', caption: 'Pipes', icon: 'oi-fork'},
			{view: 'nodes', caption: 'Nodes', icon: 'oi-puzzle-piece'}
		];
	}

	render () {
		const items = NavBar.items.map((i) => ({
			...i,
			classes: {active: this.route && this.route.view === i.view}
		}));
		return html`
			<link href="node_modules/open-iconic/font/css/open-iconic-bootstrap.css" rel="stylesheet">
			<link href="node_modules/bootstrap/dist/css/bootstrap.min.css" rel="stylesheet">

			<nav class="navbar navbar-expand navbar-dark bg-dark fixed-top">
				<a class="navbar-brand" href="#">FTRM Inspector</a>

				<ul class="navbar-nav mr-auto">
					${repeat(items, (i) => html`
						<li class="nav-item ${classMap(i.classes)}">
							<a class="nav-link" href="#${i.view}"><span class="oi ${i.icon}"></span> ${i.caption}</a>
						</li>
					`)}
				</ul>

				<span class="navbar-text">
					${this.nodes.length} nodes - ${this.components.length} components - ${this.pipes.length} pipes
				</span>
			</nav>
		`;
	}
}

customElements.define('nav-bar', NavBar);
