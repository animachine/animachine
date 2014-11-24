'use strict';

var amgui = require('./amgui');
var EventEmitter = require('events').EventEmitter;
var Timeline = require('./timeline');
var Windooman = require('./windooman');
var HistoryTab = require('./historyTab');
var Warehouseman = require('./warehouseman');
var shortcuts = require('./shortcuts');
var Chronicler = require('./chronicler');
var DomPicker = require('./dom-picker');
var i18n = require('./i18n');
var Tour = require('./tour');
var Mouse = require('./mouse');
var dialogWIP = require('./commonDialogs/dialogWIP');
var dialogFeedback = require('./commonDialogs/dialogFeedback');
var modules = {
    css: require('./modules/css'),
    js: require('./modules/javascript'),
    domTree: require('./modules/am-domtree'),
};
var externalStylesheets = [
    // require('./assets/fontello/css/amgui.css'),
    require('./am.css'),
];

var isInited = false, handlerBuff = [];


var am = window.am = module.exports = _.extend(new EventEmitter(), {

    trackTypes: {},

    selectedDomElem: undefined,
    selectedTrack: undefined,

    registerTrackType: function (Track, type) {

        this.trackTypes[type] = Track;
    }
});

am.throwHandler = function (handler) {

    handlerBuff.push(handler);
};

am.open = function (save) {

    if (!window.chrome) {
    
        return alertUnsupportedBrowsers();
    }
setTimeout(function(){am.timeline.pause();}, 300);
    am._init();

    if (save) {

        if (typeof(save) === 'string') {

            save = JSON.parse(save);
        }

        am.timeline.useSave(save);
    }
};

am._init = function () {

    if (isInited) return;

    am.i18n = i18n;
    
    am.dialogs = {
        WIP: dialogWIP,
        feedback: dialogFeedback,
    };

    am.workspace = new Windooman();
    am.workspace.loadWorkspace('base', getBaseWorkspace());
    am.workspace.load('base');

    am.mouse = new Mouse();

    am.storage = new Warehouseman();

    am.tour = new Tour();

    am.domElem = createAmRoot();
    am.deHandlerCont = createAmLayer();
    am.deGuiCont = createAmLayer();
    am.deDialogCont = createAmLayer();


    amgui.deOverlayCont = am.deDialogCont;

    am.deGuiCont.appendChild(am.workspace.domElem);

    am.deRoot = document.body;
    
    am.history = new Chronicler();
    shortcuts.on('undo', am.history.undo.bind(am.history));
    shortcuts.on('redo', am.history.redo.bind(am.history));
    
    am.historyTab = new HistoryTab();
    am.timeline = new Timeline();
    am.domPicker = new DomPicker();

    am.workspace.fillTab('History', am.historyTab.domElem);

    am.deHandlerCont.appendChild(am.domPicker.domElem);
    am.domPicker.on('pick', onSelectWithDomPicker);

    am.timeline.toolbar.addIcon({
        tooltip: 'undo',
        icon: 'ccw',
        onClick: am.history.undo.bind(am.history)
    });

    am.timeline.toolbar.addIcon({
        tooltip: 'redo',
        icon: 'cw',
        onClick: am.history.redo.bind(am.history)
    });


    am.timeline.toolbar.addIcon({
        tooltip: 'feedback',
        icon: 'megaphone',
        separator: 'rest',
        onClick: function () {
            am.dialogs.feedback.show();
        }
    });



    // am.timeline.domElem.style.position = 'fixed';
    am.timeline.domElem.style.width = '100%';
    am.timeline.domElem.style.height = '100%';
    // am.timeline.domElem.style.bottom = '0px';
    am.workspace.fillTab('timeline', am.timeline.domElem);

    addToggleGui();

    window.addEventListener('click', onClickRoot);

    Object.keys(modules).forEach(function (moduleName) {

        console.log('init', moduleName, 'module...');

        modules[moduleName].init(am);
    });

    createMenu();
    createStatusLabel();
};

am.selectTrack = function (track) {

    if (!track) throw Error;
    if (am.selectedTrack === track) return;

    am.selectedTrack = track;
    am.emit('selectTrack', am.selectedTrack);
};

am.deselectTrack = function () {

    if (!am.selectedTrack) return;

    am.selectedTrack = undefined;
    am.emit('deselectTrack');
};

am.selectDomElem = function (de) {

    if (!de) throw Error;
    if (am.selectedDomElem === de) return;

    am.selectedDomElem = de;
    am.emit('selectDomElement', am.selectedDomElem);
};

am.deselectDomElem = function () {

    if (!am.selectedDomElem) return;

    am.selectedDomElem = undefined;
    am.emit('deselectDomElem');
};

am.isPickableDomElem = function (deTest) {
    //TODO use .compareDocumentPosition()
    if (!deTest) {
        return false;
    }

    return step(deTest);

    function step(de) {

        if (!de) {
            return false;
        }
        else if (de.nodeType === 9) {
            return false;
        }
        else if (de.hasAttribute('data-am-pick')) {
            return true;
        }
        else if (de.hasAttribute('data-am-nopick')) {
            return false;
        }
        else if (de === document.body) {
            return de !== deTest;
        }
        else if (de) {
            return step(de.parentNode);
        }
    }
};














function addToggleGui() {

    var isHidden = false;   

    am.timeline.toolbar.addIcon({
        tooltip: 'show/hide editor',
        icon: 'resize-small',
        separator: 'first',
        onClick: hide,
    });

    var btnFull = amgui.createIconBtn({
        size: 24,
        icon: 'resize-full',
        tooltip: 'show editor',
        onClick: show,
    });

    shortcuts.on('show/hidePanels', toggle);

    function toggle() {

        if (isHidden) {
            show();
        }
        else {
            hide();
        }
    }

    function hide() {

        if (isHidden) return;
        isHidden = true;

        am.deGuiCont.style.display = 'none';
        
        document.body.appendChild(btnFull);

        var zIndex = getMaxZIndex();
        if (zIndex) {
            btnFull.style.zIndex = zIndex + 1000;
        }
    }

    function show() {

        if (!isHidden) return;
        isHidden = false;
            
        am.deGuiCont.style.display = 'block';
        btnFull.parentElement.removeChild(btnFull);
    }

    btnFull.style.top = '0px';
    btnFull.style.left = '0px';
    btnFull.style.position = 'fixed';
}




function getMaxZIndex() {

    var zIndex = 0, els, x, xLen, el, val;

    els = document.querySelectorAll('*');
    for (x = 0, xLen = els.length; x < xLen; x += 1) {
      el = els[x];
      if (window.getComputedStyle(el).getPropertyValue('position') !== 'static') {
        val = window.getComputedStyle(el).getPropertyValue('z-index');
        if (val) {
          val = +val;
          if (val > zIndex) {
            zIndex = val;
          }
        }
      }
    }
    return zIndex;    
}
















function onClickRoot(e) {

    if (am.isPickableDomElem(e.target)) {
        
        if (e.target !== am.selectedDomElem) {//hack!
            
            am.domPicker.focusElem(e.target);
        }
    }
    else if (e.target === document.body || e.target.parentNode === document) {

        am.deselectDomElem();
    }
}

function onSelectWithDomPicker(de) {

    am.selectDomElem(de);
}











function createAmRoot() {

    // $('body').css('opacity', .23)
        // .mouseenter(function () {$('body').css('opacity', 1)})
        // .mouseleave(function () {$('body').css('opacity', .23)});
    
    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.left = '0px';
    de.style.top = '0px';
    de.style.width = '100%';
    de.style.height = '100%';
    de.style.pointerEvents = 'none';
    de.style.userSelect = 'none';
    de.style.webktUserSelect = 'none';
    de.style.fontFamily = amgui.FONT_FAMILY;
    de.style.color = amgui.color.text;

    de.setAttribute('data-am-nopick', '');

    var zIndex = getMaxZIndex();
    if (zIndex) {
        de.style.zIndex = zIndex + 1000;
    }

    document.body.appendChild(de);

    var sr = de.createShadowRoot();
        
    sr.appendChild(amgui.getStyleSheet());

    externalStylesheets.forEach(function (css) {

        var style = document.createElement('style');
        style.innerHTML = css;
        sr.appendChild(style);
        // document.head.appendChild(style);
    });

    return sr;
    // return de;
}

function createAmLayer() {

    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.width = '100%';
    de.style.height = '100%';
    de.setAttribute('data-am-nopick', '');
    am.domElem.appendChild(de);
    return de;
}

function createMenu() {
    
    var iconMenu = am.timeline.toolbar.addIcon({
        tooltip: 'file',
        icon: 'menu',
        separator: 'global',
    });

    amgui.bindDropdown({
        deTarget: iconMenu,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'new', onSelect: onSelectNew},
                {text: 'save', onSelect: onSelectSave},
                {text: 'saveAs', onSelect: onSelectSave},
                {text: 'open', onSelect: onSelectOpen},
            ]
        })
    });

    function onSelectNew() {

        am.timeline.clear();
    }

    function onSelectSave() {

        am.storage.showSaveDialog({

            getSave: function () {
                
                var opt = am.storage.getSaveOptions();

                return am.timeline.getScript(opt);
            }
        });
    }

    function onSelectOpen() {

        am.storage.showOpenDialog({

            onOpen: function (save) {

                console.log(save);

                am.timeline.clear();
                am.timeline.useSave(save);
            }
        });
    }
}


function getBaseWorkspace() {

    return {
        type: 'container',
        direction: 'column',
        children: [
            {
                type: 'container',
                direction: 'row',
                size: 2.7,
                scaleMode: 'flex',
                children: [
                    {                    
                        type: 'panel',
                        size: 1,
                        scaleMode: 'flex',
                        tabs: [
                            {name: 'Css Style'},
                            {name: 'Dom Tree'},
                            {name: 'History'},
                        ]
                    }, {                    
                        type: 'panel',
                        empty: true,
                        size: 2.7,
                        scaleMode: 'flex',
                    }
                ]
            },{
                type: 'panel',
                size: 1,
                scaleMode: 'flex',
                noHead: true,
                tabs: [{name: 'timeline'}],
            }
        ]
    };
}

function createStatusLabel() {

    var deTitle = amgui.createLabel({
        caption: 'Animachine (alpha)',
        parent: am.deDialogCont,
        position: 'fixed',
        fontSize: '18px'
    });

    deTitle.style.pointerEvents = 'none';
    deTitle.style.width = '100%';
    deTitle.style.textAlign = 'center';
    deTitle.style.opacity = '0.23';
    deTitle.style.fontWeight = 'bold';
}

function alertUnsupportedBrowsers() {

    var deSorry = document.createElement('div');
    deSorry.textContent = 'Sorry, this demo is currently only supported by chrome. ';
    amgui.createIcon({icon: 'emo-unhappy', parent: deSorry, display: 'inline'});
    deSorry.style.display = 'fixed';
    deSorry.style.margin = 'auto';
    deSorry.style.fontFamily = amgui.FONT_FAMILY;
    deSorry.style.fontSize = '21px';
    deSorry.style.color = amgui.color.text;
    deSorry.style.background = amgui.color.overlay;
    deSorry.style.top = 0;
    deSorry.style.right = 0;
    deSorry.style.bottom = 0;
    deSorry.style.left = 0;
    document.body.innerHTML = '';
    document.body.appendChild(deSorry);
}

///polyfills
if (!Array.prototype.find) {
  Object.defineProperty(Array.prototype, 'find', {
    enumerable: false,
    configurable: true,
    writable: true,
    value: function(predicate) {
      if (this == null) {
        throw new TypeError('Array.prototype.find called on null or undefined');
      }
      if (typeof predicate !== 'function') {
        throw new TypeError('predicate must be a function');
      }
      var list = Object(this);
      var length = list.length >>> 0;
      var thisArg = arguments[1];
      var value;

      for (var i = 0; i < length; i++) {
        if (i in list) {
          value = list[i];
          if (predicate.call(thisArg, value, i, list)) {
            return value;
          }
        }
      }
      return undefined;
    }
  });
}