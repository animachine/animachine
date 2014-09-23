'use strict';

var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var dialogScriptEditor = require('./dialogScriptEditor');
var amgui = require('../../amgui');

function IntervalScript(opt) {

    EventEmitter.call(this);

    this._lineH =  21;
    this._script =  '/**/';
    this._bounds = [0, am.timeline.length];

    this._onChangeTime = this._onChangeTime.bind(this);
    this._onClickOpenScript = this._onClickOpenScript.bind(this);
    this._onChangeScript = this._onChangeScript.bind(this);

    this.deOptions = this._createParameterOptions();
    this.deKeyline = this._createBoundsLine();

    am.timeline.on('changeTime', this._onChangeTime);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(IntervalScript, EventEmitter);
var p = IntervalScript.prototype;









Object.defineProperties(p, {

    height: {
        get: function () {
            
            return this._lineH;
        }
    },
    script: {
        set: function (v) {

            v = v || '';

            if (this._script === v) return;

            this._script = v;
        },
        get: function () {

            return this._script;
        }
    },
});





p.getSave = function () {

    var save = {
        name: this.name,
        script: this.script,
        bounds: this._bounds.slice(),
    };

    return save;
};

p.useSave = function(save) {

    if ('name' in save) this.name = save.name;
    if ('script' in save) this.script = save.script;
    if ('bounds' in save) this._bounds = save.bounds;

    this._refreshBounaries();
};

p.addKey = function (opt, skipHistory) {
    
    var key = this.getKey(opt.time);

    if (key) {

        if ('value' in opt) {

            if (!skipHistory) {
                am.history.saveChain(key, [this.addKey, this, key, true], [this.addKey, this, opt, true]);
            }

            key.value = opt.value;
        }
    }
    else {

        key = new Key(_.extend({deKeyline: this.deKeyline}, opt));

        key.on('changeTime', this._onChangeKeyTime);
        key.on('delete', this._onDeleteKey);

        this._keys.push(key);

        if (!skipHistory) {
            am.history.closeChain(key);
            am.history.save([this.removeKey, this, opt.time, true], [this.addKey, this, opt, true]);
        }
    }

    this._refreshInput();
    this._refreshBtnToggleKey();

    this.emit('change');

    return key;
};

p.isInsideBounds = function (time) {

    for (var i = 0; i < this._bounds.length; i += 2) {

        if (this._bounds[i] <= time && this._bounds[i+1] >= time) {

            return true;
        }
    }
};

p.runScript = function () {

    (new Function(this.script))();//TDOD hack!!!
};













p._onChangeInput = function (e) {

    if ('key' in e.detail) {
        this.name = e.detail.key;
    }

    if ('value' in e.detail) {
        this.addKey({
            time: am.timeline.currTime,
            value: e.detail.value
        });
    }

    this.emit('change');
};

p._onDeleteKey = function (key) {

    this.removeKey(key);
};

p._onChangeTime = function () {

    this._refreshBounaries();
};

p._onClickOpenScript = function () {

    dialogScriptEditor.show({
        script: this.script,
        onChangeScript: this._onChangeScript,
    });
};

p._onChangeScript = function (script) {

    this.script = script;
};












p._refreshBounaries = function () {

    var deKeyline = this.deKeyline;
    
    deKeyline.innerHTML = '';

    for (var i = 0; i < this._bounds.length; i += 2) {

        createBound(this._bounds[i], this._bounds[i+1]);
    }

    function createBound (start, end) {

        var de = document.createElement('div');
        de.style.left = start * am.timeline.timeScale + 'px';
        de.style.width = (end - start) * am.timeline.timeScale + 'px';;
        de.style.height = '100%';
        de.style.background = 'blue';
        de.style.position = 'relative';

        deKeyline.appendChild(de);

        return de;
    }
}








p._createBoundsLine = function () {

    var de = document.createElement('div');
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'grey';
    de.style.position = 'relative';

    return de;
}


p._createParameterOptions = function () {

    var de = document.createElement('div');
    de.style.display = 'flex';
    de.style.width = '100%';
    de.style.height = this._lineH + 'px';
    de.style.background = 'linear-gradient(to bottom, blue 18%,darkblue 96%)';

    var space = document.createElement('div');
    space.style.display = 'inline-block';
    space.style.flex = '1';
    space.style.pointerEvents = 'none';
    de.appendChild(space);

    this._btnOpenScript = amgui.createIconBtn({
        icon: 'code',
        height: this._baseH,
        onClick: this._onClickOpenScript,
        parent: de
    });

    this._btnEdit = amgui.createIconBtn({
        icon: 'wrench',
        height: this._baseH,
        parent: de
    });

    amgui.bindDropdown({
        deTarget: this._btnEdit,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'merge'},
                {text: 'split'},
                {text: 'end here'},
                {text: 'start here'},
                {text: 'add', icon: 'plus'},
                {text: 'remove', icon: 'minus'},
            ]
        }),
        onSelect: function () {
            am.dialogs.featureDoesntExist.show();
        }
    });

    amgui.bindDropdown({
        asContextMenu: true,
        deTarget: de,
        deMenu: amgui.createDropdown({
            options: [
                {text: 'move up', onSelect: this.emit.bind(this, 'move', this, -1)},
                {text: 'move down', onSelect: this.emit.bind(this, 'move', this, 1)},
                {text: 'delete', onSelect: this.emit.bind(this, 'delete', this)},
            ]
        })
    });

    return de;
};

module.exports = IntervalScript;
