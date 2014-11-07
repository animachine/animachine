'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var KeyLine = require('./KeyLine');
var OptionLine = require('./OptionLine');

function Param(opt) {

    EventEmitter.call(this);

    this.keyLine = new KeyLine();
    this.optionLine = new OptionLine();
}

inherits(Param, EventEmitter);
var p = Param.prototype;
module.exports = Param;
