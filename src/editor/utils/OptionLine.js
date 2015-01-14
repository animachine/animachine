'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var UnitInput = require('./UnitInput');
var StringInput = require('./StringInput');
var SelectInput = require('./SelectInput');
var ColorInput = require('./ColorInput');
var CheckboxInput = require('./CheckboxInput');

function OptionLine(opt) {

    EventEmitter.call(this);

    this.inputs = {};
    this.buttons = {};
    this._indent = 0;
    this._lineH = amgui.LINE_HEIGHT;
    this._hidden = false;

    this._createDomElem();
    this._createHighlight();

    this._subOptionLines = [];

    if (opt.separator) {
        
        amgui.createSeparator({parent: this._deHeadCont});;
    }

    if (opt.parent) {

        opt.parent.appendChild(this.domElem);
    }

    if (opt.contextMenuOptions) {

        this.dropdown = amgui.createDropdown({
            options: opt.contextMenuOptions,
        });

        amgui.bindDropdown({
            asContextMenu: true,
            deTarget: this._deHeadCont,
            deMenu: this.dropdown,
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
    else if (opt.keepSpaceForTgglChildren) {

        this._deHighlight.style.marginRight = '16px';
    }

    this._createIndent();

    if (opt.indent) {

        this.indent = opt.indent;
    }

    if (opt.title) {

        this._deTitle = amgui.createLabel({
            text: typeof opt.title === 'string' ? opt.title : (opt.title.text || ''), 
            parent: this._deHeadCont,
        });

        if (opt.title.onClick) {

            this._deTitle.addEventListener('click', opt.title.onClick);

            var deNameIcon = amgui.createIcon({
                icon: 'pencil',
                parent: this._deHeadCont,
            });
            deNameIcon.style.display = 'none';
            this._deTitle.addEventListener('mouseenter', () => deNameIcon.style.display = 'inline-block');
            this._deTitle.addEventListener('mouseleave', () => deNameIcon.style.display = 'none');
        }
    }

    this._inputCont = amgui.createDiv({
        parent: this._deHeadCont,
        display: 'flex',
        flex: '1',
    });

    this._btnCont = amgui.createDiv({
        parent: this._deHeadCont,
        display: 'inline-block'
    });

    if (opt.inputs) {

        opt.inputs.forEach(this.addInput, this);
    }

    if (opt.tgglMerge) {

        this.addButton({
            domElem: amgui.createToggleIconBtn({
                iconOn: 'flow-line',
                iconOff: 'flow-parallel',
                onClick: opt.tgglMerge.onClick,
            }),
            name: 'tgglMerge',
        });
    }

    if (opt.btnKey) {

        this.addButton({
            domElem: amgui.createStepperKey({
                onClick: opt.btnKey.onClick,
                onClickPrev: opt.btnKey.onClickPrev,
                onClickNext: opt.btnKey.onClickNext,
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
        get: function (v) {
            this._deTitle.getText(v);
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
    hidden: {
        set: function (v) {

            v = !!v;

            if (v === this._hidden) return;

            this._hidden = v;

            this.domElem.style.display = v ? 'none' : '';
        },
        get: function () {

            return this._hidden;
        }
    }
});




p.addInput = function (opt) {

    var input;

    opt = _.assign({
        onChange: opt.onChange,
        flex: '1',
    }, opt);

    switch (opt.type) {

        case 'unit':
            input = new UnitInput(opt);
            break;

        case 'select':
            input = new SelectInput(opt);
            break;

        case 'color':
            input = new ColorInput(opt);
            break;

        case 'checkbox':
            input = new CheckboxInput(opt);
            break;

        case 'string':
        default:
            input = new StringInput(opt);
    }

    if (opt.name) {

        this.inputs[opt.name] = input;
    }

    this._inputCont.appendChild(input.domElem);
};

p.addButton = function (opt) {

    if ('childIdx' in opt && this._btnCont.children[opt.childIdx]) {

        this._btnCont.insertBefore(opt.domElem, this._btnCont.children[opt.childIdx]);
    }
    else {
        this._btnCont.appendChild(opt.domElem);
    }

    opt.domElem.style.display = 'inline-block';
    opt.domElem.style.verticalAlign = 'top';

    if (opt.name) {

        this.buttons[opt.name] = opt.domElem;
    }
};

p.addOptionLine = function (optionLine) {

    this._subOptionLines.push(optionLine);
    this._deSubcont.appendChild(optionLine.domElem);

    if (this._isBorrowingChildInputs) {
        this.returnChildInputs();
        this.borrowChildInputs();
    }
};

p.removeOptionLine = function (optionLine) {

    var idx = this._subOptionLines.indexOf(optionLine);
    if (idx === -1) return;

    this._subOptionLines.splice(idx, 1);
    $(optionLine).remove();

    if (this._isBorrowingChildInputs) {
        this.returnChildInputs();
        this.borrowChildInputs();
    }
};

p.showSubline = function () {

    this._deSubcont.style.display = '';
};

p.hideSubline = function () {

    this._deSubcont.style.display = 'none';
};

p.borrowChildInputs = function () {
//TODO: do this two somehow better

    this._isBorrowingChildInputs = true;

    this._subOptionLines.forEach(line => {

        if (line.hidden) return;
        
        Object.keys(line.inputs).forEach(inpName => {

            this._inputCont.appendChild(line.inputs[inpName].domElem);
        });
    });
};

p.returnChildInputs = function () {

    this._isBorrowingChildInputs = false;

    var deInputs = _.toArray(this._inputCont.children);

    this._subOptionLines.forEach(line => {

        Object.keys(line.inputs).forEach(inpName => {

            var idx = deInputs.indexOf(line.inputs[inpName].domElem);
            if (idx === -1) return;
            line._inputCont.appendChild(deInputs[idx]);
        });
    });
};









p._createDomElem = function() {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.overflow = 'hidden';

    this._deHeadCont = document.createElement('div');
    this._deHeadCont.style.position = 'relative';
    this._deHeadCont.style.display = 'flex';
    this._deHeadCont.style.width = '100%';
    this._deHeadCont.style.height = this._lineH + 'px';
    this.domElem.appendChild(this._deHeadCont);

    amgui.createSeparator({parent: this._deHeadCont});

    this._deSubcont = document.createElement('div');
    this._deSubcont.style.width = '100%';
    this.domElem.appendChild(this._deSubcont);
};

p._createHighlight = function () {

    this._deHighlight = document.createElement('div');
    this._deHighlight.style.display = 'inline-block';
    this._deHighlight.style.width = '2px';
    this._deHighlight.style.height = this._lineH + 'px';
    this._deHighlight.style.background = amgui.color.selected;
    this._deHighlight.style.opacity = 0;
    this._deHeadCont.appendChild(this._deHighlight);
};

p._createIndent = function () {

    this._deIndent = document.createElement('div');
    this._deIndent.style.display = 'inline-block';
    this._deIndent.style.width = '0px';
    this._deHeadCont.appendChild(this._deIndent);
};
