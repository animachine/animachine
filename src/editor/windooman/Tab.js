'use strict';

var amgui = require('../amgui');

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

    if (deContent) {

        this.domElem.appendChild(deContent);
        deContent.style.position = 'absolute';
    }
};

p.bubbleResize = function () {

    this.domElem.dispatchEvent(new Event('resize'));
};



p.select = function () {

    this.domElem.style.display = 'block';
    this.deEar.style.borderBottomWidth = '1px';
    this.deEar.style.color = amgui.color.text;
};

p.deselect = function () {

    this.domElem.style.display = 'none';
    this.deEar.style.borderBottomWidth = '0px';
    this.deEar.style.color = amgui.color.textInactive;
};

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'realtive';
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.setAttribute('data-debug', 'tab - ' + this.name);
};

p._createTabEar = function () {

    var de = amgui.createLabel({
        text: this.name,
        flex: 1,
    });
    de.style.boxSizing = 'border-box';
    de.style.cursor = 'default';
    de.style.borderBottom = 'solid 1px white';
    de.style.alignSelf = 'stretch';
    de.style.overflow = 'hidden';
    de.style.textAlign = 'center';

    return de;
};

module.exports = Tab;
