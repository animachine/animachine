var cssSequence = require('./cssSequence');
var qsgen = require('../../qsgen');

var am, iconNew, qsModal;

exports.init = function (_am) {

    am = _am;

    am.registerSequenceType(cssSequence, 'css');

    am.on('selectDomElement', onSelectDomElement);
}

function onSelectDomElement(de) {

    if (!cssSequence._instances.some(testSequ)) {

        iconNew = am.toolbar.addIcon(iconNew ? 
        {
            deIcon: iconNew
        } : {

            icon: 'plus-squared',
            onClick: function () {

                am.toolbar.removeIcon(iconNew);

                var sequ = cssSequence.create({
                    selectors: [qsgen(de)]
                });

                am.timeline.addSequence(sequ);

                sequ.select();
            }
        });
    };

    function testSequ(sequ) {
            
        if (sequ.isOwnedDomElement(de)) {

            sequ.select();
            return true;
        }
    }
}

function createQsModal() {

    var de = document.createElement('div');
    de.style.width = '340px';

    var inp = document.createElement('input');
    inp.type = 'text';
    de.appendChild(inp);

    return amgui.createDialog({
        content: de,
        title: 'Selector',
        buttons: ['ok']
    });
}

function createSelectionBox() {

    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.border = 'outset 1px white';
    
    de.focusDe = function (de) {

        var br = de.getBoundingClientRect;
        de.style.width = br.width
    }
}