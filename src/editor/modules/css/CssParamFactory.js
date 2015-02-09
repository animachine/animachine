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
        borderWidth: ['borderTopWidth',  'borderRightWidth',  'borderBottomWidth',  'borderLeftWidth'],
        borderRadius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'],
        borderColor: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
        borderStyle: ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'],
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


p._assembleParam = function (opt={}) {

    if (!_.has(opt, 'hidden') && _.include(defaultHidden, opt.name)) opt.hidden = true;
    if (!_.has(opt,'optionLine')) opt.optionLine = {};
    if (!_.has(opt.optionLine,'inputs')) opt.optionLine.inputs = [];
    if (_.isEmpty(opt.optionLine.inputs)) opt.optionLine.inputs.push({name: 'input'});

    var input = opt.optionLine.inputs[0];

    this.ifit(opt.name)
        .is('x,y,z,transformOriginZ', () => {

            opt.defaultValue = '0px';
            input.units = ['px'];
        })
        .is('scaleX,scaleY,scaleZ', () => {

            input.type = 'unit';
            opt.defaultValue = 1;
            input.dragSpeed = 0.01;
            input.precision = 2;
        })
        .is('rotationX,rotationY,rotationZ', () => {

            opt.defaultValue = '0deg';
            input.units = ['deg', 'rad'];
            input.precision = 1;
            input.converters = {
                deg2rad: function (deg) {
                    return deg / 180 * Math.PI;
                },
                rad2deg: function (rad) {
                    return rad / Math.PI * 180;
                },
            };
        })
        .is('transformOriginX,transformOriginY', () => {

            opt.defaultValue = '50%';
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

            opt.defaultValue = 1;
            input.type = 'unit';
            input.dragSpeed = 0.01;
            input.precision = 2;
            input.min = 0;
            input.max = 1;
        })
        .is('borderTopWidth,borderTopLeftRadius,borderTopColor,borderTopStyle', () => opt.title = 'top')
        .is('borderRightWidth,borderTopRightRadius,borderRightColor,borderRightStyle', () => opt.title = 'right')
        .is('borderBottomWidth,borderBottomLeftRadius,borderBottomColor,borderBottomStyle', () => opt.title = 'bottom')
        .is('borderLeftWidth,borderBottomRightRadius,borderLeftColor,borderLeftStyle', () => opt.title = 'left')
        .is('bezier', () => {

            opt.optionLine.inputs = [];
        });

    if (input.units) {
        input.type = 'unit';
    }

    var param;

    if (opt.name === 'bezier') {

        param = new BezierCssParam(opt, this.timeline);
    }
    else {
        param = new CssParam(opt, this.timeline);
    }

    return param;
};

p._assembleGroup = function (opt={}) {

    _.defaults(opt, {
        collapsed: false,
        merged: true,
        hidden: false,
        borrowChildInputsOnCollapse: true,
        optionLine: {
            inputs: [],
        },
    });

    var paramGroup = new CssParamGroup(opt, this.timeline);

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
