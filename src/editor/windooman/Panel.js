'use strict';

var Tab = require('./Tab');

function Panel(opt) {

    this._mode = opt.mode || 'tab';
    this._tabs = [];
    this._showHead = 'showHead' in opt ? opt.showHead : true;
    
    this.size = opt.size;
    this.scaleMode = opt.scaleMode;

    this._createDomElem();
    this._createTabBase();

    if (opt.tabs) {
        opt.tabs.forEach(this.addTab, this);
    }

    if (!this._tabs.some(function (tab) {return tab.selected}) &&
        this._tabs.length)
    {
        this._tabs[0].select();
    }
}

var p = Panel.prototype;

Object.defineProperty(p, 'mode', {

    set: function (v) {

        this._mode = v;
        this.domElem.style.pointerEvents = this._mode === 'empty' ? 'none' : 'auto';
        this._deTabBase.display = this._mode === 'tab' ? 'block' : 'none';
    },

    get: function () {

        return this._mode;
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
    if (this._showHead) {
        this._deTabBase.appendChild(this._deTabHead);
    }

    this._deTabContent = document.createElement('div');
    this._deTabContent.style.width = '100%';
    this._deTabContent.style.flex = 1;
    this._deTabBase.appendChild(this._deTabContent);
};

module.exports = Panel;