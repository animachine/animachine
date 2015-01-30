'use strict';
//TODO do this better 
module.exports = function (that) {

    function gotTimeline () {

        that.flag('addedToTimeline');
        that.emit('addedToTimeline');
    } 

    function test () {

        if (that.timeline) {
            that.off('added', test);
            that.off('addedToTimeline', test);
            gotTimeline();
        }
    } 

    if (that.timeline) {
        gotTimeline();
    }
    else {
        that.on('added', test);
        that.on('addedToTimeline', test);
    }
}

