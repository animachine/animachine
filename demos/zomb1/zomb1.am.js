;(function (root) {
    'use strict';

    /**@amsave*/
    var SAVEJSON = '{"timebar":{"currTime":545,"timescale":0.12,"length":558.333333333333},"sequences":[{"type":"css_sequ_type","data":{"name":"#head","fill":"forward","iterations":1,"selectors":["#head"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":30,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":0,"ease":"linear"},{"value":{"tx":-7,"ty":-110,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":483,"ease":"linear"}]},{"keys":[]}]}}]}';

    var sequPlayerGens = [function () {

    var player,
        animation,
        isInited = false,
        animations = [],
        paramKeys = [[{"offset":null,"transform":"translateY(30px) "},{"offset":null,"transform":"translate(-7px,-110px) "}],[]],
        options = {"direction":"normal","iterations":1,"fill":"forward"},
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
}];

    root.am = root.am || {};
    root.am.pageScripts = root.am.pageScripts || {};

    var reg = root.am.pageScripts.amsave = {
        
        createPlayer: function (opt) {

            var sequencePlayers = [];

            sequPlayerGens.forEach(function (create) {

                sequencePlayers.push(create(opt));
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

    if (document.readyState == 'interactive' || document.readyState == 'complete') {

        reg.createPlayer().play();
    }
    else {
        document.addEventListener('DOMContentLoaded', function () {

            reg.createPlayer().play();
        });
    }
}(this));