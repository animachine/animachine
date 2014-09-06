'use strict';

var amgui = require('../amgui');


function decorTimebarNavigator (timebar) {

    var deNav, deLeftHand, deRightHand, 
        dragMode, md = {};
    
    createBase();
    timebar.domElem.appendChild(deNav);

    deNav.addEventListener('mousedown', onMDown);
    deNav.addEventListener('mouseenter', onMEnter);
    deNav.addEventListener('mouseleave', onMLeave);

    timebar.on('changeTape', onChangeTape);


    function onChangeTape() {

        var scale = timebar.width / timebar.length;

        deNav.style.left = (-timebar.start * scale) + 'px';
        deNav.style.width = (timebar.visibleTime * scale) + 'px';
        // deNav.style.visibility = visibleTime > length ? 'none' : 'visible';
    }

    function onMDown(e) {

        e.stopPropagation();
        e.preventDefault();

        if (e.target === deLeftHand) dragMode = 'start';
        else if (e.target === deRightHand) dragMode = 'end';
        else dragMode = 'move';

        md.x = e.clientX;
        md.start = timebar.start;
        md.visibleTime = timebar.visibleTime;
        md.timescale = timebar.timescale;

        window.addEventListener('mousemove', onMMove);
        window.addEventListener('mouseup', onMUp);
        window.addEventListener('mouseleave', onMUp);
    }

    function onMMove(e) {

        var scale = timebar.width / timebar.length,
            move = (e.clientX - md.x) / scale,
            start = md.start - move;

        if (dragMode === 'move') {

            timebar.start = start;
        }
        else if (dragMode === 'start') {

            timebar.start = start;
            timebar.visibleTime = md.visibleTime - move;
        }
        else if (dragMode === 'end') {

            timebar.visibleTime = md.visibleTime + move;
        }
    }

    function onMUp() {

        window.removeEventListener('mousemove', onMMove);
        window.removeEventListener('mouseup', onMUp);
        window.removeEventListener('mouseleave', onMUp);
        dragMode = undefined;
        onMLeave();
    }

    function onMEnter() {

        deNav.style.transform = 'scaleY(1)';
    }

    function onMLeave() {

        if (!dragMode) {
            deNav.style.transform = 'scaleY(0.4)';
        }
    }

    function createBase () {

        deNav = document.createElement('div');
        deNav.style.position = 'absolute';
        deNav.style.top = '0px';
        deNav.style.height = '7px';
        deNav.style.cursor = 'move';
        deNav.style.transformOrigin = 'center top';
        deNav.style.background = amgui.color.bg2;

        deRightHand = createHandler('right');
        deLeftHand = createHandler('left');
        onMLeave();
    }

    function createHandler(side) {

        var de = document.createElement('div');
        de.style.position = 'absolute';
        de.style[side] = '0px';
        de.style.top = '0px';
        de.style.height = '100%';
        de.style.width = '8%';
        de.style.minWidth = '1px';
        de.style.maxWidth = '7px';
        de.style.cursor = 'ew-resize';
        deNav.appendChild(de);

        return de;
    }
}

module.exports = decorTimebarNavigator;