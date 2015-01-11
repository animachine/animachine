'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createRange: createRange,
        makeScrollable: makeScrollable,
    };
};



function makeScrollable(opt) {

    var pos = 0,
        deConts = opt.deCont,
        deTargets = opt.deTarget,
        deRange = opt.deRange,
        ret = {dispose: dispose};

    if (!Array.isArray(deConts)) deConts = [deConts];
    if (!Array.isArray(deTargets)) deTargets = [deTargets];

    deConts.forEach(cont => {if (!cont) throw 'false contaiter';});
    deTargets.forEach(target => {if (!target) throw 'false target';});

    deConts.forEach(deC => {
        deC.addEventListener('wheel', onWheel);
    });
    deTargets.forEach(deT => {
        var pos = deT.style.position;
        if (pos !== 'absolute' && pos !== 'fixed' && pos !== 'relative') {
            
            deT.style.position = 'relative';
        };
    });


    //create a basic scroll bar if it is not set at all
    if (!('deRange' in opt)) {

        deRange = this._scrollRange = amgui.createRange({
            parent: deConts[0],
            height: '100%',
            vertical: true
        });

        deRange.style.position = 'absolute';
        deRange.style.top = '0px';
        deRange.style.right = '0px';
    }

    if (deRange) {
        initRange();
    }


    return ret;





    function onWheel(e) {

        var way = e.deltaY/3,
            maxH = getTargetMaxH();
        
        pos = Math.max(0, Math.min(maxH, pos + way));

        if (deRange) {

            deRange.setValue(pos / maxH);
        }

        scroll();

    }

    function onChangeRange(e) {

        pos = getTargetMaxH() * e.detail.value;
        scroll();
    }

    function scroll() {

        deTargets.forEach(function (deT) {

            deT.style.top = -pos + 'px';
        });
    }

    function getTargetMaxH() {

        var contH = Math.max.apply(null, deConts.slice().map(getH)),
            targetH = Math.max.apply(null, deTargets.slice().map(getH));

        return targetH - contH;
    }

    function getH(de) {

        return de.getBoundingClientRect().height;
    }

    function initRange() {

        var saveDisplay = deRange.style.display,
            isShowing = false,
            refreshSetI;

        deRange.style.display = 'none';

        deRange.addEventListener('change', onChangeRange);

        refreshSetI = setInterval(function () {

            var needsRange = getTargetMaxH() > 0;

            if (isShowing !== needsRange) {

                isShowing = needsRange;

                deRange.style.display = isShowing ? saveDisplay : 'none';
            }
        }, 312); 

        var saveDispose = ret.dispose;
        ret.dispose = function dispose () {

            saveDispose();

            clearInterval(refreshSetI);

            deRange.removeEventListener('change', onChangeRange);
        };
    }

    function dispose() {

        deConts.forEach(function (deC) {

            deC.removeEventListener('wheel', onWheel);
        });
    }
}




function createRange(opt) {

    opt = opt || {};
  
    var value = 0, cursorWidth = 0, isVertical = !!opt.vertical;

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = opt.width || '6px';
    de.style.height = opt.height || '140px';
    de.style.background = amgui.color.bg1;
    de.style.cursor = 'pointer';

    var deCursor = document.createElement('div');
    deCursor.style.position = 'absolute';
    deCursor.style[d('left','top')] = '0';
    deCursor.style[d('right','bottom')] = '0';
    deCursor.style.margin = d('auto 0','0 auto');
    deCursor.style.background = amgui.color.bg3;
    deCursor.style[d('width','height')] = opt.cursorHeight || '100%';
    de.appendChild(deCursor);

    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    de.setCursorWidth = function (w) {

        deCursor.style[d('height','width')] = w + 'px';
        cursorWidth = w;
    };
    de.setCursorWidth(opt.cursorWidth || 12);   

    amgui.makeDraggable({
        deTarget: de,
        onMove: function (md, mx, my) {

            var br = de.getBoundingClientRect(),
                p = d(my, mx) - (d(br.top, br.left) + cursorWidth/2),
                fw = d(br.height, br.width) - cursorWidth,
                pos = Math.max(0, Math.min(1, p / fw));

            de.setValue(pos);
        }
    });

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
}