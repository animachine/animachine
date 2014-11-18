var Dialog = require('../utils/Dialog');
var amgui = require('../amgui');

var dialog = new Dialog({

    createContent: function () {

        var deScrollCont = amgui.createDiv({
            parent: this._deContent,
            width: '100%',
            display: 'flex',
        });

        var deLeft = amgui.createDiv({
            parent: deScrollCont,
            width: '234px',
        });

        var deRight = amgui.createDiv({
            parent: deScrollCont,
            flex: '1',
        });
    }
});

function createShortcutLabel(value) {

    var deLabel = amgui.createLabel({
        
    })
}