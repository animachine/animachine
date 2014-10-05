'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Copy(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this.icon = 'scissors';
    this.tooltip = 'copy to clipboard';
}

inherits(Copy, EventEmitter);
var p = Copy.prototype;

p.features = {
    save: true,
};

p.save = function (name, data) {

    window.prompt('Press CTRL+C, then ENTER', data);
};

module.exports = Copy;