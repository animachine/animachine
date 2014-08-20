var cssSequence = require('./cssSequence');
var qsgen = require('../../qsgen');

var am, iconNew, qsModal, selectBox;

exports.init = function (_am) {

    am = _am;

    am.registerSequenceType(cssSequence, 'css');

    am.on('selectDomElement', onSelectDomElement);

    selectBox = createSelectionBox();
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
                selectBox.hide();

                var sequ = cssSequence.create({
                    selectors: [qsgen(am.selectedElement)]
                });

                am.timeline.addSequence(sequ);

                sequ.select();
            }
        });

        selectBox.show(de);
    }

    function testSequ(sequ) {
            
        if (sequ.isOwnedDomElement(de)) {
            
            sequ.select();
            selectBox.hide();
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
    de.style.boxSizing = 'border-box';
    de.style.boxShadow = '0px 0px 1px 0px rgba(50, 50, 50, 0.75)';
    de.style.display = 'none';
    de.style.border = '2px dashed #eee';
    am.deHandlerCont.appendChild(de);
    
    de.show = function (deTarget) {

        var br = deTarget.getBoundingClientRect();
        de.style.left = br.left + 'px';
        de.style.top = br.top + 'px';
        de.style.width = br.width + 'px';
        de.style.height = br.height + 'px';
        de.style.display = 'block';
    }

    de.hide = function () {
        
        de.style.display = 'none';
    }

    return de;
}