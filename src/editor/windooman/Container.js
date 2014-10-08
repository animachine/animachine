'use strict';

var Block = require('./Block');
var Panel = require('./Panel');
var inherits = require('inherits');
var amgui = require('../amgui');

function Container(opt) {

    Block.call(this, opt);

    this.direction = opt.direction || 'row';
    this._children = [];
    this._deHandlers = [];

    opt.children.forEach(function (cData) {

        if (cData.type === 'container') {

            this.addChild(new Container(cData));
        }
        else if (cData.type === 'panel') {

            this.addChild(new Panel(cData));
        }
    }, this);
}

inherits(Container, Block);
var p = Container.prototype;
module.exports = Container;

Object.defineProperties(p, {

    direction: {
        set: function (v) {

            this._direction = v;
            this.domElem.style.flexDirection = this._direction;
        },
        get: function () {

            return this._direction;
        }
    }
});

p.addChild = function (child) {

    this.addChildAt(child, this._children.length);
};

p.addChildAt = function (child, idx) {

    this._children.splice(idx, 0, child);
    this._refreshChildren();
    this._refreshHandlers();
};

p.findTab = function (name) {

    var tab;

    this._children.some(function (child) {

        tab = child.findTab(name);
        return tab;
    });

    return tab;
};



p._getFullFlex = function () {

    var br = this.domElem.getBoundingClientRect(),
        full = this.direction === 'row' ? br.width : br.height;

    this._children.forEach(function (child) {

        if (child.scaleMode === 'fix') {

            full -= child.size;
        }
    });

    return full;
};

p._refreshChildren = function () {

    this._children.forEach(function (child) {
        
        this.domElem.appendChild(child.domElem);
    }, this);
};

p._refreshHandlers = function () {

    var i, deHandler, ncBr, 
        thickness = 4,
        br = this.domElem.getBoundingClientRect();

    for (i = 0; i < this._children.length - 1; ++i) {

        if (!this._deHandlers[i]) {
            this._deHandlers.push(this._createHandler())
        }

        ncBr = this._children[i+1].domElem.getBoundingClientRect();
        deHandler = this._deHandlers[i];

        if (this.direction === 'row') {

            deHandler.style.left = (ncBr.left - br.left - thickness/2) + 'px';
            deHandler.style.top = '0px';
            deHandler.style.width = thickness + 'px';
            deHandler.style.height = '100%';
        }
        else {
            deHandler.style.left = '0px';
            deHandler.style.top = (ncBr.top - br.top - thickness/2) + 'px';
            deHandler.style.width = '100%';
            deHandler.style.height = thickness + 'px';
        }
    }

    this._deHandlers.splice(i).forEach(function (deHandler) {

        deHandler.parentNode.removeChild(deHandler);
    })
};






p._onDragHandler = function (md, mx, my) {

    var move = this.direction === 'row' ? mx - md.mx : my - md.my,
        moveFlex = move / this._getFullFlex(),
        prevChild = this._children[md.idx],
        nextChild = this._children[md.idx + 1];

    prevChild.size = md.prevChildSize - (prevChild.scaleMode === 'fix' ? move : moveFlex);
    nextChild.size = md.nextChildSize - (nextChild.scaleMode === 'fix' ? move : moveFlex);
}




p._createHandler = function () {

    var de = document.createElement('div');
    de.style.position = 'absolute';

    amgui.makeDraggable({
        deTarget: de,
        thisArg: this,
        onDown: function () {
            return {
                idx: this._deHandlers.indexOf(de)
            }
        },
        onMove: this._onDragHandler,
        onEnter: function () {
            de.style.background = '#fff';
        },
        onLeave: function () {
            de.style.background = '';
        }
    });

    this.domElem.appendChild(de);

    return de;
};
