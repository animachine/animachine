'use strict';

var Dialog = require('../utils/Dialog');
var amgui = require('../amgui');

var dialog = new Dialog({
    title: 'Work in progress',
});

dialog.addButton('ok', 'hide');

amgui.createLabel({
    text: `This feature doesn't ready yet. (but it's on the way!)<br>
To get notified about the latest changes follow us on <a href="//github.com/animachine/animachine">Github!</a>`,
    fontSize: '16px',
    height: 'auto',
    display: 'block',
    parent: dialog.deContent,
});

module.exports = dialog;
