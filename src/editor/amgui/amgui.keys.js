'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createKeyline: createKeyline,
        createKey: createKey
    }
};


function createKeyline(opt) {

    var timescale = opt.timescale || 0.2,
        keys = [];

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = (opt.height || 21) + 'px';
    de.style.background = opt.background || 'grey';
    de.style.position = 'relative';

    de.addKey = function (opt) {

        var key = amgui.createKey(opt);
        keys.push(key);

        de.appendChild(key);

        return key;
    }

    return de;
}

function createKey(opt) {

    var isUserSelected = false, 
        mdx, mDragged,
        time = opt.time || 0, 
        timescale = opt.timescale || 1;

    var de = document.createElement('div');
    de.style.position = 'absolute';

    var key = document.createElement('div');
    key.style.width = '0';
    key.style.height = '0';
    key.style.borderStyle = 'solid';
    key.style.borderWidth = '21px 4px 0 4px';
    key.style.borderColor = '#7700ff transparent transparent transparent';
    de.appendChild(key);

    setLeft();
    //TODO use amgui.makeDraggable
    de.addEventListener('mousedown', function (e) {

        if (e.button !== 0) {

            return;
        }

        e.stopPropagation();
        e.preventDefault();

        mdx = e.pageX;
        mDragged = 0;

        if (!e.shiftKey && !e.ctrlKey) {
            amgui.emit('deselectAllKeys');
        }

        if (e.ctrlKey) {
            toggleUserSelected();
        }
        else {
            userSelect(true);
        }

        window.addEventListener('mousemove', drag);
        window.addEventListener('mouseup', dragEnd);
        window.addEventListener('mouseleave', dragEnd);

    });

    de.setTime = function(t) {

        if (time === t) return;

        time = t;
        setLeft();

        de.dispatchEvent(new CustomEvent('changeTime', {detail: {time: time}}));
    };

    de.setTimescale = function(ts) {

        if (timescale === ts) return;

        timescale = ts;
        setLeft();
    };

    amgui.on('deselectAllKeys', userSelect.bind(null, false));

    amgui.on('translateSelectedKeys', function (offset) {

        if (isUserSelected) {

            de.setTime(time + offset);
        }
    });

    return de;

    ///////////////////////////////////////////////////////

    function drag(e) {

        var diff = e.pageX - mdx,
            diffTime = (diff / timescale) - mDragged;

        mDragged += diffTime;

        amgui.emit('translateSelectedKeys', diffTime)
    }

    function dragEnd() {
        
        window.removeEventListener('mousemove', drag);
        window.removeEventListener('mouseup', dragEnd);
        window.removeEventListener('mouseleave', dragEnd);
    }

    function setLeft() {

        de.style.left = ((time * timescale) - 4) + 'px';
    }

    function toggleUserSelected() {

        userSelect(!isUserSelected);
    }

    function userSelect(on) {

        isUserSelected = on;
        de.style.background = isUserSelected ? 'white' : 'none';
    }
}