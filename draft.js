//main
var WindooMan = require('windoo-man'),
    Transhand = require('transhand'),
    Timeline = require('timeline');
    domelem = require('am-domelem');

var am = {},
    windowLayer = createLayer(),
    toolLayer = createLayer();

am.win = new WindooMan({parent: windowLayer});
am.handler = new Transhand({parent: toolLayer});//new window.AmguiTranshand({parent: toolLayer})
am.timeline = new Timeline();

am.win.useWokspace(getInitWorkspace());
am.win.fill('timeline', a.timeline);

domelem.init(am);

module.exports = am;









//Cssedit

var am;

function CssTimelineRow(src) {

    this._selectors = [];
    this._keyframes = [];

    this.domElement = new window.AmguiTimelineRow({color: '#7ED40F'});

    this._handlerChange = this._handlerChange.bind(this);
}

CssTimelineRow.name = 'css3';

var p = CssTimelineRow.prototype;

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

var ce = {

    init: function (_am) {

        am = _am;

        am.timeline.registerRow(CssTimelineRow);
    }
};


API

am
.registerSequenceType();
=>'pick'

sequence
create():Sequence









//WindooMan

var Windoo = require('windoo');

function WindooMan(opt)  {

    this._windows = [];
}

var p = WindooMan.prototype();

p.useWorkspace = function (ws) {

};

p.getCurrentWorkspace = function () {

};

p.saveWorkspace = function (name) {

};

p.addWindow (opt) {

    var win = opt instanceof Windoo ? opt : new Windoo(opt);

    this._windows.push(opt);

    return win; 
}