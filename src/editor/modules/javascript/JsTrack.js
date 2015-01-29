    'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var amgui = require('../../amgui');
var IntervalScript = require('./IntervalScript');
var MomentScript = require('./MomentScript');
var mstPlayer = require('./script.player.mst');
var dialogTrackOptions = require('./dialogTrackOptions');

function JsTrack(opt) {

    EventEmitter.call(this);

    this._intervalScripts = [];
    this._momentScripts = [];
    this._baseH = 21;
    this._isShowingIntervalScrips = false;
    this._isHidingSelectedElems = false;
    this._isPlaying = false;

    this._onSelectClick = this._onSelectClick.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeIntervalScript = this._onChangeIntervalScript.bind(this);
    this._onDeleteIntervalScript = this._onDeleteIntervalScript.bind(this);
    this._onMoveIntervalScript = this._onMoveIntervalScript.bind(this);
    this._onClickAddIntervalScript = this._onClickAddIntervalScript.bind(this);
    this._onClickTgglShowIntervalScripts = this._onClickTgglShowIntervalScripts.bind(this);
    this._onClickTgglMomentScript = this._onClickTgglMomentScript.bind(this);
    this._onClickEditMomentScript = this._onClickEditMomentScript.bind(this);
    this._onClickName = this._onClickName.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._animPlay = this._animPlay.bind(this);

    this.deOptions = document.createElement('div');
    this.deKeys = document.createElement('div');

    this._deHeadOptinos = this._createHeadOptions();
    this._deHeadKeyline = amgui.createKeyline({});
    this.deKeys.appendChild(this._deHeadKeyline);

    this.timeline.on('changeTime', this._onChangeTime);
    this.deOptions.addEventListener('click', this._onSelectClick);
    this.deKeys.addEventListener('click', this._onSelectClick);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(JsTrack, EventEmitter);
var p = JsTrack.prototype;

p.type = 'js_track_type';






Object.defineProperties(p, {

    height: {

        get: function () {

            var ret = this._baseH;

            if (this._isShowingIntervalScrips) {

                this._intervalScripts.forEach(function (intervalScript) {

                    ret += intervalScript.height;
                });
            }

            return ret;
        }
    },

    name: {
        set: function (v) {

            if (v === this._name) return;

            this._name = v || 'unnamed';
            this._deName.textContent = this._name;
        },
        get: function () {

            return this._name;
        }
    }
});






p.getSave = function () {

    var save = {
        name: this.name,
        intervalScripts: [],
        momentScripts: [],
        isShowingIntervalScripts: this._isShowingIntervalScrips,
    };

    this._intervalScripts.forEach(function (intervalScript) {

        save.intervalScripts.push(intervalScript.getSave());
    });

    this._momentScripts.forEach(function (momentScript) {

        save.momentScripts.push(momentScript.getSave());
    });

    return save;
};

p.useSave = function (save) {

    if (!save) {
        return;
    }

    this._selectors = save.selectors || [];

    if ('name' in save) this.name = save.name;

    if (save.intervalScripts) {

        save.intervalScripts.forEach(this.addIntervalScript, this);
    }

    if (save.momentScripts) {

        save.momentScripts.forEach(this.addMomentScript, this);
    }

    if (save.isShowingIntervalScripts) {

        this._showIntervalScripts();
    }
};

p.getScript = function () {//TODO

    var momentScripts = [], intervalScripts = [];

    this._intervalScripts.forEach(function (intervalScript) {

    });

    var code = Mustache.render(mstPlayer, {
        momentScripts: JSON.stringify(momentScripts),
        intervalScripts: JSON.stringify(intervalScripts)
    });

    return 'function () {/*TODO*/}';
};

p.addIntervalScript = function (opt, skipHistory) {

    opt = opt || {};

    var intervalScript = new IntervalScript(opt);

    if (!skipHistory) {
        am.history.save([this._removeIntervalScript, this, intervalScript, true],
            [this.addIntervalScript, this, opt, true], 'add interval script');
    }
    
    this._intervalScripts.push(intervalScript);
    intervalScript.on('change', this._onChangeIntervalScript);
    intervalScript.on('delete', this._onDeleteIntervalScript);
    intervalScript.on('move', this._onMoveIntervalScript);

    this._refreshIntervalScriptOrdering();
    this.emit('changeHeight', this);

    return intervalScript;
};

p.removeIntervalScript = function (intervalScript, skipHistory) {

    if (!skipHistory) {
        am.history.save([this.addIntervalScript, this, intervalScript, true],
            [this.removeIntervalScript, this, intervalScript, true], 'remove interval script');
    }

    var idx = this._intervalScripts.indexOf(intervalScript);

    if (idx === -1) {
        return;
    }

    this._intervalScripts.splice(idx, 1);

    intervalScript.removeListener('change', this._onChangeIntervalScript);
    intervalScript.removeListener('delete', this._onDeleteIntervalScript);
    intervalScript.removeListener('move', this._onMoveIntervalScript);

    $(intervalScript.deOptions).remove();
    $(intervalScript.deKeyline).remove();
};

p.moveIntervalScript = function (intervalScript, way) {

    var idx = this._intervalScripts.indexOf(intervalScript);

    this._intervalScripts.splice(idx, 1);
    idx = Math.min(this._intervalScripts.length, Math.max(0, idx + way));
    this._intervalScripts.splice(idx, 0, intervalScript);

    this._refreshIntervalScriptOrdering();
};


p.addMomentScript = function (opt, skipHistory) {
    
    var ms = this.getMomentScript(opt.time);

    if (ms) {

        if ('script' in opt) {

            if (!skipHistory) {
                am.history.saveChain(ms, 
                    [this.addMomentScript, this, ms, true], 
                    [this.addMomentScript, this, opt, true], 
                    'edit moment script');
            }

            ms.script = opt.script;
        }
    }
    else {

        ms = new MomentScript(_.extend({deKeyline: this._deHeadKeyline}, opt));

        // ms.on('changeTime', this._onChangeKeyTime);//TODO
        // ms.on('delete', this._onDeleteKey);//TODO

        this._momentScripts.push(ms);

        if (!skipHistory) {
            am.history.closeChain(ms);
            am.history.save(
                [this.removeMomentScript, this, opt.time, true], 
                [this.addMomentScript, this, opt, true], 
                'add moment script');
        }
    }

    this._refreshTgglMomentScript();

    this.emit('change');

    return ms;
};

p.removeMomentScript = function (ms, skipHistory) {

    if (typeof(ms) === 'number') {

        ms = this.getMomentScript(ms);
    }

    var idx = this._momentScripts.indexOf(ms);

    if (idx === -1) {

        return;
    }

    if (!skipHistory) {
        am.history.save(
            [this.addMomentScript, this, ms, true],
            [this.removeMomentScript, this, ms, true], 
            'remove moment script');
    }

    this._momentScripts.splice(idx, 1);

    ms.dispose();

    // ms.removeListener('changeTime', this._onChangeKeyTime);//TODO
    // ms.removeListener('delete', this._onDeleteKey);//TODO

    this._refreshTgglMomentScript();

    this.emit('change');
};

p.getMomentScript = function (time) {

    return this._momentScripts.find(function(ms) {

        return ms.time === time;
    });
};


p.select = function (opt) {

    opt = opt || {};

    if (this._isSelected) return;
    this._isSelected = true;

    this.deHighlight.style.opacity = 1;

    this.emit('select', this);
};

p.deselect = function () {

    if (!this._isSelected) return;
    this._isSelected = false;

    this.deHighlight.style.opacity = 0;
};

p.renderTime = function (time) {

    //TODO
};

p.play = function () {

    this._isPlaying = true;

    this._animPlay();
};

p.pause = function () {

    this._isPlaying = false;

    window.cancelAnimationFrame(this._animPlayRafid);
};

p.getMagnetPoints = function () {

    var times = [];

    this._momentScripts.forEach(function (momentScript) {

        times.push(momentScript.time);
    });

    return times;
};










p._animPlay = function () {

    this._animPlayRafid = window.requestAnimationFrame(this._animPlay);
    
    var currTime = this.timeline.currTime, 
        prevTime = this.prevRenderTime;

    this._momentScripts.forEach(function (momentScript) {

        if (momentScript.time > prevTime && momentScript.time <= currTime) {

            momentScript.runScript();
        }
    });

    this._intervalScripts.forEach(function (intervalScript) {

        if (intervalScript.isInsideBounds(currTime)) {

            intervalScript.runScript();
        }
    });

    this.prevRenderTime = currTime;
};

p._showIntervalScripts = function () {

    if (this._isShowingIntervalScrips) return;
    this._isShowingIntervalScrips = true;

    this._tgglShowIntervalScripts.setToggle(true);
    this.emit('changeHeight', this);
};

p._hideIntervalScripts = function () {

    if (!this._isShowingIntervalScrips) return;
    this._isShowingIntervalScrips = false;

    this._tgglShowIntervalScripts.setToggle(false);
    this.emit('changeHeight', this);
};








p._onSelectClick = function () {

    this.select();
};

p._onChangeTime = function () {

    if (this._isPlaying) {
        return;
    }

    this._refreshTgglMomentScript();
};

p._onChangeIntervalScript = function () {

    this.renderTime();

    this.emit('change');
};

p._onDeleteIntervalScript = function (intervalScript) {

    this.removeIntervalScript(intervalScript);
};

p._onMoveIntervalScript = function (intervalScript, way) {

    this.moveIntervalScript(intervalScript, way);
};

p._onClickTgglMomentScript = function () {

    var time = this.timeline.currTime,
        momentScript = this.getMomentScript(time);
    
    if (momentScript) {

        this.removeMomentScript(momentScript);
    }
    else {
        this.addMomentScript({time: time});
    }

    this._refreshTgglMomentScript();
};

p._onClickEditMomentScript = function () {

    var momentScript = this.getMomentScript(this.timeline.currTime);

    if (momentScript) {

        momentScript.editScript();
    }
};

p._onClickTgglShowIntervalScripts = function () {

    if (this._isShowingIntervalScrips) {
        this._hideIntervalScripts   ();
    }
    else {
        this._showIntervalScripts();
    }
};

p._onClickAddIntervalScript = function () {

    this.addIntervalScript();
};

p._onClickName = function () {

    dialogTrackOptions.show({
        name: this._name,
        onChangeName: this._onChangeName,
    });
};

p._onChangeName = function (name) {

    this.name = name;
};













p._refreshTgglMomentScript = function () {

    var momentScript = this.getMomentScript(this.timeline.currTime);

    this._tgglMomentScript.setToggle(!!momentScript);
    this._tgglEditMomentScript.setToggle(!!momentScript);
};

p._refreshIntervalScriptOrdering = function () {

    this._intervalScripts.forEach(function (intervalScript) {

        this.deOptions.appendChild(intervalScript.deOptions);
        this.deKeys.appendChild(intervalScript.deKeyline);
    }, this);
};











p._createHeadOptions = function (){

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = '100%';
    de.style.display = 'flex';
    de.style.height = this._baseH + 'px';
    de.style.background = 'linear-gradient(to bottom, blue 18%,darkblue 96%)';
    this.deOptions.appendChild(de);

    this.deHighlight = document.createElement('div');
    this.deHighlight.style.display = 'inline-block';
    this.deHighlight.style.width = '2px';
    this.deHighlight.style.height = this._baseH + 'px';
    this.deHighlight.style.background = 'gold';
    this.deHighlight.style.opacity = 0;
    de.appendChild(this.deHighlight);

    this._tgglShowIntervalScripts = amgui.createToggleIconBtn({
        iconOn: 'angle-down',
        iconOff: 'angle-right',
        height: this._baseH,
        onClick: this._onClickTgglShowIntervalScripts,
        parent: de
    });

    this._deName = amgui.createLabel({text: this._name, parent: de});
    this._deName.style.height = this._baseH  + 'px';
    this._deName.style.cursor = 'pointer';
    this._deName.addEventListener('click', this._onClickName);

    var deNameIcon = amgui.createIcon({
        icon: 'cog',
        parent: de
    });
    deNameIcon.style.display = 'none';
    this._deName.addEventListener('mouseenter', function () {deNameIcon.style.display = 'inline-block';});
    this._deName.addEventListener('mouseleave', function () {deNameIcon.style.display = 'none';});

    var space = document.createElement('div');
    space.style.display = 'inline-block';
    space.style.flex = '1';
    space.style.pointerEvents = 'none';
    de.appendChild(space);

    this._btnAddIntervalScript = amgui.createIconBtn({
        icon: 'plus',
        height: this._baseH,
        defaultToggle: false,
        onClick: this._onClickAddIntervalScript,
        parent: de
    });

    this._tgglEditMomentScript = amgui.createToggleIconBtn({
        icon: 'code',
        height: this._baseH,
        onClick: this._onClickEditMomentScript,
        changeColor: true,
        parent: de
    });

    this._tgglMomentScript = amgui.createToggleIconBtn({
        iconOn: 'circle',
        iconOff: 'circle-empty',
        height: this._baseH,
        onClick: this._onClickTgglMomentScript,
        changeColor: true,
        parent: de
    });
    this._refreshTgglMomentScript();

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

p.isOwnedDomElem = function () {

    return false;
};

p.dispose = function () {

    this.timeline.removeListener('changeTime', this._onChangeTime);

    //TODO
};

module.exports = JsTrack;




