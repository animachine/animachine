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

    var de = amgui.createDiv(opt);

    de.style.height = opt.height || amgui.LINE_HEIGHT + 'px';
    de.style.fontSize = opt.fontSize || amgui.FONT_SIZE;
    de.style.display = opt.display || 'inline-block';
    if ('flex' in opt) de.style.flex = opt.flex;
    if ('position' in opt) de.style.position = opt.position;
    if ('color' in opt) de.style.color = opt.color;

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

    var de = amgui.createDiv(opt);
    de.style.height = (opt.height || amgui.LINE_HEIGHT) + 'px';
    de.style.padding = '0 15px';
    de.style.cursor = 'pointer';
    de.style.color = amgui.color.text;
    de.style.backgroundColor = opt.backgroundColor;

    Object.defineProperties(de, {

        text: {
            set: function (v) {

                de.textContent = v;
            },
            get: function () {

                return de.textContent;
            }
        } 
    });
    
    de.text = opt.text || opt.caption || 'button';

    behaviorBtn(de, opt);

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

    behaviorBtn(de, opt);

    return de;
}

function behaviorBtn(de, opt) {

    var _inactive = false,
        _fixedHighlight = false,
        _mouseOver = false,
        background = opt.background || 'none',
        backgroundHover = opt.backgroundHover || amgui.color.bgHover;

    de.addEventListener('mouseenter', onMOver);
    de.addEventListener('mouseleave', onMOut);

    if ('onClick' in opt) {
        de.addEventListener('click', opt.onClick);
    }

    Object.defineProperties(de, {

        inactive: {
            set: function () {

                v = !!v;
                if (_inactive === v) return;

                _inactive = v;
                refreshDe();
            },
            get: function () {

                return _inactive;
            }
        },
        fixedHighlight: {
            set: function () {

                v = !!v;
                if (_fixedHighlight === v) return;

                _fixedHighlight = v;
                refreshDe();
            },
            get: function () {

                return _fixedHighlight;
            }
        },
    });

    refreshDe();

    function onMOver() {

        _mouseOver = true;
        refreshDe();
    }

    function onMOut() {

        _mouseOver = false;
        refreshDe();
    }

    function refreshDe() {

        de.style.opacity = _inactive ? .43 : 1;
        de.style.pointerEvents = _inactive ? 'none' : 'auto';
        de.style.background = (_mouseOver || _fixedHighlight) ? backgroundHover : background;
    }
}

function createToggleIconBtn(opt) {

    opt.iconOn = opt.iconOn || opt.icon;
    opt.iconOff = opt.iconOff || opt.icon;
    opt.onColor = opt.onColor || opt.color || amgui.color.text;
    opt.offColor = opt.offColor || opt.color || amgui.color.textInactive;

    var isOn = opt.defaultToggle || false;
    var de = amgui.createIconBtn(opt);
    setIcon();

    if ('autoToggle' in opt ? opt.autoToggle : !opt.onClick) {
        
        de.addEventListener('click', onToggleClick);
    }

    if ('onToggle' in opt) {

        de.addEventListener('toggle', opt.onToggle);
    }

    if ('onClick' in opt) {

        de.addEventListener('click', opt.onClick);
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
            de.style.color = isOn ? opt.onColor : opt.offColor;
        }
    }

    return de;
}

function createIcon(opt) {

    opt = opt || {};
    opt.size = opt.size || opt.height || amgui.LINE_HEIGHT;
    
    var de = amgui.createDiv();
    de.style.color = opt.color || amgui.color.text;
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