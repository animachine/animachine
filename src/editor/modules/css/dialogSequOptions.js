'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function DialogSequOptions () {

    EventEmitter.call(this);

    this._name = '';
    this._selectors = [];

    this._onClickOk = this._onClickOk.bind(this); 
    this._onChangeName = this._onChangeName.bind(this); 
    this._onSelectFill = this._onSelectFill.bind(this); 
    this._onChangeIterations = this._onChangeIterations.bind(this); 
}

inherits(DialogSequOptions, EventEmitter);
var p = DialogSequOptions.prototype;



Object.defineProperties(p, {

    name: {
        set: function (v) {

            if (this._name === v) {
                return;
            }

            this._name = v;
            this._inpName.value = v;
            this.emit('changeName', v);
        },
        get: function () {
            return this._name;
        }
    },

    selectors: {
        set: function (v) {

            this._deSelectorCont.innerHTML = '';
            this._selectors.slice().map(this._removeSelector, this);
            v.map(this._addSelector, this);
            
        },
        get: function () {
            return _.pluck(this._selectors, 'value'); 
        }
    },

    fill: {
        set: function (v) {

            if (this._fill === v) {
                return;
            }

            this._fill = v;
            this._deFill.textContent = v;
            this.emit('changeFill', v);
        },
        get: function () {
            return this._fill;
        }
    },

    iterations: {
        set: function (v) {

            if (this._iterations === v) {
                return;
            }

            this._iterations = v;
            this._inpIterations.value = v;
            this.emit('changeIterations', v);
        },
        get: function () {
            return this._iterations;
        }
    },
});

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    if ('name' in opt) this.name = opt.name;
    if ('fill' in opt) this.fill = opt.fill;
    if ('iterations' in opt) this.iterations = opt.iterations;
    if ('selectors' in opt) this.selectors = opt.selectors;

    if ('onChangeName' in opt) this.on('changeName', opt.onChangeName);
    if ('onChangeFill' in opt) this.on('changeFill', opt.onChangeFill);
    if ('onChangeIterations' in opt) this.on('changeIterations', opt.onChangeIterations);
    if ('onChangeSelectors' in opt) this.on('changeSelectors', opt.onChangeSelectors);

    this.domElem.showModal();
};

p.hide = function () {

    this.domElem.close();

    this.removeAllListeners('changeName');
    this.removeAllListeners('changeFill');
    this.removeAllListeners('changeIterations');
    this.removeAllListeners('changeSelectors');
};

p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this._createContent();
    
    this.domElem = amgui.createDialog({
        title: 'Sequence',
        content: this._deContent,
        parent: am.deDialogCont,
        buttons: ['ok'],
    });

    this.domElem.addEventListener('click_ok', this._onClickOk);
};

p._onClickOk = function () {

    this.hide();
};

p._onChangeName = function () {

    this.name = this._inpName.value;
};

p._onSelectFill = function (e) {

    this.fill = e.detail.selection;
};

p._onChangeIterations = function () {

    this.iterations = parseInt(this._inpIterations.value);
};


p._createContent = function () {

    this._deContent = document.createElement('div');
    this._deContent.style.width = '330px';
    this._deContent.style.padding = '30px 12px';

    amgui.createLabel({
        caption: 'Name',
        fontSize: '18px',
        display: 'block',
        parent: this._deContent
    });

    this._inpName = document.createElement('input');
    this._inpName.type = 'text';
    this._inpName.value = this.name;
    this._inpName.style.width = '245px';
    this._inpName.style.fontSize = '14px';
    this._inpName.style.fontFamily = amgui.FONT_FAMILY;
    this._inpName.style.background = 'none';
    this._inpName.style.border = 'none';
    this._inpName.style.marginBottom = '12px';
    this._inpName.style.color = amgui.color.text;
    this._inpName.addEventListener('change', this._onChangeName);
    this._deContent.appendChild(this._inpName);

    amgui.createLabel({
        caption: 'Selectors',
        fontSize: '18px',
        display: 'block',
        parent: this._deContent
    });

    this._deSelectorCont = document.createElement('div');
    this._deSelectorCont.style.width = '100%';
    this._deContent.appendChild(this._deSelectorCont);

    amgui.createIconBtn({
        icon: 'plus',
        onClick: this._addSelector.bind(this, ''),
        parent: this._deContent
    });

    amgui.createIconBtn({
        icon: 'code',
        onClick: function () {am.dialogs.featureDoesntExist.show()},
        parent: this._deContent,
        tooltip: 'select from options'
    });

    amgui.createLabel({
        caption: 'fill mode: ',
        parent: this._deContent
    });
    this._deFill = amgui.createLabel({
        parent: this._deContent
    });
    amgui.bindDropdown({
        deTarget: this._deFill,
        deMenu: amgui.createDropdown({
            options: ['none', 'forwards', 'backwards', 'both'],
            onSelect: this._onSelectFill,
        }),
        menuParent: this._deContent,
    });

    amgui.createLinebreak({
        parent: this._deContent
    });

    amgui.createLabel({
        caption: 'iterations: ',
        parent: this._deContent
    });

    this._inpIterations = document.createElement('input');
    this._inpIterations.type = 'number';
    this._inpIterations.step = 1;
    this._inpIterations.min = 0;
    this._inpIterations.max = 999999999999;
    this._inpIterations.style.fontSize = '14px';
    this._inpIterations.style.fontFamily = amgui.FONT_FAMILY;
    this._inpIterations.style.background = 'none';
    this._inpIterations.style.border = 'none';
    this._inpIterations.style.marginBottom = '12px';
    this._inpIterations.style.color = amgui.color.text;
    this._inpIterations.addEventListener('change', this._onChangeIterations);
    this._deContent.appendChild(this._inpIterations);
};

p._addSelector = function(value) {

    var selector = {
        value: value,
    };

    var height = 23;

    selector.domElem = document.createElement('div');
    selector.domElem.style.display = 'flex';
    selector.domElem.style.height = height + 'px';
    selector.domElem.style.paddingLeft = '2px';
    selector.domElem.style.margin = '1px 0';
    selector.domElem.style.background = amgui.color.bg2;
    this._deSelectorCont.appendChild(selector.domElem);

    var inp = document.createElement('input');
    inp.type = 'text';
    inp.value = value;
    inp.placeholder = 'selector';
    inp.style.width = '245px';
    inp.style.height = height + 'px';
    inp.style.fontSize = '14px';
    inp.style.fontFamily = amgui.FONT_FAMILY;
    inp.style.flex = '1';
    inp.style.background = 'none';
    inp.style.border = 'none';
    inp.style.color = amgui.color.text;
    selector.domElem.appendChild(inp);

    inp.addEventListener('change', function () {
        this.emit('changeSelectors', this.selectors);
    }.bind(this));

    var btnDel = amgui.createIconBtn({
        icon: 'cancel',
        height: height,
        display: 'inline-block',
        onClick:this._removeSelector.bind(this, selector),
        parent: selector.domElem
    });
    btnDel.style.visibility = 'hidden';

    selector.domElem.addEventListener('mouseenter', function () {
        btnDel.style.visibility = 'visible';
    });
    selector.domElem.addEventListener('mouseleave', function () {
        btnDel.style.visibility = 'hidden';
    });
};

p._removeSelector = function (selector) {

    this._selectors.splice(this._selectors.indexOf(selector), 1);

    selector.domElem.parentNode.removeChild(selector.domElem);
};

module.exports = new DialogSequOptions();
