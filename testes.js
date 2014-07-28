//main
var WindooMan = require('windoo-man'),
    Transhand = require('transhand'),
    Timeline = require('timeline');

var am = {},
    windowLayer = createLayer(),
    toolLayer = createLayer();

am.win = new WindooMan({parent: windowLayer});
am.handler = new Transhand({parent: toolLayer});//new window.AmguiTranshand({parent: toolLayer})
am.timeline = new Timeline();

am.win.useWokspace(getInitWorkspace());
am.win.fill('timeline', a.timeline);

module.exports = am;

//Cssedit

var am = require('animachine');

function TimelineRow() {

    this._keyframes = [];

    this.domElement = new window.AmguiTimelineRow({color: '#7ED40F'});

    this.domElement.on('selectkeyframe', function (id) {

        var kf = this._keyframes.findOne({id: id});
    });
}

TimelineRow.name = 'css';

var ce = {

    init: function () {

        am.timeline.registerRow(TimelineRow);
    }
};

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