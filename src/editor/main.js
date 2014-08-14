'use strict';

var domready = require('domready');
var EventEmitter = require('events').EventEmitter;
var Transhand = require('./transhand/Transhand');
var Timeline = require('./timeline/Timeline');
var modules = {
    css: require('./modules/css')
}



var handlerBuff = [];


var am = window.dam = module.exports = _.extend(new EventEmitter(), {

    sequenceTypes: [],

    registerSequenceType: function (sequType) {

        this.sequenceTypes.push(sequType);
    }
});

am.timeline = new Timeline(am);
am.deRoot = document.body;

am.getHandler = function () {

    if (handlerBuff.length) {

        return handlerBuff.pop();
    }
    else {
        return new Transhand();
    }
}

am.throwHandler = function (handler) {

    handlerBuff.push(handler);
} 

domready(function () {

    debugRect();

    am.timeline.domElem.style.position = 'fixed';
    am.timeline.domElem.style.width = '100%';
    am.timeline.domElem.style.height = '230px';
    am.timeline.domElem.style.bottom = '0px';
    document.body.appendChild(am.timeline.domElem);

    document.body.addEventListener(function (e) {

        if (isPickable(e.target)) {

            am.emit('pick', e.target);
        }
    });

    modules.css.init(am)
});

function debugRect() {
    var de = document.createElement('div');
    de.style.position = 'absolute';
    de.style.backgroundColor = 'blue';
    de.style.left = '55px';
    de.style.top = '55px';
    de.style.width = '55px';
    de.style.height = '55px';
    document.body.appendChild(de);
};

function isPickable() {

    var deAm = am.timeline.domElem;

    return step(deTest);

    function step(de) {

        if (de === document.body) {
            return true;
        }
        else if (de === deAm) {
            return false;
        }
        else {
            return step(de.parentNode);
        }
    }
}