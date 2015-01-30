'use strict';

var ParamGroup = require('../../track/ParamGroup');
var inherits = require('inherits');

function CssParamGroup (opt={}) {

    ParamGroup.apply(this, arguments);
}

inherits(CssParamGroup, ParamGroup);
var p = CssParamGroup.prototype;
module.exports = CssParamGroup;