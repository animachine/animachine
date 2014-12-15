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

    de = de || this._currHandledDe;
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

    var handOpt = {
        type: 'curver',
        base: {
            x: br.left,
            y: br.top,
            w: br.width,
            h: br.height,
        },
        params: {}
    };

    var p = handOpt.params;
    this._endParams.forEach(function (param) {

        switch (param.name) {
            case 'x': p.tx = parseFloat(param.getValue()); break;
            case 'y': p.ty = parseFloat(param.getValue()); break;
            case 'scaleX': p.sx = parseFloat(param.getValue()); break;
            case 'scaleY': p.sy = parseFloat(param.getValue()); break;
            case 'rotationZ': p.rz = parseFloat(param.getValue()) / 180 * Math.PI; break;
            case 'transformOriginX': p.ox = parseFloat(param.getValue()) / 100; break;
            case 'transformOriginY': p.oy = parseFloat(param.getValue()) / 100; break;
            case 'bezier':
                var value = param.getValue();
                p.tx = value.x;
                p.ty = value.y;
            break;
        }
    });
    
    this._handler.setup({
        hand: handOpt,
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

p._onChangeHandler = function (points) {


};