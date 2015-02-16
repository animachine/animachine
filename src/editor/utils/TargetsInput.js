'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');
var OptionLine = require('./OptionLine');

function TargetsInput(opt={}) {

    Input.call(this, opt);

    this._targets = [];
    this._buffTargets = [];
    this._value = opt.value || [];
    this._defaultValue = opt.defaultValue || [];

    if (_.has(opt, 'title')) this.title = opt.title;
}

inherits(TargetsInput, Input);
var p = TargetsInput.prototype;
module.exports = TargetsInput;

//TODO cleen up

Object.defineProperties(p, {

    value: {
        set: function (v) {

            if (!Array.isArray(v)) throw Error;

            this._value = v;

            var i;

            for (i = 0; i < v.length; ++i) {

                if (this._targets.length <= i) {

                    this._addTarget(v[i].type);
                }
                else if (v[i].type === this._targets[i].type) {

                    this._targets[i].refresh();
                }
                else {
                    this._removeTarget(this._targets[i--]);
                }
            }

            this._targets.slice(i).forEach(target => this._removeTarget(target));
        },
        get: function () {

            return this._value;
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




p._addTarget = function (type) {

    var target = _.find(this._buffTargets, {type});

    if (target) {
        _.pull(this._buffTargets, target);
    }
    else {
        target = this._createTarget(type);
    }

    this._targets.push(target);
    target.refresh();
    this._rootOptionLine.addOptionLine(target.optionLine);
};

p._removeTarget = function (target) {

    if (_.include(this._targets, target)) {

        _.pull(this._targets, target);
        this._buffTargets.push(target);
    }

    this._rootOptionLine.removeOptionLine(target.optionLine);
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
                onClick: () => {
                    this.value.push({type: 'css', value: ''});
                    this.value = this.value;
                },
                tooltip: 'new css selector input'
            }, {
                icon: 'code',
                text: 'js input',
                onClick: () => {
                    this.value.push({type: 'input', value: ''});
                    this.value = this.value;
                },
                tooltip: 'new js input'

            }]
        })
    });
};

p._createTarget = function (type) {

    var target = {type}, inputPaths = [], underSetting = false;

    var data = () => {

        var idx = this._targets.indexOf(target);
        return this.value[idx] || {};
    };

    target.optionLine = new OptionLine({
        inputs: [{
            name: 'input',
            type: 'string',
            placeholder: 'type here',
            value: data().value,
            onChange: value => {

                data().value = value;
                refreshSpellingFeedback();
                if (!underSetting) this.emit('change', this.value);
            }
        }],
    });

    target.refresh = function () {

        underSetting = true;
        input.value = data().value;
        underSetting = false;
    };

    var input = target.optionLine.inputs.input;
    input.focus();
    input.domElem.style.color = 'red';
    target.optionLine.highlight = type === 'input' ? amgui.color.blue : amgui.color.purple;

    var refreshSpellingFeedback = () => {

        if (type === 'input') {

            let match = inputPaths.indexOf(input.value) === -1,
                color = match ? amgui.color.text : amgui.color.aqua;

            input.domElem.style.color = color;
        }
        else if (type === 'css') {

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

    if (type === 'input') {

        refreshSuggestions();
        //TODO ?.timeline.project.on('change.inputs', refreshSuggestions);
    }

    if (type === 'css') {

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
        onClick: () => {
            _.pull(this.value, data());
            this.value = this.value;
        },
    });
    target.optionLine.addButton({domElem: btnDel, hoverMode: true});

    return target;
};
