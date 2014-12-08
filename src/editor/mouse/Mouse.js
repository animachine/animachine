'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');

function Mouse() {

    this.screenX = 0;
    this.screenY = 0;

    this._onMouseMove = this._onMouseMove.bind(this);

    window.addEventListener('mousemove', this._onMouseMove);
}

inherits(Mouse, EventEmitter);
var p = Mouse.prototype;

p._onMouseMove = function (e) {

    this.screenX = e.screenX;
    this.screenY = e.screenY;
} 


module.exports = Mouse;
