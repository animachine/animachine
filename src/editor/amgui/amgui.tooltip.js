'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        addTooltip: addTooltip,
        removeTooltip: removeTooltip,
        getTooltip: getTooltip,
    };
};

var tooltipMap = new Map();



function addTooltip(opt) {

    var showSetT, delay = 423, mx = 0, my = 0;

    var de = document.createElement('div');
    de.textContent = opt.text;
    de.style.position = 'fixed';
    de.style.padding = '12px';
    de.style.display = 'inline-block';
    de.style.background = amgui.color.overlayInverse;
    de.style.color = amgui.color.textInverse;

    de.remove = function () {

        opt.deTarget.removeEventListener('mouseenter', onMEnter);
        onMLeave();
    };

    de.setContent = function (content) {

        de.textContent = content;
    }

    tooltipMap.set(opt.deTarget, de);

    opt.deTarget.addEventListener('mouseenter', onMEnter);

    function onMEnter(e) {

        opt.deTarget.addEventListener('mousemove', onMMove);
        opt.deTarget.addEventListener('mouseleave', onMLeave);
        opt.deTarget.addEventListener('mousedown', onMLeave);

        onMMove(e);
    }

    function onMLeave() {

        opt.deTarget.removeEventListener('mousemove', onMMove);
        opt.deTarget.removeEventListener('mouseleave', onMLeave);
        opt.deTarget.removeEventListener('mousedown', onMLeave);

        hide();
        clearShowSetT();
    }

    function onMMove(e) {

        hide();
        refreshShowSetT();
        mx = e.clientX;
        my = e.clientY;
    }

    function refreshShowSetT() {

        clearShowSetT();
        showSetT = setTimeout(show, delay);
    }

    function clearShowSetT() {

        clearTimeout(showSetT);
    }

    function show() {

        amgui.deOverlayCont.appendChild(de);
        amgui.placeToPoint(de, mx, my, opt.side);
    }

    function hide() {

        if (de.parentElement) {
            de.parentElement.removeChild(de);
        }
    }
};

function removeTooltip(deTarget) {

    var tooltip = amgui.getTooltip(deTarget);

    if (tooltip) {

        tooltip.remove();
    }
};

function getTooltip(deTarget) {

    return tooltipMap.get(deTarget);
};

