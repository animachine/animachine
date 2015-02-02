'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../amgui');
var Ease = require('./Ease');
var defineCompactProperty = require('../utils/defineCompactProperty');

function Key(opt, timeline) {

    EventEmitter.call(this);

    this.timeline = timeline;
    
    this.ease = new Ease();
    this._isSelected = false;
    this._height = amgui.LINE_HEIGHT;


    this.looks = opt.looks;

    this._onSelectDropdown = this._onSelectDropdown.bind(this);
    this._onChangeEase = this._onChangeEase.bind(this);
    this._onDeselectAllKeys = this._onDeselectAllKeys.bind(this);
    this._onTranslateSelectedKeys = this._onTranslateSelectedKeys.bind(this);

    this._deDropdown = amgui.createDropdown({
        options: ['ease', 'delete', 'randomise'],
        onSelect: this._onSelectDropdown,
    });


    if (this.ease) {
        this.ease.on('change', this._onChangeEase);
    }

    this._dragger = amgui.makeDraggable({
        deTarget: this.domElem,
        thisArg: this,
        onDown: e => {

            if (!e.shiftKey && !e.ctrlKey) {
                this.timeline.emit('deselectAllKeys');
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
        onMove: md => {

            var diffTime = (md.dx / this.timeline.timescale) - md.dragged;
                
            md.dragged += diffTime;

            this.timeline.emit('translateSelectedKeys', diffTime);
        }
    });

    if (opt) {
        am.history.dontSave(() => this.useSave(opt));
    }

    this.timeline.on('deselectAllKeys', this._onDeselectAllKeys);
    this.timeline.on('translateSelectedKeys', this._onTranslateSelectedKeys);
}

inherits(Key, EventEmitter);
var p = Key.prototype;
module.exports = Key;


defineCompactProperty(p, [
    {name: 'time', type: 'int', history: true},
    {name: 'value', history: true},
    {name: 'parentKeyLine', event: 'added'},
]);






p.getSave = function () {

    return {
        value: _.cloneDeep(this.value),
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

    return this.parentKeyLine.getPrevKey(this.time);
};

p.getNextKey = function (time) {

    return this.parentKeyLine.getNextKey(this.time);
};

p.renderToLine = function (ctx) {

    var looks = this.looks || this.parentKeyLine.keyLooks,
        height = this._height,
        keyPos = ~~this.timeline.timeToRenderPos(this.time) + 0.5,
        prevKey = this.getPrevKey(),
        prevKeyPos = this.timeline.timeToRenderPos(prevKey ? prevKey.time : 0),
        line = looks.line,
        circle = looks.circle,
        r = 2,
        isSelected = this._isSelected;

    this.renderEaseToLine(ctx);

    this.emit('prerender', ctx, this);
    
    if (line) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? amgui.color.selected : (line.color || '#eee');
        ctx.lineWidth = line.width || 1;
        ctx.moveTo(keyPos, 0);
        ctx.lineTo(keyPos, height);
        ctx.stroke();
        ctx.restore();
    }

    if (circle) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = isSelected ? amgui.color.selected : (circle.color || '#eee');
        ctx.fillStyle = isSelected ? amgui.color.selected : (circle.fillColor || '#eee');
        ctx.lineWidth = circle.width || 1;
        ctx.arc(keyPos, height/2,
            'r' in circle ? circle.r : r,
            'arcStart' in circle ? circle.arcStart : 0,
            'arcEnd' in circle ? circle.arcEnd : 2 * Math.PI);
        ctx.fill();
        ctx.stroke();
        ctx.restore();
    }

    if (this.timeline.currTime === this.time) {
        ctx.save();
        ctx.beginPath();
        ctx.strokeStyle = amgui.color.red;
        ctx.lineWidth = 1;
        ctx.arc(keyPos, height/2, 6, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.restore();
    }

    this.emit('postrender', ctx, this);
};

p.renderEaseToLine = function (ctx) {

    if (!this.ease) return;

    var looks = this.looks || this.parentKeyLine.keyLooks;

    var ease = this.ease,
        color = (looks.ease && looks.ease.color) || 'rgba(225,225,225,.23)',
        height = this._height,
        keyPos = this.timeline.timeToRenderPos(this.time),
        prevKey = this.getPrevKey(),
        prevKeyPos = this.timeline.timeToRenderPos(prevKey ? prevKey.time : 0),
        width = keyPos - prevKeyPos;

    if (width === 0) return;

    ctx.save();
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.2;
    ctx.moveTo(prevKeyPos, height);

    for (var i = 0; i < width; ++i) {

        ctx.lineTo(prevKeyPos + i, height - height * ease.getRatio(i/width));
    }

    ctx.stroke();
    ctx.restore();
};

p.getDropdown = function () {

    return this._deDropdown;
};








p._onSelectDropdown = function (e) {
    
    var selection = e.detail.selection;

    if (selection === 'ease') {

        this.ease.showOptionsDialog();
    }
    else if (selection === 'delete') {

        this.remove();
    }
    else if (selection === 'randomise') {

        am.dialogs.WIP.show();
    }
};

p._onChangeEase = function (ease) {

    this.emit('change.ease');
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

    this._deDropdown.removeEventListener('select', this._onSelectDropdown);
    this.timeline.removeListener('changeTape', this._onChangeTape);
    this.timeline.removeListener('deselectAllKeys', this._onDeselectAllKeys);
    this.timeline.removeListener('translateSelectedKeys', this._onTranslateSelectedKeys);

    if (this._deDropdown.parentNode) this._deDropdown.parentNode.removeChild(this._deDropdown); 
};

