'use strict';

var inherits = require('inherits');
var amgui = require('../amgui');
var Dialog = require('../utils/Dialog');
var OptionLine = require('../utils/OptionLine');

var currEase, 
    beizerEditor,
    optRoughEase,
    optRoughStrength,
    optRoughPoints,
    optRoughClamp,
    optRoughRandomise,
    optRoughTaper,
    optRoughStrength, 
    dialog  = new Dialog({
        title: 'Key',
    });

createContent();

dialog.addProperty({name: 'roughEase', input: optRoughEase.inputs.input});
dialog.addProperty({name: 'roughStrengh', input: optRoughStrength.inputs.input});
dialog.addProperty({name: 'roughPoints', input: optRoughPoints.inputs.input});
dialog.addProperty({name: 'roughClamp', input: optRoughClamp.inputs.input});
dialog.addProperty({name: 'roughRandomise', input: optRoughRandomise.inputs.input});
dialog.addProperty({name: 'roughTaper', input: optRoughTaper.inputs.input});




dialog.show = function (opt={}) {

    opt.roughEase = opt.ease.roughEase;
    opt.roughStrengh = opt.ease.roughStrengh;
    opt.roughPoints = opt.ease.roughPoints;
    opt.roughClamp = opt.ease.roughClamp;
    opt.roughRandomise = opt.ease.roughRandomise;
    opt.roughTaper = opt.ease.roughTaper;

    Dialog.prototype.show.call(this, opt);

    if (!('ease' in opt)) throw('opt.ease must be set');

    currEase = opt.ease;
    beizerEditor.setEase(currEase);
};

function createContent() {

    dialog.addButton('ok', 'hide');

    amgui.createBtn({
        text: 'save/load ease',
        parent: dialog.deContent,
        onClick: () => am.dialogs.WIP.show(),
    });

    beizerEditor = amgui.createBezierEditor({
        parent: dialog.deContent,
    });


    optRoughEase = new OptionLine({
        title: 'rough ease',
        parent: dialog.deContent,
        defaultValue: true,
        inputs: [{
            type: 'checkbox',
            name: 'input',
            onChange: function (v) {
                optRoughStrength.domElem.style.display = v ? 'block' : 'none';
                optRoughPoints.domElem.style.display = v ? 'block' : 'none';
                optRoughClamp.domElem.style.display = v ? 'block' : 'none';
                optRoughRandomise.domElem.style.display = v ? 'block' : 'none';
                optRoughTaper.domElem.style.display = v ? 'block' : 'none';
            }
        }],
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
            precision: 0,
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
