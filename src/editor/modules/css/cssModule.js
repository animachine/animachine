'use strict';

var CssTrack = require('./CssTrack');
var ParamsTab = require('./paramsTab/ParamsTab');
var qsgen = require('../../qsgen');

var iconNew, paramsTab;

exports.init = function () {

    paramsTab = new ParamsTab();

    am.registerTrackType(CssTrack, CssTrack.prototype.type);

    am.on('selectDomElement', onSelectDomElement);

    am.workspace.fillTab('Css Style', paramsTab.domElem);

    am.domPicker.setRightLeftBtn({
        icon: 'plus',
        tooltip: 'create a new css track with this element',
        onClick: function () {

            am.domPicker.hide();

            var selector = qsgen(am.selectedDomElem);
            console.log('selector:', selector);

            var track = new CssTrack({
                selectors: [selector],
                name: selector
            });

            am.timeline.addTrack(track);

            am.selectTrack(track);
        }
    });
};

function onSelectDomElement(de) {

    am.timeline.tracks.forEach(function (track) {

        if (track instanceof CssTrack) {

            if (track.isOwnedDomElem(de)) {

                am.selectTrack(track);
                track.focusHandler(de);
                am.domPicker.hide();
            }
            else {
                if (am.selectedTrack === track) {

                    am.deselectTrack();
                } 
            }
        }
    });
}