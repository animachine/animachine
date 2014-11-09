'use strict';

var CssParam = require('./CssParam');

var ALLOWED_PARAMS = ["opacity", "width", "height", "minWidth", "minHeight", "maxWidth", "maxHeight", 
 "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "top", "right", "bottom", "left",
 "marginTop", "marginRight", "marginBottom", "marginLeft", "borderTopWidth", "borderRightWidth", 
 "borderBottomWidth", "borderLeftWidth", "borderRadius", "outlineWidth", "fontSize", "lineHeight", 
 "letterSpacing", "wordSpacing", "color", "colorRed", "colorGreen", "colorBlue", "colorAlpha", 
 "backgroundColor", "backgroundColorRed", "backgroundColorGreen", "backgroundColorBlue", 
 "backgroundColorAlpha", "borderColor", "borderColorRed", "borderColorGreen", "borderColorBlue", 
 "borderColorAlpha", "outlineColor", "outlineColorRed", "outlineColorGreen", "outlineColorBlue", 
 "outlineColorAlpha", "backgroundPositionX", "backgroundPositionY", "textShadowX", "textShadowY", 
 "textShadowBlur", "boxShadowX", "boxShadowY", "boxShadowBlur", "boxShadowSpread", "translateX", 
 "translateY", "translateZ", "scale", "scaleX", "scaleY", "scaleZ", "rotateX", "rotateY", "rotateZ", 
 "skewX", "skewY", "transformPerspective", "perspective", "perspectiveOriginX", "perspectiveOriginY", 
 "transformOriginX", "transformOriginY", "transformOriginZ", "clipTop", "clipRight", "clipBottom", 
 "clipLeft", "blur"];

var LENGTH_UNITS = 'px,em,ex,ch,rem,vh,vw,vmin,vmax,mm,cm,in,pt,pc'.split(',');
    
module.exports = {

    create: function (opt) {

        var inputOpt = {
                name: opt.name,
                optionLine: {
                    inputs: [{}]
                }
            },
            input = inputOpt.optionLine.inputs[0];


        switch (opt.name) {

            case 'translateX':
            case 'translateY': 
                input.units = ['px']; 
                break;

            case 'rotateZ': 
                input.units = ['deg', 'rad']; 
                input.precision = 1;
                input.conterters = {
                    deg2rad: function (deg) {
                        return deg / 180 * Math.PI;
                    },
                    rad2deg: function (rad) {
                        return rad / Math.PI * 180;
                    },
                }
                break;

            case 'transformOriginX':
            case 'transformOriginY': 
                input.units = ['px']; 
                break;

            case 'borderColor':
            case 'backgroundColor': 
                input.type = 'color'; 
                break;
            
            case 'borderWidth':
            case 'top':
            case 'right':
            case 'bottom':
            case 'left':
            case 'width':
            case 'height':
                input.units = LENGTH_UNITS; 
                break;

            case 'opacity':
                input.min = 0;
                input.max = 1;
                break;
        }

        return new CssParam(inputOpt);
    }
};



var groups = {

    padding: ['paddingTop',  'paddingRight',  'paddingBottom',  'paddingLeft'],
    margin: ['marginTop',  'marginRight',  'marginBottom',  'marginLeft'],
    border: {
        width: ['bordergTopWidth',  'borderightWidth',  'borderBottomWidth',  'borderLeftWidth'],
        radius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'],
        color: ['borderColorRed','borderColorGreen','borderColorBlue','borderColorAlpha'],
    },
    backgroundPosition: ['backgroundPositionX', 'backgroundPositionY'],
    textShadow: ['textShadowX', 'textShadowY', 'textShadowBlur'],
    translate: ['translateX', 'translateY', 'translateZ'],
    scale: ['scaleX', 'scaleY', 'scaleZ'],
    rotate: ['rotateX', 'rotateY', 'rotateZ'],
    skeew: ['skeewX', 'skeewY'],
    perspectiveOrigin: ['perspectiveOriginX', 'perspectiveOriginY'],
    transformOrigin: ['transformOriginX', 'transformOriginY', 'transformOriginZ'],
    boxShadow: ['boxShadowX', 'boxShadowY', 'boxShadowBlur'],
    clip: ['clipTop',  'clipRight',  'clipBottom',  'clipLeft'],
};