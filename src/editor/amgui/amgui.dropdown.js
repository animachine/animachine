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

    var items = [];

    de.addItem = function (optItem) {

        if (typeof(optItem) === 'string') {

            optItem = {text: optItem};
        }

        var li = document.createElement('li');
        li.style.textAlign = 'left';
        li.style.fontFamily = amgui.FONT_FAMILY;
        li.style.fontSize = '14px';
        li.style.padding = '0 3px';
        li.style.cursor = 'pointer';
        li.style.background = amgui.color.overlayInverse;

        optItem.label = amgui.createLabel({
            text: optItem.text,
            icon: optItem.icon,
            parent: li,
            color: amgui.color.textInverse,
        });

        li.addEventListener('click', function (e) {

            e.stopPropagation();

            if (optItem.onSelect) optItem.onSelect();//deprecated
            if (optItem.onClick) optItem.onClick();

            de.dispatchEvent(new CustomEvent('select', {detail: {selection: optItem.text}}));
        });
        de.appendChild(li);

        var onEnter = () => li.style.background = amgui.color.bgInverse,
            onLeave = () => li.style.background = amgui.color.overlayInverse;

        li.addEventListener('mouseenter', onEnter);
        li.addEventListener('mouseleave', onLeave);
        li.addEventListener('mouseclick', onLeave);

        items.push(li);

        if (optItem.children) {

            bindDropdown({
                deTarget: li,
                deDropdown: createDropdown(optItem.children),
            });
        }

        return li;
    };

    de.removeItem = function (li) {

        var idx = items.indexOf(li);
        if (idx === -1) return;
        items.splice(idx, 1);

        if (li.parentNode) {

            li.parentNode.removeChild(li);
        }
    };

    de.setItems = function (newItems) {

        while (items.length) de.removeItem(items[0]);
        
        newItems.forEach(optItem => de.addItem(optItem));
    };

    if (opt.options) {

        de.setItems(opt.options)
    };

    if (opt.onSelect) {

        de.addEventListener('select', opt.onSelect);
    }

    return de;
}

function bindDropdown(opt) {

    var isOpened = false;
    var deBtn = opt.deTarget;
    var deDropdown = opt.deDropdown || opt.deMenu;

    if (opt.asContextMenu) {

        deBtn.addEventListener('contextmenu', function (e) {

            // e.stopPropagation();
            e.preventDefault();
            if (!isOpened) open(e);
        });
    }
    else {
        
        deBtn.addEventListener('click', function (e) {

            // e.stopPropagation();
            if (!isOpened) open(e);
        });
    }

    

    return {
        setDropdown: function (dd) {

            deDropdown = dd;
        }
    }

    function open(e) {

        if (opt.onOpening && opt.onOpening(e) === false) {   
            return;
        }

        if (isOpened) return;
        isOpened = true;

        var deCont = opt.menuParent || amgui.deOverlayCont || deBtn;

        deDropdown.style.position = 'fixed';
        deDropdown.style.pointerEvents = 'auto';
        deCont.appendChild(deDropdown);
        
        amgui.placeToPoint(deDropdown, e.clientX, e.clientY, opt.side);

        deDropdown.addEventListener('select', close);
        setTimeout(() => {
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
        deDropdown.removeEventListener('select', close);
        window.removeEventListener('click', close);
        window.removeEventListener('contextmenu', close);
    }
};