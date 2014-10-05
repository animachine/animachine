'use strict';

var JsSequence = require('./JsSequence');

exports.init = function () {

    am.registerSequenceType(JsSequence, JsSequence.prototype.type);
};
