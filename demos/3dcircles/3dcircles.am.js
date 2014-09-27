;(function (root) {
    'use strict';

    /**@amsave*/
    var SAVEJSON = '{"timebar":{"currTime":2167,"timescale":0.11500000000000005,"length":3996.0188580408594},"sequences":[{"type":"css_sequ_type","data":{"name":"control","fill":"forward","iterations":1,"selectors":[".ctrl"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":1,"tz":0,"rx":0.4,"ry":0.4,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":-9,"ease":"cubic-bezier(0.514,0,0.549,0.99)"},{"value":{"tx":0,"ty":1,"tz":0,"rx":2.4,"ry":2.4,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":1444,"ease":"cubic-bezier(0.495,0.009,0.549,1.003)"},{"value":{"tx":16,"ty":46,"tz":0,"rx":-1.4,"ry":1.4,"rz":2,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":2794,"ease":"cubic-bezier(0.469,0.016,0.604,0.98)"},{"value":{"tx":0,"ty":1,"tz":0,"rx":0.4,"ry":0.4,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":4008,"ease":"linear"}],"showing3d":true},{"keys":[]}],"isShowingParams":true}},{"type":"css_sequ_type","data":{"name":"container","fill":"forward","iterations":1,"selectors":[".container"],"parameters":[{"name":"perspective","keys":[{"value":"1px","time":3999,"ease":"linear"},{"value":"1px","time":19,"ease":"cubic-bezier(0.681,0.006,0.203,0.993)"},{"value":"800px","time":2069,"ease":"cubic-bezier(0.69,0.012,0.133,0.993)"}]},{"keys":[]}],"isShowingParams":true}}]}';

    var sequPlayerGens = [function () {

    var player,
        animation,
        isInited = false,
        animations = [],
        paramKeys = [[{"offset":-0.0022522416234072675,"transform":"translateY(1px) rotateX(0.4rad) rotateY(0.4rad) ","easing":"cubic-bezier(0.514,0,0.549,0.99)"},{"offset":0.3613596560222327,"transform":"translateY(1px) rotateX(2.4rad) rotateY(2.4rad) ","easing":"cubic-bezier(0.495,0.009,0.549,1.003)"},{"offset":0.6991958995333228,"transform":"translate(16px,46px) rotateX(-1.4rad) rotateY(1.4rad) rotate(2rad) ","easing":"cubic-bezier(0.469,0.016,0.604,0.98)"},{"offset":1.0029982696240365,"transform":"translateY(1px) rotateX(0.4rad) rotateY(0.4rad) "}],[]],
        options = {"direction":"normal","duration":3996.0188580408594,"iterations":1,"fill":"forward"},
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
        paramKeys = [[{"offset":0.004754732316082009,"perspective":"1px","easing":"cubic-bezier(0.681,0.006,0.203,0.993)"},{"offset":0.517765324314404,"perspective":"800px","easing":"cubic-bezier(0.69,0.012,0.133,0.993)"},{"offset":1.000746028000629,"perspective":"1px"}],[]],
        options = {"direction":"normal","duration":3996.0188580408594,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.container');

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