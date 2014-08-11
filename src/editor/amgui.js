'use strict';

var amgui = {

    createKeyline: function (opt) {

        var timescale = opt.timescale || 0.2,
            keyframes = {};

        var de = document.createElement('div');
        de.style.width = '100%';
        de.style.height = (opt.height || 21) + 'px';
        de.style.background = opt.background || 'grey';

        de.addKeyframe = function (time) {

            var key = amgui.createKey();
            keyframes[time] = key;

            key.addEventListener('click', onSelectKey);

            de.appendChild(key);

            positionKeys();
        }

        de.setTimescale = function (ts) {

            timescale = ts;
            positionKeys();
        }

        function onSelectKey () {

            var time;

            Object.keys(keyframes).some(function (t) {

                if (keyframes[t] === this) {

                    return time = t;
                }
            }, this);

            de.dispatchEvent(new CustomEvent('selectKey', {time: time}));
        }

        function positionKeys() {

            Object.keys(keyframes).forEach(function () {

                keyframes[time].style.left = (timescale * time) + 'px';
            });
        }

        return de;
    },

    createKey: function (opt) {

        var de = document.createElement('div');
        de.style.position = 'absolute';

        var key = document.createElement('div');
        key.style.width = '0';
        key.style.height = '0';
        key.style.borderStyle = 'solid';
        key.style.borderWidth = '21px 3.5px 0 3.5px';
        key.style.borderColor = '#7700ff transparent transparent transparent';
        de.appendChild(key);

        return de;
    },

    createIconBtn: function (opt) {

        var de = document.createElement('div');
        de.style.width = (opt.width || 21) + 'px';
        de.style.height = (opt.height || 21) + 'px';
        de.style.cursor = 'pointer';
        de.style.color = 'white';
        de.className = 'icon-' + (opt.icon || 'cog');

        de.addEventListener('mouseenter', onMOver);
        de.addEventListener('mouseleave', onMOut);

        function onMOver() {

            this.style.background = 'darkgrey';
        }

        function onMOut() {
            
            this.style.background = 'none';
        }

        return de;
    },

    createToggleIconBtn: function (opt) {

        var isOn = false;
        var de = amgui.createIconBtn(opt);
        setIcon();

        de.addEventListener('click', onClick);

        de.setToggle = function (on) {

            isOn = !!on;
            setIcon();
        }

        function onClick() {
            
            isOn = !isOn
            setIcon();
        }

        function setIcon() {

            de.className = 'icon-' + (isOn ? opt.iconOn : opt.iconOff || 'cog');
        }

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
            li.style.cursor = 'pointer';
            li.style.color = 'white';
            li.style.fontFamily = 'monospace';

            li.addEventListener('click', function () {

                de.dispatchEvent(new CustomEvent('select', {selection: text}));
            });
            de.appendChild(li);
        });

        return de;
    },

    bindDropdown: function(deBtn, deDropdown) {

        var isOpened = false;

        deDropdown.style.position = 'fixed';

        deBtn.addEventListener('click', function () {

            isOpened ? close() : open();
        });
        deDropdown.addEventListener('select', close);

        function open() {

            if (isOpened) return;
            isOpened = true;

            var bcr = deBtn.getBoundingClientRect();
            deDropdown.style.left = bcr.left + 'px';
            deDropdown.style.top = bcr.bottom + 'px';

            document.body.appendChild(deDropdown);
        }

        function close() {

            if (!isOpened) return;
            isOpened = false;
            
            if (deDropdown.parentElement) {
                deDropdown.parentElement.removeChild(deDropdown);
            }
        }
    },

    createKeyValueInput: function (opt) {

        var de = document.createElement('div');

        var inpKey = createInput();

        var divider = document.createElement('span');
        divider.textContent = ':';
        divider.appendChild(inp);
        
        var inpValue = createInput();

        de.getKey = function () {
            return inpKey.value;
        };

        de.getValue = function () {
            return inpValue.value;
        };

        function onChange() {

            de.dispatchEvent(new CustomEvent({
                key: de.getKey(),
                value: de.getValue()
            }));
        }

        function createInput() {

            var inp = document.createElement('input');
            inp.type = 'text';
            inp.style.width = '123px';
            inp.style.border = 'none';
            inp.style.background = 'none';
            inp.addEventListener('change', onChange);
            $(inp).autosizeInput({space: 0});
            de.appendChild(inp);
            return inp;
        }

        return de;
    }
}


module.exports = amgui;