'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function Toolbar() {

    EventEmitter.call(this);

    this._height = 32;
    this._icons = [];
    this._separators = {};

    this.domElement = document.createElement('div');
    this.domElement.style.position = 'fixed';
    this.domElement.style.backgroundColor = 'darkslategrey';
    this.domElement.style.pointerEvents = 'auto';
    this.domElement.style.height = this._height + 'px';

    this.addSeparator('tools');
    this.addSeparator('handler');
    this.addSeparator('global');
    this.addSeparator('rest');
}

inherits(Toolbar, EventEmitter);
var p = Toolbar.prototype;
module.exports = Toolbar;


p.addIcon = function (opt) {

    var deIcon = opt.deIcon || amgui.createIconBtn({
        width: 32,
        height: 32,
        fontSize: '32px',
        icon: opt.icon,
        onClick: opt.onClick
    });

    deIcon.style.display = 'inline-block';

    this.domElement.insertBefore(deIcon, this._separators[opt.separator || 'rest']);

    return deIcon;
};

p.removeIcon = function (deIcon) {

    deIcon.parentNode.removeChild(deIcon);
} 

p.addSeparator = function (name) {

    var de = document.createElement('span');
    this.domElement.appendChild(de);
    this._separators[name] = de;
};