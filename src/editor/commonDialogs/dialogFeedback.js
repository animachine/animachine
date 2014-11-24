'use strict';

var Dialog = require('../utils/Dialog');
var amgui = require('../amgui');

var dialog = new Dialog({
    title: 'Feedback',
});

dialog.addButton('ok', 'hide');

createContent();

function createContent() {

    amgui.createLabel({
        caption: 'Hi! This program is in alpha state, so most of the things will change and most of the bugs are known. But if you have any question, feedback, feature request, bug report or just feel the need for contact, you can use the azazdeaz@gmail.com or the <a style="color:white;" href="https://github.com/animachine/animachine/issues">github issues</a>.',
        fontSize: '18px',
        height: 'auto',
        display: 'block',
        parent: dialog.deContent,
    });
};

module.exports = dialog;
