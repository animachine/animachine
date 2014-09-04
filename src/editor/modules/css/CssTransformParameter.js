'use strict';

var inherits = require('inherits');
var CssParameter = require('./CssParameter');
var uncalc = require('./uncalc');
var Key = require('./Key');
var amgui = require('../../amgui');

var BASE_VALUES = {
    tx: 0, ty: 0, tz: 0,
    rx: 0, ry: 0, rz: 0,
    sx: 1, sy: 1, sz: 1,
    skewX: 0, skewY: 0,
    perspective: 0
};

function CssTransformParameter (opt) {

    CssParameter.call(this, _.extend({
        name: 'transform',
        skipKeyValueInput: true,
    }, opt));
}

inherits(CssTransformParameter, CssParameter);
var p = CssTransformParameter.prototype;

p.getValue = function (time) {

    return convertTransformValue(this.getRawValue(time));
};

p.getRawValue = function (time) {

    if (!_.isNumber(time)) {
        time = am.timeline.currTime;
    }

    var before, after, same;

    this._keys.forEach(function (key) {

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

        return same.value;
    }
    else {

        if (after && before) {

            var calculated = {},
                p = (time - before.time) / (after.time - before.time),
                av = after.value,
                bv = before.value;

            Object.keys(bv).forEach(function (name) {

                if (name in av) {

                    calculated[name] = bv[name] + (av[name] - bv[name]) * p;
                }
                else {
                    calculated[name] = bv[name];
                }
            });

            return calculated;
        }
        else if (before) {
            
            return _.clone(before.value);
        }
        else if (after) {
            
            return _.clone(after.value);
        }
        else {
            return _.clone(BASE_VALUES);
        }
    }
};

p.addKey = function (opt) {

    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            key.value = _.extend(key.value, opt.value);
        }
    }
    else {
        key = new Key(_.extend({deKeyline: this.deKeyline}, opt));
        key.value = _.extend(this.getRawValue(opt.time), opt.value);

        key.on('changeTime', this._onChangeKeyTime);
        key.on('delete', this._onDeleteKey);

        this._keys.push(key);
    }

    this._refreshInput();
    this._refreshBtnToggleKey();

    this.emit('change');

    return key;
};

p._onChangeInput = function (e) {

    if ('key' in e.detail) {
        this.name = e.detail.key;
    }

    if ('paramName' in e.detail && 'value' in e.detail) {
        
        var key = this.addKey({
            time: am.timeline.currTime,
        });
        
        key.value[e.detail.paramName] = e.detail.value;
    }

    this.emit('change');
};

p._refreshInput = function () {

};

function convertTransformValue(v) {

    var tx = 'tx' in v && v.tx !== BASE_VALUES.tx,
        ty = 'ty' in v && v.ty !== BASE_VALUES.ty,
        tz = 'tz' in v && v.tz !== BASE_VALUES.tz,
        rx = 'rx' in v && v.rx !== BASE_VALUES.rx,
        ry = 'ry' in v && v.ry !== BASE_VALUES.ry,
        rz = 'rz' in v && v.rz !== BASE_VALUES.rz,
        sx = 'sx' in v && v.sx !== BASE_VALUES.sx,
        sy = 'sy' in v && v.sy !== BASE_VALUES.sy,
        sz = 'sz' in v && v.sz !== BASE_VALUES.sz,
        skewX = 'skeewX' in v && v.skewX !== BASE_VALUES.skewX,
        skewY = 'skeewY' in v && v.skewY !== BASE_VALUES.skewY,
        perspective = 'perspective' in v && v.perspective !== BASE_VALUES.perspective,
        ret = '';

    if (tx && ty && tz) ret += 'translate3d('+v.tx+'px,'+v.ty+'px,'+v.tz+'px) ';
    else if (tx && ty) ret += 'translate('+v.tx+'px,'+v.ty+'px) ';
    else {
        if (tx) ret += 'translateX('+v.tx+'px) ';
        if (ty) ret += 'translateY('+v.ty+'px) ';
        if (tz) ret += 'translateZ('+v.tz+'px) ';
    }

    if (rx && ry && rz) ret += 'rotate3d('+v.rx+'rad,'+v.ry+'rad,'+v.rz+'rad) ';
    else if (rx && ry) ret += 'rotate('+v.rx+'rad,'+v.ry+'rad) ';
    else {
        if (rx) ret += 'rotateX('+v.rx+'rad) ';
        if (ry) ret += 'rotateY('+v.ry+'rad) ';
        if (rz) ret += 'rotate('+v.rz+'rad) ';
    }

    if (sx && sy && sz) ret += 'scale3d('+v.sx+','+v.sy+','+v.sz+') ';
    else if (sx && sy) ret += 'scale('+v.sx+','+v.sy+') ';
    else {
        if (sx) ret += 'scaleX('+v.sx+') ';
        if (sy) ret += 'scaleY('+v.sy+') ';
        if (sz) ret += 'scaleZ('+v.sz+') ';
    }

    if (skewX && skewY) ret += 'skew('+v.skewx+'rad,'+v.skewY+'rad) ';
    else if (skewX) ret += 'skewX('+v.skewX+'rad) ';
    else if (skewY) ret += 'skewY('+v.skewY+'rad) ';

    if(perspective) ret += 'perspective('+v.perspective+') ';
// console.log(ret)
    return ret;
}

module.exports = CssTransformParameter;
