'use strict';

var amgui = require('../../amgui');
var Dialog = require('../../utils/Dialog');
var UnitInput = require('../../utils/UnitInput');
var TargetsInput = require('../../utils/TargetsInput');
var StringInput = require('../../utils/StringInput');
var OptionLine = require('../../utils/OptionLine');

var targetsInput,
    deSelectorCont,
    deSelectors = [],
    dialog = new Dialog({
        title: 'Track',
    }); 
module.exports = dialog;

createContent();
dialog.addButton('ok', 'hide');


function createContent() {

    var optName = new OptionLine({
        title: 'name:',
        parent: dialog.deContent,
        inputs: [{
            type: 'string',
            name: 'name',
            onChange: v => dialog.name = v,
        }],
    });
    dialog.on('changeName', function () {
        optName.inputs.name.value = dialog.name;
        dialog.title = dialog.name;
    });


    amgui.createLabel({
        caption: 'Selectors:',
        // fontSize: '18px',
        // height: '25px',
        display: 'block',
        parent: dialog.deContent
    });

    targetsInput = new TargetsInput({
        parent: dialog.deContent,
        onChange: () => dialog.emit('changeSelectors', targetsInput.value),
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
            onChange: function (v) {
                dialog.repeat = v;
            }
        }],
    });
    dialog.on('changeRepeat', function () {
        optRepeat.inputs.repeat.value = dialog.repeat;
    });
    $(optRepeat.domElem).one('mousedown', showWIPDialog);

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
            onChange: function (v) {
                dialog.repeatDelay = v;
            }
        }],
    });
    dialog.on('changeRepeatDelay', function () {
        optRepeatDelay.inputs.repeatDelay.value = dialog.repeatDelay;
    });
    $(optRepeatDelay.domElem).one('mousedown', showWIPDialog);

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
            onChange: function (v) {
                dialog.keyStretch = v;
            }
        }],
    });
    dialog.on('changeKeyStretch', function () {
        optKeyStretch.inputs.keyStretch.value = dialog.keyStretch;
    });
    $(optKeyStretch.domElem).one('mousedown', showWIPDialog);

    var cbYoyo = amgui.createCheckbox({
        text: 'yoyo',
        onChange: function (e) {
            dialog.yoyo = e.detail.checked;
        },
        parent: dialog.deContent,
    });
    dialog.on('changeYoyo', function () {
        cbYoyo.checked = dialog.yoyo;
    });
    $(cbYoyo).one('click', showWIPDialog);

    function showWIPDialog() {
        am.dialogs.WIP.show();
    }

    dialog.addProperty({name: 'name', startValue: 'Track'});
    dialog.addProperty({name: 'selectors', startValue: [], input: targetsInput});
    dialog.addProperty({name: 'repeat', startValue: 0});
    dialog.addProperty({name: 'repeatDelay', startValue: 0});
    dialog.addProperty({name: 'yoyo', startValue: false});
    dialog.addProperty({name: 'keyStretch', startValue: 1});
}