'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createCursorFromText: createCursorFromText,
    };
};

var buff = [];

function createCursorFromText(opt) {

    opt = opt || {};
    opt.width = opt.width || 24;
    opt.height = opt.height || 24;
    opt.hotspotX = 'hotspotX' in opt ? opt.hotspotX : opt.width / 2;
    opt.hotspotY = 'hotspotY' in opt ? opt.hotspotY : opt.height / 2;
    opt.textX = opt.textX || 0;
    opt.textY = opt.textY || 0;
    opt.fontFamily = opt.fontFamily || 'amgui';
    opt.fontSize = opt.fontSize || opt.height + 'px';
    opt.color = opt.color || '#000';
    opt.rotate = opt.rotate || 0;
    opt.rotateOriginX = opt.rotateOriginX || 0;
    opt.rotateOriginY = opt.rotateOriginY || 0;
    opt.text = opt.text || (opt.icon && amgui.getIconChar(opt.icon)) || 'A';
    
    var buffered = buff.find(function(b) {

        if (b.opt.width === opt.width &&
            b.opt.height === opt.height &&
            b.opt.hotspotX === opt.hotspotX &&
            b.opt.hotspotY === opt.hotspotY &&
            b.opt.textX === opt.textX &&
            b.opt.textY === opt.textY &&
            b.opt.fontFamily === opt.fontFamily &&
            b.opt.fontSize === opt.fontSize &&
            b.opt.color === opt.color &&
            b.opt.rotate === opt.rotate &&
            b.opt.rotateOriginX === opt.rotateOriginX &&
            b.opt.rotateOriginY === opt.rotateOriginY &&
            b.opt.text === opt.text)
        {
            return true;
        }
    });

    if (buffered) {

        return buffered.url;
    }
  
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    
    canvas.width = opt.width;
    canvas.height = opt.height;
    
    ctx.translate(opt.rotateOriginX, opt.rotateOriginY);
    ctx.rotate(opt.rotate);
    ctx.translate(-opt.rotateOriginX, -opt.rotateOriginY);
  
    ctx.font = opt.fontSize + ' ' + opt.fontFamily;
    ctx.textBaseline = 'top';
  
    if (opt.stroke) {
        ctx.strokeStyle = opt.stroke.color;
        ctx.lineWidth = opt.stroke.width;
        ctx.strokeText(opt.text, opt.textX, opt.textY);
    }
    
    ctx.fillStyle = opt.color;
    ctx.fillText(opt.text, opt.textX, opt.textY);

    if (opt.debug) {
        ctx.strokeStyle = 'lime';
        ctx.lineWidth = '3';
        ctx.rect(0, 0, opt.width, opt.height);
        ctx.stroke();

        ctx.fillStyle = 'red';
        ctx.fillRect(opt.hotspotX, opt.hotspotY, 1, 1);
    }
    
    var uri = canvas.toDataURL(),
        url = 'url(\'' + uri + '\') '+opt.hotspotX+' '+opt.hotspotY+', auto';

    buff.push({
        opt: opt,
        url: url,
    });

    return url;
}