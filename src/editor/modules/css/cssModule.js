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

    // if (!am.timeline.sequences.some(testSequ)) {

    //     var iconOpt;

    //     if (iconNew) {

    //         iconOpt = { deIcon: iconNew };
    //     }
    //     else {
    //         iconOpt = {
            
    //             icon: 'plus-squared',
    //             backgound: '#063501',
    //             tooltip: 'new sequence with selected elem',

    //             onClick: function () {

    //                 am.toolbar.removeIcon(iconNew);
    //                 am.domPicker.hide();

    //                 var selector = qsgen(am.selectedElement);
    //                 console.log('selector:', selector);

    //                 var sequ = new CssSequence({
    //                     selectors: [selector],
    //                     name: selector
    //                 });

    //                 am.timeline.addSequence(sequ);

    //                 sequ.select();
    //             }
    //         };
    //     }

    //     iconNew = am.toolbar.addIcon(iconOpt);
    // }

    am.timeline.sequences.some(testSequ);

    function testSequ(sequ) {

        if (sequ instanceof CssSequence && sequ.isOwnedDomElem(de)) {

            console.log('is owned', de);
            sequ.select({focusElem: de});
            am.domPicker.hide();
            return true;
        }
    }
}