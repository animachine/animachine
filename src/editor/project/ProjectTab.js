'use strict';

var amgui = require('../amgui');
var OptionLine = require('../utils/OptionLine');
var SelectInput = require('../utils/SelectInput');

function ProjectTab() {

    this._createBase();
}

var p = ProjectTab.prototype;

















p._createBase = function () {

    var that = this;

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;

    this._scrollCont = document.createElement('div');
    this._scrollCont.style.width = '100%';
    this.domElem.appendChild(this._scrollCont);

    amgui.makeScrollable({
        deCont: this.domElem,
        deTarget: this._scrollCont,
    });

    var refreshSelectInput = () => {
        
        var options = am.projectMap.getProjects().map(project => {

            return {
                name: project.name,
                onClick: am.projectMap.focus(project)
            }
        });
        this._inpSelect.setOptions(options);        
    }

    this._inpSelect = new SelectInput({
        parent: this._scrollCont,
    });

    amgui.createBtn({
        parent: this._scrollCont,
        icon: 'add',
        text: 'new project',
        onClick: () => {
            var project = am.projectMap.load({name: 'new project'});
            am.projectMap.focus(project);
        },
    })
};

module.exports = ProjectTab;
