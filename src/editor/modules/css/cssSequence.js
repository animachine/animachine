function CssSequence(src) {

    this._selectors = [];
    this._keyframes = [];

    this.deKeyframes = document.createElement('div');
    this.deKeyframes.style.width = '100%';
    this.deKeyframes.style.height = '100%';
    this.deKeyframes.style.background = 'orangered';

    this.deOptions = document.createElement('div');
    this.deOptions.style.width = '100%';
    this.deOptions.style.height = '100%';
    this.deOptions.style.background = 'orange';

    this._handlerChange = this._handlerChange.bind(this);
}

var p = CssSequence.prototype;

p.select = function () {

    am.handler.reset({type: 'css3'});
    am.on('change', this._handlerChange);
}

p.deselect = function () {
    
    am.off('change', this._handlerChange);
}

p._handlerChange = function(prop, value, correct) {

    var time = am.timeline.currTime,
        keyframe = this._keyframes.findOne({time: time}) || this.createKeyframe(time);

    keyframe.css[prop] = value;
}

p.addKeyframe = function (src) {

    var keyframe = _.extend({}, src, {
        time: 0,
        domElement: document.createElement('am-keyframe'),
        css: {},
        attr: {}
    });

    return keyframe;
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
}

p.generateAst = function (src) {

}

module.exports = {

    create: function () {

        return new CssSequence();
    }
};