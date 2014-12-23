'use strict';

var inherits = require('inherits');
var CssParam = require('./CssParam');
var Key = require('../../utils/Key');
var amgui = require('../../amgui');
var Transhand = require('transhand');

function BezierCssParam (opt) {

    opt = opt || {};

    CssParam.call(this, opt);

    this._defaultValue = {x: 0, y: 0};
}

inherits(BezierCssParam, CssParam);
var p = BezierCssParam.prototype;
module.exports = BezierCssParam;

Object.defineProperties(p, {

    parentTrack: {
        set: function (v) {

            if (this._parentTrack) {
                this._parentTrack.off('focusHandler', this._focusTransformer, this);
                this._parentTrack.off('blurHandler', this._blurTransformer, this);
            }

            this._parentTrack = v;


            if (this._parentTrack) {
                this._parentTrack.on('focusHandler', this._focusTransformer, this);
                this._parentTrack.on('blurHandler', this._blurTransformer, this);
            }
        },
        get: function () {

            return this._parentTrack;
        }
    }
});







p.getScriptKeys = function () {

    var keys = [];

    this.keyLine.forEachKeys(function (key) {

        var nextKey = key.getNextKey();
        
        if(!nextKey) return;

        var values = [],
            k = {
                time: key.time,
                options: {
                    bezier: {
                        type: 'cubic',
                        values: values,
                    },
                    ease: key.ease.getEaser(),
                }
            };

        key.value.forEach(function (point, idx, arr) {

            if (idx !== 0) values.push(point.handleLeft);
            values.push(point.anchor);
            if (idx !== arr.length - 1) values.push(point.handleRight);
        });

        values.push(nextKey.value[0].handleLeft);
        values.push(nextKey.value[0].anchor);
    }, this);

    return _.sortBy(keys, 'time');
};

p.getValue = function (time) {

    if (!_.isNumber(time)) {
        time = am.timeline.currTime;
    }

    var ret, before, after, same;

    this.keyLine.forEachKeys(function (key) {

        if (key.time === time) {
        
            same = key;
        }

        if (key.time < time && (!before || before.time < key.time)) {
        
            before = key;
        }

        if (key.time > time && (!after || after.time > key.time)) {
        
            after = key;
        }
    });

    if (same) {

        var point = same.value[0];

        ret = {
            x: point.anchor.x + 'px',
            y: point.anchor.y + 'px',
        };
    }
    else {

        if (after && before) {

            var p = (time - before.time) / (after.time - before.time), 
                bv = before.value,
                av = after.value, 
                points = [];

            p = after.ease.getRatio(p);

            bv.forEach(function (point, idx) {

                if (idx !== 0) {
                    points.push(point.handleLeft.x, point.handleLeft.y);
                }
                points.push(point.anchor.x, point.anchor.y);
                points.push(point.handleRight.x, point.handleRight.y);
            });
            points.push(av[0].handleLeft.x, av[0].handleLeft.y);
            points.push(av[0].anchor.x, av[0].anchor.y);



            ret = this._calcEase(points, p);
        }
        else if (before) {
            
            ret = _.clone(before.value[0].anchor);
        }
        else if (after) {
            
            ret = _.clone(after.value[0].anchor);
        }
    }
    
    return ret === undefined ? this._defaultValue : ret;
};

p.addKey = function (opt, skipHistory) {
    
    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            if (!skipHistory) {
                am.history.saveChain(key, [this.addKey, this, key, true], [this.addKey, this, opt, true], 'edit key');
            }

            key.value.length = 0;
            [].push.apply(key.value, opt.value);
        }
    }
    else {

        key = new Key(opt);

        key.on('prerender', this._onKeyPrerender, this);

        this.keyLine.addKey(key);

        if (!skipHistory) {
            am.history.closeChain(key);
            am.history.save([this.removeKey, this, opt.time, true], [this.addKey, this, opt, true], 'add key');
        }
        
        this.emit('addKey');
    }

    this._refreshInputs();
    this._refreshTgglKey();

    this.emit('change');

    return key;
};

//TODO removeKey -> key.off('prerender', this._onKeyPrerender, this);



p._calcEase = function (p, pos) {

    var l = p.length / 2;

    while (--l > 0) {

        for (var i = 0; i < l; ++i) {
            count(i*2);
        }
    }

    return {x: p[0], y: p[1]};

    function count(i) {

        p[i+0] = p[i+0] + (p[i+2] - p[i+0]) * pos;
        p[i+1] = p[i+1] + (p[i+3] - p[i+1]) * pos;
    }
};

p._focusTransformer = function (de) {

    de = de || this.parentTrack._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe) return this._blurTransformer();

    if (!this._transformer) {
        this._transformer = new Transhand();
        this._transformer.on('change', this._onChangeTransformer, this);
    }

    var transformSave;
    if (de.style.transform) {
        transformSave = de.style.transform;
        de.style.transform = '';
    }

    var br = de.getBoundingClientRect();

    de.style.transform = transformSave;

    var points = [];

    this.keyLine.forEachKeys(function (key) {

        key.value.forEach(function (point, idx) {

            points.push({
                anchor: {x: point.anchor.x, y: point.anchor.y},
                handleLeft: {x: point.handleLeft.x, y: point.handleLeft.y},
                handleRight: {x: point.handleRight.x, y: point.handleRight.y},
                style: {
                    anchorFill: idx !== 0 ? 'navajowhite' : undefined, 
                },
                linked: point.linked,
            });
        });
    });
    
    this._transformer.setup({
        hand: {
            type: 'curver',
            points: points,
            offset: {
                x: br.left,
                y: br.top,
            }
        },
    });
    this._transformer.activate();

    am.deHandlerCont.appendChild(this._transformer.domElem);
};

p._blurTransformer = function () {

    if (this._transformer && this._transformer.domElem && this._transformer.domElem.parentNode) {

        this._transformer.deactivate();
    }
};






p._onChangeTransformer = function (change) {

    var idx = change.idx, key;

    for (var i = 0, l = this.keyLine._keys.length; i < l; ++i) {

        key = this.keyLine._keys[i];

        if (key.value.length > idx) {

            idx -= key.value.length;
        }
        else {
            break;
        }
    }

    if (change.type === 'add') {

        key.value.splice(idx, 0, {
            anchor: {x: change.point.anchor.x, y: change.point.anchor.y},
            handleLeft: {x: change.point.handleLeft.x, y: change.point.handleLeft.y},
            handleRight: {x: change.point.handleRight.x, y: change.point.handleRight.y},
            linked: change.point.linked,
        });
    }
    else if (change.type === 'remove') {
        
        key.value.splice(idx, 1);

        if (key.value.length === 0) {

            this.keyLine.removeKey(key);
        }
    }
    else if (change.type === 'edit') {

        var point = key.value[idx];
        point.anchor.x = change.point.anchor.x;
        point.anchor.y = change.point.anchor.y;
        point.handleLeft.x = change.point.handleLeft.x;
        point.handleLeft.y = change.point.handleLeft.y;
        point.handleRight.x = change.point.handleRight.x;
        point.handleRight.y = change.point.handleRight.y;
        point.linked = change.point.linked;
    }

    this._focusTransformer();
};

p._onKeyPrerender = function (ctx, start, width, key) {

    for (var i = 1; i < key.value.length; ++i) {

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'deepskyblue';
        ctx.fillStyle = 'deepskyblue';
        ctx.lineWidth = 1;
        ctx.arc(start, key._height/2, 3, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }
};