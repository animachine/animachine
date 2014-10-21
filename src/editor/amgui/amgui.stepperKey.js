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

    var hasPrev = false, 
        hasNext = false,
        isShowingSteppers = false,
        isMOverKey = false,
        isMOverStepper = false,
        stepperW = 8;

    var de = amgui.createToggleIconBtn({
        icon: 'key',
        height: opt.height,
        onClick: opt.onClick,
        changeColor: true,
        parent: opt.parent
    });
    de.style.position = 'relative';
    de.style.overflow = '';
    de.addEventListener('mouseenter', onMOverKey);
    de.addEventListener('mouseleave', onMOutKey);

    var dePrev = createStepper(true);
    var deNext = createStepper(false);

    de.setSteppers = function (_hasPrev, _hasNext) {

        hasPrev = _hasPrev;
        hasNext = _hasNext;

        if (isShowingSteppers) {
            
            hideSteppers();
            showSteppers();
        }
    }

    return de;

    function onMOverKey() { isMOverKey = true; }
    function onMOutKey() { isMOverKey = false; }
    function onMOverStepper() { isMOverStepper = true; }
    function onMOutStepper() { isMOverStepper = false; }

    function onChangeOver () {

        if (isMOverKey || isMOverStepper) {

            if (!isShowingSteppers) {
                showSteppers();
            }
        }
        else if (!isMOverKey && !isMOverStepper) {

            if (isShowingSteppers) {
                hideSteppers();
            }
        }
    };

    function showSteppers() {

        isShowingSteppers = true;

        var br = de.getBoundingClientRect();

        if (hasPrev) {
            amgui.deOverlayCont.appendChild(dePrev);
            dePrev.style.left = (br.left - stepperW) + 'px';
            dePrev.style.top = br.top + 'px';
        }
        
        if (hasNext) {
            amgui.deOverlayCont.appendChild(deNext);
            deNext.style.left = br.right + 'px';
            deNext.style.top = br.top + 'px';
        }
    }

    function hideSteppers() {

        isShowingSteppers = false;

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
        deStepper.addEventListener('mouseenter', onMOverStepper);
        deStepper.addEventListener('mouseleave', onMOutStepper);

        return deStepper;
    }
}