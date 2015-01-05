'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');

function EaseMap(opt) {

    EventEmitter.call(this);

    this._map = {};
}

inherits(EaseMap, EventEmitter);
var p = EaseMap.prototype;
module.exports = EaseMap;

p.getSave = function () {

    return _.cloneDeep(this._map);
}

p.useSave = function (save) {

    if (!save) throw Error;

    this._map = _.cloneDeep(this._map);

    this.emit('change');
}

p.set = function (name, ease) {

    this._map[name] = ease;

    this.emit('change');
};

p.showSetDialog = function (name, ease) {

    //TODO
};

p.get = function (name) {

    return this._map[name];
};

p.list = function () {

    return Object.keys(this._map);
};

p.remove = function(name) {

    delete this._map[name];

    this.emit('change');
};