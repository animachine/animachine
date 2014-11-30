'use strict';

var amgui = require('../../amgui');
var Dialog = require('../../utils/Dialog');
var UnitInput = require('../../utils/UnitInput');
var StringInput = require('../../utils/StringInput');
var OptionLine = require('../../utils/OptionLine');

var deSelectorCont,
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
    startValue: [],
    set: function (v) {

        deSelectors.slice().map(removeSelector);
        v.forEach(addSelector);
        dialog.emit('changeSelectors', dialog.selectors);
    },
    get: function () {
        return _.pluck(deSelectors, 'value'); 
    }
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
        display: 'block',
        parent: dialog.deContent
    });

    deSelectorCont = amgui.createDiv({
        width: '100%',
        parent: dialog.deContent,
    });

    amgui.createIconBtn({
        icon: 'hash',
        display: 'inline-block',
        onClick: addSelector.bind(null, ''),
        parent: dialog.deContent
    });

    amgui.createIconBtn({
        icon: 'code',
        display: 'inline-block',
        onClick: function () {am.dialogs.WIP.show();},
        parent: dialog.deContent,
        tooltip: 'select from options'
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

function addSelector(value) {

    var selector = {
        value: value || '',
    };
    dialog.selectors.push(selector);

    var height = 23;

    selector.domElem = document.createElement('div');
    selector.domElem.style.display = 'flex';
    selector.domElem.style.height = height + 'px';
    selector.domElem.style.paddingLeft = '2px';
    selector.domElem.style.margin = '1px 0';
    selector.domElem.style.background = amgui.color.bg2;
    deSelectorCont.appendChild(selector.domElem);

    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value;
    inp.placeholder = 'selector';
    inp.style.width = '245px';
    inp.style.height = height + 'px';
    inp.style.fontSize = '14px';
    inp.style.fontFamily = amgui.FONT_FAMILY;
    inp.style.flex = '1';
    inp.style.background = 'none';
    inp.style.border = 'none';
    inp.style.color = amgui.color.text;
    selector.domElem.appendChild(inp);

    inp.addEventListener('change', function () {

        selector.value = inp.value;
        dialog.emit('changeSelectors', dialog.selectors);
    });

    var btnDel = amgui.createIconBtn({
        icon: 'cancel',
        height: height,
        display: 'inline-block',
        onClick: removeSelector.bind(null, selector),
        parent: selector.domElem
    });
    btnDel.style.visibility = 'hidden';

    selector.domElem.addEventListener('mouseenter', function () {
        btnDel.style.visibility = 'visible';
    });
    selector.domElem.addEventListener('mouseleave', function () {
        btnDel.style.visibility = 'hidden';
    });
}

function removeSelector(selector) {

    dialog.selectors.splice(dialog.selectors.indexOf(selector), 1);

    selector.domElem.parentNode.removeChild(selector.domElem);
}
