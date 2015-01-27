'use strict';

var Track = require('../../timeline/utils/Track');
var inherits = require('inherits');
var amgui = require('../../amgui');
var paramFactory = require('./paramFactory');
var Transhand = require('transhand');
var dialogTrackOptions = require('./dialogCssTrackOptions');
var dialogNewParam = require('./dialogNewParam');
var mstPlayer = require('./script.player.mst');


function CssTrack(opt) {

    Track.call(this);
}

inherits(CssTrack, Track);
var p = CssTrack.prototype;
module.exports = CssTrack;

p.type = 'css_track_type';

p._getScriptParams = function (opt) {

    var params = Track.prototype._getScriptParams.call(this, opt);

    handleTransformOrigin();

    return params;

    function handleTransformOrigin() {

        var tox = _.find(params, param => 'transformOriginX' in param[0].options);
        var toy = _.find(params, param => 'transformOriginY' in param[0].options);
        var toz = _.find(params, param => 'transformOriginZ' in param[0].options);

        if (!tox) return;

        var to = [];
        tox.forEach(function (key, idx) {

            to.push({
                duration: key.duration,
                options: {
                    ease: key.options.ease,
                    transformOrigin: '' + 
                        (tox && tox[idx] ? tox[idx].options.transformOriginX : '50%') + ' ' +
                        (toy && toy[idx] ? toy[idx].options.transformOriginY : '50%') + ' ' +
                        (toz && toz[idx] ? (toz[idx].options.transformOriginZ || '0px') : ''),
                } 
            });
        });

        if (tox) params.splice(params.indexOf(tox), 1);
        if (toy) params.splice(params.indexOf(toy), 1);
        if (toz) params.splice(params.indexOf(toz), 1);
        params.push(to);
    }
};


p._switchFromTranslateToBezier = function () {

    var xParam = this.getParam('x'),
        yParam = this.getParam('y'),
        xKeys = xParam.getSave().keys,
        yKeys = yParam.getSave().keys,
        bezierKeys = [],
        times = _.sortBy(_.uniq(_.pluck(xKeys, 'time').concat(_.pluck(yKeys, 'time')))),
        oldBezierKeys = this.__savedBezierKeys || [];

    times.forEach(function (time) {

        var x = parseFloat(xParam.getValue(time)),
            y = parseFloat(yParam.getValue(time)),
            xKey = xParam.getKey(time),
            yKey = yParam.getKey(time),
            oldKey = _.find(oldBezierKeys, {time: time, anchor: {x:x, y:y}});

        bezierKeys.push(oldKey || {
            time: time,
            ease: (xKey && xKey.ease) || (yKey && yKey.ease),
            value: [{
                anchor: {x, y},
                handleLeft: {x, y},
                handleRight: {x, y},
            }]
        });
    });

    var bezierParam = this.addParam({
        name: 'bezier',
        keys: bezierKeys,
    });

    xParam.hidden = true;
    yParam.hidden = true;
    this._paramGroup.getParam('translate').hidden = true;
    bezierParam.hidden = false;
    
    this._transformer();
};

p._switchFromBezierToTranslate = function () {

    //TODO restore original x, y keys when bezier wasn't changed

    var bezierParam = this.getParam('bezier'),
        bezierKeys = bezierParam.getSave().keys,
        xKeys = [],
        yKeys = [];
    
    this.__savedBezierKeys = keys;

    bezierKeys.forEach(function (bezierKey) {

        var lastPoint = _.last(bezierKey.value);

        xKeys.push(oldKey || {
            time: time,
            value: lastPoint.anchor.x + 'px',
        });
        yKeys.push(oldKey || {
            time: time,
            value: lastPoint.anchor.y + 'px',
        });
    });

    var xParam = this.addParam({
        name: 'x',
        keys: xKeys,
    });
    var yParam = this.addParam({
        name: 'y',
        keys: yKeys,
    });

    xParam.hidden = false;
    yParam.hidden = false;
    this._paramGroup.getParam('translate').hidden = false;
    bezierParam.hidden = true;

    this.focusTransformer();
};

p._onChangeHandler = function(params, type) {

    var time = am.timeline.currTime;

    var add = function (name, value) {

        if (name === 'x' || name === 'y') {

            let bezierParam = this.getParam('bezier');

            if (bezierParam && !bezierParam.hidden) {

                let key = bezierParam.getKey(time),
                    keyOpt;

                if (key) {

                    keyOpt = key.getSave();
                }
                else {
                    let {x, y} = bezierParam.getValue(time);
                    //TODO bezierParam.inzertPoint(time, ...)
                    keyOpt = {time, value: [{
                        anchor: {x, y},
                        handleLeft: {x, y},
                        handleRight: {x, y},
                    }]};
                }

                value = parseFloat(value);
                let lastPoint = _.last(keyOpt.value),
                    diff = value - lastPoint.anchor[name];

                lastPoint.anchor[name] += diff;
                lastPoint.handleLeft[name] += diff;
                lastPoint.handleRight[name] += diff;

                bezierParam.addKey(keyOpt);

                return;
            }
        }

        var param = this.addParam({name: name});

        param.addKey({
            time: time,
            value: value,
        });
    }.bind(this);

    if (type === 'transform') {

        Object.keys(params).forEach(function (name) {

            switch (name) {
                case 'tx': add('x', params[name] + 'px'); break;
                case 'ty': add('y', params[name] + 'px'); break;
                case 'sx': add('scaleX', params[name]); break;
                case 'sy': add('scaleY', params[name]); break;
                case 'rz': add('rotationZ', (params[name] / Math.PI * 180) + 'deg'); break;
                case 'ox': add('transformOriginX', (params[name] * 100) + '%'); break;
                case 'oy': add('transformOriginY', (params[name] * 100) + '%'); break;
            }
        });
    }
};



p._onWindowResize = function () {

    this.focusTransformer();
};

p._onWindowScroll = function () {

    this.focusTransformer();
};