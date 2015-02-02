var amgui = require('../amgui');

module.exports = function createMenu(am) {

    var deMenuIcon = amgui.createIconBtn({
        tooltip: 'menu',
        icon: 'menu',
        size: 24,
    });

    am._staticToolbarIcons.push(deMenuIcon);

    am.menuDropdown = amgui.createDropdown({
        options: [
            {
                text: 'file',
                icon: 'floppy',
                children: [
                    {text: 'new', onSelect: () => am.openNewProject(), icon: 'doc'},
                    {text: 'save', onSelect: onSelectSave, icon: 'upload-cloud'},
                    // {text: 'saveAs', onSelect: onSelectSave},
                    {text: 'open', onSelect: onSelectOpen, icon: 'download-cloud'},
                ]
            },
            {
                text: 'undo',
                icon: 'ccw',
                onClick: () => am.history.undo(),
            }, {
                text: 'redo',
                icon: 'cw',
                onClick: () => am.history.redo(),
            }, {
                text: "feedback",
                icon: "megaphone",
                separator: "rest",
                onClick: () => am.dialogs.feedback.show(),
            }, {
                text: "view on github",
                icon: "github",
                separator: "rest",
                onClick: () => window.open("https://github.com/animachine/animachine"),
            }   
        ]
    });

    amgui.bindDropdown({
        deTarget: deMenuIcon,
        deDropdown: am.menuDropdown,
    });

    function onSelectSave() {

        am.storage.showSaveDialog({

            getSave: function () {
                
                var opt = am.storage.getSaveOptions();

                return am.projectMap.getCurrentProject().getScript(opt);
            }
        });
    }

    function onSelectOpen() {

        am.storage.showOpenDialog({

            onOpen: function (save) {

                am.projectMap.open(save.project);
            }
        });
    }
};