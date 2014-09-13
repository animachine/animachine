'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var uncalc = require('./uncalc');
var Key = require('./Key');
var amgui = require('../../amgui');

function CssParameter (opt) {

    EventEmitter.call(this);

    this._keys = [];
    this._lineH =  21;

    this.deOptions = this._createParameterOptions();
    this.deKeyline = amgui.createKeyline({
        timescale: am.timeline.timescale
    });

    this._onChangeInput = this._onChangeInput.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeKeyTime = this._onChangeKeyTime.bind(this);
    this._onToggleKey = this._onToggleKey.bind(this);
    this._onDeleteKey = this._onDeleteKey.bind(this);

    if (!this._noBaseKeyValueInput) {

        this._input = amgui.createKeyValueInput({
            parent: this.deOptions,
            onChange: this._onChangeInput,
            height: this._lineH
        });
        this._input.style.flex = 1;
    }

    this._btnToggleKey = amgui.createIconBtn({
        icon: 'key',
        height: 21,
        parent: this.deOptions,
        onClick: this._onToggleKey,
    });
    this._refreshBtnToggleKey();

    am.timeline.on('changeTime', this._onChangeTime);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(CssParameter, EventEmitter);
var p = CssParameter.prototype;









Object.defineProperty(p, 'height', {

    get: function () {
        
        return this._lineH;
    }
});





p.getSave = function () {

    var save = {
        name: this.name,
        keys: [],
    }

    this._keys.forEach(function (keySave) {

        save.keys.push(key.getSave());
    });

    return save;
};

p.useSave = function(save) {

    this.name = save.name;

    if (save.keys) {

        save.keys.forEach(this.addKey, this);
    }
};

p.getScriptKeys = function () {

    var keys = [];

    this._keys.forEach(function (key) {

        var k = {
            offset: am.timeline.length / key.time,
        }

        k[param.name] = param.getValue(key.time);
        
        if (key.ease && key.ease !== 'linear') {

           k.easing = key.ease; 
        }

        keys.push(k);
    });

    keys.sort(function (a, b) {

        return a.offset - b.offset;
    });

    return keys;
};

p.addKey = function (opt, skipHistory) {
    
    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            if (!skipHistory) {
                am.history.saveChain(key, [this.addKey, this, key, true], [this.addKey, this, opt, true]);
            }

            key.value = opt.value;
        }
    }
    else {

        key = new Key(_.extend({deKeyline: this.deKeyline}, opt));

        key.on('changeTime', this._onChangeKeyTime);
        key.on('delete', this._onDeleteKey);

        this._keys.push(key);

        if (!skipHistory) {
            am.history.closeChain(key);
            am.history.save([this.removeKey, this, opt.time, true], [this.addKey, this, opt, true]);
        }
    }

    this._refreshInput();
    this._refreshBtnToggleKey();

    this.emit('change');

    return key;
};

p.getValue = function (time) {

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

            var p = (time - before.time) / (after.time - before.time), 
                av = uncalc(after.value), bv = uncalc(before.value);

            return createCalc(av, bv, p)
        }
        else if (before) {
            
            return before.value;
        }
        else if (after) {
            
            return after.value;
        }
    }

    function createCalc(av, bv, p) {

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
    }
    
};

p.removeKey = function (key, skipHistory) {

    if (!skipHistory) {
        am.history.save([this.addKey, this, key, true],
            [this.removeKey, this, key, true]);
    }

    var idx = this._keys.indexOf(key);

    if (idx !== -1) {

        this._keys.splice(idx, 1);

        key.dispose();

        key.removeListener('changeTime', this._onChangeKeyTime);
        key.removeListener('delete', this._onDeleteKey);

        this._refreshBtnToggleKey();

        this.emit('change');
    }
};

p.getKey = function (time) {

    return this._keys.find(function(key) {

        return key.time === time;
    });
};

p.getPrevKey = function (time) {

    var retKey;
    
    this._keys.forEach(function(key) {

        if (key.time < time && (!retKey || retKey.time < key.time)) {

            retKey = key;
        }
    });

    return retKey;
};

p.getNextKey = function (time) {

    var retKey;
    
    this._keys.forEach(function(key) {

        if (key.time > time && (!retKey || retKey.time > key.time)) {

            retKey = key;
        }
    });

    return retKey;
};

p.getKeyTimes = function () {

    var times = [];

    this._keys.forEach(function (key) {

        times.push(key.time);
    });

    return times;
};

p.isValid = function () {

    return !!(this.name && this._keys.length);
};












p._onChangeInput = function (e) {

    if ('key' in e.detail) {
        this.name = e.detail.key;
    }

    if ('value' in e.detail) {
        this.addKey({
            time: am.timeline.currTime,
            value: e.detail.value
        });
    }

    this.emit('change');
};

p._onChangeKeyTime = function () {

    this.emit('change');
};

p._onDeleteKey = function (key) {

    this.removeKey(key);
};

p._onChangeTime = function () {

    this._refreshInput();
    this._refreshBtnToggleKey();
};

p._onToggleKey = function () {

    var key = this.getKey(am.timeline.currTime);

    if (key) {
        this.removeKey(key);
    }
    else {
        this.addKey({time: am.timeline.currTime});
    }
};









p._refreshInput = function () {

    this._input.setKey(this.name);
    this._input.setValue(this.getValue());
};

p._refreshBtnToggleKey = function () {

    var key = this.getKey(am.timeline.currTime);
    this._btnToggleKey.style.color = key ? amgui.color.text : amgui.color.textInactive;
};












p._createParameterOptions = function () {

    var de = document.createElement('div');
    de.style.display = 'flex';
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';

    amgui.bindDropdown({
        asContextMenu: true,
        deTarget: de,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'move up', onSelect: this.emit.bind(this, 'move', this, -1)},
                {text: 'move down', onSelect: this.emit.bind(this, 'move', this, 1)},
                {text: 'delete', onSelect: this.emit.bind(this, 'delete', this)},
            ]
        })
    });

    return de;
};

module.exports = CssParameter;
