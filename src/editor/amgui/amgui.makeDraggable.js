'use strict';

var amgui = {

    makeDraggable: makeDraggable,
};

module.exports = amgui;


function makeDraggable(opt) {

    opt = opt || {};

    var md;

    opt.deTarget.addEventListener('mousedown', onDown);
    opt.deTarget.addEventListener('mouseenter', onEnter);
    opt.deTarget.addEventListener('mouseleave', onLeave);

    function onDown(e) {

        e.stopPropagation();
        e.preventDefault();

        if (opt.onDown) {
            md = opt.onDown(e) || {};
        }
        else {
            md = {};
        }

        md.mx = e.clientX;
        md.my = e.clientY;

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mouseleave', onUp);
    }

    function onMove(e) {

        if (opt.onMove) {
            opt.onMove(md, e.clientX, e.clientY, e);
        }
    }

    function onUp() {

        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('mouseleave', onUp);
    }

    function onEnter() {

        if (opt.onEnter) {
            opt.onEnter();
        }
    }

    function onLeave() {

        if (opt.onLeave) {
            opt.onLeave();
        }
    }
}