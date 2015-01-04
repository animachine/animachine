'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        makeDraggable: makeDraggable,
    };
};

function makeDraggable(opt) {

    opt = opt || {};

    var md, isOver, isDrag, 
        waitingMoveEvent, waitingMoveRaf;

    if (opt.deTarget) {
        
        opt.deTarget.addEventListener('mousedown', onDown);
        opt.deTarget.addEventListener('mouseover', onEnter);
        opt.deTarget.addEventListener('mouseleave', onLeave);
    }

    return {
        emitDown: function (e) {

            onDown(e);
        },
        destroy: function () {}
    }

    function onDown(e) {

        if (e.button !== 0) {
            
            return;
        }

        e.stopPropagation();//ex. prevent to drag the parent if that's draggable too
        e.preventDefault();//ex. prevent selecting text

        isDrag = true;

        var custom = call('onDown', [e]);

        if (custom === false) {//prevent dragging

            return;
        }

        md = custom || {};

        md.mx = e.clientX;
        md.my = e.clientY;
        md.dx = 0;
        md.dy = 0;

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mouseleave', onUp);
    }

    function onMove(e) {

        waitingMoveEvent = e;

        if (!waitingMoveRaf) {
            
            waitingMoveRaf = window.requestAnimationFrame(rafOnMove);
        }
    }

    function rafOnMove() {

        window.cancelAnimationFrame(waitingMoveRaf);

        var wme = waitingMoveEvent;
        waitingMoveRaf = undefined;
        waitingMoveEvent = undefined;

        var mx = wme.clientX,
            my = wme.clientY;

        md.dx = mx - md.mx;
        md.dy = my - md.my;

        call(['onMove', 'onDrag'], [md, mx, my]);
    }

    function onUp(e) {

        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('mouseleave', onUp);

        if (waitingMoveEvent) {
            rafOnMove();
        }

        isDrag = false;
        if (!isOver) {
            onLeave();
        }

        call('onUp', [md, e.clientX, e.clientY, e]);
    }

    function onEnter() {

        isOver = true;

        if (!isDrag) {
            call('onEnter');
        }
    }

    function onLeave() {

        isOver = false;
        
        if (!isDrag) {
            call('onLeave');
        }
    }

    function call(name, args) {

        if (name instanceof Array) {

            name.forEach(function (name) {

                call(name, args);
            });

            return;
        }
        
        if (name in opt) {

            return opt[name].apply(opt.thisArg, args);
        }
    }
}