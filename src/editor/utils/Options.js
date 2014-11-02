'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function Options(opt) {

    EventEmitter.call(this);

    this._createDomElem();

    if (opt.contextMenuOptions) {

        amgui.bindDropdown({
            asContextMenu: true,
            deTarget: this.domElem,
            deMenu: amgui.createDropdown({
                options: opt.contextMenuOptions
            })
        });
    }

    if (opt.indent) {

        this._deIndent.style.width = opt.indent * 6 + 'px';
    }

    if (opt.tgglDropdown) {

        this.tgglDropdown = amgui.createToggleIconBtn({
            iconOn: 'angle-down',
            iconOff: 'angle-right',
            onClick: opt.tgglDropdown.onClick,
            parent: this.domElem
        });
    }

    if (opt.text) {

        this._deText = amgui.createLabel({
            parent: this.domElem,
            caption: opt.text.text,
            flex: '1',
        });
    }

    if (opt.input) {

        this.input = amgui.createInput({
            parent: this.domElem,
            onChange: opt.input.onChange,
            flex: '1',
        });
    }

    if (opt.btnKey) {

        this.btnKey = amgui.createStepperKey({
            onClick: opt.btnKey.onClick,
            onClickPrev: opt.btnKey.onClickPrev,
            onClickNext: opt.btnKey.onClickNext,
            parent: this.domElem,
        });
    }
}

inherits(Options, EventEmitter);
var p = Options.prototype;
module.exports = Options;


Object.defineProperties(p, {

    text: {
        set: function (v) {
            this._deText.setText(v);
        }
    } 
});












p.addIcon = function (opt) {


};













p._createDomElem = function() {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = this._lineH + 'px';
    this.domElem.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';

    this._deIndent = document.createElement('div');
    this._deIndent.style.display = 'inline-block';
    this._deIndent.style.width = '0px';
    this.domElem.appendChild(this._deIndent);
}