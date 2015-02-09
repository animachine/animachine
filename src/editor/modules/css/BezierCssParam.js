'use strict';

var inherits = require('inherits');
var CssParam = require('./CssParam');
var Key = require('../../track/Key');
var amgui = require('../../amgui');
var Transhand = require('transhand');

function BezierCssParam (opt) {

    opt = opt || {optionLine: {}};

    opt.optionLine.inputs = [
        {name: 'x', type: 'unit'},
        {name: 'y', type: 'unit'},
        {name: 'autoRotate', type: 'checkbox'},
    ];

    this._checkTimeline = undefined;
    this._checkObj = {x: 0, y: 0};

    CssParam.apply(this, arguments);

    this.on('change', this._refreshCheckTimeline, this);
    this._refreshCheckTimeline();

    this._defaultValue = {x: 0, y: 0};

    this.optionLine.addButton({
        domElem: amgui.createIconBtn({
            icon: 'chart-line',
            tooltip: 'convert to plain translate',
            onClick: () => this.emit('bezierToTranslate'),
        }),
        name: 'bezier',
        childIdx: 0,
    });

    this.on('change.hidden', () => {
        if (this.hidden) {
            this._blurTransformer();
        }
        else {
            this._focusTransformer();
        }
    });
}

inherits(BezierCssParam, CssParam);
var p = BezierCssParam.prototype;
module.exports = BezierCssParam;

Object.defineProperties(p, {

    parentTrack: {
        set: function (v) {

            if (this._parentTrack) {
                this._parentTrack.off('focusTransformer', this._focusTransformer, this);
                this._parentTrack.off('blurTransformer', this._blurTransformer, this);
            }

            this._parentTrack = v;

            if (this._parentTrack) {
                this._parentTrack.on('focusTransformer', this._focusTransformer, this);
                this._parentTrack.on('blurTransformer', this._blurTransformer, this);
            }
        },
        get: function () {

            return this._parentTrack;
        }
    }
});







p.getScriptKeys = function () {

    var keys = [];

    this.keyLine.forEachKeys(function (key) {

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
            },
            prevKey = key.getPrevKey();

        values.push(prevKey ? _.last(prevKey.value).anchor : key.value[0].anchor);
        values.push(prevKey ? _.last(prevKey.value).handleRight : key.value[0].anchor);

        key.value.forEach(function (point, idx, arr) {

            values.push(point.handleLeft);
            values.push(point.anchor);
            if (idx !== arr.length - 1) values.push(point.handleRight);
        });

        //optimise and fix GSAP bug
        if (values.every(v => v.x === values[0].x && v.y === values[0].y)) {

            delete k.options.bezier;
            k.options.x = values[0].x;
            k.options.y = values[0].y;
        }

        keys.push(k);
    }, this);

    return _.sortBy(keys, 'time');
};

p._refreshCheckTimeline = function () {

    var time = 0,
     tl = new window.TimelineMax();

    if (this._checkTimeline) this._checkTimeline.kill();
    this._checkTimeline = tl;

    this.getScriptKeys(true).forEach(key => {

        tl.to(this._checkObj, (key.time - time) / 1000, key.options);

        time = key.time;
    });
};

p.getValue = function (time) {

    if (!_.isNumber(time)) {
        time = this.timeline.currTime;
    }

    if (!this._checkTimeline) {
        this._refreshCheckTimeline();
    }

    this._checkTimeline.time(time/1000);
    return {
        x: this._checkObj.x,
        y: this._checkObj.y,
    };
};

p.addKey = function (opt) {

    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            key.value.length = 0;
            [].push.apply(key.value, opt.value);
        }
    }
    else {

        if (!opt.value) {

            let {x, y} = this.getValue(opt.time);

            opt.value = [{
                anchor: {x, y},
                handleLeft: {x, y},
                handleRight: {x, y}
            }];
        }

        key = new Key(opt, this.timeline);

        key.on('prerender', this._onKeyPrerender, this);

        this.keyLine.addKey(key);

        am.history.save({
            undo: () => this.removeKey(key),
            redo: () => this.addKey(key),
            name: 'add bezier key',
        });

        this.emit('addKey');
    }

    this._refreshInputs();
    this._refreshTgglKey();

    this.emit('change');

    return key;
};

//TODO removeKey -> key.off('prerender', this._onKeyPrerender, this);



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

p._focusTransformer = function (de) {

    de = de || this.parentTrack._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe || this.hidden) return this._blurTransformer();

    if (!this._transformer) {
        this._transformer = new Transhand();
        this._transformer.on('change', this._onChangeTransformer, this);
    }

    var transformSave;
    if (de.style.transform) {
        transformSave = de.style.transform;
        de.style.transform = '';
    }

    var br = de.getBoundingClientRect();

    de.style.transform = transformSave;

    var points = [];

    _.sortBy(this.keyLine._keys, 'time').forEach(function (key) {

        key.value.forEach(function (point, idx, arr) {

            var srcKey = {
                    anchor: {x: point.anchor.x, y: point.anchor.y},
                    handleLeft: {x: point.handleLeft.x, y: point.handleLeft.y},
                    handleRight: {x: point.handleRight.x, y: point.handleRight.y},
                    linked: point.linked,
                };

            if (idx !== arr.length - 1) {

                srcKey.style = {
                    anchorFill: 'navajowhite',
                    anchorStroke: 'deepskyblue',
                    handleFill: 'navajowhite',
                    handleStroke: 'deepskyblue',
                };
            }

            points.push(srcKey);
        });
    });

    this._transformer.setup({
        hand: {
            type: 'curver',
            points: points,
            offset: {
                x: br.left + br.width/2,
                y: br.top + br.height/2,
            }
        },
    });
    this._transformer.activate();

    am.deHandlerCont.appendChild(this._transformer.domElem);
};

p._blurTransformer = function () {

    if (this._transformer) {

        this._transformer.deactivate();
    }
};






p._onChangeTransformer = function (changes) {

    var changedKeys = [];

    changes.forEach(change => {

        var idx = change.idx,
            keys = _.sortBy(this.keyLine._keys, 'time'),
            key;

        for (var i = 0, l = keys.length; i < l; ++i) {

            key = keys[i];

            if (key.value.length <= idx) {

                idx -= key.value.length;
            }
            else {
                break;
            }
        }

        if (change.type === 'add') {

            key.value.splice(idx, 0, {
                anchor: {x: change.point.anchor.x, y: change.point.anchor.y},
                handleLeft: {x: change.point.handleLeft.x, y: change.point.handleLeft.y},
                handleRight: {x: change.point.handleRight.x, y: change.point.handleRight.y},
                linked: change.point.linked,
            });
        }
        else if (change.type === 'remove') {

            key.value.splice(idx, 1);

            if (key.value.length === 0) {

                this.keyLine.removeKey(key);
            }
        }
        else if (change.type === 'edit') {

            var point = key.value[idx];
            point.anchor.x = change.point.anchor.x;
            point.anchor.y = change.point.anchor.y;
            point.handleLeft.x = change.point.handleLeft.x;
            point.handleLeft.y = change.point.handleLeft.y;
            point.handleRight.x = change.point.handleRight.x;
            point.handleRight.y = change.point.handleRight.y;
            point.linked = change.point.linked;
        }

    });

    changedKeys.forEach(key => key.emit('change'));
};

p._onKeyPrerender = function (ctx, key) {

    var prevKey = key.getPrevKey(),
        start = this.timeline.timeToRenderPos(prevKey ? prevKey.time : 0),
        width = this.timeline.timeToRenderPos(key.time) - start,
        step = width / key.value.length;

    for (var i = 0; i < key.value.length - 1; ++i) {

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = 'deepskyblue';
        ctx.lineWidth = 1;
        ctx.arc(start + (step * (i+1)), key._height/2, 3, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }
};
