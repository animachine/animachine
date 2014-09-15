'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function DialogFeatureDoesntExits () {

    EventEmitter.call(this);

    this._name = '';
    this._selectors = [];

    this._onClickOk = this._onClickOk.bind(this); 
}

inherits(DialogFeatureDoesntExits, EventEmitter);
var p = DialogFeatureDoesntExits.prototype;

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    this.domElem.showModal();
};

p.hide = function () {

    this.domElem.close();
};

p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this._createContent();
    
    this.domElem = amgui.createDialog({
        titleIcon: 'emo-unhappy',
        title: 'Sorry',
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
        caption: 'This feature doesn\'t exits yet. (But it\'s on the way!)',
        fontSize: '18px',
        display: 'block',
        parent: this._deContent
    });
};

module.exports = new DialogFeatureDoesntExits();
