'use strict';

var amgui = require('../../../amgui');
var Input = require('./Input');

function ParamsTab() {

    this._drawers = [];
    this._inputs = [];

    this._onSelectTrack = this._onSelectTrack.bind(this);  
    this._onDeselectTrack = this._onDeselectTrack.bind(this);  
    this._onChangeTrack = this._onChangeTrack.bind(this);  
    this._onInputCreate = this._onInputCreate.bind(this);

    this._createBase();

    am.on('selectTrack', this._onSelectTrack);
    am.on('deselectTrack', this._onDeselectTrack);
}

var p = ParamsTab.prototype;

p._listenToTrack = function (track) {

    this._unlisten();

    this._currTrack = track;

    this._currTrack.on('change', this._onChangeTrack);

    this._refresh();
};

p._unlisten = function (track) {

    if (!this._currTrack) return;

    this._currTrack.removeListener('change', this._onChangeTrack);
};





p._onSelectTrack = function () {

    this._listenToTrack(am.selectedTrack);
};

p._onDeselectTrack = function () {

    this._unlisten();
};

p._onChangeTrack = function () {

    this._refresh();
};

p._onInputCreate = function (input) {

    if (this._currTrack) {
        this._currTrack.addParameter({name: input.name})
    }
};







p._refresh = function () {

    this._inputs.forEach(function (input) {

        var param = this._currTrack._getParameter(input.name);

        if (param) {
            input.setParam(param);
        }
        else {
            input.removeParam();
        }
    }, this);
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

    addInput('font-family', 'Font');
    addInput('font-size', 'Font');
    addInput('font-weight', 'Font');
    addInput('font-style', 'Font');
    addInput('font-variant', 'Font');
    addInput('text-transform', 'Font', {options: ['uppercase', 'lovercase', 'capitalise', 'none']});
    addInput('text-decoration', 'Font', {options: ['underline', 'overline', 'line-trough', 'none']});
    addInput('color', 'Font', {type: 'color'});

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

        input.on('create', that._onInputCreate);
        drawers[drawerName].deContent.appendChild(input.domElem);

        that._inputs.push(input);
    }
}


module.exports = ParamsTab;
