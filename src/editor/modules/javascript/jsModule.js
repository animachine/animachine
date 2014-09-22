var CssSequence = require('./JsSequence');
var qsgen = require('../../qsgen');

var am, iconNew, qsModal;

exports.init = function (_am) {

    am = _am;

    am.registerSequenceType(JsSequence, JsSequence.prototype.type);
}
