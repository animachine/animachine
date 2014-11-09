'use strict';

var Tab = require('./Tab');
var amgui = require('../amgui');
var Block = require('./Block');
var inherits = require('inherits');

function Panel(opt) {

    Block.call(this, opt);

    this._tabs = [];

    this._onToggleCollapsed = this._onToggleCollapsed.bind(this);

    this._createTabBase();

    this._empty = false;
    this._collapsed = false;
    this._noHead = false;

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

inherits(Panel, Block);
var p = Panel.prototype;
module.exports = Panel;

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
            this._deTabContent.style.display = this._collapsed ? 'none' : 'flex';
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

    tab.deEar.addEventListener('click', this.showTab.bind(this, tab));
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

p.bubbleResize = function () {

    if (!this._tabs) return;

    this._tabs.forEach(function (tab) {

        tab.bubbleResize();
    });
};







p._onToggleCollapsed = function () {

    this.collapsed = !this.collapsed;

    this._btnToggleCollapsed.setToggle(this.collapsed);
};






p._createTabBase = function () {

    this._deTabBase = document.createElement('div');
    this._deTabBase.style.display = 'flex';
    this._deTabBase.style.flexDirection = 'column';
    this._deTabBase.style.alignSelf = 'stretch';
    this._deTabBase.style.flex = '1';
    this.domElem.appendChild(this._deTabBase);

    this._deTabHead = document.createElement('div');
    this._deTabHead.style.width = '100%';
    this._deTabHead.style.height = amgui.LINE_HEIGHT + 'px';
    this._deTabHead.style.display = 'flex';
    this._deTabHead.style.alignItems = 'stretch';
    this._deTabHead.style.background = amgui.color.bg0;
    this._deTabHead.style.pointerEvents = 'auto';
    this._deTabHead.setAttribute('data-debug', 'tabhead')
    this._deTabBase.appendChild(this._deTabHead);

    this._deTabContent = document.createElement('div');
    this._deTabContent.style.width = '100%';
    this._deTabContent.style.flex = 1;
    this._deTabContent.setAttribute('data-debug', 'tabcontent')
    this._deTabBase.appendChild(this._deTabContent);

    this._btnToggleCollapsed = amgui.createToggleIconBtn({
        tooltip: 'show/hide tabs',
        iconOn: 'collapse', 
        iconOff: 'expand',
        parent: this._deTabHead,
        display: 'inline-block',
        onClick: this._onToggleCollapsed
    });
    this._btnToggleCollapsed.style.order = 1;
};