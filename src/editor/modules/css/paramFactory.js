'use strict';

var CssParam = require('./CssParam');
var BezierCssParam = require('./BezierCssParam');
var CssParamGroup = require('./CssParamGroup');
var amgui = require('../../amgui');

var defaultHidden = 'z,rotationX,rotationY,scaleZ,perspectiveOriginX,transformOriginZ'.split(',');
    
module.exports = {

    create: function (opt) {

        var paramOpt = {
                name: opt.name,
                keys: opt.keys,
                hidden: opt.hidden,
                optionLine: {
                    inputs: [{name: 'input'}]
                }
            },
            input = paramOpt.optionLine.inputs[0];


        switch (opt.name) {

            case 'x':
            case 'y': 
            case 'z':
            case 'transformOriginZ': 
                paramOpt.defaultValue = '0px';
                input.units = ['px']; 
                break;

            case 'scaleX':
            case 'scaleY': 
            case 'scaleZ': 
                // input.units = ['']; 
                input.type = 'unit';
                paramOpt.defaultValue = 1; 
                input.dragSpeed = 0.01; 
                input.precision = 2;
                break;

            case 'rotateX': 
            case 'rotateY': 
            case 'rotateZ': 
                paramOpt.defaultValue = '0deg';
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
                paramOpt.defaultValue = '50%';
                input.units = ['%']; 
                input.dragSpeed = 0.01; 
                input.precision = 2;
                break;

            case 'color':
            case 'borderColorTop':
            case 'borderColorRight':
            case 'borderColorBottom':
            case 'borderColorLeft':
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
                input.units = ['px']; 
                break;

            case 'opacity':
                paramOpt.defaultValue = 1;
                input.type = 'unit';
                input.dragSpeed = 0.01; 
                input.precision = 2;
                input.min = 0;
                input.max = 1;
                break;

            case 'bezier':
                paramOpt.optionLine.inputs = [];
                break;
        }

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

            param = new BezierCssParam(paramOpt);
        }
        else {
            param = new CssParam(paramOpt);
        }

        return param;
    },

    createGroup: function (opt) {

        opt = opt || {};

        var pgOpt = {
            name: opt.name,
            collapsed: opt.collapsed || false,
            merged: opt.merged || false,
            hidden: opt.hidden || false,
            optionLine: {
                inputs: [],
            },
        };

        if (opt.name === 'translate') {
            
            pgOpt.optionLine.inputs.push({name: 'x', type: 'unit', units: ['px']});
            pgOpt.optionLine.inputs.push({name: 'y', type: 'unit', units: ['px']});
        }

        var paramGroup = new CssParamGroup(pgOpt);

        if (opt.name === 'translate') {

            paramGroup.optionLine.addButton({
                domElem: amgui.createIconBtn({
                    icon: 'vector',
                    tooltip: 'use bezier path',
                    onClick: function () {
                        paramGroup.emit('translateToBezier')
                    },
                }),
                name: 'bezier',
            });
        }

        return paramGroup;
    },

    getRootParamGroupName: function (paramName) {

        return Object.keys(groups).find(function (rootKey) {

            return search(groups[rootKey]);
        });

        function search(group) {

            if (_.isArray(group)) {

                if (group.indexOf(paramName) !== -1) {

                    return true;
                }
            }
            else {
                
                for (var key in group) {

                    if (search(group[key])) {

                        return true;
                    }
                }
            }
        }
    },

    getGroupMemberNames: function (path) {
        
        var group = groups;

        path = path.slice();

        while (path.length) {

            group = group[path.shift()];
        };

        if (_.isPlainObject(group)) group = Object.keys(group);

        return group || [];
    },
};



var groups = {

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