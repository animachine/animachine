'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../../amgui');

function Branch() {

    EventEmitter.call(this);

    this._onClick = this._onClick.bind(this);

    this._createBase();
}

inherits(Branch, EventEmitter);
var p = Branch.prototype;
module.exports = Branch;

p.setup = function (opt) {

    this._label.innerHTML = opt.domElem.nodeName;
    this.domElem.style.marginLeft = (opt.indent * 6) + 'px';
};




p._onClick = function () {

    this.emit('select');
}

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '21px';
    this.domElem.style.background = amgui.color.bg1;

    this.domElem.addEventListener('click', this._onClick);

    this._label = amgui.createLabel({
        parent: this.domElem,
        flex: 1
    });
};