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
