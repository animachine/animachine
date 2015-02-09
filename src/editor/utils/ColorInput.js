'use strict';

var Input = require('./Input');
var inherits = require('inherits');
var amgui = require('../amgui');

var colorPicker;

function ColorInput(opt={}) {

    Input.call(this, opt);

    this._createBase();

    this._value = opt.value || '';
    this._defaultValue = opt.defaultValue || '#000000';
}

inherits(ColorInput, Input);
var p = ColorInput.prototype;
module.exports = ColorInput;

Object.defineProperties(p, {

    value: {
        set: function (v) {

            v += '';

            if (v === this._value) return;

            this._value = v;

            this._refreshInput();

            this.emit('change', this._value);
        },
        get: function () {

            return this._value;
        }
    },
});


p._onChangePicker = function () {

    this.value = colorPicker.getColor();
};

p._onClickShowPicker = function () {

    am.dialogs.WIP.show();
    // var br = this._btnShowPicker.getBoundingClientRect();
    // colorPicker.show(br.left, br.bottom,
    //     this.value || this._defaultValue,
    //     this._onChangePicker);
};



p._refreshInput = function () {

    if (this._input.value !== this._value) {

        this._input.value = this._value;
    }
};




p._createInput = function () {

    this._input = amgui.createInput({
        parent: this.domElem,
        onChange: v => this._onChangeInput(v),
        flex: 1,
    });
    this._input.style.textAlign =  'right';
    this._input.style.paddingRight =  '2px';

    this._btnShowPicker = amgui.createIconBtn({
        parent: this.domElem,
        icon: 'ajust',
        onClick: this._onClickShowPicker,
    });
};

// ColorInput.initColorPicker = function () {


//     if (colorPicker) return;

//     var onChange,
//         de = amgui.createDiv({
//             // parent: am.deDialogCont,
//             parent: document.body,
//             display: 'none',
//             width: '345px',
//             height: '345px',
//         });

//     de.setAttribute('data-am-nopick', 1);
//     de.style.zIndex = 999999;

//     colorPicker = new ColorPicker({
//         size: 2,
//         appenTo: de,
//         actionCallback: function () {

//             if (onChange) {
//                 onChange(colorPicker.getColor());
//             }
//         }
//     });

//     colorPicker.domElem = de;

//     $('.cp-app').css('position', 'relative')

//     colorPicker.getColor = function () {

//         if (colorPicker.color.alpha === 1) {

//             return '#' + colorPicker.color.HEX;
//         }
//         else {
//             return 'rgba(' +
//                 ~~(colorPicker.color.colors.RND.rgb.r)+','+
//                 ~~(colorPicker.color.colors.RND.rgb.g)+','+
//                 ~~(colorPicker.color.colors.RND.rgb.b)+','+
//                 colorPicker.color.colors.alpha + ')';
//         }
//     };

//     colorPicker.show = function (x, y, color, _onChange) {

//         de.style.display = 'block';
//         amgui.placeToPoint(de, x, y);

//         colorPicker.setColor(color, undefined, undefined, true);

//         onChange = _onChange;
//     }

//     colorPicker.hide = function (x, y) {

//         onChange = undefined;

//         de.style.display = 'none';
//     }
//     $('.cp-exit').click(colorPicker.hide)
// }
