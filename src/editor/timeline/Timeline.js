var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Timeline() {

    this.domElem = document.createElement('div');
    this.domElem.style.backgroundColor = 'green';
}

inherits(Timeline, EventEmitter);

var p = Timeline.prototype;

module.exports = Timeline;