'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function Dialog (opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this.title = opt.title || 'Dialog';
    this._setupProperties = [];
}

inherits(Dialog, EventEmitter);
var p = Dialog.prototype;
module.exports = Dialog;



Object.defineProperties(p, {
});

p.show = function (opt) {

    opt = opt || {};

    this._createDialog();

    this._setupProperties.forEach(function (propData) {

        if (propData.name in opt) {

            this[propData.name] = opt[propData.name];
        }

        var onOpt = 'on' + propData.evtName.charAt(0).toUpperCase() + propData.evtName.slice(1);

        if (onOpt in opt) {

            this.on(propData.evtName, opt[onOpt]);
        }
    });

    this.domElem.showModal();
};

p.hide = function () {

    this.domElem.close();

    this._setupProperties.forEach(function (propData) {

        this.removeAllListeners(propData.evtName);
    });
};

p.addPoperty = function (opt) {

    var value = opt.startValue, 
        name = opt.name,
        evtName = opt.evtName || 'change' + name.charAt(0).toUpperCase() + name.slice(1);

    this._setupParamNames.push(name);

    Object.defineProperty(this, name, {

        set: opt.set || function (v) {

            if (v === value) return;

            v = value;
            refreshInput();

            this.emit(evtName, value);
        },
        get: opt.get || function (v) {

            return value;
        }
    });

    if (opt.input) {

        opt.input.on('change', function (v) {

            this[name] = v;
        }.bind(this));

        refreshInput();
    }

    function refreshInput() {

        if (opt.input && opt.input.value !== value) {

            deInput.value = value;
        }
    }
}

p.addButton = function (name, handler) {

    if (handler === 'hide') {

        handler = this.hide.bind(this);
    }

    this.domElem.addButton(name, handler)
}

p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this._createContent();
    
    this.domElem = amgui.createDialog({
        title: this.title,
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

    amgui.createLabel({
        caption: 'Dialog content',
        fontSize: '18px',
        display: 'block',
        parent: this._deContent
    });
};


