'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function DialogSequOptions () {

    EventEmitter.call(this);

    this._name = '';
    this._selectors = [];

    this._onClickOk = this._onClickOk.bind(this); 
}

inherits(DialogSequOptions, EventEmitter);
var p = DialogSequOptions.prototype;

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    if ('name' in opt) this.name = opt.name;
    if ('selectors' in opt) this.selectors = opt.selectors;
    if ('onChangeName' in opt) this.on('changeName', opt.onChangeName);
    if ('onChangeSelectors' in opt) this.on('changeSelectors', opt.onChangeSelectors);

    this.domElem.showModal();
};

p.hide = function () {

    this.domElem.close();

    this.removeAllListeners('changeName');
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
    this._deContent.appendChild(this._inpName);

    this._inpName.addEventListener('change', function () {
        this.name = this._inpName.value;
    }.bind(this));

    amgui.createLabel({
        caption: 'Selectors',
        fontSize: '18px',
        display: 'block',
        parent: this._deContent
    });

    this._deSelectorCont = document.createElement('div');
    this._deSelectorCont.style.width = '100%px';
    this._deContent.appendChild(this._deSelectorCont);

    amgui.createIconBtn({
        icon: 'plus',
        onClick: this._addSelector.bind(this, ''),
        parent: this._deContent
    });
};

p._onSelectName = function (e) {

    this.setValue(e.detail.selection);
};

p._onChangeBezier = function (e) {

    this.setValue(e.detail.value);
};

Object.defineProperties(p, {

    name: {
        set: function (v) {

            if (this._name.value === v) {
                return;
            }

            this._name.value = v;
            this._inpName.value = v;
            this.emit('changeName', v);
        },
        get: function () {
            return this._name.value;
        }
    },

    selectors: {
        set: function (v) {

            this._selectors.slice().map(this._removeSelector, this);
            v.map(this._addSelector, this);
            
        },
        get: function () {
            return _.pluck(this._selectors, 'value'); 
        }
    }
});

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

module.exports = DialogSequOptions;
