'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');

var FOLDERS = '<folders>';

function Download(opt) {

    EventEmitter.call(this);

    opt = opt || {};

    this._root = opt.root || '_Download/';

    this.icon = 'download';
    this.tooltip = 'Download';
}

inherits(Download, EventEmitter);
var p = Download.prototype;

p.features = {
    save: true,
}

p.save = function (name, data, path) {

    var data = 'data:application/javascript;charset=utf-8,' + encodeURIComponent(data);
    $('<a download="' + name + '" href="' + data + '"></a>')[0].click();
};

module.exports = Download;