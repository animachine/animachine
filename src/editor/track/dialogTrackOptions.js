'use strict';

var amgui = require('../amgui');
var Dialog = require('../utils/Dialog');
var UnitInput = require('../utils/UnitInput');
var TargetsInput = require('../utils/TargetsInput');
var StringInput = require('../utils/StringInput');
var OptionLine = require('../utils/OptionLine');

var targetsInput,
    deSelectorCont,
    deSelectors = [],
    dialog = new Dialog({
        title: 'Track',
    });
module.exports = dialog;

createContent();
dialog.addButton('ok', 'hide');


dialog.on('change.name', name => dialog.title = name);


function createContent() {

    var optName = new OptionLine({
        title: 'name:',
        parent: dialog.deContent,
        inputs: [{
            type: 'string',
            name: 'name',
        }],
    });

    targetsInput = new TargetsInput({
        parent: dialog.deContent,
        title: 'Selectors',
        onChange: value => dialog.emit('change.selectors', value),
    });

    amgui.createLinebreak({parent: dialog.deContent});

    var optRepeat = new OptionLine({
        title: 'repeat',
        parent: dialog.deContent,
        inputs: [{
            type: 'unit',
            name: 'repeat',
            min: -1,
            units: ['x'],
        }],
    });

    var optRepeatDelay = new OptionLine({
        title: 'repeat delay',
        parent: dialog.deContent,
        inputs: [{
            type: 'unit',
            name: 'repeatDelay',
            min: 0,
            precision: 3,
            dragSpeed: 0.001,
            units: ['sec'],
        }],
    });

    var optKeyStretch = new OptionLine({
        title: 'key stretch',
        parent: dialog.deContent,
        inputs: [{
            type: 'unit',
            name: 'keyStretch',
            min: 0,
            dragSpeed: 0.01,
            precision: 3,
            units: ['x'],
        }],
    });

    var optYoyo = new OptionLine({
        title: 'yoyo',
        parent: dialog.deContent,
        inputs: [{
            type: 'checkbox',
            name: 'yoyo',
        }],
    });


    $(optRepeat.domElem).one('mousedown', () => am.dialogs.WIP.show());
    $(optRepeatDelay.domElem).one('mousedown', () => am.dialogs.WIP.show());
    $(optKeyStretch.domElem).one('mousedown', () => am.dialogs.WIP.show());
    $(optYoyo.domElem).one('mousedown', () => am.dialogs.WIP.show());

    dialog.addProperty({
        name: 'name',
        startValue: 'Track',
        input: optName.inputs.name
    });
    dialog.addProperty({
        name: 'selectors',
        startValue: [],
        input: targetsInput,
    });
    dialog.addProperty({
        name: 'repeat',
        startValue: 0,
        input: optRepeat.inputs.repeat,
    });
    dialog.addProperty({
        name: 'repeatDelay',
        startValue: 0,
        input: optRepeatDelay.inputs.repeatDelay,
    });
    dialog.addProperty({
        name: 'keyStretch',
        startValue: 1,
        input: optKeyStretch.inputs.keyStretch,
    });
    dialog.addProperty({
        name: 'yoyo',
        startValue: false,
        input: optYoyo.inputs.yoyo,
    });
}
