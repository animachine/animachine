'use strict';

var CssTrack = require('./CssTrack');
var ParamsTab = require('./CssParamsTab');
var qsgen = require('../../qsgen');

var paramsTab;

exports.init = function () {

    paramsTab = new ParamsTab();

    am.registerTrackType(CssTrack, CssTrack.prototype.type);

    am.on('selectDomElem', onSelectDomElem);

    am.workspace.fillTab('Css Style', paramsTab.domElem);

    am.domPicker.on('add', function (e) {

        e.demand(10).then(() => {

            am.domPicker.hide();

            var selector = qsgen(e.target);
            console.log('selector:', selector);

            var track = new CssTrack({
                selectors: [{type: 'css', value: selector}],
                paramTree: {name: selector},
            }, am.currTimeline);

            am.currTimeline.addTrack(track);
            track.select();
        });
    });
};

function onSelectDomElem(de) {

    am.currTimeline.tracks.forEach(function (track) {

        if (track instanceof CssTrack) {

            if (track.isOwnedDomElem(de)) {

                track.select();
                track.focusTransformer(de);
            }
            else if (track.isSelected()) {

                track.deselect();
            }
        }
    });
}
