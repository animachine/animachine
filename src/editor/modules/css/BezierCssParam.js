'use strict';

var inherits = require('inherits');
var CssParam = require('./CssParam');
var Key = require('../../utils/Key');
var amgui = require('../../amgui');

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
                this._parentTrack.off('focusHandler', this._focusHandler, this);
                this._parentTrack.off('blurHandler', this._blueHandler, this);
            }

            this._parentTrack = v;


            if (this._parentTrack) {
                this._parentTrack.on('focusHandler', this._focusHandler, this);
                this._parentTrack.on('blurHandler', this._blueHandler, this);
            }
        },
        get: function () {

            return this._parentTrack;
        }
    }
})















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

    return 0;

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
            x: point.anchore.x + 'px',
            y: point.anchore.y + 'px',
        };
    }
    else {

        if (after && before) {

            var p = (time - before.time) / (after.time - before.time), 
                av = after.value, 
                bv = before.value,
                points = [];

            p = before.ease.getRatio(p);

            bv.value.forEach(function (point, idx) {

                if (idx !== 0) {
                    points.push(point.handleLeft.x, point.handleLeft.y);
                }
                points.push(point.anchor.x, point.anchor.y);
                points.push(point.handleRight.x, point.handleRight.y);
            });
            points.push(bv.value[0].handleLeft.x, bv.value[0].handleLeft.y);
            points.push(bv.value[0].anchor.x, bv.value[0].anchor.y);



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

            var diff;

            if ('x' in opt.value) {
                diff = opt.value.x - key.value[0].anchor.x;
                key.value[0].anchor.x += diff;
                key.value[0].handlerLeft.x += diff;
                key.value[0].handlerLeft.x += diff;
            }
            if ('y' in opt.value) {
                diff = opt.value.y - key.value[0].anchor.y;
                key.value[0].anchor.y += diff;
                key.value[0].handlerLeft.y += diff;
                key.value[0].handlerLeft.y += diff;
            }
        }
    }
    else {
        var anchor = this.getValue(opt.value);

        if ('x' in opt.value) anchor.x = opt.value.x;
        if ('y' in opt.value) anchor.y = opt.value.y;

        opt.value = [{
            anchor: anchor,
            handleLeft: {x: anchor.x - 25, y: anchor.y},
            handleRight: {x: anchor.x + 25, y: anchor.y},
        }];

        key = new Key(opt);

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

p._focusHandler = function (de) {

    de = de || this.parentTrack._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe) return this._blurHandler();

    if (!this._handler) {
        this._handler = new Transhand();
        this._handler.on('change', this._onChangeHandler, this);
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
                anchor: {x: point.anchor.x, x: point.anchor.y, },
                handlerLeft: {x: point.handlerLeft.x, x: point.handlerLeft.y},
                handlerRight: {x: point.handlerRight.x, x: point.handlerRight.y},
            });
        });
    });

    var handOpt = ;
    
    this._handler.setup({
        hand: {
            type: 'curver',
            base: points: points
        },
    });
    this._handler.activate();

    am.deHandlerCont.appendChild(this._handler.domElem);
};

p._blurHandler = function () {

    this._currHandledDe = undefined;

    this.emit('blurHandler');

    if (this._handler && this._handler.domElem && this._handler.domElem.parentNode) {

        this._handler.deactivate();
        this._handler.domElem.parentNode.removeChild(this._handler.domElem);
    }
};

p._onChangeHandler = function (change) {

    var idx = change.idx, key;

    for (var i = 0, l = this.keyLine._keys.length; i < l, ++i) {

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
            handlerLeft: {x: change.point.handlerLeft.x, y: change.point.handlerLeft.y},
            handlerRight: {x: change.point.handlerRight.x, y: change.point.handlerRight.y},
        });
    }
    else if (change.type === 'remove') {
        
        key.value.splice(idx, 1);

        if (key.value.length === 0) {

            this.keyLine.removeKey(key);
        }
    },
    else if (change.type === 'edit') {

        var point = key.value[idx];
        point.anchore.x = change.point.anchor.x;
        point.anchore.y = change.point.anchor.y;
        point.handlerLeft.x = change.point.handlerLeft.x;
        point.handlerLeft.y = change.point.handlerLeft.y;
        point.handlerRight.x = change.point.handlerRight.x;
        point.handlerRight.y = change.point.handlerRight.y;
    }
};