;(function (root) {
    'use strict';

    /**@amsave*/
    var SAVEJSON = '{"name":"new project","timelines":[{"name":"jumping","timebar":{"currTime":0,"timescale":0.4319999999999999,"length":1318},"tracks":[{"type":"css_track_type","data":{"selectors":[{"type":"css","value":"#cookie"}],"paramTree":{"name":"#cookie","title":"#cookie","hidden":false,"static":false,"merged":false,"collapsed":false,"children":[{"name":"scale","title":"scale","hidden":false,"static":true,"merged":true,"collapsed":true,"children":[{"name":"scaleX","title":"x","hidden":false,"static":true,"keys":[{"value":1,"time":0,"ease":{"type":"bezier","points":[0,0,1,1]}},{"value":1.1309839577396092,"time":383,"ease":{"type":"bezier","points":[0.3870331479169032,1.08984375,1,1]}},{"value":0.8662608323982148,"time":610,"ease":{"type":"bezier","points":[0.05034977157774514,0.27734375,0.12173172621961166,0.96484375]}},{"value":"1","time":1320,"ease":{"type":"bezier","points":[0.7280751981102714,0.15234375,1,1]}},{"value":"1","time":1258,"ease":{"type":"bezier","points":[0.3563831688831691,0.02734375,0.6066334191334196,0.96484375]}}]},{"name":"scaleY","title":"y","hidden":false,"static":true,"keys":[{"value":1,"time":0,"ease":{"type":"bezier","points":[0,0,1,1]}},{"value":0.7046370533942421,"time":383,"ease":{"type":"bezier","points":[0.3870331479169032,1.08984375,1,1]}},{"value":1.0417085100795993,"time":610,"ease":{"type":"bezier","points":[0.05034977157774514,0.27734375,0.12173172621961166,0.96484375]}},{"value":"1","time":1320,"ease":{"type":"bezier","points":[0.7280751981102714,0.15234375,1,1]}},{"value":"1","time":1258,"ease":{"type":"bezier","points":[0.3563831688831691,0.02734375,0.6066334191334196,0.96484375]}}]},{"name":"scaleZ","title":"z","hidden":true,"static":true,"keys":[]}]},{"name":"translate","title":"translate","hidden":false,"static":true,"merged":true,"collapsed":true,"children":[{"name":"x","title":"x","hidden":false,"static":true,"keys":[{"value":"0px","time":0,"ease":{"type":"bezier","points":[0,0,1,1]}},{"value":"0px","time":544,"ease":{"type":"bezier","points":[0,0,1,1]}},{"value":"0px","time":978,"ease":{"type":"bezier","points":[0.018084490740740745,0.40234375,0.26876720110087055,1.02734375]}},{"value":"0px","time":1320,"ease":{"type":"bezier","points":[0.4163663160602122,0.08984375,0.86985342890405,0.40234375]}}]},{"name":"y","title":"y","hidden":false,"static":true,"keys":[{"value":"0px","time":0,"ease":{"type":"bezier","points":[0,0,1,1]}},{"value":"0px","time":544,"ease":{"type":"bezier","points":[0,0,1,1]}},{"value":"-65px","time":978,"ease":{"type":"bezier","points":[0.018084490740740745,0.40234375,0.26876720110087055,1.02734375]}},{"value":"0px","time":1320,"ease":{"type":"bezier","points":[0.4163663160602122,0.08984375,0.86985342890405,0.40234375]}}]},{"name":"z","title":"z","hidden":true,"static":true,"keys":[]}]},{"name":"transformOrigin","title":"transformOrigin","hidden":false,"static":true,"merged":true,"collapsed":true,"children":[{"name":"transformOriginX","title":"x","hidden":false,"static":true,"keys":[{"value":"50%","time":0,"ease":{"type":"bezier","points":[0,0,1,1]}}]},{"name":"transformOriginY","title":"y","hidden":false,"static":true,"keys":[{"value":"100%","time":0,"ease":{"type":"bezier","points":[0,0,1,1]}}]}]}]}}}],"easeMap":{},"triggerMap":[],"currTrackIdx":0},{"name":"tour","timebar":{"currTime":0,"timescale":0.12,"length":6000},"tracks":[],"easeMap":{},"triggerMap":[]}],"currTimelineIdx":1}';

    var projectReg = {
        timelines: {timeline:(function () {
    var trackPlayerGens = [function (inputs) {

    var timelines = [[{"options":{"ease":new Ease(BezierEasing(0,0,1,1)),"scaleX":1},"duration":0},{"options":{"ease":new Ease(BezierEasing(0.3870331479169032,1.08984375,1,1)),"scaleX":1.1309839577396092},"duration":0.383},{"options":{"ease":new Ease(BezierEasing(0.05034977157774514,0.27734375,0.12173172621961166,0.96484375)),"scaleX":0.8662608323982148},"duration":0.227},{"options":{"ease":new Ease(BezierEasing(0.3563831688831691,0.02734375,0.6066334191334196,0.96484375)),"scaleX":"1"},"duration":0.648},{"options":{"ease":new Ease(BezierEasing(0.7280751981102714,0.15234375,1,1)),"scaleX":"1"},"duration":0.062}],[{"options":{"ease":new Ease(BezierEasing(0,0,1,1)),"scaleY":1},"duration":0},{"options":{"ease":new Ease(BezierEasing(0.3870331479169032,1.08984375,1,1)),"scaleY":0.7046370533942421},"duration":0.383},{"options":{"ease":new Ease(BezierEasing(0.05034977157774514,0.27734375,0.12173172621961166,0.96484375)),"scaleY":1.0417085100795993},"duration":0.227},{"options":{"ease":new Ease(BezierEasing(0.3563831688831691,0.02734375,0.6066334191334196,0.96484375)),"scaleY":"1"},"duration":0.648},{"options":{"ease":new Ease(BezierEasing(0.7280751981102714,0.15234375,1,1)),"scaleY":"1"},"duration":0.062}],[{"options":{"ease":new Ease(BezierEasing(0,0,1,1)),"x":"0px"},"duration":0},{"options":{"ease":new Ease(BezierEasing(0,0,1,1)),"x":"0px"},"duration":0.544},{"options":{"ease":new Ease(BezierEasing(0.018084490740740745,0.40234375,0.26876720110087055,1.02734375)),"x":"0px"},"duration":0.434},{"options":{"ease":new Ease(BezierEasing(0.4163663160602122,0.08984375,0.86985342890405,0.40234375)),"x":"0px"},"duration":0.342}],[{"options":{"ease":new Ease(BezierEasing(0,0,1,1)),"y":"0px"},"duration":0},{"options":{"ease":new Ease(BezierEasing(0,0,1,1)),"y":"0px"},"duration":0.544},{"options":{"ease":new Ease(BezierEasing(0.018084490740740745,0.40234375,0.26876720110087055,1.02734375)),"y":"-65px"},"duration":0.434},{"options":{"ease":new Ease(BezierEasing(0.4163663160602122,0.08984375,0.86985342890405,0.40234375)),"y":"0px"},"duration":0.342}],[{"duration":0,"options":{"ease":new Ease(BezierEasing(0,0,1,1)),"transformOrigin":"50% 100% "}}]],
        selectors = [{"type":"css","value":"#cookie"}],
        animTargets = getAnimTargets(selectors, inputs),
        rootTl = new TimelineMax();

    timelines.forEach(function (timeline) {

        var tl = new TimelineMax();
        rootTl.add(tl, 0);

        timeline.forEach(function (key, idx) {

            tl.to(animTargets, key.duration, key.options);
        });
    });

    return rootTl;
}
];

    var reg = {

        create: function (inputs) {

            var tl = new TimelineMax({paused: true});

            trackPlayerGens.forEach(function (create) {

                tl.add(create(inputs), 0);
            });

            return tl;
        },
    };

//

    return reg;
}())

timeline-1:(function () {
    var trackPlayerGens = [];

    var reg = {

        create: function (inputs) {

            var tl = new TimelineMax({paused: true});

            trackPlayerGens.forEach(function (create) {

                tl.add(create(inputs), 0);
            });

            return tl;
        },
    };

//

    return reg;
}())
},
        saveJson: SAVEJSON,
    };

    root.am = root.am || {};
    root.am.projects = root.am.projects || {};
    root.am.projects.new project = projectReg;



    //-- CJS --//
    if (typeof exports === 'object') {

        module.exports = projectReg;
    }

    //-- AMD --//
    if (typeof define === 'function' && define.amd) {

        define(function () {
            return projectReg;
        });
    }

    //utils
    function getAnimTargets(selectors, inputs) {

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

}(this));









/**
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 \u2013 MIT License
 *
 * Credits: is based on Firefox's nsSMILKeySpline.cpp
 * Usage:
 * var spline = BezierEasing(0.25, 0.1, 0.25, 1.0)
 * spline(x) => returns the easing value | x must be in [0, 1] range
 *
 */
!function(a){window.BezierEasing=a()}(function(){function i(a,i,j,k){function n(a,b){return 1-3*b+3*a}function o(a,b){return 3*b-6*a}function p(a){return 3*a}function q(a,b,c){return((n(b,c)*a+o(b,c))*a+p(b))*a}function r(a,b,c){return 3*n(b,c)*a*a+2*o(b,c)*a+p(b)}function s(c,d){for(var e=0;b>e;++e){var f=r(d,a,j);if(0===f)return d;var g=q(d,a,j)-c;d-=g/f}return d}function t(){for(var b=0;f>b;++b)m[b]=q(b*g,a,j)}function u(b,c,f){var g,h,i=0;do h=c+(f-c)/2,g=q(h,a,j)-b,g>0?f=h:c=h;while(Math.abs(g)>d&&++i<e);return h}function v(b){for(var d=0,e=1,h=f-1;e!=h&&m[e]<=b;++e)d+=g;--e;var i=(b-m[e])/(m[e+1]-m[e]),k=d+i*g,l=r(k,a,j);return l>=c?s(b,k):0===l?k:u(b,d,d+g)}function x(){w=!0,(a!=i||j!=k)&&t()}if(4!==arguments.length)throw new Error("BezierEasing requires 4 arguments.");for(var l=0;4>l;++l)if("number"!=typeof arguments[l]||isNaN(arguments[l])||!isFinite(arguments[l]))throw new Error("BezierEasing arguments should be integers.");if(0>a||a>1||0>j||j>1)throw new Error("BezierEasing x values must be in [0, 1] range.");var m=h?new Float32Array(f):new Array(f),w=!1,y=function(b){return w||x(),a===i&&j===k?b:0===b?0:1===b?1:q(v(b),i,k)};y.getControlPoints=function(){return[{x:a,y:i},{x:j,y:k}]};var z=[a,i,j,k],A="BezierEasing("+z+")";y.toString=function(){return A};var B="cubic-bezier("+z+")";return y.toCSS=function(){return B},y}var a=this,b=4,c=.001,d=1e-7,e=10,f=11,g=1/(f-1),h="Float32Array"in a;return i.css={ease:i(.25,.1,.25,1),linear:i(0,0,1,1),"ease-in":i(.42,0,1,1),"ease-out":i(0,0,.58,1),"ease-in-out":i(.42,0,.58,1)},i});
