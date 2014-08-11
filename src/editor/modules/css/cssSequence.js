var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');
var CssParameter = require('./CssParameter');

function CssSequence(src, opt) {

    EventEmitter.call(this);

    this._selectors = [];
    this._parameters = [];

    this._opt = _.extend({baseH: 21}, opt);


    this.deOptions = document.createElement('div');
    this.deKeys = document.createElement('div');

    this._deHeadOptinos = this._createHeadOptions();
    this._deHeadKeyline = amgui.createKeyline({});
    this.deKeys.appendChild(this._deHeadKeyline);

    this._handlerChange = this._handlerChange.bind(this);
}

inherits(CssSequence, EventEmitter);
var p = CssSequence.prototype;

p.select = function () {

    am.handler.reset({type: 'css3'});
    am.on('change', this._handlerChange);
};

p.deselect = function () {
    
    am.off('change', this._handlerChange);
};

p.renderTime = function (time) {

    var $selection = $(this._selectors);

    this._parameters.forEach(function (param) {

        $selection.css(param.name, param.getValue(time))
    });
};

p.getHeight = function () {

    return this._opt.baseH;
}

p._handlerChange = function(prop, value, correct) {

    var time = am.timeline.currTime,
        keyframe = this._keyframes.findOne({time: time}) || this.createKeyframe(time);

    keyframe.css[prop] = value;
};

p.addKeyframe = function (src) {

    var keyframe = _.extend({}, src, {
        time: 0,
        css: {},
        attr: {}
    });

    keyframe.domElem = this.deKeyline.addKey(keyframe.time);

    return keyframe;
};

p.addParameter = function (opt) {

    var param = new CssParameter(opt);
    this._parameters.push(param);

    this.deOptions.appendChild(param.deOptions);
    this.deKeys.appendChild(param.deKeyline);
};

p._refreshMainKeyline = function () {

};

p.generateSrc = function () {

    var src = {
        selectors: _.clone(this._selectors),
        keyframes: []
    };

    this._keyframes.forEach(function (keyframe) {

        src.keyframes.push({
            css: _.clone(keyframes.css),
            attr: _.clone(keyframes.attr),
        });
    });
};

p.generateAst = function (src) {

};

p._createHeadOptions = function (){

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = this._opt.baseH + 'px';
    de.style.background = 'orange';
    this.deOptions.appendChild(de);

    return de;
};

module.exports = {

    create: function () {

        return new CssSequence();
    }
};