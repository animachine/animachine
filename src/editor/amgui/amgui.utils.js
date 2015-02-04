'use strict';

var amgui;


function placeToPoint(de, mx, my, way) {

    amgui.callOnAdded(de, function () {

        var px = 0, py = 0,
            br = de.getBoundingClientRect(),
            w = br.width,
            h = br.height,
            ww = window.innerWidth,
            wh = window.innerHeight;

        way = way || 'left';

        switch (way) {

            case 'top':
                px = mx - (w / 2);
                py = my - h;
                break;

            case 'right':
                px = mx;
                py = my - (h / 2);
                break;

            case 'bottom':
                px = mx - (w / 2);
                py = my;
                break;

            default:
            case 'left':
                px = mx - w;
                py = my - (h / 2);
        }

        if (py < 0) py = 0;
        if (px + w > ww) px -= (px + w) - ww;
        if (py + h > wh) py -= (py + h) - wh;
        if (px < 0) px = 0;

        de.style.left = px + 'px';
        de.style.top = py + 'px';
    });
}

function callOnAdded(de, cb, thisArg) {

    if (de instanceof Array) {

        var deRest = de;
        de = deRest.shift();

        if (deRest.length !== 0) {

            cb = callOnAdded.bind(this, deRest, cb, thisArg)
        }
    }


    var setT, setTTime = 1;
    checkLoop();
    
    function checkLoop() {

        if (check(de)) {

            cb.call(thisArg);
        }
        else {
            if (setTTime < 256) {
                setTTime *= 2;
            }

            clearTimeout(setT);
            setT = setTimeout(checkLoop, setTTime)
        }
    }

    function check (node) {

        while (node.parentNode) {

            node = node.parentNode;
            
            if (node.nodeType === 9 || node.nodeType === 11) {

                return true;
            }
        }
    }
}



var delayWithRAF = (() => {

    var stack = new Map(),
        waiting = undefined;

    var onRaf = () => {

        stack.forEach((reg, fn) => {

            fn.apply(reg.ctx, reg.args);
        });

        stack.clear();
        waiting = undefined;
    };
    
    return fn => {

        function wrapper () { 

            fn.apply(this, arguments); 
        };
        
        return function () {

            stack.set(wrapper, {ctx: this, args: arguments});
            
            if (waiting === undefined) {

                waiting = window.requestAnimationFrame(onRaf);
            }
        }
    };
})();



module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        placeToPoint: placeToPoint,
        callOnAdded: callOnAdded,
        delayWithRAF: delayWithRAF,
    };
};