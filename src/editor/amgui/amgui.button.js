'use strict';

var fontelloConf = require('../assets/fontello/config.json');
var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createIcon: createIcon,
        createLabel: createLabel,
        createBtn: createBtn,
        createIconBtn: createIconBtn,
        createToggleIconBtn: createToggleIconBtn,
        createLinebreak: createLinebreak,
    };
};


function createLinebreak(opt) {

    var de = document.createElement('br');
    de.innerHTML = opt.caption || 'label';
    
    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    return de;
}

function createLabel(opt) {

    var de = document.createElement('span');
    de.innerHTML = opt.caption || 'label';

    if ('fontSize' in opt) de.style.fontSize = opt.fontSize;
    if ('display' in opt) de.style.display = opt.display;
    if ('flex' in opt) de.style.flex = opt.flex;
    if ('position' in opt) de.style.position = opt.position;
    
    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    return de;
}

function createBtn(opt) {

    opt.backgroundColor = opt.backgroundColor || amgui.color.bg0;

    var de = document.createElement('div');
    de.style.height = (opt.height || 21) + 'px';
    de.style.padding = '0 15px';
    de.style.cursor = 'pointer';
    de.style.color = amgui.color.text;
    de.style.backgroundColor = opt.backgroundColor;

    de.setCaption = function (caption) {

        de.textContent = caption;
    };
    
    de.setCaption(opt.caption || 'button');

    de.addEventListener('mouseenter', onMOver);
    de.addEventListener('mouseleave', onMOut);

    function onMOver() {

        this.style.background = amgui.color.bgHover;
    }

    function onMOut() {
        
        this.style.background = opt.backgroundColor;
    }

    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    return de;
}

function createIconBtn(opt) {

    var isFixedHighlight = false;

    var de = amgui.createIcon({
        size: opt.height, 
        icon: opt.icon,
        parent: opt.parent,
        tooltip: opt.tooltip,
        display: opt.display,
    });
    de.style.width = (opt.width || 21) + 'px';
    de.style.cursor = 'pointer';
    de.style.color = 'white';
    de.style.overflow = 'hidden';

    de.addEventListener('mouseenter', onMOver);
    de.addEventListener('mouseleave', onMOut);

    if ('onClick' in opt) {
        de.addEventListener('click', opt.onClick);
    }

    function onMOver() {

        de.style.background = amgui.color.bgHover;
    }

    function onMOut() {
        
        if (isFixedHighlight) return;

        de.style.background = 'none';
    }

    de.fixHighlight = function () {

        isFixedHighlight = true;
        onMOver();
    };

    de.removeFixHighlight = function () {

        isFixedHighlight = false;
        onMOut();
    };

    return de;
}

function createToggleIconBtn(opt) {

    opt.iconOn = opt.iconOn || opt.icon;
    opt.iconOff = opt.iconOff || opt.icon;
    opt.color = opt.color || amgui.color.text;
    opt.colorInactive = opt.colorInactive || amgui.color.textInactive;

    var isOn = opt.defaultToggle || false;
    var de = amgui.createIconBtn(opt);
    setIcon();

    if ('autoToggle' in opt ? opt.autoToggle : !opt.onClick) {
        
        de.addEventListener('click', onToggleClick);
    }

    if ('onToggle' in opt) {

        de.addEventListener('toggle', opt.onToggle);
    }

    de.setToggle = function (on) {

        on = !!on;
        if (on === isOn) {
            return;
        }
        
        isOn = on;
        setIcon();

        de.dispatchEvent(new CustomEvent('toggle', {detail: {state: isOn}}));
        de.dispatchEvent(new Event(isOn ? 'toggleOn' : 'toggleOff'));
    };

    de.state = function () {

        return isOn;
    };


    function onToggleClick() {
        
        de.setToggle(!isOn);
    }

    function setIcon() {

        de.setIcon(isOn ? opt.iconOn : opt.iconOff);

        if (opt.changeColor) {
            de.style.color = isOn ? opt.color : opt.colorInactive;
        }
    }

    return de;
}

function createIcon(opt) {

    opt = opt || {};
    opt.size = opt.size || 23;
    
    var de = document.createElement('div');
    de.style.color = '#fff';
    de.style.width = opt.size + 'px';
    de.style.height = opt.size + 'px';
    de.style.lineHeight = opt.size + 'px';
    de.style.textAlign = 'center';
    de.style.fontFamily = 'amgui';
    de.style.fontSize = Math.round(opt.size * 0.72) + 'px';
    de.style.display = opt.display || 'block';

    de.setIcon = function (icon) {

        var glyph = fontelloConf.glyphs.find(function (glyph) {

            return glyph.css === icon;
        });

        var code = glyph ? glyph.code : 59407;
        de.textContent = String.fromCharCode(code);
    };

    de.setIcon(opt.icon);

    if (opt.tooltip) {
        amgui.addTooltip({
            deTarget: de,
            text: opt.tooltip
        });
    }

    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    return de;
}