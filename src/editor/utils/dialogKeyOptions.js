'use strict';

var inherits = require('inherits');
var amgui = require('../amgui');
var Dialog = require('./Dialog');

var currEase, beizerEditor,
    dialog  = new Dialog({
    title: 'Key',
});

createContent();    




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

    var cbRoughEase = amgui.createCheckbox({
        text: 'RoughEase',
        parent: dialog.deContent,
        onChange: function (e) {
            if (e.detail.checked) {
                am.dialogs.WIP.show();
                cbRoughEase.value = false;
            }
        }
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
