'use strict';

var CssTrack = require('./CssTrack');
var ParamsTab = require('./paramsTab/ParamsTab');
var qsgen = require('../../qsgen');

var iconNew, paramsTab;

exports.init = function () {

    paramsTab = new ParamsTab();

    am.registerSequenceType(CssTrack, CssTrack.prototype.type);

    am.on('selectDomElement', onSelectDomElement);

    am.workspace.fillTab('Css Style', paramsTab.domElem);

    am.domPicker.dropdownMenu.addItem({
        text: 'new css track',
        icon: 'plus',
        tooltip: 'create a new css track with this element',
        onSelect: function () {

            am.domPicker.hide();

            var selector = qsgen(am.selectedDomElem);
            console.log('selector:', selector);

            var sequ = new CssTrack({
                selectors: [selector],
                name: selector
            });

            am.timeline.addSequence(sequ);

            am.selectTrack(sequ);
        }
    })
};

function onSelectDomElement(de) {

    am.timeline.sequences.forEach(function (sequ) {

        if (sequ instanceof CssTrack) {

            if (sequ.isOwnedDomElem(de)) {

                am.selectTrack(sequ);
                sequ.focusHandler(de);
                am.domPicker.hide();
            }
            else {
                if (am.selectedTrack === sequ) {

                    am.deselectTrack();
                } 
            }
        }
    });
}