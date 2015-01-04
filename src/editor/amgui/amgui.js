'use strict';

var EventEmitter = require('eventman');
var fontelloConf = require('../assets/fontello/config.json');

WebFont.load({
    google: {
      families: ['Open+Sans:400,700,300,600,800:latin,latin-ext']
    }
});

var amgui = window.amgui = new EventEmitter();

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
        },

        getStyleSheet: function () {

            var style = document.createElement('style');

            style.innerHTML = 'dialog::backdrop { background:'+amgui.color.bgHover+' }';

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