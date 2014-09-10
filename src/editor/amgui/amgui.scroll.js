'use strict';

var amgui = {

    createRange: createRange,
    makeScrollable: makeScrollable,
};

module.exports = amgui;



function makeScrollable(opt) {

    var pos = 0,
        deCont = opt.deCont,
        deTargets = deTargets,
        range = opt.range;

    opt.deCont.addEventListener('wheel', function (e) {

        var way = e.delta/18,
            maxH = getTargetsMaxH();
        
        pos = Math.max(0, Math.min(maxH, pos + way));

        scroll();
    });

    if (opt.range) {

        range.addEventListener('change', function (e) {

            pos = getTargetsMaxH() * e.detail.value;
            scroll();
        })
    }

    

    function scroll(p) {

        opt.deTargets.forEach(function (deTarget) {

            deTarget.top = -pos + 'px'
        });
    }

    function getTargetsMaxH() {

        var contH = getH(deCont),
            targetsH = deTargets.slice().map(getH);

        return Math.max.apply(null, targetsH) - contH;
    }

    function getH(de) {

        return de.getBoundingClientRect().height;
    }
}




function createRange(opt) {

    opt = opt || {};
  
    var value = 0, cursorWidth = 0, isVertical = !!opt.vertical;

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = opt.width || '12px';
    de.style.height = opt.height || '140px';
    de.style.background = 'grey';
    de.style.cursor = 'pointer';

    var deCursor = document.createElement('div');
    deCursor.style.position = 'absolute';
    deCursor.style[d('left','top')] = '0';
    deCursor.style[d('right','bottom')] = '0';
    deCursor.style.margin = d('auto 0','0 auto');
    deCursor.style.background = 'orange';
    deCursor.style[d('width','height')] = opt.cursorHeight || '100%';
    de.appendChild(deCursor);

    de.setCursorWidth = function (w) {

        deCursor.style[d('height','width')] = w + 'px';
        cursorWidth = w;
    };
    de.setCursorWidth(opt.cursorWidth || 12);

    de.addEventListener('mousedown', onDown);
//TODO use amgui.makeDraggable()
    function onDown(e) {

        window.addEventListener('mousemove', onDrag);
        window.addEventListener('mouseup', onUp);
        window.addEventListener('mouseleave', onUp);

        onDrag(e);
    }

    function onDrag(e) {

        var br = de.getBoundingClientRect(),
            mx = d(e.pageY,e.pageX) - (d(br.top,br.left) + cursorWidth/2),
            fw = d(br.height,br.width) - cursorWidth,
            pos = Math.max(0, Math.min(1, mx / fw));

        de.setValue(pos);
    }

    function onUp() {

        window.removeEventListener('mousemove', onDrag);
        window.removeEventListener('mouseup', onUp);
        window.removeEventListener('mouseleave', onUp);
    }

    de.setValue = function (v) {

        if (v === value) return;

        value = v;
        
        var width = de.getBoundingClientRect()[d('height','width')];
        deCursor.style[d('top','left')] = ((width - cursorWidth) * value) + 'px';

        de.dispatchEvent(new CustomEvent('change', {detail: {value: value}}));
    };

    de.getValue = function () {

        return value;
    };

    function d (vertical, horisontal) {

        return isVertical ? vertical : horisontal;
    }

    return de;
};