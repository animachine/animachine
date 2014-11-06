'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var UnitInput = require('./UnitInput');

function Options(opt) {

    EventEmitter.call(this);

    this._createDomElem();

    if (opt.contextMenuOptions) {

        amgui.bindDropdown({
            asContextMenu: true,
            deTarget: this._deHeadcont,
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
            parent: this._deHeadcont
        });
    }

    if (opt.text) {

        this._deText = amgui.createLabel({
            parent: this._deHeadcont,
            caption: opt.text.text,
            flex: '1',
        });
    }

    if (opt.input) {

        this.input = new UnitInput({
            parent: this._deHeadcont,
            onChange: opt.input.onChange,
            flex: '1',
            units: opt.input.units
        });
    }

    if (opt.btnKey) {

        this.btnKey = amgui.createStepperKey({
            onClick: opt.btnKey.onClick,
            onClickPrev: opt.btnKey.onClickPrev,
            onClickNext: opt.btnKey.onClickNext,
            parent: this._deHeadcont,
        });
    }

    if (opt.hasSubcontainer) {

        this._createSubcontainer();
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










p._createDomElem = function() {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';

    this._deHeadcont = document.createElement('div');
    this._deHeadcont.style.width = '100%';
    this._deHeadcont.style.height = this._lineH + 'px';
    this.domElem.appendChild(this._deHeadcont);

    this._deIndent = document.createElement('div');
    this._deIndent.style.display = 'inline-block';
    this._deIndent.style.width = '0px';
    this._deHeadcont.appendChild(this._deIndent);
};

p._createSubcontainer = function () {

    this._deSubcont = document.createElement('div');
    this._deSubcont.style.width = '100%';
    this._deHeadcont.appendChild(this.domElem);
}
