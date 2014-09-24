'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createInput: createInput,
    }
};


function createInput(opt) {

    opt = opt || {};

    var inp = document.createElement('input');
    inp.type = opt.type || 'text';
    inp.style.width = opt.width || '245px';
    inp.style.height = opt.height || '14px';
    inp.style.fontSize = opt.fontSize || '14px';
    inp.style.fontFamily = amgui.FONT_FAMILY;
    inp.style.color = amgui.color.text;
    inp.style.background = 'none';
    inp.style.border = 'none';
    selector.domElem.appendChild(inp);

    if ('palceholder' in opt) inp.palceholder = opt.palceholder;
    if ('value' in opt) inp.value = opt.value;

    if (opt.parent) {
        opt.parent.appendChild(inp);
    }

    return inp;
}