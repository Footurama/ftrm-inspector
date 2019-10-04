const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const esModuleMiddleware = require('@adobe/es-modules-middleware');

const pkgInfo = require('./package.json');
const name = pkgInfo.name;
const url = pkgInfo.homepage;

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
		const p = {...source, timestamp, value};
		pipes[source.pipe] = p;
		io.emit('msg', 'pipe', p);
	});

	// Listen to advertisements
	const advs = {};
	ftrm.ipc.subscribe(`unicast.${ftrm.id}.adv`);
	ftrm.ipc.on('adv', (obj) => {
		advs[obj.nodeId] = obj;
		io.emit('msg', 'adv', obj);
		console.log('NEW', obj);
	});

	// Keep track of added and removed nodex
	ftrm.on('nodeAdd', (n) => {
		setTimeout(() => ftrm.ipc.send(`unicast.${n.id}.discovery`, 'discovery'), 500);
	});
	ftrm.on('nodeRemove', (n) => {
		delete advs[n.id];
		io.emit('msg', 'nodeRemove', n);
	});
	ftrm.ipc.send(`unicast.${ftrm.id}.discovery`, 'discovery');

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
		log.info(`Client connected: ${socket.conn.remoteAddress}`, 'a42266cf4bd04d48a1660e40a650b84e');
		Object.values(pipes).forEach((p) => socket.emit('msg', 'pipe', p));
		Object.values(advs).forEach((a) => socket.emit('msg', 'adv', a));
	});

	srv.listen(opts.bind);
}

module.exports = {name, url, check, factory};
