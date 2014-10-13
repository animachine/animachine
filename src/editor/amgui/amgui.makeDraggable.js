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

    opt.deTarget.addEventListener('mousedown', onDown);
    opt.deTarget.addEventListener('mouseover', onEnter);
    opt.deTarget.addEventListener('mouseleave', onLeave);

    function onDown(e) {

        if (e.button !== 0) {
            
            return;
        }

        e.stopPropagation();
        e.preventDefault();

        isDrag = true;

        md = call('onDown', [e]) || {};

        md.mx = e.clientX;
        md.my = e.clientY;

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

        call('onMove', [md, wme.clientX, wme.clientY, wme]);
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
        
        if (name in opt) {

            return opt[name].apply(opt.thisArg, args);
        }
    }
}