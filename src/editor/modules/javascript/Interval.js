'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function Interval(opt) {

    EventEmitter.call(this);

    this._lineH =  21;
    this._start = 0;
    this._end = am.timeline.length;

    this._onDragResize = this._onDragResize.bind(this);
    this._onDragMove = this._onDragMove.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);

    this._createDomElem();
    this._refreshDomElem();

    am.timeline.on('changeTime', this._onChangeTime);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Interval, EventEmitter);
var p = Interval.prototype;









Object.defineProperties(p, {

    start: {
        set: function (v) {

            if (this._start === v) return;

            this._start = v;

            this._refreshDomElem();
        },
        get: function () {
            
            return this._start;
        }
    },
    end: {
        set: function (v) {

            if (this._end === v) return;

            this._end = v;

            this._refreshDomElem();
        },
        get: function () {
            
            return this._end;
        }
    },
});





p.getSave = function () {

    var save = {
        start: this.start,
        end: this.end,
    };

    return save;
};

p.useSave = function(save) {

    if ('start' in save) this.start = save.start;
    if ('end' in save) this.end = save.end;
};












p._onChangeTime = function () {

    this._refreshDomElem();
};

p._onDragResize = function () {

    //TODO
};

p._onDragMove = function () {

    //TODO
};








p._refreshDomElem = function () {

    this.domElem.style.left = this.start * am.timeline.timescale + 'px';
    this.domElem.style.width = (this.end - this.start) * am.timeline.timescale + 'px';
};








p._createDomElem = function () {

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'blue';
    de.style.position = 'relative';

    createHandler('left');
    createHandler('right');

    this.domElem = de;

    amgui.bindDropdown({
        asContextMenu: true,
        deTarget: de,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'split here'},
                {text: 'remove'}
            ]
        }),
        onSelect: function () {
            //TODO
            am.dialogs.featureDoesntExist.show();
        }
    });

    function createHandler(side) {

        var handler = document.createElement('div');
        handler.style.position = 'absolute';
        handler.style.top = '0px';
        handler.style[side] = '0px';
        handler.style.height = '100%';
        handler.style.width = '3px';
        handler.style.cursor = 'ew-resize';
        handler.style.pointerEvents = 'auto';
        de.appendChild(handler);
    }
};



p.dispose = function () {

    //TODO
};

module.exports = Interval;
