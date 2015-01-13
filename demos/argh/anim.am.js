;(function (root) {
    'use strict';


    var trackPlayerGens = [function (inputs) {
    
    var timelines = [[{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"x":"0px"},"duration":0},{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"x":"0.3283728619483943px"},"duration":0.125},{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"x":"0.8398900026364089px"},"duration":0.358},{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"x":"0px"},"duration":0.517}],[{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"y":"0px"},"duration":0},{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"y":"0px"},"duration":0.125},{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"y":"-25.784082820022356px"},"duration":0.358},{"options":{"ease":{"_type":0,"_power":0,"_params":[0.9993552546744037,0,1,1]},"y":"0px"},"duration":0.517}]],
        selectors = [{"type":"input","value":"head"}],
        animTargets = getAnimTargets(),
        rootTl = new TimelineMax();

    timelines.forEach(function (timeline) {

        var prevTime = 0;

        var tl = new TimelineMax();
        rootTl.add(tl);
        
        timeline.forEach(function (key, idx) {

            tl.to(animTargets, key.duration, key.options);
        });
    });

    return rootTl;
    


    function getAnimTargets() {

        var list = [];

        selectors.forEach(function (selector) {

            if (selector.type === 'css') {

                list.push(selector.value);
            }
            else if (inputs && selector.type === 'input') {

                var parent = inputs;

                selector.value.split('.').every(function (name) {

                    return parent = parent[name];
                });

                if (parent) {
                    list.push(parent);
                }
            }
        });

        return list;
    };
}
];

    root.am = root.am || {};
    root.am.anims = root.am.anims || {};

    var reg = root.am.anims.amsave = {
        
        create: function (inputs) {

            var tl = new TimelineMax({paused: true});

            trackPlayerGens.forEach(function (create) {

                tl.add(create(inputs), 0);
            });

            return tl;
        },
        
    };



    //-- CJS --//
    if (typeof exports === 'object') {
        
        module.exports = reg;
    }

    //-- AMD --//
    if (typeof define === 'function' && define.amd) {
        
        define(function () {
            return reg;
        });
    }

    
}(this));









/**
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 – MIT License
 *
 * Credits: is based on Firefox's nsSMILKeySpline.cpp
 * Usage:
 * var spline = BezierEasing(0.25, 0.1, 0.25, 1.0)
 * spline(x) => returns the easing value | x must be in [0, 1] range
 *
 */
!function(a){window.BezierEasing=a()}(function(){function i(a,i,j,k){function n(a,b){return 1-3*b+3*a}function o(a,b){return 3*b-6*a}function p(a){return 3*a}function q(a,b,c){return((n(b,c)*a+o(b,c))*a+p(b))*a}function r(a,b,c){return 3*n(b,c)*a*a+2*o(b,c)*a+p(b)}function s(c,d){for(var e=0;b>e;++e){var f=r(d,a,j);if(0===f)return d;var g=q(d,a,j)-c;d-=g/f}return d}function t(){for(var b=0;f>b;++b)m[b]=q(b*g,a,j)}function u(b,c,f){var g,h,i=0;do h=c+(f-c)/2,g=q(h,a,j)-b,g>0?f=h:c=h;while(Math.abs(g)>d&&++i<e);return h}function v(b){for(var d=0,e=1,h=f-1;e!=h&&m[e]<=b;++e)d+=g;--e;var i=(b-m[e])/(m[e+1]-m[e]),k=d+i*g,l=r(k,a,j);return l>=c?s(b,k):0===l?k:u(b,d,d+g)}function x(){w=!0,(a!=i||j!=k)&&t()}if(4!==arguments.length)throw new Error("BezierEasing requires 4 arguments.");for(var l=0;4>l;++l)if("number"!=typeof arguments[l]||isNaN(arguments[l])||!isFinite(arguments[l]))throw new Error("BezierEasing arguments should be integers.");if(0>a||a>1||0>j||j>1)throw new Error("BezierEasing x values must be in [0, 1] range.");var m=h?new Float32Array(f):new Array(f),w=!1,y=function(b){return w||x(),a===i&&j===k?b:0===b?0:1===b?1:q(v(b),i,k)};y.getControlPoints=function(){return[{x:a,y:i},{x:j,y:k}]};var z=[a,i,j,k],A="BezierEasing("+z+")";y.toString=function(){return A};var B="cubic-bezier("+z+")";return y.toCSS=function(){return B},y}var a=this,b=4,c=.001,d=1e-7,e=10,f=11,g=1/(f-1),h="Float32Array"in a;return i.css={ease:i(.25,.1,.25,1),linear:i(0,0,1,1),"ease-in":i(.42,0,1,1),"ease-out":i(0,0,.58,1),"ease-in-out":i(.42,0,.58,1)},i});
