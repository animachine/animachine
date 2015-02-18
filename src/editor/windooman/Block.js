'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');

function Block(opt) {

    EventEmitter.call(this);

    this._createDomElem();

    this.size = opt.size || 1;
    this.scaleMode = opt.scaleMode || 'flex';
}

inherits(Block, EventEmitter);
var p = Block.prototype;
module.exports = Block;

Object.defineProperties(p, {

    size: {
        set: function (v) {

            if (typeof(v) !== 'number' || this._size === v) return;

            this._size = v;
            this._refresh();
            this.bubbleResize();
        },
        get: function () {

            return this._size;
        }
    },
    scaleMode: {
        set: function (v) {

            if (typeof(v) !== 'string' || this._scaleMode === v) return;

            this._scaleMode = v;
            this._refresh();
            this.bubbleResize();
        },
        get: function () {

            return this._scaleMode;
        }
    }
});

p.bubbleResize = function () {
    //for override
};

p.getBounds = function () {

    var br = this.domElem.getBoundingClientRect();
    return {x: br.left, y: br.top, w: br.width, h: br.height};
};

p._refresh = function () {

    var flex = '', width = '', height = '';

    if (this.scaleMode === 'fix') {

        if (this._direction === 'row') {

            width = this.size + 'px';
        }
        else {
            height = this.size + 'px';
        }
    }
    else if (this.scaleMode === 'flex') {

        flex = this.size;
    }

    this.domElem.style.width = width;
    this.domElem.style.height = height;
    this.domElem.style.flex = flex;
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'relative';
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.flex = '1';
    this.domElem.style.alignSelf = 'stretch';
    this.domElem.style.pointerEvents = 'none';

    this.domElem.setAttribute('data-debug', 'block');
};
