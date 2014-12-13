'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var Ease = require('./Ease');

function Key(opt) {

    EventEmitter.call(this);
    
    this._time =  0;
    this._value =  '';
    this.ease = new Ease();
    this._isSelected = false;
    this._height = amgui.LINE_HEIGHT;


    this._looks = opt.looks || {
        line: {
            color: '#eee'
        }
    }

    this._onSelectDropdown = this._onSelectDropdown.bind(this);
    this._onChangeEase = this._onChangeEase.bind(this);
    this._onDeselectAllKeys = this._onDeselectAllKeys.bind(this);
    this._onTranslateSelectedKeys = this._onTranslateSelectedKeys.bind(this);

    this._deMenu = amgui.createDropdown({
        options: ['ease', 'delete'],
        onSelect: this._onSelectDropdown,
    });

    am.timeline.on('deselectAllKeys', this._onDeselectAllKeys);
    am.timeline.on('translateSelectedKeys', this._onTranslateSelectedKeys);

    if (this.ease) {
        this.ease.on('change', this._onChangeEase);
    }

    // amgui.bindDropdown({
    //     deTarget: this.domElem,
    //     deMenu: this._deMenu,
    //     asContextMenu: true
    // });

    this._dragger = amgui.makeDraggable({
        deTarget: this.domElem,
        thisArg: this,
        onDown: function (e) {

            if (!e.shiftKey && !e.ctrlKey) {
                am.timeline.emit('deselectAllKeys');
            }

            //TODO shift+select (if an other key(s) selected in this line its should select thoes are between them) 
            if (e.shiftKey || e.ctrlKey) {
                if (this._isSelected) {
                    this.select();
                }
                else {
                    this.deselect();
                }
            }
            else {
                this.select();
            }
            
            return {
                dragged: 0,
            };
        },
        onMove: function (md) {

            var diffTime = (md.dx / am.timeline.timescale) - md.dragged;
                
            md.dragged += diffTime;

            am.timeline.emit('translateSelectedKeys', diffTime);
        }
    });

    if (opt) {
        this.useSave(opt);
    }
}

inherits(Key, EventEmitter);
var p = Key.prototype;
module.exports = Key;

Object.defineProperties(p, {

    time: {
        set: function (v) {

            v = Math.max(0, v);

            if (!Number.isFinite(v) || this._time === v) return;

            this._time = parseInt(v);

            this.emit('changeTime', this);
        },
        get: function () {

            return this._time;
        }
    },
    value: {
        set: function (v) {

            if (this._value === v) return;

            this._value = v;
        },
        get: function () {

            return this._value;
        }
    }
});









p.getSave = function () {

    return {
        value: this.value,
        time: this.time,
        ease: this.ease.getSave(),
    };
};

p.useSave = function (save) {

    if ('value' in save) this.value = save.value;
    if ('time' in save) this.time = save.time;
    if ('ease' in save) this.ease.useSave(save.ease);
};

p.select = function () {

    if (this._isSelected) return;

    this._isSelected = true;

    this.emit('select');
}

p.deselect = function () {

    if (!this._isSelected) return;

    this._isSelected = false;

    this.emit('deselect');
};

p.grab = function (e) {

    this._dragger.emitDown(e);
}

p.remove = function () {

    this.emit('needsRemove', this);
};

p.getPrevKey = function (time) {

    return this.keyLine.getPrevKey(this.time);
};

p.getNextKey = function (time) {

    return this.keyLine.getNextKey(this.time);
};

p.renderToLine = function (ctx, start, width) {

    this.renderEaseToLine(ctx, start, width);

    var looks = this._looks,
        height = this._height,
        line = looks.line,
        circle = looks.circle,
        fixStart = ~~start + 0.5,
        isSelected = this._isSelected;
    
    if (line) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? 'gold' : (line.color || '#eee');
        ctx.lineWidth = line.width || 1;
        ctx.moveTo(fixStart, 0);
        ctx.lineTo(fixStart, height);
        ctx.stroke();
        ctx.restore();
    }

    if (circle) {

        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = circle.color || '#eee';
        ctx.fillStyle = circle.fillColor || 'rgba(0,0,0,0)';
        ctx.lineWidth = circle.width || 1;
        ctx.arc(fixStart, height/2,
            'r' in circle ? circle.r : height * 0.4,
            'arcStart' in circle ? circle.arcStart : 0,
            'arcEnd' in circle ? circle.arcEnd : 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }
};

p.renderEaseToLine = function (ctx, start, width) {

    if (!this.ease) return;

    var ease = this.ease,
        color = (this._looks.ease && this._looks.ease.color) || 'rgba(225,225,225,.23)',
        height = this._height;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.strokeWidth = 1;
    ctx.moveTo(start, height);

    for (var i = 0; i < width; ++i) {

        ctx.lineTo(start + i, height - height * ease.getRatio(i/width));
    }

    ctx.stroke();
    ctx.restore();
}











p._onSelectDropdown = function (e) {
    
    var selection = e.detail.selection;

    if (selection === 'ease') {

        this.ease.showOptionsDialog();
    }
    else if (selection === 'delete') {

        this.emit('needsRemove', this);
    }
};

p._onChangeEase = function (ease) {

    this.emit('changeEase');
};

p._onDeselectAllKeys = function () {

    this.deselect();
};

p._onTranslateSelectedKeys = function (offset) {

    if (this._isSelected) {

        this.time += offset;
    }
};














p.dispose = function () {

    this._deMenu.removeEventListener('select', this._onSelectDropdown);
    am.timeline.removeListener('changeTape', this._onChangeTape);
    am.timeline.removeListener('deselectAllKeys', this._onDeselectAllKeys);
    am.timeline.removeListener('translateSelectedKeys', this._onTranslateSelectedKeys);

    if (this._deMenu.parentNode) this._deMenu.parentNode.removeChild(this._deMenu); 
};

