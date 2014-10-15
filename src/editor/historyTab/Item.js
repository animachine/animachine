'use strict';

var amgui = require('../amgui');

function Item() {

    this._createBase();

    this.domElem.addEventListener('click', function () {

        am.history.goto(this._rec.idx);

    }.bind(this));
}

var p = Item.prototype;
module.exports = Item;

p.setup = function (record) {

    this._rec = record;

    this._label.textContent = record.name;
    this._toggleState.setToggle(record.executed);
}

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '21px';
    this.domElem.style.background = amgui.color.bg1;

    this._toggleState = amgui.createToggleBtn({
        parent: this.domElem,
        iconOn: 'circle',
        iconOff: 'circle-empty',
    });

    this._label = amgui.createLabel({
        parent: this.domElem,
        flex: 1
    });
}