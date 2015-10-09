/*eslint-disable */

function DomPicker() {

    EventEmitter.call(this);

    this._isMouseOver = false;
    this._crumbs = [];

    this._onMMove = this._onMMove.bind(this);
    this._render = this._render.bind(this);
    window.addEventListener('mousemove', this._onMMove);

    am.on('selectDomElem', this._onSelectDomElem, this);
    am.on('change.currTrack', this.hide, this);

    this._createBase();

    this.setRightLeftBtn({
        icon: 'plus',
        tooltip: 'create a new css track with this element',
        onClick:  () => {

            var winner, winnerPrior, done = false;

            this.emit('add', {
                target: this._deTarget,
                demand: prior => {

                    return new Promise((resolve, reject) => {

                        if (done) return reject();

                        if (winnerPrior === undefined || prior < winnerPrior) {

                            winnerPrior = prior;
                            if (winner) winner.reject();
                            winner = {resolve, reject};
                        }
                        else {
                            reject();
                        }
                    });
                }
            });

            done = true;
            if (winner) winner.resolve();
        },
    });
}

inherits(DomPicker, EventEmitter);
var p = DomPicker.prototype;

module.exports = DomPicker;

p.focusElem = function (target) {

    if (target === this._deTarget) return;

    var oldTarget = this._deTarget,
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

    this._deTarget = undefined;

    clearInterval(this._rerenderSetI);
    window.removeEventListener('resize', this._render);

    this.domElem.style.display = 'none';
};

p.setRightLeftBtn = function (opt) {

    this._btnRightLeft.setIcon(opt.icon);

    //TODO remove the previous
    this._btnRightLeft.addEventListener('click', opt.onClick);

    var tooltip = amgui.getTooltip(this._btnRightLeft);
    tooltip.setContent(opt.tooltip);
};

p.setBounds = function (fn) {

    this._getBounds = fn;
};


p._getBounds = function () {

    return {
        x: 0,
        y: 0,
        w: window.innerWidth,
        h: window.innerHeight,
    };
};







p._render = function () {

    if (!this._deTarget) return;

    var br = this._deTarget.getBoundingClientRect();

    this.domElem.style.left = br.left + 'px';
    this.domElem.style.top = br.top + 'px';
    this.domElem.style.width = br.width + 'px';
    this.domElem.style.height = br.height + 'px';

    this._alignBtnCont();
};

p._alignBtnCont = function () {

    var {top, left, width, height} = this.domElem.getBoundingClientRect(),
        [oTop, oLeft, oWidth, oHeight] = [top, left, width, height],
        {x: wLeft, y: wTop, w: wWidth, h: wHeight} = this._getBounds(),
        btnSize = 21;

    width = Math.max(btnSize, oWidth);
    height = Math.max(btnSize, oHeight);

    left += (oWidth - width) / 2;
    top += (oHeight - height) / 2;

    if (left < wLeft + btnSize) {
        left = wLeft + btnSize;
        width = Math.max(btnSize, oLeft + oWidth - left);
    }
    if (top < wTop + btnSize) {
        top = wTop + btnSize;
        height = Math.max(btnSize, oTop + oHeight - top);
    }
    if (left + width > wLeft + wWidth - btnSize) width = wLeft + wWidth - btnSize - left;
    if (top + height > wTop + wHeight - btnSize) height = wTop + wHeight - btnSize - top;

    this._btnCont.style.left = (left - oLeft) + 'px';
    this._btnCont.style.top = (top - oTop) + 'px';
    this._btnCont.style.width = width + 'px';
    this._btnCont.style.height = height + 'px';
};

p._onMMove =  function (e) {

    var br = this.domElem.getBoundingClientRect(),
        mx = e.clientX,
        my = e.clientY,
        s = this._isMouseOver ? 21 : 0,
        over = mx >= br.left-s && mx <= br.right+s &&
            my >= br.top-s && my <= br.bottom+s;

    if (over !== this._isMouseOver) {

        this._isMouseOver = over;

        this._btnCont.style.visibility = over ? 'visible' : 'hidden';
    }
};

p._onSelectDomElem = function (de) {

    this.focusElem(de);
};

p._createBase = function () {

    var btnSize = 21, borderSize = '2px';

    var de = document.createElement('div');
    de.style.position = 'fixed';
    de.style.boxSizing = 'border-box';
    de.style.display = 'none';
    de.style.pointerEvents = 'none';
    de.style.border = 'solid #eee ' + borderSize;
    de.style.pointerEvents = 'none';
    am.deHandlerCont.appendChild(de);

    var deDashed = document.createElement('div');
    deDashed.style.width = '100%';
    deDashed.style.height = '100%';
    deDashed.style.border = 'dashed #444 ' + borderSize;
    deDashed.style.transform = 'translate(-'+borderSize+',-'+borderSize+')';
    de.appendChild(deDashed);

    this._btnCont = amgui.createDiv({parent: de, position: 'absolute'});

    de.addEventListener('mouseenter', this._onMEnter);
    de.addEventListener('mouseleave', this._onMLeave);

    this.domElem = de;


    var createBtn = (icon, tooltip, onClick) => {

        var deIcon = amgui.createIconBtn({
            icon: icon,
            size: btnSize,
            parent: this._btnCont,
        });

        deIcon.style.textShadow = '0 0 6px #000, 0 0 6px #000';

        if (onClick) {

            deIcon.addEventListener('click', function (e) {

                e.stopPropagation();
                onClick();
            });
        }

        amgui.addTooltip({
            deTarget: deIcon,
            text: tooltip
        });

        deIcon.style.position = 'absolute';
        deIcon.style.pointerEvents = 'auto';

        return deIcon;
    };

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

    this._btnRightLeft = createBtn('plus', '');
    this._btnRightLeft.style.right = -btnSize + 'px';
    this._btnRightLeft.style.bottom = -btnSize + 'px';
};
