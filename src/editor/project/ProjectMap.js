'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var ProjectTab = require('./ProjectTab');
var Project = require('./Project');

function ProjectMap(opt) {

    EventEmitter.call(this);

    this._projects = [];

    this.projectTab = new ProjectTab(this);
    am.workspace.fillTab('Project', this.projectTab.domElem);
}

inherits(ProjectMap, EventEmitter);
var p = ProjectMap.prototype;
module.exports = ProjectMap;

p.load = function (project) {
    
    if (!(project instanceof Project)) {

        project = new Project(project);
    }

    if (!_.include(this._projects, project)) {

        this._projects.push(project);
    }

    this.emit('load', project);

    return project;
};

p.unload = function (project) {

    _.pull(this._projects, project);

    project.dispose();

    this.emit('unload', project);
};

p.focus = function (project) {

    project = this.load(project);

    if (this._currProject) {

        this._currProject.blur();
        this._currProject.off('change.currTimeline', am.setTimeline, am);
    }

    this._currProject = project;
    this._currProject.focus();

    am.setTimeline(this._currProject.currTimeline);
    this._currProject.on('change.currTimeline', am.setTimeline, am);

    this.projectTab.focus(this._currProject);
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
}