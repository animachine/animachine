'use strict';

var Param = require('../../track/Param');
var inherits = require('inherits');

function CssParam (opt={}) {

    Param.call(this, opt);
}

inherits(CssParam, Param);
var p = CssParam.prototype;
module.exports = CssParam;