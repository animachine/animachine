'use strict';

var EventEmitter = require('events').EventEmitter;
var fontelloConf = require('../assets/fontello/config.json');

WebFont.load({
    google: {
      families: ['Open Sans']
    }
});

var amgui = _.extend(
    new EventEmitter, 
    require('./amgui.bezierEditor'),
    {

    FONT_FAMILY: '"Open Sans", sans-serif',
    FONT_SIZE: '15px',

    color: {
        bg0: '#000',
        bg1: '#222',
        bg2: '#444',
        bg3: '#666',
        text: '#efe',
        overlay: 'rgba(0,0,0,.785)'
    },

    createKeyline: function (opt) {

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
    },

    createKey: function (opt) {

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
    },

    createDialog: function (opt) {

        var de = document.createElement('dialog');
        document.body.appendChild(de);

        de.style.background = 'none';
        de.style.border = 'none';
        de.style.fontFamily = amgui.FONT_FAMILY;


        var deTitle = document.createElement('div');
        deTitle.style.display = 'inline-block';
        deTitle.style.padding = '0 3px';
        deTitle.style.height = '34px';
        deTitle.style.fontSize = '23px';
        deTitle.style.background = amgui.color.overlay;
        deTitle.style.color = amgui.color.text;
        de.appendChild(deTitle);

        var titleEnd = document.createElement('div');
        titleEnd.style.display = 'inline-block';
        titleEnd.style.width = '0';
        titleEnd.style.height = '0';
        titleEnd.style.verticalAlign = 'bottom';
        titleEnd.style.borderStyle = 'solid';
        titleEnd.style.borderWidth = '34px 0 0 8px';
        titleEnd.style.borderColor = 'transparent transparent transparent ' + amgui.color.overlay;;
        de.appendChild(titleEnd);

        

        var contentCont = document.createElement('div');
        contentCont.style.background = amgui.color.overlay;
        de.appendChild(contentCont);

        var buttonsCont = document.createElement('div');
        buttonsCont.style.background = amgui.color.overlay;
        buttonsCont.style.display = 'inline-block';
        buttonsCont.style.float = 'right';
        de.appendChild(buttonsCont);


        de.setTitle = function (title) {

            deTitle.textContent = title || 'Dialog';
        };

        de.setContent = function (content) {

            if (!content) {
                return;
            }

            contentCont.innerHTML = '';
            contentCont.appendChild(content);
        };

        de.setButtons = function (buttons) {

            if (!buttons) {
                return
            }

            buttonsCont.innerHTML = '';

            buttons.forEach(function (caption) {

                var btn = amgui.createBtn({caption: caption});
                btn.style.display = 'inline-block';
                buttonsCont.appendChild(btn);

                btn.addEventListener('click', function () {
                    de.dispatchEvent(new Event('click_' + caption.toLowerCase()));
                });
            });
        };

        de.setTitle(opt.title);
        de.setContent(opt.content);
        de.setButtons(opt.buttons);

        var buttonsEnd = document.createElement('div');
        buttonsEnd.style.display = 'inline-block';
        buttonsEnd.style.float = 'right';
        buttonsEnd.style.width = '0';
        buttonsEnd.style.height = '0';
        buttonsEnd.style.verticalAlign = 'top';
        buttonsEnd.style.borderStyle = 'solid';
        buttonsEnd.style.borderWidth = '0 6px 21px 0';
        buttonsEnd.style.borderColor = 'transparent '+amgui.color.bg0+' transparent transparent';
        de.appendChild(buttonsEnd);

        return de;
    },

    createBtn: function (opt) {

        opt.backgroundColor = opt.backgroundColor || amgui.color.bg0;

        var de = document.createElement('div');
        de.style.height = (opt.height || 21) + 'px';
        de.style.padding = '0 15px';
        de.style.cursor = 'pointer';
        de.style.color = amgui.color.text;
        de.style.backgroundColor = opt.backgroundColor;

        de.setCaption = function (caption) {

            de.textContent = caption;
        }
        
        de.setCaption(opt.caption || 'button');

        de.addEventListener('mouseenter', onMOver);
        de.addEventListener('mouseleave', onMOut);

        function onMOver() {

            this.style.background = 'darkgrey';
        }

        function onMOut() {
            
            this.style.background = opt.backgroundColor;
        }

        if (opt.parent) {
            opt.parent.appendChild(de);
        }

        return de;
    },

    createIconBtn: function (opt) {

        var de = amgui.createIcon({size: opt.height, icon: opt.icon});
        de.style.width = (opt.width || 21) + 'px';
        de.style.cursor = 'pointer';
        de.style.color = 'white';
        de.style.overflow = 'hidden';
        de.style.display = opt.display || 'block';

        de.addEventListener('mouseenter', onMOver);
        de.addEventListener('mouseleave', onMOut);

        if (opt.onClick) {

            de.addEventListener('click', opt.onClick);
        }

        function onMOver() {

            this.style.background = 'rgba(255,255,255,0.12)';
        }

        function onMOut() {
            
            this.style.background = 'none';
        }

        if (opt.parent) {
            opt.parent.appendChild(de);
        }

        return de;
    },

    createToggleIconBtn: function (opt) {

        var isOn = false;
        var de = amgui.createIconBtn(opt);
        setIcon();

        de.addEventListener('click', onClick);

        de.setToggle = function (on) {

            on = !!on;
            if (on === isOn) {
                return;
            }
            isOn = on;
            setIcon();

            de.dispatchEvent(new CustomEvent('toggle', {detail: {state: isOn}}));
            de.dispatchEvent(new CustomEvent(isOn ? 'toggleOn' : 'toggleOff'));
        };

        de.state = function () {

            return isOn;
        }

        function onClick() {
            
            de.setToggle(!isOn);
        }

        function setIcon() {

            de.setIcon(isOn ? opt.iconOn : opt.iconOff);
        }

        return de;
    },

    createIcon: function (opt) {

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

        de.setIcon = function (icon) {

            var glyph = fontelloConf.glyphs.find(function (glyph) {

                return glyph.css === icon
            });

            var code = glyph ? glyph.code : 59407;
            de.textContent = String.fromCharCode(code);
        };

        de.setIcon(opt.icon);

        return de;
    },  

    createDropdown: function (opt) {

        var options = opt.options || [];

        var de = document.createElement('ul');
        de.style.listStyleType = 'none';
        de.style.margin = 0;
        de.style.padding = 0;

        options.forEach(function (text) {

            var li = document.createElement('li');
            li.textContent = text;
            li.style.textAlign = 'left';
            li.style.fontFamily = amgui.FONT_FAMILY;
            li.style.fontSize = '14px';
            li.style.padding = '0 3px';
            li.style.cursor = 'pointer';
            li.style.color = amgui.color.text;
            li.style.background = amgui.color.bg2;

            li.addEventListener('click', function (e) {

                e.stopPropagation();

                de.dispatchEvent(new CustomEvent('select', {detail: {selection: text}}));
            });
            de.appendChild(li);
        });

        if (opt.onSelect) {

            de.addEventListener('select', opt.onSelect);
        }

        return de;
    },

    bindDropdown: function(opt) {

        var isOpened = false;
        var deBtn = opt.deTarget;
        var deDropdown = opt.deMenu;

        if (opt.asContextMenu) {

            deBtn.addEventListener('contextmenu', function (e) {

                e.stopPropagation();
                e.preventDefault();
                isOpened ? close() : open();
            });
        }
        else {
            
            deBtn.addEventListener('click', function (e) {

                e.stopPropagation();
                isOpened ? close() : open();
            });
        }

        deDropdown.style.position = 'fixed';
        
        deDropdown.addEventListener('select', close);

        function open() {

            if (isOpened) return;
            isOpened = true;

            var bcr = deBtn.getBoundingClientRect();
            deDropdown.style.left = bcr.left + 'px';
            deDropdown.style.top = bcr.bottom + 'px';

            document.body.appendChild(deDropdown);
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
    },

    addTooltip: function (opt) {

        var showSetT, delay = 1200, mx = 0, my = 0;

        var de = document.createElement('div');
        de.textContent = opt.text;
        de.style.position = 'absolute';
        de.style.padding = '12px';
        de.style.background = amgui.color.overlay;

        opt.deTarget.addEventListener('mouseenter', onMEnter);
        opt.deTarget.addEventListener('mouseleave', onMLeave);

        function onMEnter(e) {

            opt.deTarget.addEventListener('mousemove', onMMove);
            onMMove(e);
        }

        function onMLeave(e) {

            opt.deTarget.removeEventListener('mousemove', onMMove);
            hide();
            clearShowSetT();
        }

        function onMMove(e) {

            hide();
            refreshShowSetT();
            mx = e.pageX;
            my = e.pageY;
        }

        function refreshShowSetT() {

            clearShowSetT();
            showSetT = setTimeout(show, delay);
        }

        function clearShowSetT() {

            clearTimeout(showSetT);
        }

        function show() {

            document.body.appendChild(de);
            amgui.placeToPoint(de, mx, my, opt.side);
        }

        function hide() {

            if (de.parentElement) {
                de.parentElement.removeChild(de);
            }
        }
    },

    createKeyValueInput: function (opt) {

        opt = opt || {};

        var de = document.createElement('div');
        de.style.margin = '0 1px';

        var keyOn = false;

        var oldKey, oldValue;

        var inpKey = createInput('parameter name');
        inpKey.addEventListener('keypress', onKeyPress);

        var divider = createDivider();

        var inpValue = createInput('value');
        // inpValue.style.color = 'lightblue';
        inpValue.style.textAlign = 'right';
        inpValue.style.right = '0px';

        showHideValue(keyOn);

        de.getKey = function () {
            return inpKey.value;
        };

        de.setKey = function (v) {
            
            if (v === oldKey) return;
            
            oldKey = v;
            inpKey.value = v;
            checkKeyOn();
        };

        de.getValue = function () {
            return inpValue.value;
        };

        de.setValue = function (v) {
            
            if (v === oldValue) return;

            oldValue = v;
            inpValue.value = v;
        };

        if (opt.parent) {
            opt.parent.appendChild(de);
        }

        if (opt.key) {
            de.setKey(opt.key);
        }

        if (opt.value) {
            de.setValue(opt.value);
        }

        if (opt.onChange) {
            de.addEventListener('change', opt.onChange);
        }

        function onChange(e) {

            e.preventDefault();
            e.stopPropagation();
            
            checkKeyOn();

            var detail = {};
            
            if (de.getKey() !== oldKey) {
                oldKey = detail.key = de.getKey();
            }
            if (de.getValue() !== oldValue) {
                oldValue = detail.value = de.getValue();
            }

            if ('value' in detail || 'key' in detail) {

                de.dispatchEvent(new CustomEvent('change', {detail: detail}));
            }
        }

        function onKeyPress(e) {
            
            if (e.keyCode === 13) {
                
                e.preventDefault();
                e.stopPropagation();

                inpValue.focus();
            }
        }

        function checkKeyOn() {

            var on = !!inpKey.value;

            if (on !== keyOn) {
                
                keyOn = on;
                showHideValue(keyOn);
            }
        }

        function showHideValue(show) {
            
            divider.style.display = show ? 'inline' : 'none';
            inpValue.style.display = show ? 'inline-block' : 'none';
            inpKey.style.width = show ? 'calc(50% - 5px)' : '100%';
        }

        function createInput(placeholder) {

            var inp = document.createElement('input');
            inp.type = 'text';
            inp.placeholder = placeholder;
            inp.style.width = '50%';
            inp.style.height = '100%';
            inp.style.fontSize = amgui.FONT_SIZE;
            inp.style.fontFamily = amgui.FONT_FAMILY;
            inp.style.border = 'none';
            inp.style.color = 'white';
            inp.style.background = 'none';
            inp.addEventListener('change', onChange);
            inp.addEventListener('keyup', onChange);
            // $(inp).autosizeInput({space: 0});
            de.appendChild(inp);
            return inp;
        }

        function createDivider () {

            var divider = document.createElement('span');
            divider.textContent = ':';
            divider.style.color = 'white';
            divider.style.width = '2px';
            divider.style.fontSize = amgui.FONT_SIZE;
            divider.style.fontFamily = amgui.FONT_FAMILY;
            de.appendChild(divider);

            return divider;
        }

        return de;
    },

    placeToPoint: function (de, mx, my, way) {

        var px = 0, py = 0,
            br = de.getBoundingClientRect(),
            w = br.width,
            h = br.height,
            ww = window.innerWidth,
            wh = window.innerHeight;

        way = way || 'left';

        switch (way) {

            case 'top':
                px = mx - (w / 2);
                py = my - h;
                break;

            case 'right':
                px = mx;
                py = my - (h / 2);
                break;

            case 'bottom':
                px = mx - (w / 2);
                py = my;
                break;

            case 'left':
                px = mx - w;
                py = my - (h / 2);
                break;
        }

        if (py < 0) py = 0;
        if (px + w > ww) px -= (px + w) - ww;
        if (py + h > wh) py -= (py + h) - wh;
        if (px < 0) px = 0;

        de.style.top = px + 'px';
        de.style.height = py + 'px';
    },

    callOnAdded: function (de, cb, thisArg) {

        var setI = setInterval(function () {

            if (check(de)) {

                clearInterval(setI);

                cb.call(thisArg);
            }
            
        }, 234);
        
        function check (node) {

            while (node.parentNode) {

                node = node.parentNode;
                
                if (node.nodeType === 9 || node.nodeType === 11) {

                    return true;
                }
            }
        }
    }
});


amgui.setMaxListeners(0);

module.exports = amgui;