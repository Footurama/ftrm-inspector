import {LitElement, html} from '@polymer/lit-element';
import moment from 'moment';

moment.relativeTimeThreshold('ss', 5);

function getDelay (age) {
	if (age < 60000) return 1000;
	if (age < 360000) return 60000;
	return 3600000;
}

class FromNow extends LitElement {
	static get properties () {
		return {
			timestamp: {type: Number},
			age: {type: String}
		};
	}

	retrigger () {
		const age = Date.now() - this.timestamp;
		this.to = setTimeout(() => this.retrigger(), getDelay(age));
		this.age = this._timestamp.fromNow();
	}

	updated () {
		this._timestamp = moment(this.timestamp);
		if (this.to) clearTimeout(this.to);
		this.retrigger();
	}

	render () {
		return html`${this.age}`;
	}
}

customElements.define('from-now', FromNow);
