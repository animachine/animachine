'use strict';

var amgui = require('../amgui');

function Item() {

    if (!window.ci) window.ci = [];
    window.ci.push(this)

    this._createBase();

    this.domElem.addEventListener('click', function () {

        var idx = this._rec.executed ? this._rec.idx - 1 : this._rec.idx;
        am.history.goto(idx);

    }.bind(this));
}

var p = Item.prototype;
module.exports = Item;

p.setup = function (record) {

    this._rec = record;

    this._label.innerHTML = record.name;
    this._toggleState.setToggle(record.executed);
};

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '21px';
    this.domElem.style.background = amgui.color.bg1;

    this._toggleState = amgui.createToggleIconBtn({
        parent: this.domElem,
        iconOn: 'circle',
        iconOff: 'circle-thin',
    });

    this._label = amgui.createLabel({
        parent: this.domElem,
        flex: 1,
        caption: 'refsfsd' + Math.random()
    });
};