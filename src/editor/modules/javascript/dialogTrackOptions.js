    'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../../amgui');

function DialogTrackOptions () {

    EventEmitter.call(this);

    this._name = '';
    this._selectors = [];

    this._onClickOk = this._onClickOk.bind(this); 
    this._onChangeName = this._onChangeName.bind(this);
}

inherits(DialogTrackOptions, EventEmitter);
var p = DialogTrackOptions.prototype;



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
});

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    if ('name' in opt) this.name = opt.name;

    if ('onChangeName' in opt) this.on('changeName', opt.onChangeName);

    this.domElem.showModal();
};

p.hide = function () {

    this.domElem.close();

    this.removeAllListeners('changeName');
};

p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this._createContent();
    
    this.domElem = amgui.createDialog({
        title: 'Track',
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
};

module.exports = new DialogTrackOptions();
