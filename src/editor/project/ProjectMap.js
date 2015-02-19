'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var ProjectTab = require('./ProjectTab');
var Project = require('./Project');

function ProjectMap() {

    EventEmitter.call(this);

    this._projects = [];

    this.projectTab = new ProjectTab(this);
    am.workspace.fillTab('Project', this.projectTab.domElem);
}

inherits(ProjectMap, EventEmitter);
var p = ProjectMap.prototype;
module.exports = ProjectMap;

Object.defineProperties(p, {
    currProject: {
        get: function () {

            return  this.getCurrProject();
        }
    }
});

p.load = function (project) {

    if (!(project instanceof Project)) {

        project = new Project(project);
    }

    if (!_.include(this._projects, project)) {

        this._projects.push(project);

        am.history.save({
            undo: () => this.unload(project),
            redo: () => this.load(project),
            name: 'load ' + project.name,
        });
    }

    this.emit('load', project);

    return project;
};

p.unload = function (project) {

    if (!_.include(this._projects, project)) return;

    _.pull(this._projects, project);

    am.history.save({
        undo: () => this.load(project),
        redo: () => this.unload(project),
        name: 'unload ' + project.name,
    });

    this.emit('unload', project);
};

p.focus = function (project) {

    project = this.load(project);

    if (this._currProject) {

        let oldProject = this._currProject;

        am.history.save({
            undo: () => this.focus(oldProject),
            redo: () => this.focus(project),
            name: 'select ' + project.name,
        });

        oldProject.sleep();
        oldProject.off('change.currTimeline', am.setTimeline, am);
    }

    this._currProject = project;
    this._currProject.wake();

    am.setTimeline(this._currProject.currTimeline);
    this._currProject.on('change.currTimeline', am.setTimeline, am);

    this.emit('focus', this._currProject);
};

p.blur = function () {

};

p.clear = function () {

    this._projects.slice().forEach(p => this.closeProject(p));
};

p.getCurrProject = function () {

    return this._currProject;
};

p.getProjects = function () {

    return this._projects;
};
