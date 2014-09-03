'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var FOLDERS = '<folders>';

function PageScript(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._root = opt.root || '_PageScript/';

    this.icon = 'code';

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

p.save = function (name, data, path) {

    name = this._validName(name);
    
    this.mkdir(path);
    this._set(path + name, data);

    return name;
};

p.open = function (name) {

    if (name in pageScripts()) {

        return pageScripts()[name];
    }
};

p.dir = function (path) {

    var ret = [];

    Object.keys(pageScripts()).forEach(function (key) {

        ret.push({
            name: key,
            type: 'file'
        });
    });

    return ret;
};

function pageScripts() {

    return (window.am && window.am.pageScripts) || [];
}

module.exports = PageScript;