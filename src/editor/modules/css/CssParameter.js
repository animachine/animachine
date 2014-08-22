var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var dialogKeyOptions = require('./dialogKeyOptions');
var uncalc = require('./uncalc');
var amgui = require('../../amgui');

function CssParameter (opt) {

    EventEmitter.call(this);
    
    this.type = opt.type || '';
    this.name = opt.name || '';

    this._lineH = opt.lineH || 21;

    this._keys = [];

    this.deOptions = this._createParameterOptions();
    this.deKeyline = amgui.createKeyline({
        timescale: am.timeline.timescale
    });

    this._onChangeInput = this._onChangeInput.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeTape = this._onChangeTape.bind(this);
    this._onChangeDeKeyTime = this._onChangeDeKeyTime.bind(this);

    this._input = amgui.createKeyValueInput({
        parent: this.deOptions,
        key: this.name,
        value: opt.value,
        onChange: this._onChangeInput,
        height: this._lineH
    });

    am.timeline.on('changeTime', this._onChangeTime);
    am.timeline.on('changeTape', this._onChangeTape);
}

inherits(CssParameter, EventEmitter);
var p = CssParameter.prototype;

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

    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            key.value = opt.value;
        }
    }
    else {
        key = {
            time: opt.time || 0,
            value: opt.value || '',
            ease: 'linear'
        };

        key.domElem = this.deKeyline.addKey({
            timescale: am.timeline.timescale,
            time: key.time
        });

        key.domElem.addEventListener('changeTime', this._onChangeDeKeyTime);

        amgui.bindDropdown({
            deTarget: key.domElem,
            deMenu: amgui.createDropdown({
                options: ['ease', 'delete'],
                onSelect: function (e) {
                    if(e.detail.selection === 'ease') {
                        dialogKeyOptions.show({ease: key.ease});
                        dialogKeyOptions.on('changeEase', function (ease) {key.ease = ease;});
                    }
                }
            }),
            asContextMenu: true
        });

        this._keys.push(key);
    }

    this._refreshInput();
    return key;
};

p.getKey = function (time) {

    return this._keys.find(function(key) {

        return key.time === time;
    });
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

p._onChangeDeKeyTime = function (e) {

    var key = this._keys.find(function (key) {
        return key.domElem === e.target;
    });

    key.time = e.detail.time;

    this.emit('change');
};

p._onChangeTime = function () {

    this._refreshInput();
};

p._onChangeTape = function () {

    this._keys.forEach(function (key) {

        key.domElem.setTimescale(am.timeline.timescale);
    });
};

p._refreshInput = function () {

    this._input.setKey(this.name);
    this._input.setValue(this.getValue());
}

p._createParameterOptions = function () {

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'linear-gradient(to bottom, #184F12 18%,#1B4417 96%)';

    return de;
};

module.exports = CssParameter;
