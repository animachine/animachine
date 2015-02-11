'use strict';

var Dialog = require('../utils/Dialog');
var amgui = require('../amgui');
var i18n = require('../i18n');

var dialog = new Dialog({
    title: 'Hi!',
});

dialog.addButton('close', 'hide');

const CHECKFLAG = '__am_dontshowwelcomemsgagain',
    CHECKFLAGVAL = 'v1';

dialog.deContent.style.width = '570px';

var deText = amgui.createLabel({
    text: i18n.welcomeMsg,
    fontSize: '14px',
    height: 'auto',
    display: 'block',
    fontWeight: '600',
    parent: dialog.deContent
});
deText.style.marginBottom = '12px';


var cb = amgui.createCheckbox({
    text: 'don\'t show this again',
    parent: dialog.deContent,
});

dialog.on('hide', () => {

    am.setVar(CHECKFLAG, cb.checked ? CHECKFLAGVAL : false);
});

var _oriShow = dialog.show;
dialog.show = function () {

    dialog.isChecked(yes => {

        if (!yes) _oriShow.call(dialog);
    });
};

dialog.isChecked = function (cb) {

    am.getVar(CHECKFLAG, v => cb(v === CHECKFLAGVAL));
};

module.exports = dialog;
