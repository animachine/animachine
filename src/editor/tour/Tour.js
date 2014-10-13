'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Tour() {


}

inherits(Tour, EventEmitter);
var p = Tour.prototype;
module.exports = Tour;

p.createBase = function () {

	this.domElem = document.createElement('div');
	this.domElem.style.width = '100%';
	this.domElem.style.height = '100%';

	this._deHead = document.createElement('div');
	this._deHead.style.width = '100%';
	this._deHead.style.height = '23px';

	this._deState = amgui.createLabel({
		parent: this._deHead,
	});
	this._deState.style.flex = 1;

	this._btnPrev = amgui.createButon({
		parent: this._deHead,
		caption: 'prev',
	});
	this._deState.style.flex = 1;
}


