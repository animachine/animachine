var cssSequence = require('./cssSequence');

exports.init = function (am) {

    am.registerSequenceType(cssSequence, 'css');
}