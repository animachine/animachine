'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');
var defineCompactProperty = require('./defineCompactProperty');

function Dialog (opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._setupProperties = [];
    this._offsetX = 0;
    this._offsetY = 0;

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

    this.emit('show');

    this.domElem.showModal();
};

p.hide = function () {
    
    if (!this._isOpened) return;
    this._isOpened = false;

    this.domElem.close();

    this._setupProperties.forEach(function (propData) {

        this.removeAllListeners(propData.evtName);
    }, this);

    this.emit('hide');
};

p.addProperty = function (opt) {

    this._setupProperties.push(defineCompactProperty(this, opt));
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

p.move = function (x, y) {

    this._offsetX = x;
    this._offsetY = y;

    this.domElem.style.transform = 'translate('+x+'px,'+y+'px)';
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

    amgui.makeDraggable({
        deTarget: this.domElem,
        thisArg: this,
        onDown: function () {

            return {
                offsetX: this._offsetX,
                offsetY: this._offsetY,
            }
        },
        onDrag: function (md) {

            this.move(md.offsetX + md.dx, md.offsetY + md.dy);
        }
    });

    this.domElem.addEventListener('click_ok', this._onClickOk);

    this.domElem.addEventListener('click', function (e) {
    
        var rect = this.domElem.getBoundingClientRect();
    
        if (rect.left > e.x || rect.right < e.x ||
            rect.top > e.y || rect.bottom < e.y) 
        {
            this.hide();
        }
    }.bind(this));
};


