'use strict';

var amgui = require('../amgui');
var Item = require('./Item');

function HistoryTab() {

    this._onHistoryChage = this._onHistoryChage.bind(this);

    this._items = [];

    this._createBase();

    am.history.on('change', this._onHistoryChage);
}

var p = HistoryTab.prototype;
module.exports = HistoryTab;

p._addItem = function () {

    this._items.push(new Item());
}

p._removeItem = function (item) {

    var idx = this._items.indexOf(item);
    
    if (item !== -1) {

        this._items.splice(idx, 1);

        if (item.domElem.parentNode) {

            item.domElem.parentNode.removeChild(item.domElem)
        }
    }
}

p._onHistoryChage = function () {

    var records = am.history.getRecords();

    records.forEach(function (rec, idx) {

        if (!this._items[idx]) {

            this._addItem();
        }

        this._items[idx].setup(rec);
    }, this);

    while (this._items.length > records.length) {

        this._removeItem(this.items[records.length]);
    }
}

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;
}