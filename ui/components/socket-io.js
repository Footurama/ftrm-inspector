import {LitElement, html} from '@polymer/lit-element';

class SocketIO extends LitElement {
	constructor () {
		super();

		// Setup socket.io
		const script = document.createElement('script');
		script.setAttribute('type', 'text/javascript');
		script.setAttribute('src', '/socket.io/socket.io.js');
		this.appendChild(script);

		// Listen for events
		script.onload = () => {
			io.connect().on('msg', (type, data) => {
				const e = new CustomEvent('msg', {detail: {type, data}});
				this.dispatchEvent(e);
			});
		};
	}

	render () {
		return html``;
	}
}

customElements.define('socket-io', SocketIO);
