'use strict';

var amgui = require('../amgui');
var Dialog = require('../utils/Dialog');

var dialog = new Dialog({
    title: 'Copy',
});

dialog.addButton('ok', 'hide');

var input = document.createElement('textarea');
dialog.deContent.appendChild(input);
dialog.deContent.style.width = '100%';

module.exports = function createClipboard (am) {

    am.clipboard = {

        copy: function (data) {

            input.value = data;
            dialog.show();
            input.focus();
            input.select();

            if (am.isExtension()) {
                document.execCommand("Copy", false, null);
                dialog.hide();
            }
        },
    };
};
