'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var BezierEasing = require('bezier-easing');
var defineCompactProperty = require('../utils/defineCompactProperty');
var dialogEaseOptions = require('./dialogEaseOptions');
var debugId = 0
function Ease(opt) {

    EventEmitter.call(this);
    this._aaaDebugId = ++debugId;
    this._type =  'bezier';
    this._points = [];
    this.points = [0, 0, 1, 1];
    this._easer;

    this.on('change.rough', this._refreshEaser, this);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Ease, EventEmitter);
var p = Ease.prototype;
module.exports = Ease;

Object.defineProperties(p, {

    type: {
        set: function () {

            //currently the only supproted type is bezier
        },
        get: function () {

            return this._type;
        },
    },
    points: {
        set: function (v) {

            var p = this._points;

            if (p.length === v.length &&
                p.every(function (p, idx) {return p === v[idx];}))
            {
                return;
            }

            p.length = 0;
            p.push.apply(this._points, v);

            this._refreshEaser();

            this.emit('change');
        },
        get: function () {

            return this._points;
        }
    }
});

defineCompactProperty(p, {name: 'roughEase', type: 'boolean', startValue: false, evtName: 'change.rough.ease'});
defineCompactProperty(p, {name: 'roughStrength', type: 'float', startValue: 1, evtName: 'change.rough.strength'});
defineCompactProperty(p, {name: 'roughPoints', type: 'int', startValue: 20, evtName: 'change.rough.points'});
defineCompactProperty(p, {name: 'roughClamp', type: 'boolean', startValue: false, evtName: 'change.rough.clamp'});
defineCompactProperty(p, {name: 'roughRandomise', type: 'boolean', startValue: true, evtName: 'change.rough.randomise'});
defineCompactProperty(p, {name: 'roughTaper', type: 'string', startValue: 'none', evtName: 'change.rough.taper'});





p.getSave = function () {

    return {
        type: this.type,
        points: this.points,
        roughEase: this.roughEase,
        roughStrength: this.roughStrength,
        roughPoints: this.roughPoints,
        roughClamp: this.roughClamp,
        roughRandomise: this.roughRandomise,
        roughTaper: this.roughTaper,
    };
};

p.useSave = function (save) {

    if (!save) return;

    if ('type' in save) this.type = save.type;
    if ('points' in save) this.points = save.points;
    if ('roughEase' in save) this.roughEase = save.roughEase;
    if ('roughStrength' in save) this.roughStrength = save.roughStrength;
    if ('roughPoints' in save) this.roughPoints = save.roughPoints;
    if ('roughClamp' in save) this.roughClamp = save.roughClamp;
    if ('roughRandomise' in save) this.roughRandomise = save.roughRandomise;
    if ('roughTaper' in save) this.roughTaper = save.roughTaper;
};

p.getRatio = function (p) {

    return this._easer.getRatio(p);
};

p.getEaser = function () {

    return this._easer;
};

p.getScript = function () {

    var base = 'new Ease(BezierEasing('+this.points.join()+'))';

    if (this.roughEase) {

        var roughOpt = {
            ease: '{{ease}}',
            strength: this.roughStrength,
            points: this.roughPoints,
            clamp: this.roughClamp,
            randomise: this.roughRandomise,
            taper: this.roughTaper,
        };
        roughOpt = JSON.stringify(roughOpt);
        //this is for avoid the quotes around the constructor call
        roughOpt = roughOpt.replace('"{{ease}}"', base);

        return 'new RoughEase('+roughOpt+')';
    }
    else {
        return base;
    }
};

p.clone = function () {

    return new Ease(this);
};

p.match = function (ease) {

    return ease.type === this.type &&
        ease.points[0] === this.points[0] &&
        ease.points[1] === this.points[1] &&
        ease.points[2] === this.points[2] &&
        ease.points[3] === this.points[3] &&
        ease.roughEase === this.roughEase &&
        ease.roughStrength === this.roughStrength &&
        ease.roughPoints === this.roughPoints &&
        ease.roughClamp === this.roughClamp &&
        ease.roughRandomise === this.roughRandomise &&
        ease.roughTaper === this.roughTaper;
};


p.showOptionsDialog = function (opt={}) {

    dialogEaseOptions.show({
        ease: this,
        twinEases: opt.twinEases,
        on: {
            'change.roughEase': v => this.roughEase = v,
            'change.roughStrength': v => this.roughStrength = v,
            'change.roughPoints': v => this.roughPoints = v,
            'change.roughClamp': v => this.roughClamp = v,
            'change.roughRandomise': v => this.roughRandomise = v,
            'change.roughTaper': v => this.roughTaper = v,
        }
    });
};





p._refreshEaser = function () {

    this._easer = new GreenSockGlobals.Ease(BezierEasing(...this._points));

    if (this.roughEase) {

        this._easer = new RoughEase({
            template: this._easer,
            strength: this.roughStrength,
            points: this.roughPoints,
            clamp: this.roughClamp,
            randomise: this.roughRandomise,
            taper: this.roughTaper,
        });
    }
};
