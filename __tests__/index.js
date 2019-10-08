const EventEmitter = require('events');

jest.mock('express');
const mockExpress = require('express');

jest.mock('http');
const mockHttp = require('http');

jest.mock('socket.io');
const mockSocketio = require('socket.io');

const inspector = require('../index.js');

const ftrmFactory = () => {
	const ftrm = new EventEmitter();
	const ipc = new EventEmitter();
	ipc.send = jest.fn();
	ipc.subscribe = jest.fn();
	ftrm.ipc = ipc;
	ftrm.id = 'abc';
	return ftrm;
};

describe('check', () => {
	test('enforce no inputs', () => {
		expect(() => inspector.check({
			input: [{}],
			output: []
		})).toThrowError('Inputs must not be specified');
	});

	test('enforce no inputs', () => {
		expect(() => inspector.check({
			input: [],
			output: [{}]
		})).toThrowError('Outputs must not be specified');
	});

	test('set default bind', () => {
		const opts = {
			input: [],
			output: []
		};
		inspector.check(opts);
		expect(opts.bind).toMatchObject({
			host: '::1',
			port: 3876
		});
	});

	test('set input', () => {
		const opts = {
			input: [],
			output: []
		};
		inspector.check(opts);
		expect(opts.input[0].pipe).toEqual('#');
		expect(opts.input[0].spy).toBe(true);
	});
});

describe('factory', () => {
	test('bind http port', () => {
		const bind = {};
		inspector.factory({bind}, [new EventEmitter()], [], {}, ftrmFactory());
		expect(mockExpress.mock.calls.length).toBe(1);
		expect(mockHttp.createServer.mock.calls[0][0]).toBe(mockExpress.mock.results[0].value);
		expect(mockSocketio.mock.calls[0][0]).toBe(mockHttp.createServer.mock.results[0].value);
		expect(mockHttp.createServer.mock.results[0].value.listen.mock.calls[0][0]).toBe(bind);
	});

	test('broadcast all incoming values', () => {
		const i = new EventEmitter();
		inspector.factory({}, [i], [], {}, ftrmFactory());
		const value = 123;
		const timestamp = 456789;
		const pipe = 'abc';
		const source = {pipe};
		const io = mockSocketio.mock.results[0].value;
		const onMsg = jest.fn();
		io.on('msg', onMsg);
		i.emit('update', value, timestamp, source);
		expect(onMsg.mock.calls[0][0]).toEqual('pipe');
		expect(onMsg.mock.calls[0][1]).toMatchObject({timestamp, value, pipe});
	});

	test('send all pipes to new connecting clients', () => {
		const i = new EventEmitter();
		const info = jest.fn();
		inspector.factory({}, [i], [], {info}, ftrmFactory());
		const value = 123;
		const timestamp = 456789;
		const pipe = 'abc';
		const source = {pipe};
		i.emit('update', value, timestamp, source);
		const io = mockSocketio.mock.results[0].value;
		const remoteAddress = '::123';
		const socket = {
			emit: jest.fn(),
			conn: {remoteAddress}
		};
		io.emit('connection', socket);
		expect(info.mock.calls[0][0]).toEqual(`Client connected: ${remoteAddress}`);
		expect(info.mock.calls[0][1]).toEqual('a42266cf4bd04d48a1660e40a650b84e');
		expect(socket.emit.mock.calls[0][0]).toEqual('msg');
		expect(socket.emit.mock.calls[0][1]).toEqual('pipe');
		expect(socket.emit.mock.calls[0][2]).toMatchObject({value, timestamp, pipe});
	});

	test('broadcast new components', () => {
		const ftrm = ftrmFactory();
		inspector.factory({}, [new EventEmitter()], [], {info: () => {}}, ftrm);
		const io = mockSocketio.mock.results[0].value;
		const onMsg = jest.fn();
		io.on('msg', onMsg);
		const adv = {
			nodeId: 'a',
			opts: {id: 'b'}
		};
		ftrm.ipc.emit('adv', adv);
		expect(onMsg.mock.calls[0][0]).toEqual('adv');
		expect(onMsg.mock.calls[0][1]).toBe(adv);
	});

	test('send all components to new connecting clients', () => {
		const ftrm = ftrmFactory();
		inspector.factory({}, [new EventEmitter()], [], {info: () => {}}, ftrm);
		const adv = {
			nodeId: 'a',
			opts: {id: 'b'}
		};
		ftrm.ipc.emit('adv', adv);
		const socket = {
			emit: jest.fn(),
			conn: {}
		};
		const io = mockSocketio.mock.results[0].value;
		io.emit('connection', socket);
		expect(socket.emit.mock.calls[0][0]).toEqual('msg');
		expect(socket.emit.mock.calls[0][1]).toEqual('adv');
		expect(socket.emit.mock.calls[0][2]).toBe(adv);
	});

	test('broadcast removed nodes', () => {
		const ftrm = ftrmFactory();
		inspector.factory({}, [new EventEmitter()], [], {info: () => {}}, ftrm);
		const io = mockSocketio.mock.results[0].value;
		const onMsg = jest.fn();
		io.on('msg', onMsg);
		const node = {};
		ftrm.emit('nodeRemove', node);
		expect(onMsg.mock.calls[0][0]).toEqual('nodeRemove');
		expect(onMsg.mock.calls[0][1]).toBe(node);
	});
});
