'use strict';

var Track = require('../../track/Track');
var inherits = require('inherits');
var CssParamFactory = require('./CssParamFactory');

function CssTrack (opt={}, timeline) {

    this._paramFactory = new CssParamFactory({}, timeline);

    Track.apply(this, arguments);
}

inherits(CssTrack, Track);
var p = CssTrack.prototype;
module.exports = CssTrack;

p.type = 'css_track_type';