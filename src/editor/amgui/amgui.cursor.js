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
    opt.hotspotX = opt.hotspotX || opt.width / 2;
    opt.hotspotY = opt.hotspotY || opt.height / 2;
    opt.textX = opt.textX || 0;
    opt.textY = opt.textY || 0;
    opt.fontFamily = opt.fontFamily || 'amgui';
    opt.fontSize = opt.fontSize || opt.height / 2 + 'px';
    opt.color = opt.color || '#000';
    opt.rotate = opt.rotate || 0;
    opt.rotateOriginX = opt.rotateOriginX || 0;
    opt.rotateOriginY = opt.rotateOriginY || 0;
    opt.text = opt.text || 'A';
    
  
    var canvas = document.createElement('canvas'),
        ctx = canvas.getContext('2d');
    
    canvas.width = opt.width;
    canvas.height = opt.height;
  
    if (opt.backgroundColor) {
        ctx.fillStyle = opt.backgroundColor;
        ctx.fillRect(0, 0, opt.width, opt.height);
    }
    
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
  
    if (opt.hotspotColor) {
        ctx.fillStyle = opt.hotspotColor;
        ctx.fillRect(opt.hotspotX, opt.hotspotY, 1, 1);
    }
    
    var uri = canvas.toDataURL();
 
    return 'url(\'' + uri + '\') '+opt.hotspotX+' '+opt.hotspotY+', auto';
}