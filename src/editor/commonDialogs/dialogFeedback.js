'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function DialogFeedback () {

    EventEmitter.call(this);

    this._name = '';
    this._selectors = [];

    this._onClickOk = this._onClickOk.bind(this); 
}

inherits(DialogFeedback, EventEmitter);
var p = DialogFeedback.prototype;

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
        title: 'Feedback',
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
    this._deContent.style.width = '450px';
    this._deContent.style.padding = '30px 12px';

    amgui.createLabel({
        caption: 'Hi! This program is in alpha state, so most of the things will change and most of the bugs are known. But if you have any question, feedback, feature request, bug report or just feel the need for contact, you can use the azazdeaz@gmail.com or the <a style="color:white;" href="https://github.com/animachine/animachine/issues">github issues</a>.',
        fontSize: '18px',
        display: 'block',
        parent: this._deContent
    });
};

module.exports = new DialogFeedback();
