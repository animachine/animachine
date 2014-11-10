'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var UnitInput = require('./UnitInput');

function OptionLine(opt) {

    EventEmitter.call(this);

    this.inputs = {};
    this.buttons = {};
    this._indent = 0;
    this._lineH = amgui.LINE_HEIGHT;

    this._createDomElem();
    this._createHighlight();

    if (opt.indent) {

        this.indent = opt.indent;
    }

    if (opt.contextMenuOptions) {

        amgui.bindDropdown({
            asContextMenu: true,
            deTarget: this._deHeadCont,
            deMenu: amgui.createDropdown({
                optionLine: opt.contextMenuOptions
            })
        });
    }

    if (opt.tgglChildren) {

        this.buttons.tgglChildren = amgui.createToggleIconBtn({
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
                parent: de,
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

    if (opt.inputs) {

        opt.inputs.map(this.addInput, this);
    }

    if (opt.btnMerge) {

        this.addButton({
            domElem: amgui.createToggleIconBtn({
                iconOn: 'flow-split',
                iconOff: 'flow-merge',
                onClick: opt.btnMerge.onClick,
                parent: this._btnCont,
            }),
            name: 'merge',
        });
    }

    if (opt.btnKey) {

        this.addButton({
            domElem: amgui.createStepperKey({
                onClick: opt.btnKey.onClick,
                onClickPrev: opt.btnKey.onClickPrev,
                onClickNext: opt.btnKey.onClickNext,
                parent: this._btnCont,
            }),
            name: 'key',
        });
    }
}

inherits(OptionLine, EventEmitter);
var p = OptionLine.prototype;
module.exports = OptionLine;





Object.defineProperties(p, {

    title: {
        set: function (v) {
            this._deTitle.setText(v);
        },
    },
    highlight: {
        set: function (v) {
            this._deHighlight.style.opacity = v ? 1 : 0;
        },
    },
    indent: {
        set: function (v) {

            v = parseInt(v);
            if (v === this._indent) return;

            this._indent = v;
            this._deIndent.style.width = this._indent * 6 + 'px';
        },
        get: function (v) {
            return this._indent;
        },
    },
});




p.addInput = function (opt) {

    var input = new UnitInput(_.assign({
        parent: this._inputCont,
        onChange: opt.onChange,
        flex: '1',
    }, opt));

    if (opt.name) {

        this.inputs[opt.name] = input;
    }
};

p.addButton = function (opt) {

    this._btnCont.appendChild(opt.domElem);

    if (opt.name) {

        this.buttons[opt.name] = opt.domElem;
    }
};

p.addSubline = function (de) {

    this._deSubcont.appendChild(de);
};










p._createDomElem = function() {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.borderBottom = 'solid 1px #121212';
    this.domElem.style.boxSizing = 'border-box';
    this.domElem.style.overflow = 'hidden';

    this._deHeadCont = document.createElement('div');
    this._deHeadCont.style.position = 'relative';
    this._deHeadCont.style.display = 'flex';
    this._deHeadCont.style.width = '100%';
    this._deHeadCont.style.height = this._lineH + 'px';
    this.domElem.appendChild(this._deHeadCont);
    amgui.createSeparator({parent: this._deHeadCont});

    this._deIndent = document.createElement('div');
    this._deIndent.style.display = 'inline-block';
    this._deIndent.style.width = '0px';
    this._deHeadCont.appendChild(this._deIndent);

    this._deSubcont = document.createElement('div');
    this._deSubcont.style.width = '100%';
    this.domElem.appendChild(this._deSubcont);
};

p._createHighlight = function () {

    this._deHighlight = document.createElement('div');
    this._deHighlight.style.display = 'inline-block';
    this._deHighlight.style.width = '2px';
    this._deHighlight.style.height = this._lineH + 'px';
    this._deHighlight.style.background = 'gold';
    this._deHighlight.style.opacity = 0;
    this._deHeadCont.appendChild(this._deHighlight);
};
