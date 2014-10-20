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

    opt.height = opt.height || amgui.LINE_HEIGHT;

    var stepperW = 8;

    var de = amgui.createToggleIconBtn({
        icon: 'key',
        height: opt.height,
        onClick: opt.onClick,
        changeColor: true,
        parent: opt.parent
    });
    de.style.position = 'relative';
    de.style.overflow = '';
    de.addEventListener('mouseenter', onMOver)
    de.addEventListener('mouseleave', onMOut)

    var dePrev = createStepper(true);
    var deNext = createStepper(false);

    function onMOver() {

        dePrev.style.display = 'block';
        deNext.style.display = 'block';
    }

    function onMOut() {

        dePrev.style.display = 'none';
        deNext.style.display = 'none';
    }

    function createStepper(isLeft) {

        var deStepper = amgui.createIconBtn({
            icon: isLeft ? 'angle-left' : 'angle-right',
            height: opt.height,
            width: stepperW,
            onClick: isLeft ? opt.onClickPrev : opt.onClickNext,
            parent: de
        });
        deStepper.style.display = 'none';
        deStepper.style.position = 'absolute';
        deStepper.style.top = '0px'; 
        deStepper.style[isLeft ? 'left' : 'right'] = (-stepperW) + 'px';

        return deStepper;
    }

    return de;
}