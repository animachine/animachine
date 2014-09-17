'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');

function DialogKeyOptions () {

    EventEmitter.call(this);

    this._onSelectEase = this._onSelectEase.bind(this);
    this._onChangeEase = this._onChangeEase.bind(this);
    this._onChangeBezier = this._onChangeBezier.bind(this);
    this._onClickOk = this._onClickOk.bind(this); 
}

inherits(DialogKeyOptions, EventEmitter);
var p = DialogKeyOptions.prototype;

Object.defineProperties(p, {

    ease: {

        set: function (v) {

            if (this._ease === v) return;
            
            this._inpEase.value = v;
            this._beizerEditor.setValue(v);

            this.emit('changeEase', v);
        },
        get: function () {

            return this._ease;
        }
    }
});


p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    this.ease = opt.ease;

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

    this._deLabelEase = document.createElement('span');
    this._deLabelEase.textContent = 'ease: ';
    this._deContent.appendChild(this._deLabelEase);

    this._inpEase = document.createElement('input');
    this._inpEase.type = 'text';
    this._inpEase.value = 'linear';
    this._inpEase.style.width = '245px';
    this._inpEase.style.fontSize = '14px';
    this._inpEase.style.fontFamily = amgui.FONT_FAMILY;
    this._inpEase.style.background = 'none';
    this._inpEase.style.border = 'none';
    this._inpEase.style.color = amgui.color.text;
    this._inpEase.addEventListener('change', this._onChangeEase);
    this._deContent.appendChild(this._inpEase);

    this._btnSelectEase = amgui.createIconBtn({
        icon: 'chart-bar',
        display: 'inline'
    });
    this._btnSelectEase.style.marginLeft = '4px';
    this._deContent.appendChild(this._btnSelectEase);

    amgui.bindDropdown({
        deTarget: this._btnSelectEase,
        deMenu: amgui.createDropdown({
            options: ['linear', 'ease', 'ease-in', 'ease-out', 'ease-in-out', 'steps(1)', 'cubic-bezier(0,0,1,1)'],
            onSelect: this._onSelectEase,
        }),
        menuParent: this._deContent
    });

    this._beizerEditor = amgui.createBezierEditor({
        // width: 330,
        // height: 330,
        parent: this._deContent,
        onChange: this._onChangeBezier
    });
};

p._onClickOk = function (e) {

    this.hide();
};

p._onSelectEase = function (e) {

    this.ease = e.detail.selection;
};

p._onChangeEase = function (e) {

    this.ease = this._inpEase.value;
};

p._onChangeBezier = function (e) {

    this.ease = e.detail.value;
};

module.exports = new DialogKeyOptions();
