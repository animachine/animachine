'use strict';


var inherits = require('inherits');
var ParamFactory = require('../../track/ParamFactory');
var CssParam = require('./CssParam');
var BezierCssParam = require('./BezierCssParam');
var CssParamGroup = require('./CssParamGroup');
var amgui = require('../../amgui');

var defaultHidden = 'z,rotationX,rotationY,scaleZ,perspectiveOriginX,transformOriginZ'.split(',');

function CssParamFactory() {

    ParamFactory.apply(this, arguments);

    this.groups = {
        padding: ['paddingTop',  'paddingRight',  'paddingBottom',  'paddingLeft'],
        margin: ['marginTop',  'marginRight',  'marginBottom',  'marginLeft'],
        border: {
            width: ['borderTopWidth',  'borderRightWidth',  'borderBottomWidth',  'borderLeftWidth'],
            radius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'],
            color: ['borderTopColor','borderRightColor','borderBottomColor','borderLeftColor'],
            style: ['borderTopStyle','borderRightStyle','borderBottomStyle','borderLeftStyle'],
        },
        backgroundPosition: ['backgroundPositionX', 'backgroundPositionY'],
        textShadow: ['textShadowX', 'textShadowY', 'textShadowBlur'],
        translate: ['x', 'y', 'z'],
        scale: ['scaleX', 'scaleY', 'scaleZ'],
        rotation: ['rotationX', 'rotationY', 'rotationZ'],
        skeew: ['skeewX', 'skeewY'],
        perspectiveOrigin: ['perspectiveOriginX', 'perspectiveOriginY', 'perspectiveOriginZ'],
        transformOrigin: ['transformOriginX', 'transformOriginY'],
        boxShadow: ['boxShadowX', 'boxShadowY', 'boxShadowBlur'],
        clip: ['clipTop',  'clipRight',  'clipBottom',  'clipLeft'],
    };
}

module.exports = CssParamFactory;
inherits(CssParamFactory, ParamFactory);
var p = CssParamFactory.prototype;


p.create = function (opt={}) {

    var paramOpt = {
            name: opt.name,
            keys: opt.keys,
            hidden: opt.hidden,
            optionLine: {
                inputs: [{name: 'input'}]
            }
        },
        input = paramOpt.optionLine.inputs[0];


    this.ifit(opt.name)
        .is('x,y,z,transformOriginZ', () => {

            paramOpt.defaultValue = '0px';
            input.units = ['px']; 
        })
        .is('scaleX,scaleY,scaleZ', () => {

            input.type = 'unit';
            paramOpt.defaultValue = 1; 
            input.dragSpeed = 0.01; 
            input.precision = 2;
        })
        .is('rotationX,rotationY,rotationZ', () => {

            paramOpt.defaultValue = '0deg';
            input.units = ['deg', 'rad']; 
            input.precision = 1;
            input.converters = {
                deg2rad: function (deg) {
                    return deg / 180 * Math.PI;
                },
                rad2deg: function (rad) {
                    return rad / Math.PI * 180;
                },
            }
        })
        .is('transformOriginX,transformOriginY', () => {
            
            paramOpt.defaultValue = '50%';
            input.units = ['%']; 
            input.dragSpeed = 0.01; 
            input.precision = 2;
        })
        .is('xPercent,yPercent', () => {

            input.units = []; 
            input.dragSpeed = 1; 
            input.precision = 1;
        })
        .is('color,borderColorTop,borderColorRight,borderColorBottom,borderColorLeft,backgroundColor', () => {

            input.type = 'color'; 
        })
        .is('borderWidth,top,right,bottom,left,width,height', () => {

            input.units = ['px'];
        })
        .is('opacity', () => {

            paramOpt.defaultValue = 1;
            input.type = 'unit';
            input.dragSpeed = 0.01; 
            input.precision = 2;
            input.min = 0;
            input.max = 1;
        })
        .is('bezier', () => {

            paramOpt.optionLine.inputs = [];
        });

    if (defaultHidden.indexOf(opt.name) !== -1) {

        if (!('hidden' in opt)) {
            paramOpt.hidden = true;
        }
    }

    if (input.units) {
        input.type = 'unit';
    }

    var param;

    if (opt.name === 'bezier') {

        param = new BezierCssParam(paramOpt, this.timeline);
    }
    else {
        param = new CssParam(paramOpt, this.timeline);
    }

    return param;
};

p.createGroup = function (opt={}) {

    var pgOpt = {
        name: opt.name,
        collapsed: 'collapsed' in opt ? opt.collapsed : false,
        merged: 'merged' in opt ? opt.merged : true,
        hidden: 'hidden' in opt ? opt.hidden : false,
        borrowChildInputsOnCollapse: true,
        optionLine: {
            inputs: [],
        },
    };
    
    var paramGroup = new CssParamGroup(pgOpt, this.timeline);

    if (opt.name === 'translate') {

        paramGroup.optionLine.addButton({
            domElem: amgui.createIconBtn({
                icon: 'vector',
                tooltip: 'convert to bezier path',
                onClick: () => paramGroup.emit('translateToBezier'),
            }),
            name: 'bezier',
            childIdx: 0,
        });
    }

    return paramGroup;
};