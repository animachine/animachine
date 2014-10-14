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

	this._createBase();
	am.workspace.fillTab('tour', this.domElem);

	this.prev = this.prev.bind(this);
	this.next = this.next.bind(this);
}

p.setup = function (data) {

	this.init();
	this.clear();

	data.steps.forEach(function (step) {

		step.domElem = document.createElement('div');
		step.domElem.innerHTML = step.content;

		if (step.checkboxCount) {

			step._deCheckboxes = [];
			
			for (var i = 0; i < step.checkboxCount; ++i) {

				step._deCheckboxes.push(amgui.createToggleBtn({
					iconOn: 'circle', 
					iconOff: 'circle-empty'
				}));
			}
		}

		this._steps.push(step);
	}, this);

	this.goto(0);
};

p.clear = function () {

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

	if (this._currStep) {

		this._deStepCont.removeChild(this._currStep.domElem);
	}

	this._currStep = this._steps[idx];
	this._deStepCont.appendChild(this._currStep.domElem);
	
	if (typeof(this._currStep.setup) === 'function') {
		
		this._currStep.setup(this);
	}

	this._deState.textContent = (idx+1)+'/'+this._steps.length+' '+(this._currStep.title || '');
};

p.completeStep = function (step) {

	step = step || this._currStep;

	if (!step) return;

	step._completed = true;	
}

p.addPointer = function (opt) {

	if (!this._currStep) return;

	var dePointer = this._createTriangle();
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
	deTriangle.style.borderWidth = '0 50px 100px 50px';
	deTriangle.style.borderColor = 'transparent transparent #ff000d transparent';
	de.appendChild(deTriangle);

	return de;
}


