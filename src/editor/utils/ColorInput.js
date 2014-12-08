'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');

var colorPicker;

function ColorInput(opt) {

    EventEmitter.call(this);

    this._onChangeInput = this._onChangeInput.bind(this);
    this._onChangePicker = this._onChangePicker.bind(this);
    this._onClickShowPicker = this._onClickShowPicker.bind(this);

    this._createBase();

    this._value = opt.value || '';
    this._defaultValue = opt.defaultValue || '#000000';

    ColorInput.initColorPicker();

    if ('flex' in opt) this.domElem.style.flex = opt.flex;
    if ('parent' in opt) opt.parent.appendChild(this.domElem);
    if (opt.onChange) this.on('change', opt.onChange);
}

inherits(ColorInput, EventEmitter);
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






p.reset = function () {

    this.value = this._defaultValue;
};







p._onChangeInput = function () {

    this.value = this._input.value;
};

p._onChangePicker = function () {

    this.value = colorPicker.getColor();
};

p._onClickShowPicker = function () {

    var br = this._btnShowPicker.getBoundingClientRect();
    colorPicker.show(br.left, br.bottom, 
        this.value || this._defaultValue, 
        this._onChangePicker);
};



p._refreshInput = function () {

    if (this._input.value !== this._value) {
    
        this._input.value = this._value;
    }
};




p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.display = 'flex';

    this._input = amgui.createInput({
        parent: this.domElem,
        onChange: this._onChangeInput,
        flex: 1, 
    });
    this._input.style.textAlign =  'right';
    this._input.style.paddingRight =  '2px';

    this._btnShowPicker = amgui.createIconBtn({
        parent: this.domElem,
        icon: 'color-adjust',
        onClick: this._onClickShowPicker,
    });
};

ColorInput.initColorPicker = function () {


    if (colorPicker) return;

    var onChange,
        de = amgui.createDiv({
            // parent: am.deDialogCont,
            parent: document.body,
            display: 'none',
            width: '345px',
            height: '345px',
        });

    de.setAttribute('am-nopick',1);
    de.style.zIndex = 999999;

    colorPicker = new ColorPicker({
        size: 2,
        appenTo: de,
        actionCallback: function () {

            if (onChange) {
                onChange(colorPicker.getColor());
            }
        }
    });

    colorPicker.domElem = de;

    $('.cp-app').css('position', 'relative')

    colorPicker.getColor = function () {

        if (colorPicker.color.alpha === 1) {

            return '#' + colorPicker.color.HEX;
        }
        else {
            return 'rgba(' + 
                ~~(colorPicker.color.colors.RND.rgb.r)+','+ 
                ~~(colorPicker.color.colors.RND.rgb.g)+','+ 
                ~~(colorPicker.color.colors.RND.rgb.b)+','+ 
                colorPicker.color.colors.alpha + ')';            
        }
    };

    colorPicker.show = function (x, y, color, _onChange) {

        de.style.display = 'block';
        amgui.placeToPoint(de, x, y);

        colorPicker.setColor(color, undefined, undefined, true);

        onChange = _onChange;
    }

    colorPicker.hide = function (x, y) {

        onChange = undefined;

        de.style.display = 'none';
    }
    $('.cp-exit').click(colorPicker.hide)
}