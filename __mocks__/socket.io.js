const EventEmitter = require('events');
module.exports = jest.fn(() => new EventEmitter());
