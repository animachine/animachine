'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../../amgui');

function Interval(opt) {

    EventEmitter.call(this);

    this._lineH =  21;
    this._start = 0;
    this._end = this.timeline.length;

    this._onDragResize = this._onDragResize.bind(this);
    this._onFinishResize = this._onFinishResize.bind(this);
    this._onDragMove = this._onDragMove.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);

    this._createDomElem();
    this._refreshDomElem();

    this.timeline.on('changeTime', this._onChangeTime);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Interval, EventEmitter);
var p = Interval.prototype;









Object.defineProperties(p, {

    start: {
        set: function (v) {

            v = parseInt(v);

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

            v = parseInt(v);

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

p.showNeighbours = function (neighbours) {

    this._neighbourIntervals = neighbours;
};










p._nextInterval = function () {

    return this.__neighbourInterval(true);
};

p._prevInterval = function () {

    return this.__neighbourInterval(false);
};

p.__neighbourInterval = function (forward) {

    var pos, neighbour;

    this._neighbourIntervals.forEach(function (interval) {

        var next = forward ? interval.start : interval.end;

        if (interval !== this && 
            (forward ? next > this.end : next < this.start) &&
            (pos === undefined || (forward === (pos > next))))
        {
            pos = next;
            neighbour = interval;
        }
    }, this);

    return neighbour;
};

p._remove = function () {

    this.emit('remove', this);
};










p._onChangeTime = function () {

    this._refreshDomElem();
};

p._onDragResize = function (md, mx) {

    var neighbour, 
        timePos = this.timeline.screenXToTime(mx);

    if (md.side === 'left') {

        neighbour = this._prevInterval();

        if (neighbour && timePos < neighbour.end) {

            timePos = neighbour.end;
        }

        this.start = timePos;
    }
    else {

        neighbour = this._nextInterval();

        if (neighbour && timePos > neighbour.start) {

            timePos = neighbour.start;
        }

        this.end = timePos;
    }
};

p._onFinishResize = function (md) {

    var neighbour;

    if (md.side === 'left') {

        neighbour = this._prevInterval();

        if (neighbour && neighbour.end === this.start) {

            neighbour.end = this.end;
            this._remove();
        }
    }
    else {

        neighbour = this._nextInterval();

        if (neighbour && neighbour.start === this.end) {

            neighbour.start = this.start;
            this._remove();
        }
    }
};

p._onDragMove = function (md, mx) {

    var timePos = this.timeline.screenXToTime(mx),
        move = timePos - md.timePos,
        nextInterval = this._nextInterval(),
        prevInterval = this._prevInterval();

    if (nextInterval && md.end + move > nextInterval.start) {

        move = nextInterval.start - md.end;
    }

    if (prevInterval && md.start + move < prevInterval.end) {

        move = prevInterval.end - md.start;
    }

    if (md.start + move < 0) {

        move = -md.start;
    }

    this.start = md.start + move;
    this.end = md.end + move;
};








p._refreshDomElem = function () {

    this.domElem.style.left = this.start * this.timeline.timescale + 'px';
    this.domElem.style.width = (this.end - this.start) * this.timeline.timescale + 'px';
};








p._createDomElem = function () {

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'blue';
    de.style.position = 'relative';

    createHandler.call(this, 'left');
    createHandler.call(this, 'right');

    this.domElem = de;

    amgui.makeDraggable({
        deTarget: de,
        thisArg: this,
        onDown: function (e) {
            return {
                start: this.start,
                end: this.end,
                timePos: this.timeline.screenXToTime(e.screenX)
            };
        },
        onMove: this._onDragMove,
    });

    amgui.bindDropdown({
        asContextMenu: true,
        deTarget: de,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'split here'},
                {text: 'remove'}
            ]
        }),
        onSelect: function (selection) {
            
            if (selection === 'split here') {

                this._remove();
            }
            else {
                am.dialogs.WIP.show();
            }
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

        amgui.makeDraggable({
            deTarget: handler,
            onDown: function () {
                return {
                    side: side
                };
            },
            onMove: this._onDragResize,
            onUp: this._onFinishResize,
            onEnter: function () {
                handler.style.background = 'white';
            },
            onLeave: function () {
                handler.style.background = '';
            }
        });
    }
};



p.dispose = function () {

    //TODO
};

module.exports = Interval;
