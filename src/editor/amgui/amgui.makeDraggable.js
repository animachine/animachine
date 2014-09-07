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

        md = call('onDown', [e]);

        md.mx = e.clientX;
        md.my = e.clientY;

        window.addEventListener('mousemove', onMove);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mouseleave', onUp);
    }

    function onMove(e) {

        call('onMove', [md, e.clientX, e.clientY, e]);
    }

    function onUp() {

        window.removeEventListener('mousemove', onMove);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('mouseleave', onUp);

        call('onUp');
    }

    function onEnter() {

        call('onEnter');
    }

    function onLeave() {
        
        call('onLeave');
    }

    function call(name, args) {

        if (name in opt) {

            return opt[name].apply(opt.thisArg, args)
        }
    }
}