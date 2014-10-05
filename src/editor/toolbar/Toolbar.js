'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function Toolbar() {

    EventEmitter.call(this);

    this._height = 32;
    this._icons = [];
    this._separators = {};

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'fixed';
    this.domElem.style.backgroundColor = 'darkslategrey';
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.style.height = this._height + 'px';

    this.addSeparator('first');
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

    if (opt.tooltip) {
        
        amgui.addTooltip({
            deTarget: deIcon,
            text: opt.tooltip,
            side: 'bottom'
        });
    }

    deIcon.style.display = 'inline-block';

    this.domElem.insertBefore(deIcon, this._separators[opt.separator || 'rest']);

    return deIcon;
};

p.removeIcon = function (deIcon) {

    deIcon.parentNode.removeChild(deIcon);
} 

p.addSeparator = function (name) {

    var de = document.createElement('span');
    this.domElem.appendChild(de);
    this._separators[name] = de;
};