'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var CheckboxInput = require('../utils/CheckboxInput');

var cssAmgui = require('../assets/fontello/css/amgui.css');

function Tour() {

    EventEmitter.call(this);

}

inherits(Tour, EventEmitter);
var p = Tour.prototype;
module.exports = Tour;

p.init = function () {

    if (this._inited) return;
    this._inited = true;

    this._callRunningLoop = this._callRunningLoop.bind(this);

    this._steps = [];
    this._dePointers = [];
    this._deCheckboxes = [];

    this._createBase();
    am.workspace.fillTab('tour', this.domElem);

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
}

p.setup = function (data) {


    var createCheck = (tooltip) => {

        var cb = new CheckboxInput({
            parent: this._deCheckboxCont,
            tooltip: tooltip,
        });

        cb.domElem.style.display = 'none';
        cb.domElem.style.width = 'auto';

        return cb;
    }

    this.init();

    window.addEventListener('click', this._callRunningLoop);


    data.steps.forEach(function (step) {

        step.domElem = amgui.createDiv();
        step.domElem.innerHTML = step.content;
        step.checklist = step.checklist ? step.checklist.map(createCheck) : [];

        this._steps.push(step);
    }, this);

    this.goto(0);
};

p.next = function () {

    var idx = this._steps.indexOf(this._currStep) + 1;
    this.goto(idx);
};

p.prev = function () {

    var idx = this._steps.indexOf(this._currStep) - 1;
    this.goto(idx);
};

p.goto = function (idx) {

    idx = Math.max(0, Math.min(this._steps.length-1, idx));

    this.removeAllPointer();

    if (this._currStep) {

        clearInterval(this._runningLoopSetI);

        if (typeof(this._currStep.onClose) === 'function') {

            this._currStep.onClose(this);
        }
        this._deStepContent.removeChild(this._currStep.domElem);
        this._currStep.checklist.forEach(cb => cb.domElem.style.display = 'none');
    }

    this._currStep = this._steps[idx];

    this._deStepContent.appendChild(this._currStep.domElem);
    this._currStep.checklist.forEach(cb => cb.domElem.style.display = 'inline-block');

    if (typeof(this._currStep.onReady) === 'function') {

        this._currStep.onReady(this);
    }

    if (typeof(this._currStep.runningLoop) === 'function') {

        this._runningLoopSetI = setInterval(this._callRunningLoop, 312);
    }

    this._deState.textContent = (idx+1)+'/'+this._steps.length+' '+(this._currStep.title || '');

    this._refreshChecklist();
};

p.checkIn = function (idx, step) {

    this._check(idx, step, true)
};

p.checkOut = function (idx, step) {

    this._check(idx, step, false)
};

p._check = function (idx, step, val) {

    step = step || this._currStep;
    if (!step) return;

    step.checklist[idx].value = !!val;

    this._refreshChecklist();
};

p.isChecked = function (idx, step) {

    step = step || this._currStep;
    if (!step) return;

    return step.checklist[idx].value;
};

p.addPointer = function (opt) {

    var dePointer = this._createTriangle();
    this._dePointers.push(dePointer);

    var x, y, r, brt = opt.deTarget.getBoundingClientRect();

    switch (opt.side) {
        case 'right':
            x = brt.right;
            y = brt.top + brt.height/2;
            r = 0;

        case 'bottom':
            x = brt.left + brt.width/2;
            y = brt.bottom;
            r = 90;

        case 'left':
            x = brt.left;
            y = brt.top + brt.height/2;
            r = 180;

        case 'top':
        default:
            x = brt.left + brt.width/2;
            y = brt.top;
            r = -90;
    }

    dePointer.style.left = x + 'px'
    dePointer.style.top = y + 'px'
    dePointer.rotate(r);

    return dePointer;
};

p.removePointer = function (dePointer) {

    var idx = this._dePointers.indexOf(dePointer);

    if (idx !== -1) {

        this._dePointers.splice(idx, 1);

        if (dePointer.parentNode) {
            dePointer.parentNode.removeChild(dePointer);
        }
    }
};

p.removeAllPointer = function () {

    while (this._dePointers.length) {

        this.removePointer(this._dePointers[0]);
    }
};

p._callRunningLoop = function () {

    if (this._currStep && this._currStep.runningLoop) {

        this._currStep.runningLoop(this);
    }
}





p._refreshChecklist = function () {

    if (!this._currStep) return;

    var allChecked =  _.every(this._currStep.checklist, 'value'),
        isLast = _.last(this._steps) === this._currStep;

    this._btnDone.style.visibility = allChecked && !isLast ? '' : 'hidden';
}




p._createBase = function () {

    this.domElem = amgui.createDiv();
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.display = 'flex';
    this.domElem.style.flexDirection = 'column';
    this.domElem.style.background = amgui.color.bg0;

    this._deHead = amgui.createDiv();
    this._deHead.style.display = 'flex';
    this._deHead.style.width = '100%';
    this._deHead.style.height = '23px';
    this.domElem.appendChild(this._deHead);

    this._deStepContScroll = amgui.createDiv();
    this._deStepContScroll.style.position = 'relative';
    this._deStepContScroll.style.flex = '1';
    this.domElem.appendChild(this._deStepContScroll);

    this._srStepContScroll = this._deStepContScroll.createShadowRoot();

    this._deStepCont = amgui.createDiv();
    this._deStepCont.style.position = 'absolute';
    this._deStepCont.style.width = '100%';
    this._srStepContScroll.appendChild(this._deStepCont);

    this._deStepContent = amgui.createDiv({
        parent: this._deStepCont,
    });

    this._btnDone = amgui.createBtn({
        'text': 'next',
        color: amgui.color.bg0,
        background: amgui.color.green,
        parent: this._deStepCont,
        onClick: () => this.next(),
    });

    this._btnDone.style.float = 'right';
    this._btnDone.style.marginRight = '2px';

    var style = document.createElement('style');
    style.innerHTML = cssAmgui;
    this._srStepContScroll.appendChild(style);


    this._scrollRange = amgui.createRange({
        parent: this._deStepContScroll,
        height: '100%',
        vertical: true
    });

    this._scrollRange.style.position = 'absolute';
    this._scrollRange.style.top = '0px';
    this._scrollRange.style.right = '0px';

    amgui.makeScrollable({
        deCont: this._deStepContScroll,
        deTarget: this._deStepCont,
        deRange: this._scrollRange
    });

    this._deState = amgui.createLabel({
        parent: this._deHead,
    });
    this._deState.style.flex = 1;

    this._deCheckboxCont = document.createElement('span');
    this._deHead.appendChild(this._deCheckboxCont);

    this._btnPrev = amgui.createIconBtn({
        parent: this._deHead,
        icon: 'angle-left',
        onClick: this.prev.bind(this)
    });

    this._btnNext = amgui.createIconBtn({
        parent: this._deHead,
        icon: 'angle-right',
        onClick: this.next.bind(this)
    });
}

p._createTriangle = function () {

    var size = 12;

    var de = amgui.createDiv();
    de.style.position = 'absolute';
    de.style.pointerEvents = 'none';
    am.deDialogCont.appendChild(de);

    var deTriangle = amgui.createDiv();
    deTriangle.style.position = 'absolute';
    deTriangle.style.width = '0';
    deTriangle.style.height = '0';
    deTriangle.style.borderStyle = 'solid';
    deTriangle.style.transformOrigin = 'left center';
    deTriangle.style.borderWidth = size+'px '+(2*size)+'px '+size+'px 0';
    deTriangle.style.borderColor = 'transparent #ff000d transparent transparent';

    de.appendChild(deTriangle);


    de.rotate = function (r) {

        deTriangle.style.transform = 'rotate(' + r + 'deg)';
    };

    return de;
}
