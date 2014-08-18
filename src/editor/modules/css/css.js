var cssSequence = require('./cssSequence');

var am, iconNew;

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
                am.timeline.addSequence(cssSequence.create());
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