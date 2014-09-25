;(function (root) {
    'use strict';

    /**@amsave*/
    var SAVEJSON = '{"timebar":{"currTime":1647,"timescale":0.12,"length":2058.333333333333},"sequences":[{"type":"js_sequ_type","data":{"intervalScripts":[{"script":"// Call the paintCanvas function here so that our canvas\\n// will get re-painted in each next frame\\npaintCanvas();\\n\\n// Call the function that will draw the balls using a loop\\nfor (var i = 0; i < particles.length; i++) {\\n  p = particles[i];\\n  p.draw();\\n}\\n\\n//Finally call the update function\\nupdate();","intervals":[{"start":0,"end":6000}]}],"momentScripts":[{"script":"color = \'#\'+Math.random().toString(16).substr(-6);","time":983,"ease":"linear"}],"isShowingIntervalScripts":true}}]}';

    var sequPlayerGens = [function () {/*TODO*/}];

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


}(this));