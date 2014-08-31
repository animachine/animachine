var inherits = require('inherits');
var CssParameter = require('./CssParameter');
var uncalc = require('./uncalc');
var Key = require('./Key');
var amgui = require('../../amgui');

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

    var before, after, same, calculated;

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
            
            return before.value;
        }
        else if (after) {
            
            return after.value;
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
        key.value = {};

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

    var tx = 'tx' in v,
        ty = 'ty' in v,
        tz = 'tz' in v,
        rx = 'rx' in v,
        ry = 'ry' in v,
        rz = 'rz' in v,
        sx = 'sx' in v,
        sy = 'sy' in v,
        sz = 'sz' in v,
        skewX = 'skeewX' in v,
        skewY = 'skeewY' in v,
        perspective = 'perspective' in v,
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
console.log(ret)
    return ret;
}

module.exports = CssTransformParameter;
