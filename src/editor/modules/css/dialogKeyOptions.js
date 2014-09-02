var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function DialogKeyOptions () {

    EventEmitter.call(this);

    this._onSelectEase = this._onSelectEase.bind(this);
    this._onClickOk = this._onClickOk.bind(this); 
}

inherits(DialogKeyOptions, EventEmitter);
var p = DialogKeyOptions.prototype;

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    this._btnSelectEase.setCaption(opt.ease);

    this.domElem.showModal();
};

p.hide = function () {

    this.domElem.close();

    this.removeAllListeners('changeEase');
};

p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this._createContent();
    
    this.domElem = amgui.createDialog({
        title: 'Key',
        content: this._deContent,
        parent: am.deDialogCont,
        buttons: ['ok'],
    });

    this.domElem.addEventListener('click_ok', this._onClickOk);
};

p._createContent = function () {

    this._deContent = document.createElement('div');
    this._deContent.style.width = '330px';
    this._deContent.style.padding = '30px 12px';
    this._deContent.style.background = amgui.color.bg0;

    this._deLabelEase = document.createElement('span');
    this._deLabelEase.textContent = 'ease: ';
    this._deLabelEase.style.color = amgui.color.text;
    this._deContent.appendChild(this._deLabelEase);

    this._btnSelectEase = amgui.createBtn('linear');
    this._btnSelectEase.style.display = 'inline-block';
    this._deContent.appendChild(this._btnSelectEase);

    amgui.bindDropdown({
        deTarget: this._btnSelectEase,
        deMenu: amgui.createDropdown({
            options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'beizer'],
            onSelect: this._onSelectEase
        })
    });
};

p._onClickOk = function (e) {

    this.hide();
};

p._onSelectEase = function (e) {

    var ease = e.detail.selection;
    this._btnSelectEase.setCaption(ease);
    this.emit('changeEase', ease);
};

module.exports = new DialogKeyOptions();
