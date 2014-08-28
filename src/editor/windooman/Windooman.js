'use strict';

var Container = require('./Container');

function Windooman() {

    this._tabMap = {};
    this._workspaces = {};

    this._createDomElem();
}

var p = Windooman.prototype;

p.loadWorkspaces = function (workspaces) {

    Object.keys(workspaces).forEach(function (name) {

        this._workspaces[name] = workspaces[name];
    }, this);
};

p.load = function (name) {

    var map = this._workspaces[name];

    if (!map || map.type !== 'container') {
        throw Error('can\'t load ' + map);
    }

    this._root = new Container(map);
    
    this.domElem.innerHTML = '';
    this.domElem.appendChild(this._root.domElem);

    Object.keys(this._tabMap).forEach(function (name) {

        this.placeTab(name, this._tabMap[name]);
    }, this);
};

p.findTab = function (name) {

    if (this._root) {

        return this._root.findTab(name);
    }
};

p.fillTab = function (name, content) {

    this._tabMap[name] = content;

    var tab = this.findTab(name);

    if (tab) {
        tab.setContent(content);
    }
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
};

module.exports = Windooman;