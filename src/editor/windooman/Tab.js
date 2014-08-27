'use strict';

function Tab(opt) {

    this.name = opt.name;
    this.selected = opt.selected;

    this._createDomElem();
    this.deEar = this._createTabEar();

    this[this.selected ? 'select' : 'deselect']();
}

var p = Tab.prototype;

p.setContent = function (deContent) {

    this.domElem.innerHTML = '';
    this.domElem.appendChild(deContent);
};

p.select = function () {

    this.domElem.style.display = 'block';
    this.deEar.style.borderBottomWidth = '2px';
};

p.deselect = function () {

    this.domElem.style.display = 'none';
    this.deEar.style.borderBottomWidth = '1px';
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.pointerEvents = 'auto';
};

p._createTabEar = function () {

    var de = document.createElement('div');
    de.textContent = this._name;
    de.style.flex = 1;
    de.style.boxSizing = 'border-box';
    de.style.borderBottom = 'solid 1px white';
    de.style.alignItems = 'stretch';

    return de;
};

module.exports = Tab;