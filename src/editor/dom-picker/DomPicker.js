var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function DomPicker(opt) {

    EventEmitter.call(this);

    this._isMouseOver = false;
    this._crumbs = [];

    this._onMMove = this._onMMove.bind(this);
    this._render = this._render.bind(this);
    window.addEventListener('mousemove', this._onMMove);

    this._createBase();
}

inherits(DomPicker, EventEmitter);
var p = DomPicker.prototype;

module.exports = DomPicker;

p.focusElem = function (target) {

    var oldTarget = this._deTarget
        crumbs = this._crumbs,
        lastCrumb = crumbs[crumbs.length-1];

    if (oldTarget && oldTarget.parentElement === target) {

        crumbs.push(oldTarget);
    }
    else if (target === lastCrumb) {
        
        crumbs.pop();
    }
    else if (target.parentElement === lastCrumb) {

        crumbs.length = 0;
    }

    this._deTarget = target;


    var p = am.isPickableDomElem,
        top = p(target.parentElement),
        right = p(target.nextElementSibling),
        bottom = p(target.firstElementChild),
        left = p(target.previousElementSibling);

    this._btnTop.style.display = top ? 'block' : 'none';
    this._btnRight.style.display = right ? 'block' : 'none';
    this._btnBottom.style.display = bottom ? 'block' : 'none';
    this._btnLeft.style.display = left ? 'block' : 'none';

    this.domElem.style.display = 'block';

    this._render();

    this._rerenderSetI = setInterval(this._render, 123);
    window.addEventListener('resize', this._render);

    this.emit('pick', target);
};

p.hide = function () {

    clearInterval(this._rerenderSetI);
    window.removeEventListener('resize', this._render);

    this.domElem.style.display = 'none';
};

p._render = function () {

    var br = this._deTarget.getBoundingClientRect();

    this.domElem.style.left = br.left + 'px';
    this.domElem.style.top = br.top + 'px';
    this.domElem.style.width = br.width + 'px';
    this.domElem.style.height = br.height + 'px';
}

p._onMMove =  function (e) {

    var br = this.domElem.getBoundingClientRect(),
        mx = e.clientX,
        my = e.clientY,
        s = this._isMouseOver ? 21 : 0,
        over = mx >= br.left-s && mx <= br.right+s &&
            my >= br.top-s && my <= br.bottom+s;

    if (over !== this._isMouseOver) {

        this._isMouseOver = over;

        var v = over ? 'visible' : 'hidden';

        this._btnTop.style.visibility = v;
        this._btnRight.style.visibility = v;
        this._btnBottom.style.visibility = v;
        this._btnLeft.style.visibility = v;
        this._btnClose.style.visibility = v;
    }
};

p._createBase = function () {

    var btnSize = 21;

    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.boxSizing = 'border-box';
    de.style.boxShadow = '0px 0px 1px 0px rgba(50, 50, 50, 0.75)';
    de.style.display = 'none';
    de.style.pointerEvents = 'none';
    de.style.border = '2px dashed #eee';
    de.style.pointerEvents = 'none';
    am.deHandlerCont.appendChild(de);

    de.addEventListener('mouseenter', this._onMEnter);
    de.addEventListener('mouseleave', this._onMLeave);
    
    this.domElem = de;

    this._btnTop = createBtn('angle-up', 'up one level', function () {

        this.focusElem(this._deTarget.parentElement);
    }.bind(this));
    this._btnTop.style.top = -btnSize + 'px';
    this._btnTop.style.left = '0';
    this._btnTop.style.right = '0';
    this._btnTop.style.margin = '0 auto';


    this._btnRight = createBtn('angle-right', 'next sibling', function () {

        this.focusElem(this._deTarget.nextElementSibling);
    }.bind(this));
    this._btnRight.style.right = -btnSize + 'px';
    this._btnRight.style.top = '0';
    this._btnRight.style.bottom = '0';
    this._btnRight.style.margin = 'auto 0';

    this._btnBottom = createBtn('angle-down', 'down one level', function () {

        this.focusElem(this._crumbs[this._crumbs.length-1] || this._deTarget.firstElementChild);

    }.bind(this));
    this._btnBottom.style.bottom = -btnSize + 'px';
    this._btnBottom.style.left = '0';
    this._btnBottom.style.right = '0';
    this._btnBottom.style.margin = '0 auto';

    this._btnLeft = createBtn('angle-left', 'previous sibling', function () { 

        this.focusElem(this._deTarget.previousElementSibling);
    }.bind(this));
    this._btnLeft.style.left = -btnSize + 'px';
    this._btnLeft.style.top = '0';
    this._btnLeft.style.bottom = '0';
    this._btnLeft.style.margin = 'auto 0';

    this._btnClose = createBtn('cancel', 'close', function () {

        this.hide();
    }.bind(this));
    this._btnClose.style.right = -btnSize + 'px';
    this._btnClose.style.top = -btnSize + 'px';

    function createBtn(icon, tooltip, onClick) {

        var deIcon = amgui.createIconBtn({
            icon: icon,
            widht: btnSize,
            height: btnSize,
            onClick: function (e) {
                e.stopPropagation();
                onClick();
            },
            parent: de
        });

        amgui.addTooltip({
            deTarget: deIcon,
            text: tooltip
        });

        deIcon.style.position = 'absolute';
        deIcon.style.pointerEvents = 'auto';

        return deIcon;
    }
};