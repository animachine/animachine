'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../../amgui');
var qsgen = require('../../qsgen');

function Branch() {

    EventEmitter.call(this);

    this._onClick = this._onClick.bind(this);

    this._createBase();
}

inherits(Branch, EventEmitter);
var p = Branch.prototype;
module.exports = Branch;

p.setup = function (opt) {

    var qs = qsgen(opt.domElem);

    this.value = opt.domElem;
    
    this._label.innerHTML = qs;
    this._label.style.marginLeft = (opt.indent * 6) + 'px';
};




p._onClick = function () {

    this.emit('select', this);
}

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.position = 'relative';
    this.domElem.style.width = '100%';
    this.domElem.style.height = amgui.LINE_HEIGHT;

    amgui.createSeparator({parent: this.domElem});

    this.domElem.addEventListener('click', this._onClick);

    this._label = amgui.createLabel({
        parent: this.domElem,
        flex: 1
    });
};