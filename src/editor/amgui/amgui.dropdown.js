'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createDropdown: createDropdown,
        bindDropdown: bindDropdown,
    };
};



function createDropdown(opt) {

    var options = opt.options || [];

    var de = document.createElement('ul');
    de.style.listStyleType = 'none';
    de.style.margin = 0;
    de.style.padding = 0;

    options.forEach(function (opt) {

        if (typeof(opt) === 'string') {

            opt = {text: opt};
        }

        var li = document.createElement('li');
        li.textContent = opt.text;
        li.style.textAlign = 'left';
        li.style.fontFamily = amgui.FONT_FAMILY;
        li.style.fontSize = '14px';
        li.style.padding = '0 3px';
        li.style.cursor = 'pointer';
        li.style.color = amgui.color.text;
        li.style.background = amgui.color.bg2;

        li.addEventListener('click', function (e) {

            e.stopPropagation();

            if (opt.onSelect) {
                opt.onSelect();
            }

            de.dispatchEvent(new CustomEvent('select', {detail: {selection: opt.text}}));
        });
        de.appendChild(li);
    });

    if (opt.onSelect) {

        de.addEventListener('select', opt.onSelect);
    }

    return de;
}

function bindDropdown(opt) {

    var isOpened = false;
    var deBtn = opt.deTarget;
    var deDropdown = opt.deMenu;

    if (opt.asContextMenu) {

        deBtn.addEventListener('contextmenu', function (e) {

            e.stopPropagation();
            e.preventDefault();
            isOpened ? close(e) : open(e);
        });
    }
    else {
        
        deBtn.addEventListener('click', function (e) {

            e.stopPropagation();
            isOpened ? close(e) : open(e);
        });
    }

    deDropdown.style.position = 'fixed';
    deDropdown.style.pointerEvents = 'auto';
    
    deDropdown.addEventListener('select', close);

    function open(e) {

        if (isOpened) return;
        isOpened = true;

        
        amgui.placeToPoint(deDropdown, e.clientX, e.clientY, opt.side);

        var deCont = opt.menuParent || amgui.deOverlayCont || deBtn;

        deCont.appendChild(deDropdown);
        window.addEventListener('click', close);
    }

    function close() {

        if (!isOpened) return;
        isOpened = false;
        
        if (deDropdown.parentElement) {
            deDropdown.parentElement.removeChild(deDropdown);
        }
        window.removeEventListener('click', close);
    }
}