'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var FOLDERS = '<folders>';

function PageScript(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._root = opt.root || '_PageScript/';

    this.icon = 'down-circled2';

    this._folders = window.localStorage.getItem(this._root + FOLDERS);
    
    try { 
        this.folders = JSON.parse(this._folders); 
    }
    catch (e) {
        this._folders = [];
    }
}

inherits(PageScript, EventEmitter);
var p = PageScript.prototype;

p.features = {
    save: true,
}

p.save = function (name, data, path) {

    name = this._validName(name);
    
    this.mkdir(path);
    this._set(path + name, data);

    return name;
};

module.exports = PageScript;