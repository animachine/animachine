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

    var de = amgui.createDiv();

    de.style.height = opt.height || amgui.LINE_HEIGHT + 'px';
    de.style.fontSize = opt.fontSize || amgui.FONT_SIZE;
    de.style.display = opt.display || 'inline-block';
    if ('flex' in opt) de.style.flex = opt.flex;
    if ('position' in opt) de.style.position = opt.position;

    de.setText = function (text) {
        de.innerHTML = text || '';
    }

    opt.text = opt.text || opt.caption;//TODO: change caption sets to text
    de.setText(opt.text);
    
    if (opt.parent) {
        opt.parent.appendChild(de);
    }

    return de;
}

function createBtn(opt) {

    opt.backgroundColor = opt.backgroundColor || amgui.color.bg0;

    var de = amgui.createDiv();
    de.style.height = (opt.height || amgui.LINE_HEIGHT) + 'px';
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

    var de = amgui.createIcon(opt);
    de.style.cursor = 'pointer';
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
    opt.size = opt.size || opt.height || amgui.LINE_HEIGHT;
    
    var de = amgui.createDiv();
    de.style.color = amgui.color.text;
    de.style.width = (opt.width || opt.size) + 'px';
    de.style.height = (opt.height || opt.size) + 'px';
    de.style.lineHeight = opt.size + 'px';
    de.style.textAlign = 'center';
    de.style.fontFamily = 'amgui';
    de.style.fontSize = Math.round(opt.size * 0.72) + 'px';
    de.style.display = opt.display || 'block';

    var textNode = document.createTextNode('');
    de.appendChild(textNode);

    de.setIcon = function (icon) {

        var glyph = fontelloConf.glyphs.find(function (glyph) {

            return glyph.css === icon;
        });

        var code = glyph ? glyph.code : 59407;
        textNode.textContent = String.fromCharCode(code);
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