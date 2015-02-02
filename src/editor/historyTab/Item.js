'use strict';

var amgui = require('../amgui');

function Item() {

    this._createBase();

    this.domElem.addEventListener('click', function () {

        var idx = this._rec.executed ? this._rec.idx - 1 : this._rec.idx;
        am.history.goto(idx);

    }.bind(this));
}

var p = Item.prototype;
module.exports = Item;

var cursors = {
    undo: 'auto',
    redo: 'auto',
};

amgui.on('fontLoaded', () => {

    cursors.undo = createIcon('ccw');
    cursors.redo = createIcon('cw');

    function createIcon(icon) {

        return amgui.createCursorFromText({
            icon: icon,
            color: amgui.color.text,
            width: 16,
            height: 16,
            hotspotX: 8,
            hotspotY: 8,
            textX: 2,
            stroke: {color:'black', width: 2},
            debug: false,
        })
    }
});

p.setup = function (record) {

    this._rec = record;

    this._label.innerHTML = record.name;
    this._toggleState.setToggle(record.executed);
    this.domElem.style.cursor = cursors[record.executed ? 'undo' : 'redo'];
};

p._createBase = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.display = 'flex';
    this.domElem.style.width = '100%';
    this.domElem.style.height = amgui.LINE_HEIGHT + 'px';
    this.domElem.style.background = amgui.color.bg1;

    this._toggleState = amgui.createToggleIconBtn({
        parent: this.domElem,
        iconOn: 'circle',
        iconOff: 'circle-thin',
    });

    this._label = amgui.createLabel({
        parent: this.domElem,
        flex: 1
    });
};