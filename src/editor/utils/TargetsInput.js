'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');
var StringInput = require('./StringInput');

function TargetsInput(opt={}) {

    Input.call(this, opt);

    this._createBase();

    this._value = opt.value || [];
    this._defaultValue = opt.defaultValue || [];
    this._targets = [];
}

inherits(TargetsInput, Input);
var p = TargetsInput.prototype;
module.exports = TargetsInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            if (!Array.isArray(v)) throw Error;

            this._targets.slice().forEach(target => this.removeTarget(target));

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








p._createInput = function () {

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

    var target = {data}, inputPaths = [];

    var height = amgui.LINE_HEIGHT;

    target.domElem = document.createElement('div');
    target.domElem.style.display = 'flex';
    target.domElem.style.height = height + 'px';
    target.domElem.style.margin = '1px 0';
    target.domElem.style.background = amgui.color.bg2;

    var deHighlight = document.createElement('div');
    deHighlight.style.display = 'inline-block';
    deHighlight.style.width = '2px';
    deHighlight.style.height = height + 'px';
    deHighlight.style.marginRight = '2px';
    deHighlight.style.background = data.type === 'css' ? amgui.color.purple : amgui.color.blue;
    target.domElem.appendChild(deHighlight);

    var inp = new StringInput({
        parent: target.domElem,
        placeholder: 'type here',
        value: target.data.value,
        onChange: () => {

            target.data.value = inp.value;
            this.emit('change');

            if (data.type === 'input') {
                inp.domElem.style.color = inputPaths.indexOf(inp.value) === -1 ? amgui.color.text : amgui.color.aqua;
            }
        }
    });
    inp.domElem.style.width = '245px';
    inp.domElem.style.height = height + 'px';
    inp.domElem.style.fontSize = '14px';
    inp.domElem.style.flex = '1';

    inp.focus();

    var refreshSuggestions = () => {

        inputPaths = am.projectMap.getCurrProject().getInputPaths();
        inp.setSuggestions(inputPaths);
    };

    if (target.data.type === 'input') {

        refreshSuggestions();
        // this.timeline.on('change.inputs', refreshSuggestions);
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
        if (btnPick) btnPick.style.visibility = 'visible';
        btnDel.style.visibility = 'visible';
    });
    target.domElem.addEventListener('mouseleave', function () {
        if (btnPick) btnPick.style.visibility = 'hidden';
        btnDel.style.visibility = 'hidden';
    });

    target.dispose = function () {

        // this.timeline.off('change.inputs', refreshSuggestions);
    };

    return target;
};
