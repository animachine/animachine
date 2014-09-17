;(function (root) {
    'use strict';

    /**@amsave*/
    var SAVEJSON = '{"timebar":{"currTime":0,"timescale":0.12,"length":558.333333333333},"sequences":[{"type":"css_sequ_type","data":{"name":"#head","fill":"forward","iterations":1,"selectors":["#head"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":30,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":0,"ease":"linear"},{"value":{"tx":-7,"ty":-110,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":483,"ease":"linear"}]},{"keys":[]}]}},{"type":"css_sequ_type","data":{"name":"#rshoulder","fill":"forward","iterations":1,"selectors":["#rshoulder"],"parameters":[{"name":"transform","keys":[{"value":{"tx":55,"ty":76,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":0,"ease":"linear"},{"value":{"tx":50,"ty":-71,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":483,"ease":"linear"},{"value":{"tx":52.50517598343686,"ty":2.652173913043484,"tz":0,"rx":0,"ry":0,"rz":-0.4985477598326012,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":241,"ease":"linear"}]},{"name":"transform-origin","keys":[{"value":"19.15% 52.86%","time":0,"ease":"linear"}]},{"keys":[]}]}},{"type":"css_sequ_type","data":{"name":"#rhand","fill":"forward","iterations":1,"selectors":["#rhand"],"parameters":[{"name":"transform","keys":[{"value":{"tx":67,"ty":-155,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":483,"ease":"linear"},{"value":{"tx":71,"ty":-9,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":0,"ease":"linear"},{"value":{"tx":65.00414078674949,"ty":-92.84886128364388,"tz":0,"rx":0,"ry":0,"rz":0.771136899689201,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":241,"ease":"linear"}]},{"name":"transform-origin","keys":[{"value":"40.54% 91.20%","time":483,"ease":"linear"}]},{"keys":[]}]}}]}';

    var sequPlayerGens = [function () {

    var player,
        animation,
        isInited = false,
        animations = [],
        paramKeys = [[{"offset":0,"transform":"translateY(30px) "},{"offset":0.8650746268656722,"transform":"translate(-7px,-110px) "}],[]],
        options = {"direction":"normal","duration":558.333333333333,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('#head');

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
        paramKeys = [[{"offset":0,"transform":"translate(55px,76px) "},{"offset":0.43164179104477635,"transform":"translate(52.50517598343686px,2.652173913043484px) rotate(-0.4985477598326012rad) "},{"offset":0.8650746268656722,"transform":"translate(50px,-71px) "}],[{"offset":0,"transform-origin":"19.15% 52.86%"}],[]],
        options = {"direction":"normal","duration":558.333333333333,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('#rshoulder');

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
        paramKeys = [[{"offset":0,"transform":"translate(71px,-9px) "},{"offset":0.43164179104477635,"transform":"translate(65.00414078674949px,-92.84886128364388px) rotate(0.771136899689201rad) "},{"offset":0.8650746268656722,"transform":"translate(67px,-155px) "}],[{"offset":0.8650746268656722,"transform-origin":"40.54% 91.20%"}],[]],
        options = {"direction":"normal","duration":558.333333333333,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('#rhand');

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