'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createKeyline: createKeyline,
        createKey: createKey
    };
};


function createKeyline(opt) {

    var deKeys = [];

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = (opt.height || 21) + 'px';
    de.style.background = opt.background || 'grey';
    de.style.position = 'relative';

    var svgEase = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgEase.style.width = '100%';
    svgEase.style.height = '100%';
    svgEase.style.fill = 'none';
    svgEase.style.stroke = 'white';
    svgEase.style.position = 'absolute';
    de.appendChild(svgEase);

    amgui.callOnAdded(de, renderEase);

    de.addKey = function (opt) {

        var deKey = amgui.createKey(opt);
        deKeys.push(deKey);

        de.appendChild(deKey);

        deKey.addEventListener('change', renderEase);
        deKey.addEventListener('remove', onKeyRemove);
        renderEase();

        return deKey;
    };

    function sortKeys() {

        deKeys.sort(function (a, b) {
        
            return a.offsetLeft - b.offsetLeft;
        });
    }

    function onKeyRemove () {

        var deKey = this,
            idx = deKeys.indexOf(deKey);

        if (idx === -1) {
            return;
        }

        deKeys.splice(idx, 1);
        
        deKey.removeEventListener('change', renderEase);
        deKey.removeEventListener('remove', onKeyRemove);

        if (deKey.parentNode) {
            deKey.parentNode.removeChild(deKey);
        }

        renderEase();
    }

    function renderEase() {

        sortKeys();

        svgEase.innerHTML = '';

        deKeys.forEach(function (deKey, idx) {

            if (idx === deKeys.length-1) {
                return;
            }

            var ease = deKey.ease;

            if (amgui.EASE2BEZIER.hasOwnProperty(ease)) {
                ease = amgui.EASE2BEZIER[ease];
            }

            var rx = /cubic-bezier\(\s*([\d\.]+)\s*,\s*([\d\.-]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.-]+)\s*\)/,
                m = rx.exec(ease),
                x = deKey.offsetLeft,
                w = deKeys[idx+1].offsetLeft - x,
                h = de.offsetHeight,
                path = document.createElementNS('http://www.w3.org/2000/svg', 'path'),
                d = '';

            if (m) {
                d += 'M' + x + ',' + h + ' ';
                d += 'C' + (x + w*m[1]) + ',' + (h - h*m[2]) + ' ';
                d += (x + w*m[3]) + ',' + (h - h*m[4]) + ' ';
                d += (x + w) + ',' + 0;
            }
            else {
                return;
                //TODO steps()
                // d += 'M' + x + ',' + h + ' ';
                // d += 'L' + (x + w) + ',0';
            }

            path.setAttribute('d', d);
            svgEase.appendChild(path);
        });
    }

    return de;
}

function createKey(opt) {

    opt = opt || {};

    opt.color = opt.color || '#7700ff';

    var isUserSelected = false,
        time = opt.time || 0, 
        timescale = opt.timescale || 1;

    var de = document.createElement('div');
    de.style.position = 'absolute';
    de.style.transform = 'translateX(-4px)';

    var key = document.createElement('div');
    key.style.width = '0';
    key.style.height = '0';
    key.style.borderStyle = 'solid';
    key.style.borderWidth = '21px 4px 0 4px';
    key.style.borderColor = opt.color + ' transparent transparent transparent';
    de.appendChild(key);

    amgui.makeDraggable({
        deTarget: de,
        onDown: function (e) {

            if (!e.shiftKey && !e.ctrlKey) {
                amgui.emit('deselectAllKeys');
            }

            if (e.ctrlKey) {
                toggleUserSelected();
            }
            else {
                userSelect(true);
            }
            
            return {
                dragged: 0,
            };
        },
        onMove: function (md, mx) {

            var diff = mx - md.mx,
                diffTime = (diff / timescale) - md.dragged;
                
            md.dragged += diffTime;

            amgui.emit('translateSelectedKeys', diffTime);
        }
    });

    amgui.on('deselectAllKeys', onDeselectAllKeys);
    amgui.on('translateSelectedKeys', onTranslateSelectedKeys);

    de.setTime = function(t) {

        if (time === t) return;

        time = t;
        setLeft();
        de.dispatchEvent(new Event('change'));

        de.dispatchEvent(new CustomEvent('changeTime', {detail: {time: time}}));
    };
    de.setTimescale = function(ts) {

        if (timescale === ts) return;

        timescale = ts;
        setLeft();
        de.dispatchEvent(new Event('change'));
    };

    de.setEase = function(ease) {

        if (de.ease === ease) {
            return;
        }   

        de.ease = ease;

        de.dispatchEvent(new Event('change'));
    };

    de.remove = function() {

        amgui.removeListener('deselectAllKeys', onDeselectAllKeys);
        amgui.removeListener('translateSelectedKeys', onTranslateSelectedKeys);

        de.dispatchEvent(new Event('remove'));
    };

    setLeft();
    de.setEase(opt.ease);

    return de;

    ///////////////////////////////////////////////////////


    function setLeft() {

        de.style.left = (time * timescale) + 'px';
    }

    function toggleUserSelected() {

        userSelect(!isUserSelected);
    }

    function userSelect(on) {

        isUserSelected = on;
        de.style.background = isUserSelected ? 'white' : 'none';
    }

    function onDeselectAllKeys() {

        userSelect(false);
    }

    function onTranslateSelectedKeys(offset) {

        if (isUserSelected) {

            de.setTime(time + offset);
        }
    }
}