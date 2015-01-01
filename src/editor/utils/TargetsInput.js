'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');

function TargetsInput(opt) {

    EventEmitter.call(this);

    this._onChangeInput = this._onChangeInput.bind(this);

    this._createBase();

    this._value = opt.value || [];
    this._defaultValue = opt.defaultValue || [];
    this._targets = [];

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if (opt.onChange) this.on('change', opt.onChange);
}

inherits(TargetsInput, EventEmitter);
var p = TargetsInput.prototype;
module.exports = TargetsInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            if (!Array.isArray(v)) throw Error;

            this._value.slice().forEach(i => this.removeTarget(i));

            v.forEach(i => this.addTarget(i));
        },
        get: function () {

            return _.pluck(this._targets, 'value');
        }
    },
});




p.addTarget = function (opt) {

    var target = this._createTarget(opt);

    this._targets.push(target);
    this._deTargetsCont.appendChild(target.domElem);
};

p.removeTarget = function (target) {

    var idx = this._targets.indexOf(target);

    if (idx === -1) return;

    this._targets.splice(idx, 1);
    this._deTargetsCont.removeChild(target.domElem);
};

p.reset = function () {

    this.value = this._defaultValue;
};









p._onChangeInput = function () {

    this.value = this._input.value;
};




p._createBase = function () {

    this.domElem = amgui.createDiv();
    
    this._deTargetsCont = amgui.createDiv({
        parent: this.domElem,
    });
    
    amgui.createIconBtn({
        icon: 'hash',
        display: 'inline-block',
        onClick: () => this.addTarget({type: 'css', value: ''}),
        parent: this.domElem
    });

    amgui.createIconBtn({
        icon: 'code',
        display: 'inline-block',
        onClick: () => am.dialogs.WIP.show(),
        parent: this.domElem,
        tooltip: 'select from options'
    });
};

p._createTarget = function (value) {

    var target = {value};

    var height = 23;

    target.domElem = document.createElement('div');
    target.domElem.style.display = 'flex';
    target.domElem.style.height = height + 'px';
    target.domElem.style.paddingLeft = '2px';
    target.domElem.style.margin = '1px 0';
    target.domElem.style.background = amgui.color.bg2;

    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = target.value.value;
    inp.placeholder = 'target';
    inp.style.width = '245px';
    inp.style.height = height + 'px';
    inp.style.fontSize = '14px';
    inp.style.fontFamily = amgui.FONT_FAMILY;
    inp.style.flex = '1';
    inp.style.background = 'none';
    inp.style.border = 'none';
    inp.style.color = amgui.color.text;
    target.domElem.appendChild(inp);

    inp.addEventListener('change', () => {
        target.value.value = inp.value;
        this.emit('change');
    });

    var btnDel = amgui.createIconBtn({
        icon: 'cancel',
        height: height,
        display: 'inline-block',
        onClick: () => this.removeTarget(target),
        parent: target.domElem
    });
    btnDel.style.visibility = 'hidden';

    target.domElem.addEventListener('mouseenter', function () {
        btnDel.style.visibility = 'visible';
    });
    target.domElem.addEventListener('mouseleave', function () {
        btnDel.style.visibility = 'hidden';
    });

    return target;
}