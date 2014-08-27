'use strict';

var amgui = require('../amgui');


function decorTimebarNavigator (timebar) {

    var deNav, deLeftHand, deRightHand, 
        dragMode = 'move', mdX, mdStart, mdEnd;
    
    createBase();
    timebar.domElem.appendChild(deNav);

    deNav.addEventListener('mousedown', onMDown);
    deNav.addEventListener('mouseenter', onMEnter);
    deNav.addEventListener('mouseleave', onMLeave);

    timebar.on('changeTape', onChangeTape);

    function onChangeTape() {

        var width = timebar.width,
            max = timebar.maxTime,
            start = timebar.start,
            end = timebar.start;

        deNav.style.left = (width * (start / max)) + 'px';
        deNav.style.width = (width * ((end - start) / max)) + 'px';
    }

    function onMDown(e) {

        e.stopPropagation();
        e.preventDefault();

        if (e.target === deLeftHand) dragMode = 'start';
        else if (e.target === deRightHand) dragMode = 'end';
        else dragMode = 'move';

        mdX = e.pageX;
        mdStart = timebar.start;
        mdEnd = timebar.end;

        window.addEventListener('mousemove', onMMove);
        window.addEventListener('mouseup', onMUp);
        window.addEventListener('mouseleave', onMUp);
    }

    function onMMove(e) {

        var move = (e.pageX - mdX) * timebar.maxTime,
            start = mdStart + move,
            length = mdEnd + timebar.start;

        if (dragMode === 'move') {

            timebar.start = start;
        }
        else if (dragMode === 'start') {

            timebar.start = start;
            timebar.length = length;
        }
        else if (dragMode === 'end') {

            timebar.length = length;
        }
    }

    function onMUp() {

        window.removeEventListener('mousemove', onMMove);
        window.removeEventListener('mouseup', onMUp);
        window.removeEventListener('mouseleave', onMUp);
    }

    function onMEnter() {

        deNav.style.transform = 'scaleY(1)';
    }

    function onMLeave() {

        deNav.style.transform = 'scaleY(0.3)';
    }

    function createBase () {

        deNav = document.createElement(div);
        deNav.style.position = 'absolute';
        deNav.style.top = '0px';
        deNav.style.height = '3px';
        deNav.style.cursor = 'move';
        deNav.style.transformOrigin = 'center top';
        deNav.style.background = amgui.color.bg2;

        deRightHand = createHandler('right');
        deLeftHand = createHandler('left');
    }

    function createHandler(side) {

        var de = document.createElement(div);
        de.style.position = 'absolute';
        de.style[side] = '0px';
        de.style.top = '0px';
        de.style.height = '100%';
        de.style.width = '5%';
        de.style.minWidth = '1px';
        de.style.maxWidth = '7px';
        de.style.cursor = 'ew-resize';
        de.style.transformOrigin = 'center top';
        de.style.transform = 'scaleY(0.3)';
        deNav.appendChild(de);
    }
}

module.exports = decorTimebarNavigator;