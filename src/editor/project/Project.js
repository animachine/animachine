var EventEmitter = require('eventman');
var inherits = require('inherits');
var Timeline = require('../timeline');
var defineCompactProperty = require('../utils/defineCompactProperty');

function Project(save = {}) {

    EventEmitter.call(this);

    this._timelines = [];

    this.useSave(save);
}

inherits(Project, EventEmitter);
var p = Project.prototype;
module.exports = Project;

defineCompactProperty(p, {name: 'name', type: 'string'});

p.useSave = function (save = {}) {

    am.history.saveSuspended = true;
    
    if (_.has(save, 'name')) {
        this.name = save.name;
    }

    if (_.isArray(save.timelines)) {

        save.timelines.forEach(tl => this.addTimeline(tl));
    }
    
    if (_.has(save, 'currTimelineIdx')) {
        this.selectTimeline(save.currTimelineIdx);
    }

    am.history.saveSuspended = false;
};

p.getSave = function () {

    var save = {
        name: this.name,
        timelines: this._timelines.map(tl => tl.getSave()),
    };

    if (this._currTimeline) {
        save.currTimelineIdx = this._timelines.indexOf(this._currTimeline);
    }

    return save;
};

p.addTimeline = function (timeline) {

    //create the instance if the parameter is a save object
    if (!(timeline instanceof Timeline)) {

        timeline = new Timeline(timeline);
    }
    //remove the timeline if it's already added to an other project
    else if (timeline.parentProject && timeline.parentProject !== this) {

        timeline.parentProject.removeTimeline(timeilne);
    }

    timeline.parentProject = this;

    //avoid to add twice
    if (_.include(this._timelines, timeline)) {
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

    if (!_.include(this._timelines, timeline)) {
        return;
    }

    timeline.parentProject = undefined;

    am.history.save({
        undo: () => this.addTimeline(timeline),
        redo: () => this.removeTimeline(timeline),
        name: 'remove timeline',
    });

    _.pull(this._timelines, timeline);

    this.emit('removeTimeline');
};

p.selectTimeline = function (idx) {

    var timeline = this._timelines[idx];

    if (!timeline || timeline === this._currTimeline) return;

    if (this._currTimeline) {

        this._currTimeline.pause();
    }

    this._currTimeline = timeline;
}

p.focus = function () {

    this._showTimeline()
};

p.blur = function () {
    
    if (this._currTimeline) {

        this._currTimeline.pause();
    }
};

p._showTimeline = function () {

    if (!this._currTimeline && !_.isEmpty(this._timelines)) {

        this.selectTimeline(0);
    }

    if (this._currTimeline) {

        am.workspace.fillTab('timeline', this._currTimeline.domElem);
    }

    this.emit('focus.timeline', this._currTimeline);
}




p.addInput = function (path, value) {

    var obj = this.inputs;

    if (typeof(path) !== 'string') {
        //TODO: throw a detailed error
        throw Error();
    }

    path = path.split('.');

    path.forEach(function (name, idx, arr) {

        if (idx === arr.length-1) {

            obj[name] = value;
        }
        else {
            obj = _.isPlainObject(obj[name]) ? obj[name] : {};
        }
    });

    this.emit('change.inputs');
};

p.setInputs = function (inputs) {

    if (!_.isPlainObject(inputs)) {
        //TODO: throw a detailed error
        throw Error();
    }

    this.inputs = inputs;

    this.emit('change.inputs');
};

p.getInputPaths = function (maxLevel = 4) {

    var ret = [];

    var step = (obj, path, level) => {

        Object.keys(obj).forEach(key => {

            ret.push(path + key);

            if (_.isPlainObject(obj[key]) && level <= maxLevel) {

                step(obj[key], path + key + '.', level + 1);
            }
        });
    }

    step(this.inputs, '', 0);

    return ret;
};



p.dispose = function () {

    _.invoke(this._timelines, 'dispose');
};