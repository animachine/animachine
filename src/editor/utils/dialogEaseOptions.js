'use strict';

var inherits = require('inherits');
var amgui = require('../amgui');
var Dialog = require('./Dialog');

var currEase, 
    beizerEditor,
    cbRoughEase,
    optRoughStrength,
    dialog  = new Dialog({
    title: 'Key',
});

createContent();

dialog.addProperty({name: 'roughEase', input: cbRoughEase});
dialog.addProperty({name: 'roughStrengh', input: optRoughStrengh.inputs.input});
dialog.addProperty({name: 'roughPoints', input: optRoughPoints.inputs.input});
dialog.addProperty({name: 'roughClamp', input: optRoughClamp.inputs.input});
dialog.addProperty({name: 'roughRandomise', input: optRoughRandomise.inputs.input});
dialog.addProperty({name: 'roughTaper', input: optRoughTaper.inputs.input});




dialog.show = function (opt) {

    opt = opt || {};

    Dialog.prototype.show.call(this, opt);

    if (!('ease' in opt)) throw('opt.ease must be set');

    currEase = opt.ease;
    beizerEditor.setPoints(currEase.points);
};

function createContent() {

    dialog.addButton('ok', 'hide');

    beizerEditor = amgui.createBezierEditor({
        // width: 330,
        // height: 330,
        parent: dialog.deContent,
        onChange: onChangeBezier
    });

    cbRoughEase = amgui.createCheckbox({
        text: 'RoughEase',
        parent: dialog.deContent,
        onChange: function (e) {
            if (e.detail.checked) {
                am.dialogs.WIP.show();
                cbRoughEase.value = false;
            }
        }
    });

    optRoughStrength = new OptionLine({
        title: 'strength',
        parent: dialog.deContent,
        inputs: [{
            type: 'unit',
            name: 'input',
            min: 0,
            dragSpeed: 0.1,
            precision: 1
        }],
    });

    optRoughPoints = new OptionLine({
        title: 'points',
        parent: dialog.deContent,
        inputs: [{
            type: 'unit',
            name: 'input',
            min: 0,
            dragSpeed: 1,
            precision: 0
        }],
    });

    optRoughClamp = new OptionLine({
        title: 'clamp',
        parent: dialog.deContent,
        inputs: [{
            type: 'checkbox',
            name: 'input'
        }],
    });

    optRoughRandomise = new OptionLine({
        title: 'randomise',
        parent: dialog.deContent,
        inputs: [{
            type: 'checkbox',
            name: 'input'
        }],
    });

    optRoughTaper = new OptionLine({
        title: 'taper',
        parent: dialog.deContent,
        inputs: [{
            type: 'select',
            name: 'input',
            options: ['none', 'ease', 'opt', 'both']
        }],
    });
};

// p._onSelectEase = function (e) {

//     this.ease = e.detail.selection;
// };

// p._onChangeEase = function () {

//     this.ease = this._inpEase.value;
// };

function onChangeBezier(e) {
    currEase.points = e.detail.points;
};

module.exports = dialog;
