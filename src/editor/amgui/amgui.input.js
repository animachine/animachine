'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createInput: createInput,
    };
};


function createInput(opt) {

    opt = opt || {};

    var inp = document.createElement('input');
    inp.type = opt.type || 'text';
    inp.style.width = opt.width || '245px';
    inp.style.height = opt.height || amgui.LINE_HEIGHT + 'px';
    inp.style.fontSize = opt.fontSize || amgui.FONT_SIZE;
    inp.style.fontFamily = amgui.FONT_FAMILY;
    inp.style.color = amgui.color.text;
    inp.style.background = 'none';
    inp.style.border = 'none';
    inp.style.padding = '0';

    if ('palceholder' in opt) inp.palceholder = opt.palceholder;
    if ('value' in opt) inp.value = opt.value;
    if ('flex' in opt) inp.style.flex = opt.flex;

    if (opt.onChange) {
        inp.addEventListener('change', opt.onChange);
    }

    if (opt.parent) {
        opt.parent.appendChild(inp);
    }

    inp.setValue = function (v) {
            
        if (v === inp.value) return;

        inp.value = v;
    };

    return inp;
}