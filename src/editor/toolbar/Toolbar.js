'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');

function Toolbar(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._height = opt.height || 24;
    this._icons = [];
    this._separators = {};

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'fixed';
    this.domElem.style.display = 'flex';
    this.domElem.style.backgroundColor = opt.bgColor || amgui.color.bg0;
    this.domElem.style.pointerEvents = 'auto';
    this.domElem.style.height = this._height + 'px';

    this.addSeparator({name: 'first'});
    this.addSeparator({name: 'tools'});
    this.addSeparator({name: 'handler'});
    this.addSeparator({name: 'global'});
    this.addSeparator({name: 'rest'});
    this.addSeparator({name: 'controls', flex: 1});
}

inherits(Toolbar, EventEmitter);
var p = Toolbar.prototype;
module.exports = Toolbar;



Object.defineProperties(p, {
    height: {
        get: function () {
            return this._height;
        }
    }
});


p.addIcon = function (opt) {

    if (_.isArray(opt)) {

        return opt.map(o => this.addIcon(o));
    }

    var deIcon;

    if (_.isElement(opt)) {
        
        deIcon = opt;
    } 
    else if (_.isElement(opt.deIcon)) {
        
        deIcon = opt.deIcon;
    } 
    else {
        deIcon = amgui.createIconBtn({
            size: this._height,
            icon: opt.icon,
            onClick: opt.onClick
        });
    }

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
};

p.addSeparator = function (opt) {

    var de = document.createElement('span');
    this.domElem.appendChild(de);
    this._separators[opt.name] = de;

    if ('flex' in opt) {
        de.style.flex = opt.flex;
    }
};