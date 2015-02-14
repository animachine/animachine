'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');
var OptionLine = require('./OptionLine');

function TargetsInput(opt={}) {

    Input.call(this, opt);

    this._targets = [];
    this._value = opt.value || [];
    this._defaultValue = opt.defaultValue || [];

    if (_.has(opt, 'title')) this.title = opt.title;
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
    title: {
        set: function (v) {

            this._rootOptionLine.title = v;
        },
        get: function () {

            return this._rootOptionLine.title;
        }
    },
});




p.addTarget = function (opt) {

    var target = this._createTarget(opt);

    this._targets.push(target);
    this._rootOptionLine.addOptionLine(target.optionLine);
};

p.removeTarget = function (target) {

    var idx = this._targets.indexOf(target);

    if (idx === -1) return;

    this._targets.splice(idx, 1);
    this._rootOptionLine.removeOptionLine(target.optionLine);
    target.dispose();
};








p._createInput = function () {

    this._rootOptionLine = new OptionLine({
        title: 'Targets',
        parent: this.domElem,
    });

    this._rootOptionLine.addButton({
        name: 'add',
        domElem: amgui.createIconBtn({
            icon: 'plus',
            tooltip: 'add new input'
        }),
    });

    amgui.bindDropdown({
        deTarget: this._rootOptionLine.buttons.add,
        deDropdown: amgui.createDropdown({
            options: [{
                icon: 'hash',
                text: 'css selector',
                onClick: () => this.addTarget({type: 'css', value: ''}),
                tooltip: 'new css selector input'
            }, {
                icon: 'code',
                text: 'js input',
                onClick: () => this.addTarget({type: 'input', value: ''}),
                tooltip: 'new js input'

            }]
        })
    });
};

p._createTarget = function (data) {

    var target = {data}, inputPaths = [];

    target.optionLine = new OptionLine({
        inputs: [{
            name: 'input',
            type: 'string',
            placeholder: 'type here',
            value: target.data.value,
            onChange: value => {

                target.data.value = value;
                refreshSpellingFeedback();
                this.emit('change', this.value);
            }
        }],
    });

    var input = target.optionLine.inputs.input;
    input.focus();
    input.domElem.style.color = 'red';
    target.optionLine.highlight = data.type === 'input' ? amgui.color.blue : amgui.color.purple;

    var refreshSpellingFeedback = () => {

        if (data.type === 'input') {

            let match = inputPaths.indexOf(input.value) === -1,
                color = match ? amgui.color.text : amgui.color.aqua;

            input.domElem.style.color = color;
        }
        else if (data.type === 'css') {

            let color = amgui.color.text;

            try {//querySelector breaks on invalid selectors
                if (document.querySelector(input.value)) {

                    color = amgui.color.purple;
                }
            } catch (e) {}

            input.domElem.style.color = color;
        }
    };

    refreshSpellingFeedback();


    var refreshSuggestions = () => {

        inputPaths = am.projectMap.getCurrProject().getInputPaths();
        input.setSuggestions(inputPaths);
    };

    if (target.data.type === 'input') {

        refreshSuggestions();
        // this.timeline.on('change.inputs', refreshSuggestions);
    }

    if (target.data.type === 'css') {

        var btnPick = amgui.createIconBtn({
            icon: 'target',
            display: 'inline-block',
            onClick: () => am.dialogs.WIP.show(),
            tooltip: 'pick DOM element'
        });
        target.optionLine.addButton({domElem: btnPick, hoverMode: true});
    }

    var btnDel = amgui.createIconBtn({
        icon: 'cancel',
        display: 'inline-block',
        onClick: () => this.removeTarget(target),
    });
    target.optionLine.addButton({domElem: btnDel, hoverMode: true});

    target.dispose = function () {

        //TODO
        target.optionLine.dispose();
    };

    return target;
};
