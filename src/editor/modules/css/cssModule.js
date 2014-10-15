'use strict';

var CssSequence = require('./CssSequence');
var qsgen = require('../../qsgen');

var am, iconNew;

exports.init = function (_am) {

    am = _am;

    am.registerSequenceType(CssSequence, CssSequence.prototype.type);

    am.on('selectDomElement', onSelectDomElement);

    am.domPicker.dropdownMenu.addItem({
        text: 'new css track',
        icon: 'plus',
        tooltip: 'create a new css track with this element',
        onSelect: function () {

            am.domPicker.hide();

            var selector = qsgen(am.selectedElement);
            console.log('selector:', selector);

            var sequ = new CssSequence({
                selectors: [selector],
                name: selector
            });

            am.timeline.addSequence(sequ);

            sequ.select();
        }
    })
};

function onSelectDomElement(de) {

    am.timeline.sequences.forEach(function (sequ) {

        if (sequ instanceof CssSequence) {

            if (sequ.isOwnedDomElem(de)) {

                console.log('is owned', de);
                sequ.select({focusElem: de});
                am.domPicker.hide();
            }
            else {
                sequ.deselect();
            }
        }
    });
}