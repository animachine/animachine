'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var BezierEasing = require('bezier-easing');
var defineCompactProperty = require('./defineCompactProperty');
var dialogEaseOptions = require('./dialogEaseOptions');

function Ease(opt) {

    EventEmitter.call(this);
    
    this._type =  'bezier';
    this._points = []
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
        set: function (v) {

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
            
            this._refreshEaser()

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
    };
};

p.useSave = function (save) {

    if (!save) return;

    if ('type' in save) this.type = save.type;
    if ('points' in save) this.points = save.points;
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
        roughOpt = roughOpt.replace('"{{ease}"', base);

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


p.showOptionsDialog = function () {

    dialogEaseOptions.show({
        ease: this,
        onChangeRoughEase: function (v) {this.roughEase = v}.bind(this),
        onChangeRoughStrength: function (v) {this.roughStrength = v}.bind(this),
        onChangeRoughPoints: function (v) {this.roughPoints = v}.bind(this),
        onChangeRoughClamp: function (v) {this.roughClamp = v}.bind(this),
        onChangeRoughRandomise: function (v) {this.roughRandomise = v}.bind(this),
        onChangeRoughTaper: function (v) {this.roughTaper = v}.bind(this),
    });
};





p._refreshEaser = function () {

    this._easer = new GreenSockGlobals.Ease(BezierEasing(p[0], p[1], p[2], p[3]));

    if (this.roughEase) {

        this._easer = new RoughEase({
            ease: this._easer,
            strength: this.roughStrength,
            points: this.roughPoints,
            clamp: this.roughClamp,
            randomise: this.roughRandomise,
            taper: this.roughTaper,
        });
    }
};