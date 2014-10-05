'use strict';

var inherits = require('inherits');
var CssParameter = require('./CssParameter');
var Key = require('./Key');
var amgui = require('../../amgui');

var BASE_VALUES = {
    tx: 0, ty: 0, tz: 0,
    rx: 0, ry: 0, rz: 0,
    sx: 1, sy: 1, sz: 1,
    skewX: 0, skewY: 0,
    perspective: 0
};

var PRECISIONS = { 
    tx: 0, ty: 0, tz: 0,
    rx: 2, ry: 2, rz: 2,
    sx: 2, sy: 2, sz: 2,
    skewX: 2, skewY: 2,
    perspective: 0
};

function CssTransformParameter (opt) {

    this._noBaseKeyValueInput = true;

    this._inputs = {};
    this._inputs3d = [];
    this._lineCount = 6;

    CssParameter.call(this, _.extend({name: 'transform'}, opt));

    this._onToggle3d = this._onToggle3d.bind(this);

    this._createTransformInputs();

    this._btnToggle3d = amgui.createIconBtn({
        icon: 'cube',
        height: 21,
        parent: this.deOptions,
        onClick: this._onToggle3d,
    });
    this.deOptions.insertBefore(this._btnToggle3d, this._btnToggleKey);
    
    this._showing3d = !this._showing3d;//TODO do this somehow else!
    this._showHide3d(!this._showing3d);
}

inherits(CssTransformParameter, CssParameter);
var p = CssTransformParameter.prototype;


p.getSave = function () {

    var save = CssParameter.prototype.getSave.call(this);

    save.showing3d = this._showing3d;

    return save;
};

p.useSave = function(save) {

    CssParameter.prototype.useSave.call(this, save);

    this._showing3d = !!save.showing3d;
};

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

            p = this._applyEase(before.ease, p);

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

p.addKey = function (opt, skipHistory) {

    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            if (!skipHistory) {
                am.history.saveChain(key, 
                    [this.addKey, this, _.cloneDeep(key.getSave()), true], 
                    [this.addKey, this, _.cloneDeep(opt), true]);
            }
            
            key.value = _.extend(key.value, opt.value);
        }
    }
    else {
        key = new Key(_.extend({deKeyline: this.deKeyline}, opt));
        key.value = _.extend(this.getRawValue(opt.time), opt.value);

        key.on('changeTime', this._onChangeKeyTime);
        key.on('delete', this._onDeleteKey);

        this._keys.push(key);

        if (!skipHistory) {
            am.history.closeChain(key);
            am.history.save(
                [this.removeKey, this, opt.time, true], 
                [this.addKey, this, opt, true]);
        }
    }

    this._refreshInput();
    this._refreshBtnToggleKey();

    this.emit('change');

    return key;
};

p._refreshInput = function () {

    var inputs = this._inputs,
        values = this.getRawValue();

    Object.keys(inputs).forEach(function (key) {

        if (inputs[key].value !== values[key]) {

            inputs[key].value = values[key].toFixed(PRECISIONS[key]);
        }
    });
};

Object.defineProperty(p, 'height', {

    get: function () {
        
        return this._lineH * this._lineCount;
    }
});

p._onChangeInput = function (e) {

    var inp = e.currentTarget,
        value = {};

    value[inp._key] = parseFloat(inp.value);

    this.addKey({
        time: am.timeline.currTime,
        value: value,
    });
};

p._onToggle3d = function () {

    this._showHide3d(!this._showing3d);
};

p._showHide3d = function (show) {

    if (this._showHide3d === show) {
        return;
    }

    this._showing3d = show;

    this._btnToggle3d.style.color = show ? amgui.color.text : amgui.color.textInactive;

    this._inputs3d.forEach(function (de) {

        de.style.visibility = show ? $(de).show() : $(de).hide();
    });
};

p._createTransformInputs = function () {

    var deOptions = this.deOptions,
        lineH = this._lineH,
        inputs = this._inputs,
        inputs3d = this._inputs3d,
        onChangeInput = this._onChangeInput;

    deOptions.style.height = (lineH * this._lineCount) + 'px';
    deOptions.style.flexWrap = 'wrap';

    this.deKeyline.style.height = lineH + 'px';
    this.deKeyline.style.marginBottom = (lineH * (this._lineCount-1)) + 'px';

    var label = document.createElement('span');
    label.textContent = 'transform';
    label.style.flex = '1';
    label.style.height = lineH + 'px';
    $(deOptions).prepend(label);

    var row = createRow();
    createInput('tx', 'tx', row);
    createInput('ty', 'y', row);
    createInput('tz', 'z', row, true);
    row = createRow();
    createInput('rx', 'rx', row, true);
    createInput('ry', 'y', row, true);
    createInput('rz', 'rz', row);
    row = createRow();
    createInput('sx', 'sx', row);
    createInput('sy', 'y', row);
    createInput('sz', 'z', row, true);
    row = createRow();
    createInput('skewX', 'skewX', row);
    createInput('skewY', 'skewY', row);
    row = createRow(true);
    createInput('perspective', 'perspective', row);

    function createRow(i3d) {

        var de = document.createElement('div');
        de.style.display = 'flex';
        de.style.width = '100%';
        de.style.height = lineH + 'px';
        // de.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';
        if (i3d) {
            inputs3d.push(de);
        }
        deOptions.appendChild(de);
        return de;
    }

    function createInput(key, caption, parent, i3d) {

        var label = document.createElement('span');
        label.textContent = caption;
        parent.appendChild(label);

        var inp = document.createElement('input');
        inp._key = key;
        inp.type = 'number';
        inp.value = BASE_VALUES[key];
        inp.style.flex = '1';
        inp.style.fontFamily = amgui.FONT_FAMILY;
        inp.style.background = 'rgba(255,255,255,.12)';
        inp.style.border = 'none';
        inp.style.margin = '0 0 0 3px';
        inp.style.color = amgui.color.text;
        inp.addEventListener('change', onChangeInput);
        parent.appendChild(inp);

        if (i3d) {
            inputs3d.push(label, inp);
        }
        inputs[key] = inp;
    }
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

    // if (rx && ry && rz) ret += 'rotate3d('+v.rx+'rad,'+v.ry+'rad,'+v.rz+'rad) ';
    // else {
        if (rx) ret += 'rotateX('+v.rx+'rad) ';
        if (ry) ret += 'rotateY('+v.ry+'rad) ';
        if (rz) ret += 'rotate('+v.rz+'rad) ';
    // }

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

    if(perspective) ret += 'perspective('+v.perspective+'px) ';
// console.log(ret)
    return ret;
}

module.exports = CssTransformParameter;
