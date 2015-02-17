'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var defineCompactProperty = require('../utils/defineCompactProperty');
var OptionLine = require('../utils/OptionLine');
var Key = require('./Key');
var KeyLine = require('./KeyLine');
var amgui = require('../amgui');

function Param (opt={}, timeline) {

    EventEmitter.call(this);

    this.timeline = timeline;

    this._lineH =  amgui.LINE_HEIGHT;
    this._inputs = [];
    this._defaultValue = opt.defaultValue || 0;

    this._onChangeInput = this._onChangeInput.bind(this);
    this._onClickTgglKey = this._onClickTgglKey.bind(this);
    this._onClickStepPrevKey = this._onClickStepPrevKey.bind(this);
    this._onClickStepNextKey = this._onClickStepNextKey.bind(this);

    this._createKeyline(opt.keyLine);
    this._createOptions(opt.optionLine);

    this.keyLine.parentParam = this;

    this.deOptionLine = this.optionLine.domElem;
    this.deKeyLine = this.keyLine.domElem;

    this.keyLine.on('change.keys', this._onChangeKeyLineKeys, this);

    //hack!
    $([this.optionLine.domElem, this.keyLine.domElem])
        .on('mouseenter', () => {
            this.optionLine.bgHighlight = true;
            this.keyLine.bgHighlight = true;
        })
        .on('mouseleave', () => {
            this.optionLine.bgHighlight = false;
            this.keyLine.bgHighlight = false;
        });

    this.setMaxListeners(1234);


    this.useSave(opt);
}

inherits(Param, EventEmitter);
var p = Param.prototype;
module.exports = Param;

p.wake = function () {

    this.timeline.on('changeTime', this._onChangeTime, this);

    this.keyLine.wake();

    this._onChangeTime();
};

p.sleep = function () {

    this.timeline.off('changeTime', this._onChangeTime, this);

    this.keyLine.sleep();
};







Object.defineProperties(p, {

    height: {
        get: function () {

            return this.hidden ? 0 : this._lineH;
        }
    }
});

defineCompactProperty(p, [
    {name: 'name', type: 'string'},
    {name: 'title', type: 'string', onChange: function (v) {
        this.optionLine.title = v;
    }},
    {name: 'hidden', type: 'boolean', startValue: false, onChange: function (v) {
        this.keyLine.hidden = v;
        this.optionLine.hidden = v;
    }},
    {name: 'static', type: 'boolean'},
]);



p.getSave = function () {

    var save = {
        name: this.name,
        title: this.title,
        hidden: this.hidden,
        static: this.static,
        keys: [],
    };

    this.keyLine.forEachKeys(function (key) {

        save.keys.push(key.getSave());
    });

    return save;
};

p.useSave = function(save) {

    this.name = save.name;
    this.title = save.title || save.name;
    this.hidden = save.hidden;
    this.static = save.static;

    if (save.keys) {

        save.keys.forEach(this.addKey, this);
    }
};

p.getScriptKeys = function (opt = {}) {

    var keys = [];

    this.keyLine.forEachKeys(function (key) {

        var k = {
            time: key.time,
            options: {
                ease: opt.runnable ? key.ease.getEaser() : key.ease.getScript(),
            }
        };
        k.options[this.name] = key.value;
        keys.push(k);
    }, this);

    return _.sortBy(keys, 'time');
};

p.getValue = function (time) {

    if (!_.isNumber(time)) {
        time = this.timeline.currTime;
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
                av = after.value, bv = before.value;

            p = after.ease.getRatio(p);

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




    //TODO dont think is it's needed anymore
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
        }

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

            var m = /([a-z%]+)$/.exec(v);

            return m && m[1];
        }
    }
};

p.addKey = function (opt) {

    this.timeline.pause();

    if (!_.has(opt, 'time')) {

        opt.time = this.timeline.currTime;
    }

    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            key.value = opt.value;
        }
    }
    else {
        key = new Key(opt, this.timeline);
        key.value = 'value' in opt ? opt.value : this.getValue(opt.time);

        this.keyLine.addKey(key);

        this.emit('addKey', key, this);
    }

    this._refreshInputs();

    return key;
};

p.removeKey = function (key) {

    if (!this.keyLine.removeKey(key)) {

        return;
    }
};

p.getKey = function (time) {

    return this.keyLine.getKeyByTime(time);
};

p.getPrevKey = function (time) {

    return this.keyLine.getPrevKey(time);
};

p.getNextKey = function (time) {

    return this.keyLine.getNextKey(time);
};

p.gotoPrevKey = function (time) {

    if (time === undefined) time = this.timeline.currTime;

    var key = this.getPrevKey(time);

    if (key) {
        this.timeline.currTime = key.time;
    }
};

p.gotoNextKey = function (time) {

    if (time === undefined) time = this.timeline.currTime;

    var key = this.getNextKey(time);

    if (key) {
        this.timeline.currTime = key.time;
    }
};

p.getKeyTimes = function () {

    return this.keyLine.getKeyTimes();
};

p.toggleKey = function () {

    var key = this.getKey(this.timeline.currTime);

    if (key) {
        this.removeKey(key);
    }
    else {
        this.addKey({time: this.timeline.currTime});
    }
};

p.isValid = function () {

    return this.keyLine.keyCount !== 0;
};

p.attachInput = function (input) {

    this.detachInput(input);

    input.on('change', this._onChangeInput);

    this._inputs.push(input);
};

p.detachInput = function (input) {

    var idx = this._inputs.indexOf(input);

    if (idx === -1) {
        return;
    }

    input.removeListener('change', this._onChangeInput);

    this._inputs.splice(idx, 1);
};

p._isKeySet = function (time) {

    return !!this.getKey(time);
};








p._onChangeInput = function (value) {

    var oldValue = this.getValue();

    if (String(value) === String(oldValue)) {
        return;
    }

    this.addKey({
        time: this.timeline.currTime,
        value: value
    });
};

p._onChangeKeyLineKeys = function () {

    this._refreshTgglKey();
    this.emit('change.keys');
};

p._onChangeTime = function () {

    this._refreshInputs();
    this._refreshTgglKey();
};

p._onClickTgglKey = function () {

    this.toggleKey();
};

p._onClickStepPrevKey = function () {

    this.gotoPrevKey();
};

p._onClickStepNextKey = function () {

    this.gotoNextKey();
};









p._refreshInputs = function () {

    if (this.getValue() !== undefined) {

        this._inputs.forEach(function (input) {

            //get the value again, because it can change over the iteration
            input.value = this.getValue();
        }, this);
    }
};

p._refreshTgglKey = function () {

    var time = this.timeline.currTime;
    
    this.optionLine.buttons.key.setHighlight(this._isKeySet(time));
    this.optionLine.buttons.key.setSteppers(!!this.getPrevKey(time), !!this.getNextKey(time));
};






p._createOptions = function (opt) {

    this.optionLine = new OptionLine(_.assign({
        keepSpaceForTgglChildren: true,
        contextMenuOptions: [
            {text: 'move up', onSelect: () => am.dialogs.WIP.show()},
            {text: 'move down', onSelect: () => am.dialogs.WIP.show()},
            {text: 'delete', onSelect: () => this.emit('need.remove', this)},
        ],
        title: {
            text: this.name,
        },
        btnKey: {
            onClick: this._onClickTgglKey,
            onClickPrev: this._onClickStepPrevKey,
            onClickNext: this._onClickStepNextKey,
        },
        inputs: [{
            type: 'unit',
            units: [],
            name: 'input'
        }],
        indent: 0,
    }, opt));

    if (this.optionLine.inputs.input){

        this.attachInput(this.optionLine.inputs.input);
    }
};

p._createKeyline = function () {

    this.keyLine = new KeyLine({}, this.timeline);
};






p.dispose = function () {

    //TODO
};
