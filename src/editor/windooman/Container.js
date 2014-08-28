'use strict';

var Panel = require('./Panel');

function Container(opt) {

    this._createDomElem();

    this.direction = opt.direction || 'row';
    this._children = [];

    this.size = opt.size;
    this.scaleMode = opt.scaleMode;

    opt.children.forEach(function (cData) {

        if (cData.type === 'container') {

            this.addChild(new Container(cData));
        }
        else if (cData.type === 'panel') {

            this.addChild(new Panel(cData));
        }
    }, this);

    this._scaleChildren();
}

var p = Container.prototype;

Object.defineProperty(p, 'direction', {

    set: function (v) {

        this._direction = v;
        this.domElem.style.flexDirection = this._direction;
    },

    get: function () {

        return this._direction;
    }
});

p.addChild = function (child) {

    this._children.push(child);
    this.domElem.appendChild(child.domElem);

    this._scaleChildren();
};


p.findTab = function (name) {

    var tab;

    this._children.some(function (child) {

        tab = child.findTab(name);
        return tab;
    });

    return tab;
};

p._scaleChildren = function () {

    this._children.forEach(function (child) {

        var flex = '', width = '', height = ''; 

        if (child.scaleMode === 'fix') {

            if (this._direction.indexOf('row') === 0) {

                width = child.size + 'px'; 
            } else {
                height = child.size + 'px';
            }
        }
        else if (child.scaleMode === 'flex') {

            flex = child.size;
        }

        child.domElem.style.width = width;
        child.domElem.style.height = height;
        child.domElem.style.flex = flex;
    }, this);
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.display = 'flex';
    this.domElem.style.alignItems = 'stretch';
    // this.domElem.style.pointerEvents = 'none';
};

module.exports = Container;