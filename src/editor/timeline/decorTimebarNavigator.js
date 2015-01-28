'use strict';

var amgui = require('../amgui');


function decorTimebarNavigator (timebar) {

    var deNav, deColor, deLeftHand, deRightHand, dragMode;
    
    createBase();
    timebar.domElem.appendChild(deNav);

    amgui.makeDraggable({
        deTarget: deNav,
        onDown: function (e) {

            if (e.target === deLeftHand) dragMode = 'start';
            else if (e.target === deRightHand) dragMode = 'end';
            else dragMode = 'move';

            return {
                start: timebar.start,
                visibleTime: timebar.visibleTime,
                timescale: timebar.timescale,
            };
        },
        onMove: function (md, mx) {

            var scale = timebar.width / timebar.length,
                move = (mx - md.mx) / scale,
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

                var mdPos = (md.start + timebar.currTime) * md.timescale;
                timebar.start = -((timebar.currTime * timebar.timescale) - mdPos) / timebar.timescale;
            }   
        },
        onUp: function () {

            dragMode = undefined;
            onMLeave();
        },
        onEnter: function () {

            deColor.style.transform = 'scaleY(1)';
            deColor.style.background = amgui.color.selected;
        },
        onLeave: onMLeave
    });

    timebar.on('changeTape', onChangeTape);


    function onChangeTape() {

        var scale = timebar.width / timebar.length;

        deNav.style.left = ((-timebar.start * scale) + timebar._startMargin) + 'px';
        deNav.style.width = (timebar.visibleTime * scale) + 'px';
    }

    function onMLeave() {

        if (!dragMode) {
            deColor.style.transform = 'scaleY(0.4)';
            deColor.style.background = amgui.color.bg2;
        }
    }

    function createBase () {

        deNav = document.createElement('div');
        deNav.style.position = 'absolute';
        deNav.style.top = '0px';
        deNav.style.height = '7px';
        deNav.style.cursor = 'move';

        deColor = document.createElement('div');
        deColor.style.position = 'absolute';
        deColor.style.top = '0px';
        deColor.style.left = '0px';
        deColor.style.width = '100%';
        deColor.style.height = '100%';
        deColor.style.transformOrigin = 'center top';
        deNav.appendChild(deColor);

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