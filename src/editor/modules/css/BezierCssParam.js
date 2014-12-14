'use strict';

var inherits = require('inherits');
var CssParam = require('./CssParam');
var Key = require('../../utils/Key');
var amgui = require('../../amgui');

function BezierCssParam (opt) {

    opt = opt || {};

    CssParam.call(this, opt);
}

inherits(BezierCssParam, CssParam);
var p = BezierCssParam.prototype;
module.exports = BezierCssParam;
















p.getScriptKeys = function () {

    var keys = [];

    // this.keyLine.forEachKeys(function (key) {

    //     var k = {
    //         offset: key.time / am.timeline.length,
    //     };

    //     k[this.name] = this.getValue(key.time);
        
    //     if (key.ease && key.ease !== 'linear') {

    //        k.easing = key.ease;
    //     }

    //     keys.push(k);
    // }, this);

    // keys.sort(function (a, b) {

    //     return a.offset - b.offset;
    // });

    return keys;
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

        ret = same.value;
    }
    else {

        if (after && before) {

            var p = (time - before.time) / (after.time - before.time), 
                av = uncalc(after.value), bv = uncalc(before.value);

            p = before.ease.getRatio(p);

            ret = createCalc(av, bv, p);
        }
        else if (before) {
            
            ret = before.value;
        }
        else if (after) {
            
            ret = after.value;
        }
    }
    
    return ret === undefined ? this._defaultValue : ret;





    function createCalc(av, bv, p) {

        if (!isNaN(av) && !isNaN(bv)) {

            return parseFloat(bv) + ((av - bv) * p);
        }

        var aUnit = getUnit(av);
        var bUnit = getUnit(bv);
        
        if (aUnit === bUnit) {

            av = parseFloat(av);
            bv = parseFloat(bv);
            
            return (bv + ((av - bv) * p)) + aUnit;
        };

        var avs = _.compact(av.split(' ')),
            bvs = _.compact(bv.split(' ')),
            avl = avs.length,
            bvl = bvs.length,
            ret = [];

        if (avl !== bvl) {

            if (avl < bvl) {

                avs = avs.concat(bvs.slice(avl));
            }
            else {
                bvs = bvs.concat(avs.slice(bvl));
            }         
        }

        avs.forEach(function (a, idx) {

            ret.push(calc(a, bvs[idx]));
        });

        return ret.join(' ');

        function calc(a, b) {

            return 'calc(' + b + ' + (' + a + ' - ' + b + ')*' + p + ')';
        }

        function getUnit(v) {

            var m = /([a-z]+)$/.exec(v);

            return m && m[1];
        }
    }
};

p.addKey = function (opt, skipHistory) {
    
    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            if (!skipHistory) {
                am.history.saveChain(key, [this.addKey, this, key, true], [this.addKey, this, opt, true], 'edit key');
            }

            key.value = opt.value;
        }
    }
    else {

        key = new Key(opt);
        key.value = 'value' in opt ? opt.value : this.getValue(opt.time);//??

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





p._applyEase = function (p, pos) {

    var l = p.length / 2;

    while (--l > 0) {

        for (var i = 0; i < l; ++i) {
            count(i*2);
        }
    }

    return p.slice(0, 2);

    function count(i) {

        p[i+0] = p[i+0] + (p[i+2] - p[i+0]) * pos;
        p[i+1] = p[i+1] + (p[i+3] - p[i+1]) * pos;
    }
};


