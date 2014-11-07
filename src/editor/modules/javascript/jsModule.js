'use strict';

var JsTrack = require('./JsTrack');

exports.init = function () {

    am.registerTrackType(JsTrack, JsTrack.prototype.type);
};
