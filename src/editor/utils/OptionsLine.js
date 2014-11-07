'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var UnitInput = require('./UnitInput');

function OptionsLine(opt) {

    EventEmitter.call(this);

    this._createDomElem();
    this._createHighlight();

    if (opt.indent) {

        this._deIndent.style.width = opt.indent * 6 + 'px';
    }

    if (opt.contextMenuOptions) {

        amgui.bindDropdown({
            asContextMenu: true,
            deTarget: this._deHeadCont,
            deMenu: amgui.createDropdown({
                options: opt.contextMenuOptions
            })
        });
    }

    if (opt.tgglChildren) {

        this.tgglChildren = amgui.createToggleIconBtn({
            iconOn: 'angle-down',
            iconOff: 'angle-right',
            onClick: opt.tgglChildren.onClick,
            parent: this._deHeadCont
        });
    }

    if (opt.title) {

        this._deTitle = amgui.createLabel({
            text: this._name, 
            parent: this._deHeadCont
        });

        if (opt.title.onClick) {

            this._deTitle.addEventListener('click', opt.title.onClick);

            var deNameIcon = amgui.createIcon({
                icon: 'cog',
                parent: de
            });
            deNameIcon.style.display = 'none';
            this._deName.addEventListener('mouseenter', function () {deNameIcon.style.display = 'inline-block';});
            this._deName.addEventListener('mouseleave', function () {deNameIcon.style.display = 'none';});
        }
    }

    this._inputCont = amgui.createDiv({
        parent: this._deHeadCont,
        display: 'inline-block',
        flex: '1',
    });

    this._btnCont = amgui.createDiv({
        parent: this._deHeadCont,
        display: 'inline-block'
    });

    if (opt.input) {

        this.addInput(opt.input);
    }

    if (opt.inputs) {

        this.inputs.map(this.addInput, this);
    }

    if (opt.btnDiverge) {

        this.addButton({
            domElem: amgui.createToggleIconBtn({
                iconOn: 'flow-split',
                iconOff: 'flow-merge',
                onClick: opt.btnDiverge.onClick,
                parent: this._deHeadCont,
            }),
            name: 'diverge',
        });
    }

    if (opt.btnKey) {

        this.addButton({
            domElem: amgui.createStepperKey({
                onClick: opt.btnKey.onClick,
                onClickPrev: opt.btnKey.onClickPrev,
                onClickNext: opt.btnKey.onClickNext,
                parent: this._deHeadCont,
            }),
            name: 'key',
        });
    }
}

inherits(OptionsLine, EventEmitter);
var p = OptionsLine.prototype;
module.exports = OptionsLine;





Object.defineProperties(p, {

    text: {
        set: function (v) {
            this._deText.setText(v);
        },
    },
    highlight: {
        set: function (v) {
            this._deHighlight.style.opacity = v ? 1 : 0;
        },
    },
});




p.addInput = function (opt) {

    if (!opt) {
        return;
    }
    else if (opt.domElem) {}//...

    this.input = new UnitInput({
        parent: this._deHeadCont,
        onChange: opt.onChange,
        flex: '1',
        units: opt.units
    });
};

p.addButton = function (opt) {

    this._btnCont.appendChild(opt.domElem);

    if (opt.name) {

        this.buttons[opt.name] = deBtn;
    }
};










p._createDomElem = function() {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';

    this._deHeadCont = document.createElement('div');
    this._deHeadCont.style.width = '100%';
    this._deHeadCont.style.height = this._lineH + 'px';
    this.domElem.appendChild(this._deHeadCont);

    this._deIndent = document.createElement('div');
    this._deIndent.style.display = 'inline-block';
    this._deIndent.style.width = '0px';
    this._deHeadCont.appendChild(this._deIndent);

    this.deSubcont = document.createElement('div');
    this.deSubcont.style.width = '100%';
    this.domElem.appendChild(this.deSubcont);
};

p._createHighlight = function () {

    this._deHighlight = document.createElement('div');
    this._deHighlight.style.display = 'inline-block';
    this._deHighlight.style.width = '2px';
    this._deHighlight.style.height = this._baseH + 'px';
    this._deHighlight.style.background = 'gold';
    this._deHighlight.style.opacity = 0;
    this._deHeadCont.appendChild(this._deHighlight);
};
