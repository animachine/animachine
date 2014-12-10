'use strict';

var CssParam = require('./CssParam');
var CssParamGroup = require('./CssParamGroup');

var defaultHidden = 'z,rotationX,rotationY,scaleZ,perspectiveOriginX,bezier'.split(',');
    
module.exports = {

    create: function (opt) {

        var paramOpt = {
                name: opt.name,
                keys: opt.keys,
                optionLine: {
                    inputs: [{name: 'input'}]
                }
            },
            input = paramOpt.optionLine.inputs[0];


        switch (opt.name) {

            case 'x':
            case 'y': 
            case 'z':
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
                input.units = ['%']; 
                input.dragSpeed = 0.01; 
                input.precision = 2;
                break;

            case 'transformOriginZ': 
                input.units = ['px'];
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
                input.type = 'unit';
                input.dragSpeed = 0.01; 
                input.precision = 2;
                input.min = 0;
                input.max = 1;
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

        var param =  new CssParam(paramOpt);

        if (opt.name === 'bezier') {

            if ('hidden' in opt) {}
            prepareBezierParam(param);
        }
        return param;
    },

    createGroup: function (opt) {

        opt = opt || {};

        var pgOpt = {
            name: opt.name,
            optionLine: {
                inputs: [],
            },
        };

        if (opt.name === 'translate') {

            pgOpt.optionLine.tgglBezier = true;
            pgOpt.optionLine.inputs.push({name: 'x', type: 'unit', units: ['px']});
            pgOpt.optionLine.inputs.push({name: 'y', type: 'unit', units: ['px']});
        }

        var paramGropup = new CssParamGroup(pgOpt);

        return paramGropup;
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
    translate: ['x', 'y', 'z', 'bezier'],
    scale: ['scaleX', 'scaleY', 'scaleZ'],
    rotation: ['rotationX', 'rotationY', 'rotationZ'],
    skeew: ['skeewX', 'skeewY'],
    perspectiveOrigin: ['perspectiveOriginX', 'perspectiveOriginY', 'perspectiveOriginZ'],
    transformOrigin: ['transformOriginX', 'transformOriginY'],
    boxShadow: ['boxShadowX', 'boxShadowY', 'boxShadowBlur'],
    clip: ['clipTop',  'clipRight',  'clipBottom',  'clipLeft'],
};

function prepareBezierParam(param) {

    // param.parentTrack.on('focusHandler', function () {


    // });

    // function focusHandler(de) {

    //     de = de || this._currHandledDe;
    //     this._currHandledDe = de;

    //     if (!param._currHandledDe) return this._blurHandler();

    //     var transformSave;
    //     if (de.style.transform) {
    //         transformSave = de.style.transform;
    //         de.style.transform = '';
    //     }

    //     var br = de.getBoundingClientRect();

    //     de.style.transform = transformSave;

    //     var handOpt = {
    //         type: 'transformer',
    //         base: {
    //             x: br.left,
    //             y: br.top,
    //             w: br.width,
    //             h: br.height,
    //         },
    //         params: {}
    //     };

    //     var p = handOpt.params;
    //     this._endParams.forEach(function (param) {

    //         switch (param.name) {
    //             case 'x': p.tx = parseFloat(param.getValue()); break;
    //             case 'y': p.ty = parseFloat(param.getValue()); break;
    //             case 'scaleX': p.sx = parseFloat(param.getValue()); break;
    //             case 'scaleY': p.sy = parseFloat(param.getValue()); break;
    //             case 'rotationZ': p.rz = parseFloat(param.getValue()) / 180 * Math.PI; break;
    //             case 'transformOriginX': p.ox = parseFloat(param.getValue()) / 100; break;
    //             case 'transformOriginY': p.oy = parseFloat(param.getValue()) / 100; break;
    //         }
    //     });
        
    //     this._handler.setup({
    //         hand: handOpt
    //     });
    //     this._handler.activate();

    //     am.deHandlerCont.appendChild(this._handler.domElem);
    // };

    // function blurHandler() {

    //     this._currHandledDe = undefined;

    //     if (this._handler && this._handler.domElem && this._handler.domElem.parentNode) {

    //         this._handler.deactivate();
    //         this._handler.domElem.parentNode.removeChild(this._handler.domElem);
    //     }
    // };
}