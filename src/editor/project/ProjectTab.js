'use strict';

var amgui = require('../amgui');
var OptionLine = require('../utils/OptionLine');

function ProjectTab() {

    this._createBase();
}

var p = ProjectTab.prototype;











p._refreshKeyButtons = function () {

    if (this._currTrack) {

        this._paramOptionLines.forEach(function (optionLine) {

            optionLine.refreshKey();
        });
    }
};







p._createBase = function () {

    var that = this;

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;
};

module.exports = ProjectTab;
