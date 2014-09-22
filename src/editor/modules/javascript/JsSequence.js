var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');
var IntervalScript = require('./IntervalScript');
var MomentScript = require('./MomentScript');
var mstPlayer = require('./script.player.mst');
var dialogSequOptions = require('./dialogSequOptions');

function JsSequence(opt) {

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
    this._onClickName = this._onClickName.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._onChangeName = this._onChangeName.bind(this);
    this._animPlay = this._animPlay.bind(this);

    this.deOptions = document.createElement('div');
    this.deKeys = document.createElement('div');

    this._deHeadOptinos = this._createHeadOptions();
    this._deHeadKeyline = amgui.createKeyline({});
    this.deKeys.appendChild(this._deHeadKeyline);

    am.timeline.on('changeTime', this._onChangeTime);
    this.deOptions.addEventListener('click', this._onSelectClick);
    this.deKeys.addEventListener('click', this._onSelectClick);

    if (opt) {
        this.useSave(opt);
    }
}

inherits(JsSequence, EventEmitter);
var p = JsSequence.prototype;

p.type = 'js_sequ_type';






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
        isShowingIntervalScripts: this._isShowingIntervalScrips,
    };

    this._intervalScripts.forEach(function (intervalScript) {

        save.intervalScripts.push(intervalScript.getSave());
    });

    return save;
};

p.useSave = function (save) {

    if (!save) {
        return;
    }

    this._selectors = save.selectors || [];

    if ('name' in save) this.name = save.name

    if (save.intervalScripts) {

        save.intervalScripts.forEach(this._addIntervalScript, this);
    }

    this._selectElements();
    this._refreshHeadKeyline();
    this._refreshTgglKey();

    if (save.isShowingIntervalScripts) {

        this._showIntervalScripts();
    }
};

p.getScript = function () {

    var paramKeys = [], code = '', options, selectors;

    this._intervalScripts.forEach(function (intervalScript) {

        paramKeys.push(intervalScript.getScriptKeys());
    });

    options = {
      direction: "normal",
      duration: am.timeline.length,
      iterations: this.iterations,
      fill: this.fill,
    };

    selectors = this._selectors.join(',').replace('\\','\\\\');

    code = Mustache.render(mstPlayer, {
        paramKeys: JSON.stringify(paramKeys),
        options: JSON.stringify(options),
        selectors: selectors
    });

    return code;
};

p._addIntervalScript = function (opt, skipHistory) {

    opt = opt || {};

    var intervalScript = this.getParameter(opt.name);
    

    if (intervalScript) {

        return intervalScript;
    }
    else {

        if (opt.name === 'transform') {

            intervalScript = new CssTransformParameter(opt);
        }
        else {

            intervalScript = new IntervalScript(opt);
        }

        if (!skipHistory) {
            am.history.save([this.removeIntervalScript, this, intervalScript, true],
                [this._addIntervalScript, this, intervalScript, true]);
        }

        this._intervalScripts.push(intervalScript);
        intervalScript.on('change', this._onChangeIntervalScript);
        intervalScript.on('delete', this._onDeleteIntervalScript);
        intervalScript.on('move', this._onMoveIntervalScript);

        this._refreshIntervalScriptOrdering();
        this._moveBlankParameterDown();
        this.emit('changeHeight', this);

        return intervalScript;
    }
};

p.removeIntervalScript = function (intervalScript, skipHistory) {

    if (!skipHistory) {
        am.history.save([this._addIntervalScript, this, intervalScript, true],
            [this.removeIntervalScript, this, intervalScript, true]);
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

    if (this._selectors.length === 0) {
        return;
    }

    var selection = _.toArray(am.deRoot.querySelectorAll(this._selectors.join(',')));

    this._intervalScripts.forEach(function (intervalScript) {

        selection.forEach(function (de) {

            de.style[intervalScript.name] = intervalScript.getValue(time);
        });
    });
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
    //TODO
    this.renderTime(am.timeline.currTime);
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










p._onChangeTime = function (time) {

    if (this._isPlaying) {
        return;
    }
//TODO
    this._refreshTgglKey();
    
    this._intervalScripts.forEach(function (intervalScript) {

        this.renderTime(time);
        this._focusHandler();
    }, this);
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

p._onClickTgglShowIntervalScripts = function () {

    if (this._isShowingIntervalScrips) {
        this._hideIntervalScripts   ();
    }
    else {
        this._showIntervalScripts();
    }
};

p._onClickAddIntervalScript = function () {

    if (this._isHidingSelectedElems) {
        this._showSelectedElems();
    }
    else {
        this._hideSelectedElems();
    }
};

p._onClickName = function () {

    dialogSequOptions.show({
        name: this._name,
        onChangeName: this._onChangeName,
    });
};

p._onChangeName = function (name) {

    this.name = name;
};













p._refreshTgglMomentScript = function () {

    //TODO
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

    this._deName = amgui.createLabel({caption: this._name, parent: de});
    this._deName.style.height = this._baseH  + 'px';
    this._deName.style.cursor = 'pointer';
    this._deName.addEventListener('click', this._onClickName);

    var deNameIcon = amgui.createIcon({
        icon: 'cog',
        parent: de
    });
    deNameIcon.style.display = 'none';
    this._deName.addEventListener('mouseenter', function () {deNameIcon.style.display = 'inline-block';})
    this._deName.addEventListener('mouseleave', function () {deNameIcon.style.display = 'none';})

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

    this._tgglMomentScript = amgui.createToggleIconBtn({
        icon: 'code',
        height: this._baseH,
        onClick: this._onClickTgglMomentScript,
        changeColor: true,
        parent: de
    });
    this._refreshTgglKey();

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

p.isOwnedDomElem = function (de) {

    return false;
};

p.dispose = function () {

    am.timeline.removeListener('changeTime', this._onChangeTime);

    //TODO
}

module.exports = JsSequence;




