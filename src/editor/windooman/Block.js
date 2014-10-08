'use strict';

function Block(opt) {

    this._createDomElem();

    this.size = opt.size;
    this.scaleMode = opt.scaleMode;
}

var p = Block.prototype;

Object.defineProperties(p, {

    size: {
        set: function (v) {

            if (this._size === v) return;

            this._size = v;
            this._refresh();
        },
        get: function () {

            return this._size;
        }
    },
    scaleMode: {
        set: function (v) {

            if (this._scaleMode === v) return;

            this._scaleMode = v;
            this._refresh();
        },
        get: function () {

            return this._scaleMode;
        }
    }
});

p._refresh = function () {

    var flex = '', width = '', height = ''; 

    if (this.scaleMode === 'fix') {

        if (this._direction === 'row') {

            width = this.size + 'px'; 
        } else {
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
    this.domElem.style.display = 'relative';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.display = 'flex';
    this.domElem.style.alignItems = 'stretch';
    this.domElem.style.pointerEvents = 'none';
};

module.exports = Block;