var EventEmitter = require('eventman');
var inherits = require('inherits');
var Timeline = require('../timeline');

function Project(save = {}) {

    this._timelines = [];

    this.useSave(save);
}

inherits(Project, EventEmitter);
var p = Project.prototype;
module.exports = Project;

p.useSave = function (save = {}) {

    this.history.saveSuspended = true;
    
    if (_.has(save, 'name')) 
        this.name = save.name;

    if (_.isArray(save.timelines)) {

        timelines.forEach(tl => this.addTimeline(save));
    }

    this.history.saveSuspended = false;
};

p.getSave = function () {

    var save = {
        name: this.name,
        timelines: this._timelines.map(tl => tl.getSave()),
    };
};

p.addTimeline = function (timeline) {

    //create the instance if the parameter is a save object
    if (!(timeline instanceof Timeline)) {

        timeline = new Timeline(timeline);
    }

    //avoid to add twice
    if (_.contains(this._timelines, timeline)) {
        return;
    }

    am.history.save({
        undo: () => this.removeTimeline(timeline),
        redo: () => this.addTimeline(timeline),
        name: 'add timeline',
    });

    this._timelines.push(timeline);

    this.emit('addTimeline');
};

p.removeTimeline = function (timeline) {

    if (!_.contains(this._timelines, timeline)) {
        return;
    }

    am.history.save({
        undo: () => this.addTimeline(timeline),
        redo: () => this.removeTimeline(timeline),
        name: 'remove timeline',
    });

    _.pull(this._timelines, timeline);

    this.emit('removeTimeline');
};