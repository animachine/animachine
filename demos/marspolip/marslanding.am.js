;(function (root) {
    'use strict';

    /**@amsave*/
    var SAVEJSON = '{"timebar":{"currTime":7183,"timescale":0.12,"length":7975},"sequences":[{"type":"css_sequ_type","data":{"name":"ship","fill":"forward","iterations":1,"selectors":[".ship"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":3209,"ease":"linear"},{"value":{"tx":1234,"ty":-234,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":44,"ease":"cubic-bezier(0.557,0.942,0.573,0.983)"},{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":5333,"ease":"cubic-bezier(0.451,0.003,0.903,0.551)"},{"value":{"tx":-18,"ty":18,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":5688,"ease":"linear"}]},{"keys":[]}],"isShowingParams":false}},{"type":"css_sequ_type","data":{"name":"ship rotate","fill":"forward","iterations":1,"selectors":[".ship-rotate"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0.8779471194062779,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":2816,"ease":"linear"},{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":-1.8955896848795295,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":1805,"ease":"cubic-bezier(0.282,0.018,0.451,0.995)"}]},{"keys":[]}],"isShowingParams":false}},{"type":"css_sequ_type","data":{"name":"flag","fill":"forward","iterations":1,"selectors":[".flag"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":3441,"ease":"cubic-bezier(0.407,1.074,0.762,1.144)"},{"value":{"tx":0,"ty":-20,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":3800,"ease":"linear"},{"value":{"tx":0,"ty":-20,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":6591,"ease":"linear"},{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":6741,"ease":"linear"}]},{"keys":[]}],"isShowingParams":true}},{"type":"css_sequ_type","data":{"name":"tentacle","fill":"forward","iterations":1,"selectors":[".tentacle"],"parameters":[{"name":"transform","keys":[{"value":{"tx":-2,"ty":-3,"tz":0,"rx":0,"ry":0,"rz":-2.9370497215895837,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":5333,"ease":"cubic-bezier(0.49,0.009,0.955,0.599)"},{"value":{"tx":-20,"ty":24,"tz":0,"rx":0,"ry":0,"rz":-1.2332932040384388,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":4670,"ease":"cubic-bezier(0.358,0.737,0.608,0.99)"},{"value":{"tx":-29,"ty":9,"tz":0,"rx":0,"ry":0,"rz":-2.9370497215895837,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":5723,"ease":"linear"}]},{"keys":[]}],"isShowingParams":false}},{"type":"css_sequ_type","data":{"name":"tentacle2","fill":"forward","iterations":1,"selectors":[".small-tentacle"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":-0.9595781414907016,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":6350,"ease":"cubic-bezier(0.424,0.974,0.562,0.974)"},{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0.6503269374418507,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":6741,"ease":"linear"}]},{"keys":[]}],"isShowingParams":true}},{"type":"css_sequ_type","data":{"name":"flag color","fill":"forward","iterations":1,"selectors":[".flag .color"],"parameters":[{"name":"transform","keys":[{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0,"sx":0,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":3825,"ease":"cubic-bezier(0,0,0.464,0.99)"},{"value":{"tx":0,"ty":0,"tz":0,"rx":0,"ry":0,"rz":0,"sx":1,"sy":1,"sz":1,"skewX":0,"skewY":0,"perspective":0},"time":4191,"ease":"linear"}]},{"name":"transform-origin","keys":[{"value":"0% 0%","time":3825,"ease":"linear"}]},{"keys":[]}],"isShowingParams":true}}]}';

    var sequPlayerGens = [function () {

    var player,
        animation,
        isInited = false,
        animations = [],
        paramKeys = [[{"offset":0.005517241379310344,"transform":"translate(1234px,-234px) ","easing":"cubic-bezier(0.557,0.942,0.573,0.983)"},{"offset":0.4023824451410658,"transform":""},{"offset":0.6687147335423197,"transform":"","easing":"cubic-bezier(0.451,0.003,0.903,0.551)"},{"offset":0.7132288401253919,"transform":"translate(-18px,18px) "}],[]],
        options = {"direction":"normal","duration":7975,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.ship');

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
        paramKeys = [[{"offset":0.2263322884012539,"transform":"rotate(-1.8955896848795295rad) ","easing":"cubic-bezier(0.282,0.018,0.451,0.995)"},{"offset":0.35310344827586204,"transform":"rotate(0.8779471194062779rad) "}],[]],
        options = {"direction":"normal","duration":7975,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.ship-rotate');

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
        paramKeys = [[{"offset":0.4314733542319749,"transform":"","easing":"cubic-bezier(0.407,1.074,0.762,1.144)"},{"offset":0.47648902821316613,"transform":"translateY(-20px) "},{"offset":0.8264576802507837,"transform":"translateY(-20px) "},{"offset":0.8452664576802508,"transform":""}],[]],
        options = {"direction":"normal","duration":7975,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.flag');

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
        paramKeys = [[{"offset":0.5855799373040752,"transform":"translate(-20px,24px) rotate(-1.2332932040384388rad) ","easing":"cubic-bezier(0.358,0.737,0.608,0.99)"},{"offset":0.6687147335423197,"transform":"translate(-2px,-3px) rotate(-2.9370497215895837rad) ","easing":"cubic-bezier(0.49,0.009,0.955,0.599)"},{"offset":0.7176175548589342,"transform":"translate(-29px,9px) rotate(-2.9370497215895837rad) "}],[]],
        options = {"direction":"normal","duration":7975,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.tentacle');

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
        paramKeys = [[{"offset":0.7962382445141066,"transform":"rotate(-0.9595781414907016rad) ","easing":"cubic-bezier(0.424,0.974,0.562,0.974)"},{"offset":0.8452664576802508,"transform":"rotate(0.6503269374418507rad) "}],[]],
        options = {"direction":"normal","duration":7975,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.small-tentacle');

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
        paramKeys = [[{"offset":0.47962382445141066,"transform":"scaleX(0) ","easing":"cubic-bezier(0,0,0.464,0.99)"},{"offset":0.5255172413793103,"transform":""}],[{"offset":0.47962382445141066,"transform-origin":"0% 0%"}],[]],
        options = {"direction":"normal","duration":7975,"iterations":1,"fill":"forward"},
        elems = document.querySelectorAll('.flag .color');

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