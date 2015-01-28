'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var Dialog = require('../utils/Dialog');
var OptionLine = require('../utils/OptionLine');
var StringInput = require('../utils/StringInput');

var ACTIONS = [{
    method: 'play',
    arguments: [{type: 'number'}, {}],
}];

function ProjectMap(opt) {

    EventEmitter.call(this);

    this._projects = [];

    this.projectTab = new ProjectTab();
    am.workspace.fillTab('project tab', am.projectTab.domElem);
}

inherits(ProjectMap, EventEmitter);
var p = ProjectMap.prototype;
module.exports = ProjectMap;

p.getSave = function () {

    var save = {
        projects: this._projects.map(p => p.getSave()),
    };

    return save;
};

p.useSave = function (save) {

    if (!save) throw Error;

    if (save.projects) {

        this.clear();

        save.projects.forEach(p => p._loadProject(p));
    }
};

p._loadProject = function (project) {

    if (!(project instanceof Project)) {

        project = new Project(project);
    }

    if (!_.include(this._projects, project)) {

        this.project.push(project);
    }
}

p.openProject = function (project) {

    project = this._loadProject(project);

    if (am.currProject) {

        am.currProject.blur();
    }

    am.currProject = project;
    am.currProject.focus();
};

p.closeProject = function (project) {

    this._projects.pull(project);
    project.dispose();
}

p.clear = function() {

    this._projects.slice().forEach(p => this.closeProject(p));
};