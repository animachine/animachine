'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var Keyline = require('./Keyline');
var Options = require('./Options');

function Param(opt) {

    EventEmitter.call(this);

    this.keyline = new Keyline();
    this.options = new Options();
}

inherits(Param, EventEmitter);
var p = Param.prototype;
module.exports = Param;
