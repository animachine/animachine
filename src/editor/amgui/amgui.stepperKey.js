'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createStepperKey: createStepperKey,
    };
};


function createStepperKey(opt) {

    opt = opt || {};

    opt.height = opt.height || amgui.lineHeight;

    var stepperW = 12;

    var de = amgui.createToggleIconBtn({
        icon: 'key',
        height: opt.height,
        onClick: opt.onClick,
        changeColor: true,
        parent: opt.parent
    });
    de.style.position = 'relative';

    var dePrev = amgui.createIconBtn({
        icon: 'angle-left',
        height: opt.height,
        width: stepperW,
        onClick: opt.onClickPrev,
        parent: de
    });
    dePrev.style.position = 'absolute';
    dePrev.style.left = (-stepperW) + 'px';
}