'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');

function InlineEaseEditor(opt) {

    EventEmitter.call(this);

    this._height = amgui.LINE_HEIGHT;
    this._color = '#00BFFF';

    this.timeline = opt.timeline;
    
    this._points = [0, 0, 1, 1];

    this._render = amgui.delayWithRAF(this._render, this);

    this._createBase();
    this.hide();
}

inherits(InlineEaseEditor, EventEmitter);
var p = InlineEaseEditor.prototype;
module.exports = InlineEaseEditor;




p.show = function (opt) {

    if (!opt.key || (!opt.key.ease && !opt.eases)) return;

    this._key = opt.key;
    this._eases = opt.eases ? opt.eases.slice() : [opt.key.ease];

    this._points[0] = this._eases[0].points[0];
    this._points[1] = this._eases[0].points[1];
    this._points[2] = this._eases[0].points[2];
    this._points[3] = this._eases[0].points[3];

    this._eases.forEach(ease => {

        ease.on('change', this._onChangeEase, this);
    });

    this._render();

    this._startAutoRefresh();

    window.addEventListener('click', this._onClickWindow, this);

    this.domElem.style.display = '';
};

p.hide = function () {

    if (this._eases) {

        this._eases.forEach(ease => {

            ease.off('change', this._onChangeEase, this);
        });
    }

    this._stopAutoRefresh();

    window.removeEventListener('click', this._onClickWindow, this);

    this.domElem.style.display = 'none';
};




p._startAutoRefresh = function () {

    var refresh = () => {

        window.cancelAnimationFrame(this.__rafIdAutoRefresh);

        this.__rafIdAutoRefresh = window.requestAnimationFrame(refresh);

        this._render();
    };

    refresh();
};

p._stopAutoRefresh = function () {

    window.cancelAnimationFrame(this.__rafIdAutoRefresh);
};

p._render = function() {

    var key = this._key,
        prevKey = key.getPrevKey(),
        brKeyLine = key.parentKeyLine.domElem.getBoundingClientRect(),
        brParent = this.domElem.parentNode.getBoundingClientRect(),
        p = this._points,
        x = this.timeline.timeToScreenX(prevKey ? prevKey.time : 0),
        w = this.timeline.timeToScreenX(key.time) - x,
        h = this._height,
        d = '',
        ease = this._eases[0];

    this._width = w;

    this.domElem.style.left = x + 'px';
    this.domElem.style.top = (brKeyLine.bottom - brParent.top) + 'px';

    d += 'M' + (w*p[0]) + ',' + (h*p[1]) + ' ';
    d += 'L0,0 ';
    d += 'C' + (w*p[0]) + ',' + (h*p[1]) + ' ';
    d += (w*p[2]) + ',' + (h*p[3]) + ' ';
    d += w + ',' + h + ' ';
    d += 'L' + (w*p[2]) + ',' + (h*p[3]);

    if (ease) {
        
        d += 'M0,0 ';

        for (let i = 0; i < w; ++i) {

            d += 'L' + i + ',' + (h*ease.getRatio(i/w));
        }
    }
    
    this._path.setAttribute('d', d);
  
    this._deCp0.refreshPosition();
    this._deCp1.refreshPosition();
};

p._setPoint = function (pidx, x, y) {

    this._points[pidx] = x;
    this._points[pidx+1] = y;

    this._eases.forEach(ease => ease.points = this._points);
};






p._onChangeEase = function () {

    this._render();
};

p._onClickWindow = function () {

    this.hide();
};







p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.position = 'absolute';
    this.domElem.style.transform = 'scaleY(-1)';
    this.domElem.style.pointerEvents = 'none';

    this._svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    // this._svg.style.background = 'red';
    this._svg.style.position = 'absolute';
    this._svg.style.top = '0px';
    this._svg.style.left = '0px';
    this._svg.style.overflow = 'visible';
    this.domElem.appendChild(this._svg);

    this._path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    this._path.style.stroke = this._color;
    this._path.style.fill = 'none';
    this._svg.appendChild(this._path);
  
    this._deCp0 = this._createCp(0);
    this._deCp1 = this._createCp(2);
};

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
    deCp.style.background = this._color;
    deCp.style.pointerEvents = 'auto';
    this.domElem.appendChild(deCp);

    deCp.addEventListener('click', function (e) {
        e.stopPropagation();//prevent calling _onClickWindow();
    });
  
    amgui.makeDraggable({
        deTarget: deCp,
        thisArg: this,
        onMove: function (md, mx, my) {

            var br = this.domElem.getBoundingClientRect();

            this._setPoint(pointIdx,
                Math.max(0, Math.min(1, (mx - br.left) / this._width)),
                (br.top - my) / this._height);
        }
    });
  
    deCp.refreshPosition = function () {
        
        deCp.style.left = (this._points[pointIdx] * this._width) + 'px';
        deCp.style.top = (this._points[pointIdx+1] * this._height) + 'px';
    }.bind(this);
    deCp.refreshPosition();
  
    return deCp;
};

