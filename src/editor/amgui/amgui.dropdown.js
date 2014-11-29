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

    opt = opt || {};

    var de = document.createElement('ul');
    de.style.listStyleType = 'none';
    de.style.margin = 0;
    de.style.padding = 0;

    de.addItem = function (optItem) {

        if (typeof(optItem) === 'string') {

            optItem = {text: optItem};
        }

        var li = document.createElement('li');
        li.textContent = optItem.text;
        li.style.textAlign = 'left';
        li.style.fontFamily = amgui.FONT_FAMILY;
        li.style.fontSize = '14px';
        li.style.padding = '0 3px';
        li.style.cursor = 'pointer';
        li.style.color = amgui.color.text;
        li.style.background = amgui.color.bg2;

        li.addEventListener('click', function (e) {

            e.stopPropagation();

            if (optItem.onSelect) {
                optItem.onSelect();
            }

            de.dispatchEvent(new CustomEvent('select', {detail: {selection: optItem.text}}));
        });
        de.appendChild(li);

        return li;
    }

    de.removeItem = function (li) {

        if (li.parentNode) {

            li.parentNode.removeChild(li);
        }
    }

    if (opt.options) {

        opt.options.forEach(function (optItem) {

           de.addItem(optItem);
        });
    }

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

            // e.stopPropagation();
            e.preventDefault();
            isOpened ? close(e) : open(e);
        });
    }
    else {
        
        deBtn.addEventListener('click', function (e) {

            // e.stopPropagation();
            isOpened ? close(e) : open(e);
        });
    }

    deDropdown.style.position = 'fixed';
    deDropdown.style.pointerEvents = 'auto';
    
    deDropdown.addEventListener('select', close);

    function open(e) {

        if (isOpened) return;
        isOpened = true;

        var deCont = opt.menuParent || amgui.deOverlayCont || deBtn;

        deCont.appendChild(deDropdown);
        
        amgui.placeToPoint(deDropdown, e.clientX, e.clientY, opt.side);

        setTimeout(function () {
            window.addEventListener('click', close);
            window.addEventListener('contextmenu', close);
        });
    }

    function close(e) {

        if (!isOpened) return;
        isOpened = false;

        if (deDropdown.parentElement) {
            deDropdown.parentElement.removeChild(deDropdown);
        }
        window.removeEventListener('click', close);
        window.removeEventListener('contextmenu', close);
    }
}