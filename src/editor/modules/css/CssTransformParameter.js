var inherits = require('inherits');
var CssParameter = require('./CssParameter');
var uncalc = require('./uncalc');
var Key = require('./Key');
var amgui = require('../../amgui');

function CssTransformParameter (opt) {

    CssParameter.call(this, _.extend({name: 'transform'}, opt));
}

inherits(CssTransformParameter, CssParameter);
var p = CssTransformParameter.prototype;

module.exports = CssTransformParameter;
