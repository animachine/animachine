'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function Tour() {

    EventEmitter.call(this);

}

inherits(Tour, EventEmitter);
var p = Tour.prototype;
module.exports = Tour;

p.init = function () {

    if (this._inited) return;
    this._inited = true;


    this._steps = [];
    this._dePointers = [];
    this._deCheckboxes = [];

    this._createBase();
    am.workspace.fillTab('tour', this.domElem);

    this.prev = this.prev.bind(this);
    this.next = this.next.bind(this);
}

p.setup = function (data) {

    this.init();

    data.steps.forEach(function (step) {

        step.domElem = document.createElement('div');
        step.domElem.innerHTML = step.content;
        step._checklist = [];

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

        this._deStepCont.removeChild(this._currStep.domElem);
    }

    this._currStep = this._steps[idx];
    this._deStepCont.appendChild(this._currStep.domElem);
    
    if (typeof(this._currStep.setup) === 'function') {
        
        this._currStep.setup(this);
    }

    this._deState.textContent = (idx+1)+'/'+this._steps.length+' '+(this._currStep.title || '');

    p._refreshChecklist();
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

    step._ckecklist[idx] = val;

    p._refreshChecklist();
};

p.isChecked = function (idx, step) {

    step = step || this._currStep;
    if (!step) return;

    return step._ckecklist[idx]; 
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
    dePointer.style.transform = 'rotate(' + r + 'deg)'

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



p._refreshChecklist = function () {

    for (var i = 0; i < this._currStep.checklistLength; ++i) {

        if (!this._deCheckboxes[i]) {

            this._deCheckboxes.push(this._createCheckbox());
        }

        this._deCheckboxes[i].setToggle(!!this._currStep._checklist[i]);
        this._deCheckboxes[i].style.display = 'inline-block';
    }

    for (; i < this._deCheckboxes.length; ++i) {

        this._deCheckboxes[i].style.display = 'none';
    }
}




p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;

    this._deHead = document.createElement('div');
    this._deHead.style.display = 'flex';
    this._deHead.style.width = '100%';
    this._deHead.style.height = '23px';
    this.domElem.appendChild(this._deHead);

    this._deStepCont = document.createElement('div');
    this._deStepCont.style.width = '100%';
    this.domElem.appendChild(this._deStepCont); 

    this._deState = amgui.createLabel({
        parent: this._deHead,
    });
    this._deState.style.flex = 1;

    this._deCheckboxCont = document.createElement('span');
    this._deCheckboxCont.style.width = '100%';
    this.domElem.appendChild(this._deCheckboxCont);

    this._btnPrev = amgui.createIconBtn({
        parent: this._deHead,
        icon: 'angle-left',
        onClick: this.prev
    });

    this._btnNext = amgui.createIconBtn({
        parent: this._deHead,
        icon: 'angle-right',
        onClick: this.next
    });
}

p._createCheckbox = function () {

    return amgui.createToggleIconBtn({
        parent: this._deCheckboxCont,
        iconOn: 'circle',
        iconOff: 'circle-empty'
    });
}

p._createTriangle = function () {

    var de = document.createElement('div');
    de.style.position = 'absolute';
    de.style.pointerEvents = 'none';
    am.deDialogCont.appendChild(de);

    var deTriangle = document.createElement('div');
    deTriangle.style.position = 'absolute';
    deTriangle.style.left = '25px';
    deTriangle.style.width = '0';
    deTriangle.style.height = '0';
    deTriangle.style.borderStyle = 'solid';
    deTriangle.style.borderWidth = '50px 100px 50px 0';
    deTriangle.style.borderColor = 'transparent #ff000d transparent transparent';
;
    de.appendChild(deTriangle);

    return de;
}


