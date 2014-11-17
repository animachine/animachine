'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

function Ease(opt) {

    EventEmitter.call(this);
    
    this._type =  0;
    this._points = [];

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Ease, EventEmitter);
var p = Ease.prototype;
module.exports = Ease;

Object.defineProperties(p, {

    type: {
        set: function (v) {

            if (this._type === v) return;

            this._type = parseInt(v);
        },
        get: function () {

            return this._type;
        }
    }
});









p.getSave = function () {

    return {
        value: this.value,
        time: this.time,
        ease: this.ease
    };
};

p.useSave = function (save) {

    this.value = save.value;
    this.time = save.time;
    this.ease = save.ease;
};

