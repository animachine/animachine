'use strict';

var amgui = require('../amgui');
var OptionLine = require('../utils/OptionLine');

function ProjectTab(projectMap) {

    this._projectMap = projectMap;

    this._createBase();

    projectMap.on('focus', this._onFocus, this);
}

var p = ProjectTab.prototype;

p._onFocus = function (project) {

    if (this._currProject) {

        this._currProject.off(['addTimeline', 'removeTimeline', 'change.currTimeline'], this._refreshLibrary, this);
    }

    this._currProject = project;

    this._deSelected.text = this._currProject.name;

    this._refreshLibrary();
    this._currProject.on(['addTimeline', 'removeTimeline', 'change.currTimeline'], this._refreshLibrary, this);
};







p._refreshLibrary = function () {

    this._optLibrary.removeAllOptionLines();

    this._currProject._timelines.forEach(timeline => {

        var optionLine = new OptionLine({
            title: timeline.name || 'unnamed timeline',
            onDblclick: () => this._projectMap.currProject.selectTimeline(timeline),
            keepSpaceForTgglChildren: true,
            data: {
                type: 'timeline',
                value: timeline,
            },
            highlight: this._currProject.currTimeline === timeline,
        });

        optionLine.addButton({
            domElem: amgui.createIconBtn({
                icon: 'cancel',
                hoveMode: true,
                onClick: () => this._projectMap.currProject.removeTimeline(timeline),
            }),
        });

        this._optLibrary.addOptionLine(optionLine);
    });
};








p._createBase = function () {

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

    this._createProjectHandlers();
    this._createLibrary();
};

p._createProjectHandlers = function () {

    var deHead = amgui.createDiv({
        parent: this._scrollCont,
        display: 'flex',
        width: '100%'
    });

    var refreshSelectInput = () => {

        var items = this._projectMap.getProjects().map(project => {

            return {
                text: project.name,
                onClick: () => this._projectMap.focus(project),
                iconRight: project === this._projectMap.currProject ? 'paw' : undefined,
            };
        });
        this._ddSelect.setItems(items);
    };

    this._deSelected = amgui.createLabel({
        parent: deHead,
        fontSize: '14px',
        fontWeight: '600',
        iconRight: 'down-dir',
    });

    this._ddSelect = amgui.createDropdown({});

    amgui.bindDropdown({
        deTarget: this._deSelected,
        deDropdown: this._ddSelect,
    });

    refreshSelectInput();
    this._projectMap.on(['load', 'unload', 'focus'], refreshSelectInput);

    amgui.createDiv({
        parent: deHead,
        flex: 1,
    });

    amgui.bindDropdown({
        deTarget: amgui.createIconBtn({
            parent: deHead,
            icon: 'ellipsis-vert',
            display: 'inline-block',
            size: 18,
        }),
        deDropdown: amgui.createDropdown({
            options: [{
                text: 'new project',
                icon: 'plus',
                onClick: () => {
                    var project = this._projectMap.load({
                        name: 'new project',
                        timelines: [{}],
                    });
                    this._projectMap.focus(project);
                },
            }, {
                text: 'close this project',
                icon: 'cancel',
                onClick: () => am.dialogs.WIP.show(),
            }],
        }),
    });
};

p._createLibrary = function () {

    this._optLibrary = new OptionLine({
        title: 'Library',
        parent: this._scrollCont,
        tgglChildren: true,
    });

    var btnNew = amgui.createIconBtn({
        icon: 'plus'
    });

    amgui.bindDropdown({
        deTarget: btnNew,
        deDropdown: amgui.createDropdown({
            options: [
                {text: 'timeline', icon: 'barcode', onClick: () => this._currProject.addTimeline()},
                {text: 'folder', icon: 'folder-empty', onClick: () => am.dialogs.WIP.show()},
                {text: 'image', icon: 'file-image', onClick: () => am.dialogs.WIP.show()},
                {text: 'custom asset', icon: 'doc', onClick: () => am.dialogs.WIP.show()},
            ],
        }),
    });

    this._optLibrary.addButton({
        domElem: btnNew,
    });
};

module.exports = ProjectTab;
