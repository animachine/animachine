var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function DomPicker(opt) {

    EventEmitter.call(this);

    this._onMEnter = this._onMEnter.bind(this);
    this._onMLeave = this._onMLeave.bind(this);

    this.prevChildChain = [];
    this._createDomElem();
}

inherits(Timeline, EventEmitter);
var p = DomPicker.prototype;

module.exports = DomPicker;

p.focusElem = function (deTraget) {
//TODO: track the prevChildChain
    if (this._deTarget && this._deTarget.parentNode === deTarget) {

        this._dePrevChild = this._deTarget;
    }
    else if (this._dePrevChild && this._dePrevChild.parentNode !== deTarget) {
        
        this._dePrevChild = undefined;
    }

    this._deTarget = deTarget;

    var br = deTarget.getBoundingClientRect();
    this.domElem.style.left = br.left + 'px';
    this.domElem.style.top = br.top + 'px';
    this.domElem.style.width = br.width + 'px';
    this.domElem.style.height = br.height + 'px';
    this.domElem.style.display = 'block';

    var p = am.isPickableDomElem;
    this._btnTop.style.display = p(deTarget.parentNode) ? 'absolute' : 'none';
    this._btnRight.style.display = p(deTarget.nextSibling) ? 'absolute' : 'none';
    this._btnBottom.style.display = p(deTarget.firstChild) ? 'absolute' : 'none';
    this._btnLeft.style.display = p(deTarget.previousSibling) ? 'absolute' : 'none';

    this.emit('select', deTarget);
};

p.hide = function () {

    var br = deTarget.getBoundingClientRect();
    this.domElem.style.left = br.left + 'px';
    this.domElem.style.top = br.top + 'px';
    this.domElem.style.width = br.width + 'px';
    this.domElem.style.height = br.height + 'px';
    this.domElem.style.display = 'block';
};

p._onMEnter =  function () {

    this._btnTop.style.visibility = 'visible';
    this._btnRight.style.visibility = 'visible';
    this._btnBottom.style.visibility = 'visible';
    this._btnLeft.style.visibility = 'visible';
    this._btnClose.style.visibility = 'visible';
};

p._onMLeave =  function () {

    this._btnTop.style.visibility = 'hidden';
    this._btnRight.style.visibility = 'hidden';
    this._btnBottom.style.visibility = 'hidden';
    this._btnLeft.style.visibility = 'hidden';
    this._btnClose.style.visibility = 'hidden';
};

p._createBase = function () {

    var btnSize = 21;

    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.boxSizing = 'border-box';
    de.style.boxShadow = '0px 0px 1px 0px rgba(50, 50, 50, 0.75)';
    de.style.display = 'none';
    de.style.border = '2px dashed #eee';
    am.deHandlerCont.appendChild(de);

    de.addEventListener('mouseenter', this._onMEnter);
    de.addEventListener('mouseleave', this._onMLeave);
    
    this.domElem = de;

    this._btnTop = createIcon('angle-top', 'up one level', function () {

        this.focus(this._deTarget.parentNode);
    });
    this._btnTop.top = -btnSize + 'px';
    this._btnTop.left = '0';
    this._btnTop.right = '0';
    this._btnTop.margin = 'auto 0';

    this._btnRight = createIcon('angle-right', 'next sibling', function () {
        this.focus(this._deTarget.nextSibling);
    }.bind(this));
    this._btnRight.right = btnSize + 'px';
    this._btnRight.top = '0';
    this._btnRight.bottom = '0';
    this._btnRight.margin = '0 auto';

    this._btnBottom = createIcon('angle-bottom', 'down one level', function () {
        this.focus(this._deTarget.firstChild);
    }.bind(this));
    this._btnBottom.bottom = btnSize + 'px';
    this._btnBottom.left = '0';
    this._btnBottom.right = '0';
    this._btnBottom.margin = 'auto 0';

    this._btnLeft = createIcon('angle-left', 'prevoius sibling', function () { 
        this.focus(this._deTarget.previousSibling);
    }.bind(this));
    this._btnLeft.left = -btnSize + 'px';
    this._btnLeft.top = '0';
    this._btnLeft.bottom = '0';
    this._btnLeft.margin = '0 auto';

    this._btnClose = createIcon('close', 'close', function () {
        this.hide();
    }.bind(this));
    this._btnClose.right = -btnSize + 'px';
    this._btnClose.top = -btnSize + 'px';

    function createBtn(icon, tooltip, onClick) {

        var deIcon = amgui.createIconBtn({
            icon: icon,
            widht: btnSize,
            height: btnSize,
            onClick: onClick,
            parent: this.domElem
        });

        amgui.addTooltip({
            deTarget: deIcon,
            text: tooltip
        });

        deIcon.style.position = 'absolute';
        return deIcon;
    }
};