'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createDrawer: createDrawer,
    };
};


function createDrawer(opt) {

    opt = opt || {};

    var isOpened = false;

    var de = document.createElement('div');

    de.deHead = document.createElement('div');
    de.deHead.style.height = amgui.LINE_HEIGHT + 'px';
    de.deHead.style.display = 'flex';
    de.appendChild(de.deHead);

    de.deContent = document.createElement('div');
    de.appendChild(de.deContent);
    
    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    var toggleBtn = amgui.createToggleIconBtn({
        iconOn: 'angle-down',
        iconOff: 'angle-right',
        onClick: onToggleClick,
        parent: de.deHead,
        display: 'inline-block'
    });

    var labelTitle = amgui.createLabel({
        text: opt.text || 'drawer',
        parent: de.deHead,
        display: 'inline-block'
    });






    de.toggle = function () {

        isOpened ? de.close() : de.open();
    }

    de.open = function () {

        if (isOpened) return;
        isOpened = true;

        refreshOpen();
    }

    de.close = function () {

        if (!isOpened) return;
        isOpened = false;

        refreshOpen();
    }

    refreshOpen();
    return de;







    function onToggleClick() {
        
        de.toggle();
    }

    function refreshOpen() {

        toggleBtn.setToggle(isOpened);
        de.deContent.style.display = isOpened ? 'block' : 'none';
    }

    return inp;
}