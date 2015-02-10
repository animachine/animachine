'use strict';

var EventEmitter = require('eventman');
var fontelloConf = require('../assets/fontello/config.json');

var amgui = window.amgui = new EventEmitter();

WebFont.load({
    google: {
      families: ['Open+Sans:300,400,600,700,800:latin,latin-ext']
    },
    custom: {
        families: ['amgui'],
        // urls: ['../assets/fontello/amgui.css'],
    },
    fontactive: (() => {

        var variants = [
            'amgui:n4',
            'Open Sans:n3',
            'Open Sans:n4',
            'Open Sans:n6',
            'Open Sans:n7',
            'Open Sans:n8'
        ];

        return (familyName, fvd) => {

            var variant = familyName + ':' + fvd;

            if (variants.indexOf(variant) !== -1) {

                variants.splice(variants.indexOf(variant), 1);

                if (variants.length === 0) {

                    amgui.flag('fontLoaded');
                    amgui.emit('fontLoaded');
                }
            }
        };

    })(),
});

_.extend(amgui,
    require('./amgui.bezierEditor')(amgui),
    require('./amgui.breadcrumbs')(amgui),
    require('./amgui.button')(amgui),
    require('./amgui.checkbox')(amgui),
    require('./amgui.cursor')(amgui),
    require('./amgui.dialog')(amgui),
    require('./amgui.drawer')(amgui),
    require('./amgui.dropdown')(amgui),
    require('./amgui.input')(amgui),
    require('./amgui.keyValueInput')(amgui),
    require('./amgui.makeDraggable')(amgui),
    require('./amgui.scroll')(amgui),
    require('./amgui.stepperKey')(amgui),
    require('./amgui.tooltip')(amgui),
    require('./amgui.utils')(amgui),
    {

        FONT_FAMILY: '"Open Sans", sans-serif',
        FONT_SIZE: '12px',
        LINE_HEIGHT: 16,

        deOverlayCont: undefined, //am._init() fill this

        color: {
            bg0: '#000',
            bg1: '#222',
            bg2: '#444',
            bg3: '#666',
            bgInverse: '#eee',
            text: '#eee',
            textInverse: '#000',
            textInactive: 'rgba(255,255,255,.23)',
            overlay: 'rgba(0,0,0,.785)',
            overlayInverse: 'rgba(222,232,222,.785)',
            bgHover: 'rgba(255,255,255,0.12)',
            selected: '#01FF70',
            transparent: 'rgba(0,0,0,0)',
            //https://github.com/mrmrs/colors
            aqua: "#7FDBFF",
            blue: "#0074D9",
            lime: "#01FF70",
            navy: "#001F3F",
            teal: "#39CCCC",
            olive: "#3D9970",
            green: "#2ECC40",
            red: "#FF4136",
            maroon: "#85144B",
            orange: "#FF851B",
            purple: "#B10DC9",
            yellow: "#FFDC00",
            fuchsia: "#F012BE",
            gray: "#aaa",
            white: "#fff",
            black: "#111",
            silver: "#ddd",
        },

        getStyleSheet: function () {

            var style = document.createElement('style');

            style.innerHTML = `a{color: ${amgui.color.aqua};}`;

            return style;
        },

        createDiv: function (opt) {

            var de = document.createElement('div');
            de.style.webkitUserSelect = 'none';
            de.style.mozUserSelect = 'none';
            de.style.msUserSelect = 'none';
            de.style.userSelect = 'none';

            if (typeof(opt) === 'object') {

                if ('display' in opt) de.style.display = opt.display;
                if ('flex' in opt) de.style.flex = opt.flex;
                if ('position' in opt) de.style.position = opt.position;
                if ('parent' in opt)  opt.parent.appendChild(de);
                if ('width' in opt)  de.style.width = opt.width;
                if ('height' in opt)  de.style.height = opt.height;
                if ('debug' in opt)  de.setAttribute('data-debug', opt.debug);
            }

            return de;
        },

        createSeparator: function (opt) {

            var de = amgui.createDiv(opt);
            de.style.width = '100%';
            de.style.height = '0px';
            de.style.bottom = '0px';
            de.style.position = 'absolute';
            de.style.borderBottom = 'solid 1px rgba(255,255,255,.11)';
        },

        getIconChar: function (iconName) {

            var glyph = fontelloConf.glyphs.find(glyph => glyph.css === iconName);

            var code = glyph ? glyph.code : 59407;

            return String.fromCharCode(code);
        }
    }
);


amgui.setMaxListeners(0);

module.exports = amgui;
