'use strict';

var domready = require('domready');
var amgui = require('./amgui');
var EventEmitter = require('events').EventEmitter;
var Transhand = require('./transhand');
var Timeline = require('./timeline');
var Toolbar = require('./toolbar');
var Windooman = require('./windooman');
var Warehouseman = require('./warehouseman');
var Chronicler = require('./chronicler');
var DomPicker = require('./dom-picker');
var dialogFeatureDoesntExits = require('./commonDialogs/dialogFeatureDoesntExits');
var dialogFeedback = require('./commonDialogs/dialogFeedback');
var modules = {
    css: require('./modules/css')
};
var externalStylesheets = [
    // require('./assets/fontello/css/amgui.css'),
    require('./am.css'),
];
window.dialogScript = require('./modules/javascript/dialogScriptEditor');;

var isInited = false, handlerBuff = [];


var am = window.am = module.exports = _.extend(new EventEmitter(), {

    sequenceTypes: {},

    selectedElement: undefined,

    registerSequenceType: function (Sequence, type) {

        this.sequenceTypes[type] = Sequence;
    }
});

am.getHandler = function () {

    if (handlerBuff.length) {

        return handlerBuff.pop();
    }
    else {
        return new Transhand();
    }
};

am.throwHandler = function (handler) {

    handlerBuff.push(handler);
};

am.open = function (save) {

    if (!window.chrome) {
    
        return alertUnsupportedBrowsers();
    }

    am._init();

    if (save) {

        if (typeof(save) === 'string') {

            save = JSON.parse(save);
        }

        am.timeline.useSave(save);
    }
}

am._init = function () {

    if (isInited) return;
    
    am.dialogs = {
        featureDoesntExist: dialogFeatureDoesntExits,
        feedback: dialogFeedback,
    };

    am.workspace = new Windooman();
    am.workspace.loadWorkspaces({
        base: getBaseWorkspace()
    });
    am.workspace.load('base');

    am.storage = new Warehouseman();

    am.domElem = createAmRoot();
    am.deHandlerCont = createAmLayer();
    am.deGuiCont = createAmLayer();
    am.deDialogCont = createAmLayer();


    amgui.deOverlayCont = am.deDialogCont;

    am.deGuiCont.appendChild(am.workspace.domElem);

    am.deRoot = document.body;
    am.history = new Chronicler();
    am.toolbar = new Toolbar();
    am.timeline = new Timeline();
    am.domPicker = new DomPicker();

    am.workspace.fillTab('tools', am.toolbar.domElem);

    am.deHandlerCont.appendChild(am.domPicker.domElem);
    am.domPicker.on('pick', onSelectWithDomPicker)

    am.toolbar.addIcon({
        icon: 'ccw',
        onClick: am.history.undo.bind(am.history)
    });

    am.toolbar.addIcon({
        icon: 'cw',
        onClick: am.history.redo.bind(am.history)
    });


    am.toolbar.addIcon({
        icon: 'megaphone',
        separator: 'rest',
        onClick: function () {
            am.dialogs.feedback.show()
        }
    });



    am.timeline.domElem.style.position = 'fixed';
    am.timeline.domElem.style.width = '100%';
    am.timeline.domElem.style.height = '230px';
    am.timeline.domElem.style.bottom = '0px';
    am.workspace.fillTab('timeline', am.timeline.domElem);

    addToggleGui();

    document.body.addEventListener('click', onClickRoot);

    modules.css.init(am);

    createMenu();
    createStatusLabel();
};

function createMenu() {
    
    var iconMenu = am.toolbar.addIcon({
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

function onClickRoot(e) {

    if (am.isPickableDomElem(e.target) && 
        e.target !== am.selectedElement) //hack!
    {
        am.domPicker.focusElem(e.target);
    }
}

function onSelectWithDomPicker(de) {

    if (am.selectedElement !== de) {

        am.selectedElement = de;
        am.emit('selectDomElement', am.selectedElement);
    }

}

am.isPickableDomElem = function (deTest) {

    if (!deTest) {
        return false;
    }

    return step(deTest);

    function step(de) {

        if (de.hasAttribute('data-am-pick')) {
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
        //TODO
        sr.appendChild(style);
        // document.head.appendChild(style);
    });

    return sr;
    // return de;
}

function addToggleGui() {

    am.toolbar.addIcon({
        icon: 'resize-small',
        separator: 'first',
        tooltip: 'hide editor',
        onClick: function () {

            am.deGuiCont.style.display = 'none';
            
            document.body.appendChild(btnFull);

            var zIndex = getMaxZIndex();
            if (zIndex) {
                btnFull.style.zIndex = zIndex + 1000;
            }
        }
    });

    var btnFull = amgui.createIconBtn({
        width: 32,
        height: 32,
        fontSize: '32px',
        icon: 'resize-full',
        tooltip: 'show editor',
        onClick: function () {
            
            am.deGuiCont.style.display = 'block';
            btnFull.parentElement.removeChild(btnFull);
        }
    });

    btnFull.style.top = '0px';
    btnFull.style.left = '0px';
    btnFull.style.position = 'fixed';
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


function getBaseWorkspace() {

    return {
        type: 'container',
        direction: 'column',
        children: [{
                type: 'panel',
                size: 32,
                scaleMode: 'fix',
                noHead: false,
                tabs: [{name: 'tools'}],
            },{
                type: 'container',
                direction: 'row',
                size: 10,
                scaleMode: 'flex',
                children: [{                    
                    type: 'panel',
                    size: 3,
                    scaleMode: 'flex',
                    tabs: [
                        {name: 'Css Style'},
                        {name: 'Dom Tree'}
                    ]
                }, {                    
                    type: 'panel',
                    empty: true,
                    size: 12,
                    scaleMode: 'flex'
                }]
            }, {
                type: 'panel',
                size: 4,
                scaleMode: 'flex',
                noHead: false,
                tabs: [{name: 'timeline'}],
            }]
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
    deTitle.style.top = '32px';
    deTitle.style.left = '3px';
    deTitle.style.opacity = '0.23';
    deTitle.style.fontWeight = 'bold';
}

function alertUnsupportedBrowsers() {

    var deSorry = document.createElement('div');
    deSorry.textContent = 'Sorry, this demo is currently only supported by chrome. ';
    amgui.createIcon({icon: 'emo-unhappy', parent: deSorry, display: 'inline'})
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