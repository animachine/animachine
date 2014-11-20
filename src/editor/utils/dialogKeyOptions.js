'use strict';

var inherits = require('inherits');
var amgui = require('../amgui');
var Dialog = require('./Dialog');

var dialog  = new Dialog({
    title: 'Key',
});




dialog.show = function (opt) {

    opt = opt || {};

    Dialog.prototype.show.call(this, opt);

    if (!('ease' in opt)) throw('opt.ease must be set');

    this._ease = opt.ease;
    this._beizerEditor.setPoints(this._ease.points);
};



dialog._createContent = function () {

    dialog.addButton('ok', 'hide');

    this._deContent = document.createElement('div');
    this._deContent.style.width = '330px';
    this._deContent.style.padding = '30px 12px';

    // this._deLabelEase = document.createElement('span');
    // this._deLabelEase.textContent = 'ease: ';
    // this._deContent.appendChild(this._deLabelEase);

    // this._inpEase = document.createElement('input');
    // this._inpEase.type = 'text';
    // this._inpEase.value = 'linear';
    // this._inpEase.style.width = '245px';
    // this._inpEase.style.fontSize = '14px';
    // this._inpEase.style.fontFamily = amgui.FONT_FAMILY;
    // this._inpEase.style.background = 'none';
    // this._inpEase.style.border = 'none';
    // this._inpEase.style.color = amgui.color.text;
    // this._inpEase.addEventListener('change', this._onChangeEase);
    // this._deContent.appendChild(this._inpEase);

    // this._btnSelectEase = amgui.createIconBtn({
    //     icon: 'chart-bar',
    //     display: 'inline'
    // });
    // this._btnSelectEase.style.marginLeft = '4px';
    // this._deContent.appendChild(this._btnSelectEase);

    // amgui.bindDropdown({
    //     deTarget: this._btnSelectEase,
    //     deMenu: amgui.createDropdown({
    //         options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'steps(1)', 'cubic-bezier(0,0,1,1)'],
    //         onSelect: this._onSelectEase,
    //     }),
    //     menuParent: this._deContent
    // });

    this._beizerEditor = amgui.createBezierEditor({
        // width: 330,
        // height: 330,
        parent: this._deContent,
        onChange: this._onChangeBezier
    });
};

// p._onSelectEase = function (e) {

//     this.ease = e.detail.selection;
// };

// p._onChangeEase = function () {

//     this.ease = this._inpEase.value;
// };

function onChangeBezier(e) {

    this._ease.points = e.detail.points;
};

module.exports = dialog;
