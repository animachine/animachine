'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var StringInput = require('../utils/StringInput');

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

            this._value.slice().forEach(target => this.removeTarget(target));

            v.forEach(i => this.addTarget(i));
        },
        get: function () {

            return _.pluck(this._targets, 'data');
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
    $(target.domElem).remove();
    target.dispose();
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
        onClick: () => this.addTarget({type: 'input', value: ''}),
        parent: this.domElem,
        tooltip: 'select from js inputs'
    });
};

p._createTarget = function (data) {

    var target = {data};

    var height = 23;

    target.domElem = document.createElement('div');
    target.domElem.style.display = 'flex';
    target.domElem.style.height = height + 'px';
    target.domElem.style.paddingLeft = '2px';
    target.domElem.style.margin = '1px 0';
    target.domElem.style.background = amgui.color.bg2;

    var deHighlight = document.createElement('div');
    deHighlight.style.display = 'inline-block';
    deHighlight.style.width = '2px';
    deHighlight.style.height = this._lineH + 'px';
    deHighlight.style.background = target.data === 'css' ? amgui.purple : amgui.blue;
    deHighlight.style.opacity = 0;
    target.domElem.appendChild(deHighlight);

    var inp = new StringInput({
        parent: target.domElem,
        placeholder: 'type here',
        value: target.data.value,
        onChange: () => {
            target.data.value = inp.value;
            this.emit('change');
        }
    });
    inp.domElem.style.width = '245px';
    inp.domElem.style.height = height + 'px';
    inp.domElem.style.fontSize = '14px';

    var refreshSuggestions = () => {

        inp.setSuggestions(am.timeline.getInputNames());
    }

    if (target.data.type === 'input') {

        refreshSuggestions();
        am.timeline.on('change.inputs', refreshSuggestions);
    } 

    if (target.data.type === 'css') {

        var btnPick = amgui.createIconBtn({
            icon: 'target',
            height: height,
            display: 'inline-block',
            onClick: () => am.dialogs.WIP.show(),
            parent: target.domElem,
            tooltip: 'pick DOM element'
        });
        btnPick.style.visibility = 'hidden';
    }

    var btnDel = amgui.createIconBtn({
        icon: 'cancel',
        height: height,
        display: 'inline-block',
        onClick: () => this.removeTarget(target),
        parent: target.domElem
    });
    btnDel.style.visibility = 'hidden';

    target.domElem.addEventListener('mouseenter', function () {
        btnPick.style.visibility = 'visible';
        btnDel.style.visibility = 'visible';
    });
    target.domElem.addEventListener('mouseleave', function () {
        btnPick.style.visibility = 'hidden';
        btnDel.style.visibility = 'hidden';
    });

    target.dispose = function () {

        am.timeline.off('change.inputs', refreshSuggestions);
    }

    return target;
}