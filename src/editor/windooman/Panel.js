'use strict';

var Tab = require('./Tab');
var amgui = require('../amgui');

function Panel(opt) {

    this._tabs = [];
    
    this.size = opt.size;
    this.scaleMode = opt.scaleMode;

    this._createDomElem();
    this._createTabBase();

    this._empty = false;
    this._collapsed = false;
    this._noHead = true;

    if ('empty' in opt) this.empty = opt.empty;
    if ('collapsed' in opt) this.collapsed = opt.collapsed;
    if ('noHead' in opt) this.noHead = opt.noHead;

    if (opt.tabs) {
        opt.tabs.forEach(this.addTab, this);
    }

    if (!this._tabs.some(function (tab) {return tab.selected;}) &&
        this._tabs.length)
    {
        this._tabs[0].select();
    }
}

var p = Panel.prototype;

Object.defineProperties(p, {

    empty: {
        set: function (v) {

            v = !!v;
            if (this._empty === v) return;

            this._empty = v;
            this.domElem.style.pointerEvents = this._empty ? 'none' : 'auto';
            this.domElem.style.visibility = this._empty ? 'hidden' : 'visibile';
        },
        get: function () {
            return this._empty;
        }
    },
    
    collapsed: {
        set: function (v) {

            v = !!v;
            if (this._collapsed === v) return;

            this._collapsed = v;
            this._deTabBase.style.display = this._collapsed ? 'none' : 'flex';
        },
        get: function () {
            return this._collapsed;
        }
    },
    
    noHead: {
        set: function (v) {

            v = !!v;
            if (this._noHead === v) return;

            this._noHead = v;
            this._deTabHead.style.display = this._noHead ? 'none' : 'flex';
        },
        get: function () {
            return this._noHead;
        }
    }
});

p.addTab = function (tData) {

    var tab = new Tab(tData);
    this._deTabHead.appendChild(tab.deEar);
    this._deTabContent.appendChild(tab.domElem);
    this._tabs.push(tab);
};


p.findTab = function (name) {

    var tab;

    this._tabs.some(function (t) {

        if (t.name === name) {

            return (tab = t);
        }
    });

    return tab;
};

p.showTab = function (tab) {

    this._tabs.forEach(function (t) {
        
        if (tab === t) {
            t.select();
        }
        else {
            t.deselect();
        }
    });
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
};

p._createTabBase = function () {

    this._deTabBase = document.createElement('div');
    this._deTabBase.style.width = '100%';
    this._deTabBase.style.height = '100%';
    this._deTabBase.style.display = 'flex';
    this._deTabBase.style.flexDirection = 'column';
    this.domElem.appendChild(this._deTabBase);

    this._deTabHead = document.createElement('div');
    this._deTabHead.style.width = '100%';
    this._deTabHead.style.height = '23px';
    this._deTabHead.style.display = 'flex';
    this._deTabHead.style.alignItems = 'stretch';
    this._deTabHead.style.background = amgui.color.bg1;
    if (this._showHead) {
        this._deTabBase.appendChild(this._deTabHead);
    }

    this._deTabContent = document.createElement('div');
    this._deTabContent.style.width = '100%';
    this._deTabContent.style.flex = 1;
    this._deTabBase.appendChild(this._deTabContent);
};

module.exports = Panel;