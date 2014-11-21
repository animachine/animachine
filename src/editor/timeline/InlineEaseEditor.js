'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../amgui');

function InlineEaseEditor(opt) {

    EventEmitter.call(this);

    this._onChangeEase = this._onChangeEase.bind(this);
    this._onClickWindow = this._onClickWindow.bind(this);

    this._height = amgui.LINE_HEIGHT;
    
    this._points = [0, 0, 1, 1];

    this._createBase();
}

inherits(InlineEaseEditor, EventEmitter);
var p = InlineEaseEditor.prototype;
module.exports = InlineEaseEditor;




p.show = function (opt) {

    if (!opt.key || !opt.key.ease) return;

    this._key = opt.key;
    this._nextKey = opt.nextKey;

    this._points[0] = this._key.ease.points[0];
    this._points[1] = this._key.ease.points[1];
    this._points[2] = this._key.ease.points[2];
    this._points[3] = this._key.ease.points[3];

    this._key.ease.on('change', this._onChangeEase);
    window.addEventListener('click', this._onClickWindow);

    this._render();

    this.domElem.style.display = '';
}

p.hide = function () {

    if (this._key) {

        this._key.ease.removeListener('change', this._onChangeEase);
    }

    window.removeEventListener('click', this._onClickWindow);

    this.domElem.style.display = 'none';
}






p._render = function() {

    var ctx = this._ctx,
        w = this._width,
        h = this._height;

    var brKey = this._key.domElem.getBoundingClientRect(),
        brNextKey = this._nextKey.domElem.getBoundingClientRect(),
        brParent = this.domElem.parentNode.getBoundingClientRect(),
        p = this._points,
        x = 0,
        w = brNextKey.left - brKey.left,
        h = this._height,
        d = '';

    this.domElem.style.left = (brKey.left - brParent.left) + 'px';
    this.domElem.style.top = (brParent.bottom - brKey.bottom) + 'px';

    d += 'M' + x + ',' + h + ' ';
    d += 'C' + (x + w*p[0]) + ',' + (h - h*p[1]) + ' ';
    d += (x + w*p[2]) + ',' + (h - h*p[3]) + ' ';
    d += (x + w) + ',' + 0;
    
    this._path.setAttribute('d', d);
  
    this._deCp0.refreshPosition();
    this._deCp1.refreshPosition();
}

p._setPoint = function (pidx, x, y) {

    this._points[pidx] = x;
    this._points[pidx+1] = y;
    this._key.ease.points = this._points;
}






p._onChangeEase = function () {

    this._render();
}

p._onClickWindow = function () {

    this.hide();
}







p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'relative';
    this.domElem.style.transform = 'scaleY(-1)';

    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    this.domElem.appendChild(this._svg);

    this._path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this._path.style.stroke = '#00BFFF';
    this._svg.appendChild(this._path);
  
    this._deCp0 = this._createCp(0);
    this._deCp1 = this._createCp(2);
}

p._createCp = function(pointIdx) {

    var r = 3;

    var deCp = document.createElement('div');
    deCp.style.position = 'absolute';
    deCp.style.cursor = 'grab';
    deCp.style.boxSizing = 'border-box';
    deCp.style.width = r*2 + 'px';
    deCp.style.height = r*2 + 'px';
    deCp.style.transform = 'translate(-'+r+'px,-'+r+'px)';
    deCp.style.borderRadius = r + 'px';
    deCp.style.background = 'rgba(256, 256, 256, 1)';
    this.domElem.appendChild(deCp);
  
    amgui.makeDraggable({
        deTarget: deCp,
        onDown: function () {

            deCp.style.cursor = 'grabbing';

            var md = {};
            md.minY = minY();
            md.fullY = maxY() - md.minY;    
            return md;
        },
        onMove: function (md, mx, my) {

            var br = de.getBoundingClientRect();

            this._setPoint(pointIdx,
                Math.max(0, Math.min(1, (mx - br.left) / w)),
                (((br.bottom - my) / h) * md.fullY) - md.minY
            );
        },
        onUp: function () {

            deCp.style.cursor = 'grab';
        }
    });
  
    deCp.refreshPosition = function () {
        
        deCp.style.left =  + 'px';
        deCp.style.top =  + 'px';
    };
    deCp.refreshPosition();
  
    return deCp;
}

