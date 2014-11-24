'use strict';

var Dialog = require('../utils/Dialog');
var amgui = require('../amgui');

var dialog = new Dialog({
    title: 'Work in progress',
});

dialog.addButton('ok', 'hide');

createContent();

function createContent() {

    amgui.createLabel({
        caption: 'This feature doesn\'t ready yet. (But we are on it!)',
        fontSize: '18px',
        height: 'auto',
        display: 'block',
        parent: dialog.deContent
    });
};

module.exports = dialog;
