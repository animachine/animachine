'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function Dialog (opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._setupProperties = [];

    this._createDialog();
    
    this.title = opt.title || 'Dialog';
}

inherits(Dialog, EventEmitter);
var p = Dialog.prototype;
module.exports = Dialog;

Object.defineProperties(p, {

    title: {
        set: function (v) {

            if (!v || this._title === v) return;

            this._title = v;
            this.domElem.setTitle(this._title);
        },
        get: function () {

            return this._title;
        },
    },
    isOpened: {
        get: function () {

            return this._isOpened;
        }
    }
});


p.show = function (opt) {

    if (this._isOpened) return;
    this._isOpened = true;

    opt = opt || {};

    am.deDialogCont.appendChild(this.domElem);

    this._setupProperties.forEach(function (propData) {

        if (propData.name in opt) {

            this[propData.name] = opt[propData.name];
        }

        var onOpt = 'on' + propData.evtName.charAt(0).toUpperCase() + propData.evtName.slice(1);

        if (onOpt in opt) {

            this.on(propData.evtName, opt[onOpt]);
        }
    }, this);

    this.domElem.showModal();
};

p.hide = function () {
    
    if (!this._isOpened) return;
    this._isOpened = false;

    this.domElem.close();

    this._setupProperties.forEach(function (propData) {

        this.removeAllListeners(propData.evtName);
    }, this);
};

p.addProperty = function (opt) {

    var value = opt.startValue, 
        name = opt.name,
        evtName = opt.evtName || 'change' + name.charAt(0).toUpperCase() + name.slice(1);

    this._setupProperties.push({
        name: name,
        evtName: evtName,
    });

    Object.defineProperty(this, name, {

        set: opt.set || function (v) {

            if (v === value) return;

            value = v;
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
};

p.addButton = function (text, handler) {

    if (handler === 'hide') {

        handler = this.hide.bind(this);
    }

    this.domElem.addButton(text, handler);
};

p.hideButton = function (text) {

    this.domElem.hideButton(text);
};

p.showButton = function (text) {

    this.domElem.showButton(text);
};



p._createDialog = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this.deContent = document.createElement('div');
    this.deContent.style.width = '330px';
    this.deContent.style.padding = '30px 12px';
    this.deContent.setAttribute('deContent', 1);

    
    this.domElem = amgui.createDialog({
        title: this.title,
        content: this.deContent,
        // parent: am.deDialogCont,
        buttons: [],
    });

    this.domElem.addEventListener('click_ok', this._onClickOk);

    this.domElem.addEventListener('click', function (e) {
    
        var rect = this.domElem.getBoundingClientRect();
    
        if (rect.left > e.x || rect.bottom < e.x ||
            rect.top > e.y || rect.right < e.y) 
        {
            this.hide();
        }
    }.bind(this));
};


