'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var defineCompactProperty = require('./defineCompactProperty');

function Dialog (opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._setupProperties = [];
    this._offsetX = 0;
    this._offsetY = 0;
    this._offOnHideListeners = [];

    this._createDomElem();

    this._options = {
        deContent: this.deContent,
        buttons: [],
        title: opt.title || 'Dialog',
        onHide: () => this._onHide(),
    };
}

inherits(Dialog, EventEmitter);
var p = Dialog.prototype;
module.exports = Dialog;

Object.defineProperties(p, {

    title: {
        set: function (v) {

            if (!v || this._options.title === v) return;

            this._options.title = v;

            am.workspace.dialogs.setTitle(v);
        },
        get: function () {

            return this._options._title;
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

    if (opt.on) {

        Object.keys(opt.on).forEach(evtName => {

            this.on(evtName, opt.on[evtName]);

            this._offOnHideListeners.push({
                evtName: evtName,
                callback: opt.on[evtName],
            });
        });
    }

    this._setupProperties.forEach(function (propData) {

        if (propData.name in opt) {

            this[propData.name] = opt[propData.name];
        }

        var onOpt = 'on' + propData.evtName.charAt(0).toUpperCase() + propData.evtName.slice(1);

        if (onOpt in opt) {
            console.warn('deprecated, use opt.on to bind listeners!');
            this._offOnHideListeners.push({
                evtName: propData.evtName,
                callback: opt[onOpt],
            });
            this.on(propData.evtName, opt[onOpt]);
        }
    }, this);

    this.emit('show');

    am.workspace.dialogs.showDialog(this._options);

    return this;
};

p.hide = function () {

    am.workspace.dialogs.hideDialog(this._options);

    return this;
};

p._onHide = function () {

    if (!this._isOpened) return;
    this._isOpened = false;

    this._offOnHideListeners.forEach(reg => {
        this.off(reg.evtName, reg.callback);
    });

    this.emit('hide');
};

p.addProperty = function (opt) {

    var reg = defineCompactProperty(this, opt);

    this._setupProperties.push(reg);

    if (opt.input) {

        opt.input.value = this[reg.name];
        opt.input.on('change', v => this[reg.name] = v);
        this.on(reg.evtName, v => opt.input.value = v);
    }

    return this;
};

p.addButton = function (text, onClick) {

    if (onClick === 'hide') {
        onClick = () => this.hide();
    }

    this._options.buttons.push({text, onClick});

    return this;
};

p.hideButton = function (text) {

    var btn = _.find(this._options.buttons, {text});

    if (btn) btn.hidden = true;

    return this;
};

p.showButton = function (text) {

    var btn = _.find(this._options.buttons, {text});

    if (btn) btn.hidden = false;

    return this;
};





p._createDomElem = function () {

    if (this._isDialogCreated) return;
    this._isDialogCreated = true;

    this.deContent = document.createElement('div');
    this.deContent.style.width = '330px';
    this.deContent.style.padding = '30px 12px';
};
