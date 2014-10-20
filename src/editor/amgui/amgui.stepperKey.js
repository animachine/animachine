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
    de.addEventListener('mouseenter', showSteppers)
    de.addEventListener('mouseleave', hideSteppers)

    var dePrev = createStepper(true);
    var deNext = createStepper(false);

    function showSteppers() {

        amgui.deOverlayCont.appendChild(dePrev);
        amgui.deOverlayCont.appendChild(deNext);

        var br = de.getBoundingClientRect();
        console.log(br.left, br.right)

        dePrev.style.left = (br.left - stepperW) + 'px';
        dePrev.style.top = br.top + 'px';
        
        deNext.style.left = br.right + 'px';
        deNext.style.top = br.top + 'px';
    }

    function hideSteppers() {

        if (dePrev.parentNode) {
            dePrev.parentNode.removeChild(dePrev);
        }

        if (deNext.parentNode) {
            deNext.parentNode.removeChild(deNext);
        }
    }

    function createStepper(isLeft) {

        var deStepper = amgui.createIconBtn({
            icon: isLeft ? 'angle-left' : 'angle-right',
            height: opt.height,
            width: stepperW,
            onClick: isLeft ? opt.onClickPrev : opt.onClickNext
        });
        deStepper.style.position = 'absolute';
        deStepper.style.pointerEvents = 'auto';

        return deStepper;
    }

    return de;
}