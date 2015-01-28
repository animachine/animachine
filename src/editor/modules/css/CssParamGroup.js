'use strict';

var ParamGroup = require('../../track/ParamGroup');
var inherits = require('inherits');

function CssParamGroup (opt={}) {

    ParamGroup.call(this, opt);
}

inherits(CssParamGroup, ParamGroup);
var p = CssParamGroup.prototype;
module.exports = CssParamGroup;