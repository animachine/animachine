'use strict';

var amgui = require('../../../amgui');
var Input = require('./Input');

function ParamsTab() {

    this._drawers = [];
    this._inputs = [];

    this._createBase();

    this._onChangeTrack = this._onChangeTrack.bind(this);  
}

var p = ParamsTab.prototype;

p._listenToTrack = function (track) {

    this._unlistenToTrack();

    this._currTrack = track;

    this._currTrack.on('change', this._onChangeTrack);

    this._refresh();
};

p._unlistenToTrack = function (track) {

    if (!this._currTrack) return;

    this._currTrack.removeListener('change', this._onChangeTrack);
};





p._onChangeTrack = function () {

    this._refresh();
};







p._refresh = function () {

    this._inputs.forEach(function (input) {

        var param = track._getParameter(input.name);

        input.currParam = param;
    });
};








p._createBase = function () {

    var that = this;

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;

    this._scrollCont = document.createElement('div');
    this._scrollCont.style.width = '100%';
    this.domElem.appendChild(this._scrollCont);

    amgui.makeScrollable({
        deCont: this.domElem,
        deTarget: this._scrollCont
    });

    var drawers = {};

    addDrawer('Text');
    addDrawer('Font');
    addDrawer('Border');
    addDrawer('Background');
    addDrawer('Transform');
    addDrawer('Layout');

    addInput('color', 'Text');

    function addDrawer(name) {

        var drawer = drawers[name] = amgui.createDrawer({
            text: name,
            parent: that._scrollCont
        });
    }

    function addInput(name, drawerName) {

        var input;

        switch (name) {

            default:
                input = new Input({name: name});
        }

        drawers[drawerName].deContent.appendChild(input.domElem);
    }
}


module.exports = new ParamsTab();
