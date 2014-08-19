var uncalc = require('./uncalc');
var amgui = require('../../amgui');

function CssParameter (opt) {
    
    this.type = opt.type || '';
    this.name = opt.name || '';
    this.value = opt.value || 0;
    this.quantity = opt.quantity || undefined;
    this.quantityOptions = opt.quantityOptions || undefined;
    this.valueOptions = opt.valueOptions || undefined;

    this._lineH = opt.lineH || 21;

    this._keys = [];

    this.deOptions = this._createParameterOptions();
    this.deKeyline = amgui.createKeyline({
        timescale: am.timeline.timescale
    });
}

var p = CssParameter.prototype;

p.getValue = function (time) {

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

            var p = (time - before.time) / (after.time - before.time), 
                av = uncalc(after.value), bv = uncalc(before.value);

            return 'calc(' + bv + ' + (' + av + ' - ' + bv + ')*' + p + ')';
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

    var key = {
        time: opt.time || 0,
        value: opt.value || 0
    };

    key.domElem = this.deKeyline.addKey(key.time);

    this._keys.push(key);

    return key;
};

p.getKey = function (time) {

    return this._keys.find(function(key) {

        return key.time === time;
    });
};

p._createParameterOptions = function () {

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'orange';

    return de;
};

module.exports = CssParameter;
