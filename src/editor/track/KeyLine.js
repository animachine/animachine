'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var defineCompactProperty = require('../utils/defineCompactProperty');

function KeyLine (opt, timeline) {

    EventEmitter.call(this);

    this.timeline = timeline;

    this._keys = [];
    this._height = amgui.LINE_HEIGHT;
    this._hidden = false;

    this.keyLooks = {
        line: {
            color: '#eee'
        },
        circle: {}
    };

    this._onDblClick = this._onDblClick.bind(this);
    this._onMouseDown = this._onMouseDown.bind(this);

    this._render = amgui.delayWithRAF(this._render, this);

    this._createDomElem();

    var dropdownBinding = amgui.bindDropdown({
        deTarget: this._canvas,
        asContextMenu: true,
        onOpening: function (e) {

            var key = this.getKeyUnderPos(e.x),
                dropdown = key && key.getDropdown();

            if (dropdown) {

                dropdownBinding.setDropdown(dropdown);
            }
            else {
                return false;
            }
        }.bind(this),
    });

    amgui.callOnAdded(this.domElem, () => this._render());
}

inherits(KeyLine, EventEmitter);
var p = KeyLine.prototype;
module.exports = KeyLine;


p.wake = function () {

    this.timeline.on(['changeTape'], this._render, this);

    _.invoke(this._keys, 'wake');

    this._render();
};

p.sleep = function () {

    this.timeline.off(['changeTape'], this._render, this);

    _.invoke(this._keys, 'sleep');
};




Object.defineProperties(p, {

    keyCount: {

        get: function () {

            return this._keys.length;
        }
    },
    hidden: {
        set: function (v) {

            v = !!v;

            if (v === this._hidden) return;

            this._hidden = v;

            this.domElem.style.display = v ? 'none' : '';
        },
        get: function () {

            return this._hidden;
        }
    },
});



defineCompactProperty(p, [
    {name: 'bgHighlight', type: 'boolean', onChange: function (v) {
        this._canvas.style.backgroundColor = v ? amgui.color.bg1 : amgui.color.bg0;
    }}
]);



p.addKey = function (key) {

    this._keys.push(key);
    key.parentKeyLine = this;
    key.wake();

    am.history.save({
        undo: () => this.removeKey(key),
        redo: () => this.addKey(key),
        name: 'add key',
    });

    key.on(['change.value', 'change.time'], this._onChangeKeyValue, this);
    key.on(['need.render', 'select', 'deselect', 'change.time', 'change.ease'], this._onKeyNeedRender, this);
    key.on('need.remove', this._onKeyNeedRemove, this);

    this._render();
    this.emit('change.keys');
};

p.removeKey = function (key) {

    if(!_.include(this._keys, key)) return false;

    _.pull(this._keys, key);
    key.sleep();
    key.parentKeyLine = undefined;

    am.history.save({
        undo: () => this.addKey(key),
        redo: () => this.removeKey(key),
        name: 'remove key',
    });

    key.off(['change.value', 'change.time'], this._onChangeKeyValue, this);
    key.off(['need.render', 'select', 'deselect', 'change.time', 'change.ease'], this._onKeyNeedRender, this);
    key.off('need.remove', this._onKeyNeedRemove, this);

    this._render();
    this.emit('change.keys');

    return true;
};

p.forEachKeys = function (fn, thisArg) {

    this._keys.forEach(fn, thisArg);
};

p.getKeyByTime = function (time) {

    return this._keys.find(key => key.time === time);
};

p.getPrevKey = function (time) {

    var retKey;

    this._keys.forEach(function(key) {

        if (key.time < time && (!retKey || retKey.time < key.time)) {

            retKey = key;
        }
    });

    return retKey;
};

p.getNextKey = function (time) {

    var retKey;

    this._keys.forEach(function(key) {

        if (key.time > time && (!retKey || retKey.time > key.time)) {

            retKey = key;
        }
    });

    return retKey;
};

p.getClosestKey = function (time) {

    var retKey, retDist;

    this._keys.forEach(function(key) {

        var dist = Math.abs(time - key.time);

        if (!retKey || retDist > dist) {

            retDist = dist;
            retKey = key;
        }
    });

    return retKey;
};

p.getKeyUnderPos = function (x) {

    var time = this.timeline.screenXToTime(x),
        key = this.getClosestKey(time);

    if (key && (Math.abs(time - key.time) * this.timeline.timescale) < 4) {

        return key;
    }
};

p.getKeyTimes = function () {

    return _.pluck(this._keys, 'time');
};









p._render = function () {

    if (this._skipRender || this.hidden) return;

    var canvas = this._canvas,
        ctx = this._ctx;

    canvas.width = this.timeline.width;
    canvas.height = this._height;

    _.sortBy(this._keys, 'time').forEach(key => key.renderToLine(ctx));
};








p._onChangeKeyValue = function () {

    this.emit('change.keys');
};

p._onKeyNeedRender = function () {

    this._render();
};

p._onKeyNeedRemove = function (key) {

    this.removeKey(key);
};

p._onDblClick = function (e) {

    var time = this.timeline.screenXToTime(e.screenX),
        key = this.getNextKey(time);

    if (key) {
        this.timeline.inlineEaseEditor.show({key});
    }
};

p._onMouseDown = function (e) {

    var key = this.getKeyUnderPos(e.screenX);

    if (key) {
        key.grab(e);
    }
};












p._createDomElem = function createKeyline() {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.position = 'relative';
    this.domElem.setAttribute('debug-keyline', 1);
    this.domElem.style.overflow = 'hidden';


    //TODO remove _deLine if it's doesn't needed;
    this._deLine = document.createElement('div');
    this._deLine.style.position = 'relative';
    this._deLine.style.width = '100%';
    this._deLine.style.height = this._height + 'px';
    this.domElem.appendChild(this._deLine);

    this._canvas = document.createElement('canvas');
    this._canvas.style.position = 'absolute';
    this._deLine.appendChild(this._canvas);
    this._ctx = this._canvas.getContext('2d');

    amgui.createSeparator({parent: this._deLine});

    this._canvas.addEventListener('dblclick', this._onDblClick);
    this._canvas.addEventListener('mousedown', this._onMouseDown);
};

p.dispose = function () {
    //TODO
};
