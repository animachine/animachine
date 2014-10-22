'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createCursorFromText: createCursorFromText,
    };
};


function createCursorFromText(opt) {

    opt = opt || {};
    opt.width = opt.width || 24;
    opt.height = opt.height || 24;
    opt.cx = opt.cx || opt.width / 2;
    opt.cy = opt.cy || opt.height / 2;
    opt.tx = opt.tx || 0;
    opt.ty = opt.ty || opt.height / 2;
    opt.fontFamily = opt.fontFamily || 'amgui';
    opt.fontSize = opt.fontSize || opt.height / 2 + 'px';
    opt.color = opt.color || '#000';
    opt.r = opt.r || 0;
    opt.text = opt.text || 'A';

    var svg = 'url(\'data:image/svg+xml;utf8,'
        + '<svg xmlns="http://www.w3.org/2000/svg" width="'+opt.width+'" height="'+opt.height+'">'
        + '<text x="'+opt.ty+'" y="'+opt.ty+'" transform="rotate('+opt.r+', '+opt.cx+', '+opt.cy+')" '
        + 'fill="'+opt.color+'" font-size="'+opt.fontSize+'" font-family="'+opt.fontFamily+'">'+opt.text+'</text>'
        + '</svg>\') '+opt.cx+' '+opt.cy+', auto';

    return svg;
}