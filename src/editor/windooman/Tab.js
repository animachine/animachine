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

p.bubbleResize = function () {

    this.domElem.dispatchEvent(new Event('resize'));
};



p.deselect = function () {

    this.domElem.style.display = 'none';
    this.deEar.style.borderBottomWidth = '1px';
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = 'rgba(0,0,0,0.3)';
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.setAttribute('data-debug', 'tab - ' + this.name);
};

p._createTabEar = function () {

    var de = document.createElement('div');
    de.textContent = this.name;
    de.style.flex = 1;
    de.style.boxSizing = 'border-box';
    de.style.borderBottom = 'solid 1px white';
    de.style.alignSelf = 'stretch';
    de.style.overflow = 'hidden';

    return de;
};

module.exports = Tab;