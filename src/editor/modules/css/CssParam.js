'use strict';

var Param = require('../../track/Param');
var inherits = require('inherits');

function CssParam (opt={}) {

    Param.apply(this, arguments);
}

inherits(CssParam, Param);
var p = CssParam.prototype;
module.exports = CssParam;