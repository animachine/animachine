'use strict';

var EventEmitter = require('events').EventEmitter;

WebFont.load({
    google: {
      families: ['Open Sans']
    }
});

var amgui = new EventEmitter();

_.extend(amgui,
    require('./amgui.bezierEditor')(amgui),
    require('./amgui.breadcrumbs')(amgui),
    require('./amgui.button')(amgui),
    require('./amgui.dialog')(amgui),
    require('./amgui.drawer')(amgui),
    require('./amgui.dropdown')(amgui),
    require('./amgui.input')(amgui),
    require('./amgui.keys')(amgui),
    require('./amgui.keyValueInput')(amgui),
    require('./amgui.makeDraggable')(amgui),
    require('./amgui.scroll')(amgui),
    require('./amgui.stepperKey')(amgui),
    require('./amgui.tooltip')(amgui),
    require('./amgui.utils')(amgui),
    {

        FONT_FAMILY: '"Open Sans", sans-serif',
        FONT_SIZE: '15px',

        color: {
            bg0: '#000',
            bg1: '#222',
            bg2: '#444',
            bg3: '#666',
            text: '#efe',
            textInactive: 'rgba(255,255,255,.23)',
            overlay: 'rgba(0,0,0,.785)',
            bgHover: 'rgba(255,255,255,0.12)',
        },

        lineHeight: 23,

        getStyleSheet: function () {

            var style = document.createElement('style');

            style.innerHTML = 'dialog::backdrop { background:'+amgui.color.bgHover+' }';

            return style;
        },

        createDiv: function () {

            var de = document.createElement('div');
            de.style.webkitUserSelect = 'none';
            de.style.mozUserSelect = 'none';
            de.style.msUserSelect = 'none';
            de.style.userSelect = 'none';

            return de;
        },
    }
);


amgui.setMaxListeners(0);

module.exports = amgui;