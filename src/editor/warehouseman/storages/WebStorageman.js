'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var FOLDERS = '<folders>';

function WebStorageman(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._root = opt.root || '_webstorageman/';

    this.icon = 'bullseye';

    this._folders = window.localStorage.getItem(this._root + FOLDERS);
    
    try { 
        this.folders = JSON.parse(this._folders); 
    }
    catch (e) {
        this._folders = [];
    }
}

inherits(WebStorageman, EventEmitter);
var p = WebStorageman.prototype;

p.save = function (name, data, path) {

    name = this._validName(name);
    
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

    path = this._validPath(path);
    path = path.split('/');

    var folderPath = '';

    path.forEach(function (folder) {

        if (folder === '') {
            return;
        }

        folderPath += folder + '/';

        if (this._folders.indexOf(folderPath) !== -1) {

            this._folders.push(folderPath);
        }
    });
};

p.dir = function (path) {

    path = this._root + this._validPath(path);

    var ret = [];

    Object.keys(window.localStorage).forEach(function (key) {

        testKey(key, 'file');
    });

    this._folders.forEach(function (key) {

        testKey(key, 'folder');
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

};

p._set = function(path, data) {

    return window.localStorage.setItem(this._root + path, data);
};

p._get = function(path) {

    return window.localStorage.getItem(this._root + path);
};

p._validPath = function(path) {

    if (path.charAt(0) === '/') {
        path = path.substr(1);
    }

    if (path.charAt(path.length-1) !== '/') {
        path += '/';
    }

    return path;
};

p._validName = function(name) {

    return name.replace(/<|\//g, '_');
};

module.exports = WebStorageman;