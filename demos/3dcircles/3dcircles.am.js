;(function (root) {
    'use strict';

    /**@amsave*/
    var SAVEJSON = '{"timebar":{"currTime":2983,"timescale":0.103,"length":4048.1927710843374},"sequences":[{"type":"css_sequ_type","data":{"name":"unnamed","fill":"forward","iterations":1,"selectors":[".ctrl"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":1,"tz":0,"rx":0.4,"ry":0.4,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":998,"ease":"cubic-bezier(0.514,0,0.549,0.99)"},{"value":{"tx":0,"ty":1,"tz":0,"rx":2.4,"ry":2.4,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":2000,"ease":"linear"},{"value":{"tx":19,"ty":48,"tz":0,"rx":2.4,"ry":2.4,"rz":2,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":2983,"ease":"cubic-bezier(0.469,0.016,0.604,0.98)"},{"value":{"tx":0,"ty":1,"tz":0,"rx":0.4,"ry":0.4,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":4008,"ease":"linear"}],"showing3d":true},{"keys":[]}],"isShowingParams":true}},{"type":"css_sequ_type","data":{"name":"unnamed","fill":"forward","iterations":1,"selectors":[],"parameters":[{"keys":[]}],"isShowingParams":false}}]}';

    var sequPlayerGens = [function () {

    var player,
        animation,
        isInited = false,
        animations = [],
        paramKeys = [[{"offset":0.2465297619047619,"transform":"translateY(1px) rotateX(0.4rad) rotateY(0.4rad) ","easing":"cubic-bezier(0.514,0,0.549,0.99)"},{"offset":0.494047619047619,"transform":"translateY(1px) rotateX(2.4rad) rotateY(2.4rad) "},{"offset":0.7368720238095238,"transform":"translate(19px,48px) rotate3d(2.4rad,2.4rad,2rad) ","easing":"cubic-bezier(0.469,0.016,0.604,0.98)"},{"offset":0.9900714285714286,"transform":"translateY(1px) rotateX(0.4rad) rotateY(0.4rad) "}],[]],
        options = {"direction":"normal","duration":4048.1927710843374,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.ctrl');

    for (var i = 0; i < elems.length; ++i) {
        for (var j = 0; j < paramKeys.length; ++j) {

            animations.push(new Animation(elems[i], paramKeys[j], options));
        }
    }

    animation = new AnimationGroup(animations);

    return {

        play: function () {

            if (!isInited) {

                player = document.timeline.play(animation);
                isInited = true;
            }
            else {
                player.play();
            }
        },
        pause: function () {

            if (!player) {
                return;
            }

            player.pause();
        },
        seek: function (time) {

            if (!player) {
                return;
            }

            player.currentTime = time;
        }
    };
},
function () {

    var player,
        animation,
        isInited = false,
        animations = [],
        paramKeys = [[]],
        options = {"direction":"normal","duration":4048.1927710843374,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('');

    for (var i = 0; i < elems.length; ++i) {
        for (var j = 0; j < paramKeys.length; ++j) {

            animations.push(new Animation(elems[i], paramKeys[j], options));
        }
    }

    animation = new AnimationGroup(animations);

    return {

        play: function () {

            if (!isInited) {

                player = document.timeline.play(animation);
                isInited = true;
            }
            else {
                player.play();
            }
        },
        pause: function () {

            if (!player) {
                return;
            }

            player.pause();
        },
        seek: function (time) {

            if (!player) {
                return;
            }

            player.currentTime = time;
        }
    };
}];

    root.am = root.am || {};
    root.am.pageScripts = root.am.pageScripts || {};

    var reg = root.am.pageScripts.amsave = {
        
        createPlayer: function (opt) {

            var sequencePlayers = [];

            sequPlayerGens.forEach(function (create) {

                sequencePlayers.push(create(opt))   ;
            });

            return {
                play: callPlayers.bind(null, 'play'),
                pause: callPlayers.bind(null, 'pause'),
                seek: callPlayers.bind(null, 'seek'),
            };

            function callPlayers(fnName, arg1) {

                sequencePlayers.forEach(function (sequencePlayer) {

                    sequencePlayer[fnName].call(null, arg1);
                });
            }
        },
        
        saveJson: SAVEJSON,
    };


    if (typeof define === 'function' && define.amd) {
        
        define(function () {
            return reg;
        });
    }

    if (typeof exports === 'object') {
        
        module.exports = reg;
    }


    if (document.readyState == 'interactive' || document.readyState == 'complete') {

        reg.createPlayer().play();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {

            reg.createPlayer().play();
        });
    }
}(this));