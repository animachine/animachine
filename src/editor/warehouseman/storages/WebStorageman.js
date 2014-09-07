'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var ROOT = '_webstorageman/', 
    FOLDERS = '<folders>';

function WebStorageman(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this.icon = 'bullseye';
    this.rootName = 'webstorage';

    this._folders = window.localStorage.getItem(ROOT + FOLDERS);
    
    try { 
        this._folders = JSON.parse(this._folders); 
    }
    catch (e) {}

    if (!(this._folders instanceof Array)) {

        this._folders = [];
    } 
}

inherits(WebStorageman, EventEmitter);
var p = WebStorageman.prototype;

p.features = {
    save: true,
    open: true,
    browse: true,
}


p.save = function (name, data, path) {

    name = this._validName(name);
    path = this._validPath(path);
    
    this.mkdir(path);
    this._set(path + name, data);

    return name;
};

p.load = function (name, path) {

    name = this._validName(name);
    path = this._validPath(path);
    
    return this._get(path + name);
};

p.mkdir = function (path) {

    path = this._validPath(path).split('/').filter(Boolean);

    var folderPath = '';

    path.forEach(function (folder) {

        this._addFolder(folder + '/');

    }, this);
};

p.dir = function (path) {

    path = ROOT + this._validPath(path);

    var ret = [];

    Object.keys(window.localStorage).forEach(function (key) {

        if (key.indexOf(FOLDERS) === -1) {

            testKey(key, 'file');
        }
    });

    this._folders.forEach(function (path) {

        testKey(ROOT + path.slice(0, -1), 'folder');
    });

    return ret;

    function testKey(key, type) {

        if (key.indexOf(path) === 0) {

            key = key.substr(path.length);
            
            if (key.indexOf('/') === -1) {

                ret.push({
                    name: key,
                    type: type
                });
            }
        }
    }
};

p._addFolder = function(path) {

    if (this._folders.indexOf(path) !== -1) {
        return;
    }

    this._folders.push(path);

    window.localStorage.setItem(ROOT + FOLDERS, JSON.stringify(this._folders));
};

p._set = function(path, data) {

    return window.localStorage.setItem(ROOT + path, data);
};

p._get = function(path) {

    return window.localStorage.getItem(ROOT + path);
};

p._validPath = function(path) {

    if (!path) {
        path = '';
    }

    if (path.charAt(0) === '/') {
        path = path.substr(1);
    }

    if (path.charAt(path.length-1) !== '/' && path.length) {
        path += '/';
    }

    return path;
};

p._validName = function(name) {

    return name.replace(/<|\//g, '_');
};

module.exports = WebStorageman;