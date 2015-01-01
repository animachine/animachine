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



dialog.addProperty({name: 'repeat', startValue: 0});
dialog.addProperty({name: 'repeatDelay', startValue: 0});
dialog.addProperty({name: 'yoyo', startValue: false});
dialog.addProperty({name: 'keyStretch', startValue: 1});
dialog.addProperty({
    name: 'selectors',
    set: v => targetsInput.value = v,
    get: () => targetsInput.value,
});


function createContent() {

    amgui.createLabel({
        caption: 'Name: ',
        fontSize: '18px',
        parent: dialog.deContent
    });

    var inpTitle = new StringInput({
        parent: dialog.deContent,
    });
    inpTitle.domElem.style.width = '245px';
    inpTitle.domElem.style.fontSize = '14px';
    inpTitle.domElem.style.fontFamily = amgui.FONT_FAMILY;
    inpTitle.domElem.style.background = 'none';
    inpTitle.domElem.style.border = 'none';
    inpTitle.domElem.style.marginBottom = '12px';
    inpTitle.domElem.style.color = amgui.color.text;
    inpTitle.on('change', function (v) {
        dialog.title = v;
    });
    dialog.on('changeTitle', function () {
        inpTitle.value = dialog.title;
    });

    amgui.createLabel({
        caption: 'Selectors',
        fontSize: '18px',
        height: '25px',
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
}