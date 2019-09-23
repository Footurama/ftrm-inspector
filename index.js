const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const esModuleMiddleware = require('@adobe/es-modules-middleware');

function check (opts) {
	if (opts.input.length !== 0) throw new Error('Inputs must not be specified');
	if (opts.output.length !== 0) throw new Error('Outputs must not be specified');
	if (opts.bind === undefined) opts.bind = {host: '::1', port: 3876};
	opts.input.push({pipe: '#', spy: true});
}

function factory (opts, input, output, log, ftrm) {
	const app = express();
	const srv = http.createServer(app);
	const io = socketio(srv);

	// Listen to changes on pipes
	const pipes = {};
	input[0].on('update', (value, timestamp, source) => {
		const pipe = source.event;
		const p = {pipe, timestamp, value};
		pipes[pipe] = p;
		io.emit('msg', 'pipe', p);
	});

	// Serve static files
	app.use(esModuleMiddleware.middleware({paths: {
		'/components': path.join(__dirname, 'ui', 'components'),
		'/node_modules': path.join(__dirname, 'ui', 'node_modules')
	}}));
	app.get('/', (req, res) => {
		res.sendFile(path.join(__dirname, 'ui', 'index.html'));
	});

	// Send current state to new connecting users
	io.on('connection', (socket) => {
		log.info(`Client connected: ${socket.conn.remoteAddr}`, 'a42266cf4bd04d48a1660e40a650b84e');
		Object.values(pipes).forEach((p) => socket.emit('msg', 'pipe', p));
		ftrm.ipc.send('multicast.discovery', 'discovery');
	});

	// Broadcast advertisements
	ftrm.ipc.subscribe(`unicast.${ftrm.id}.adv`);
	ftrm.ipc.on('adv', (obj) => {
		io.emit('msg', 'adv', obj);
	});

	srv.listen(opts.bind);
}

module.exports = {check, factory};
