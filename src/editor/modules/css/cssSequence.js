var EventEmitter = require('events').EventEmitter;
var inherits = require('inherits');
var amgui = require('../../amgui');
var CssParameter = require('./CssParameter');
var Key = require('./Key');
var Transhand = require('../../transhand/Transhand');

var cssSequence = {

    _instances: [],

    create: function (opt) {

        return new CssSequence(opt);
    }
}

var HAND2CSS = {
    'x': 'left',
    'y': 'top',
    'w': 'width',
    'h': 'height',
};

function CssSequence(opt) {

    opt = opt || {};

    EventEmitter.call(this);

    cssSequence._instances.push(this);

    this._selectors = opt.selectors || [];
    this._parameters = [];

    this._opt = _.extend({baseH: 21}, opt);

    this._selectedElements = [];
    this._isOpened = false;
    this._headKeys = [];

    this._onSelectClick = this._onSelectClick.bind(this);
    this._onChangeHandler = this._onChangeHandler.bind(this);
    this._onChangeTime = this._onChangeTime.bind(this);
    this._onChangeParameter = this._onChangeParameter.bind(this);
    this._onChangeBlankParameter = this._onChangeBlankParameter.bind(this);
    this._onToggleKey = this._onToggleKey.bind(this);

    this.deOptions = document.createElement('div');
    this.deKeys = document.createElement('div');

    this._deHeadOptinos = this._createHeadOptions();
    this._deHeadKeyline = amgui.createKeyline({});
    this.deKeys.appendChild(this._deHeadKeyline);

    am.timeline.on('changeTime', this._onChangeTime);
    this.deOptions.addEventListener('click', this._onSelectClick);
    this.deKeys.addEventListener('click', this._onSelectClick);

    this._onChangeBlankParameter();
}

inherits(CssSequence, EventEmitter);
var p = CssSequence.prototype;

p.select = function () {

    if (this._isSelected) return;
    this._isSelected = true;


    if (!this._handler) {
        this._handler = new Transhand();
    }

    this._handler.on('change', this._onChangeHandler);

    this.selectElements();

    if (this._selectedElements.length) {

        this._focusHandler(this._selectedElements[0]);
    }

    this.deHighlight.style.opacity = 1;

    this.emit('select', this);
};

p.deselect = function () {

    if (!this._isSelected) return;
    this._isSelected = false;

    this._blurHandler();

    this.deHighlight.style.opacity = 0;

    if (this._handler) {

        this._handler.removeListener('change', this._onChangeHandler);
    }
};

p.renderTime = function (time) {

    var selection = _.toArray(am.deRoot.querySelectorAll(this._selectors.join(',')));

    this._parameters.forEach(function (param) {

        selection.forEach(function (de) {

            de.style[param.name] = param.getValue(time);
        });
    });
};

p.height = function () {

    return this._opt.baseH * (this._isOpened ? this._parameters.length + 1 : 1);
}

p._onPick = function (de) {

    var items = am.deRoot.querySelectorAll(this.selectors.join(','));

    if (items.indexOf(de)) {

        this.select();
    }
}

p._focusHandler = function (de) {

    de = de || this._currHandledDe;
    this._currHandledDe = de;

    if (!this._currHandledDe) return;

    var br = de.getBoundingClientRect();
    var handOpt = {
        type: 'transformer',
        base: {
            x: br.left, 
            y: br.top, 
            w: br.width, 
            h: br.height,
        }
    };
    var transformParam = this.getParameter('transform');

    if (transformParam) {

        handOpt.params = transformParam.getParams();
    }

    this._handler.setup({
        hand: handOpt
    });
    this._handler.activate();

    am.deHandlerCont.appendChild(this._handler.domElem);
};

p._blurHandler = function () {

    // this._currHandledDe = undefined;

    if (this._handler && this._handler.domElem && this._handler.domElem.parentNode) {

        this._handler.deactivate();
        this._handler.domElem.parentNode.removeChild(this._handler.domElem);        
    }
};

p._onSelectClick = function () {

    this.select();
}

p._onChangeHandler = function(params, type) {

    var time = am.timeline.currTime,
        name, prop;


    if (type === 'transform') {

        Object.keys(params).forEach(function (name) {

            if (name === 'tx' || name === 'ty' || name === 'ty' ||
                name === 'rx' || name === 'ry' || name === 'ry' ||
                name === 'sx' || name === 'sy' || name === 'sy')
            {

                prop = this.addParameter({name: 'transform'});
                prop.addKey({
                    time: time, 
                    name: name, 
                    value: {name: params[name]}
                });
            }
            else if (name === 'ox' || name === 'oy') {

                prop = this.addParameter({name: 'transform-origin'});
                prop.addKey({
                    time: time, 
                    name: name, 
                    value: {name: params[name]}
                });
            }
        }, this);
        
    }

    this.renderTime(time);
    this._focusHandler();
};

p._onChangeTime = function (time) {

    this._parameters.forEach(function (param) {

        this.renderTime(time);
        this._focusHandler();
        this._refreshBtnToggleKey();
    }, this);
};

p._onChangeParameter = function () {

    this.renderTime();
    this._focusHandler();
    this._refreshHeadKeyline();
    this._refreshBtnToggleKey();

    this.emit('change');
};

p._onChangeBlankParameter = function () {

    if (this._blankParameter) {

        this._blankParameter.removeListener('change', this._onChangeBlankParameter);
    };

    this._blankParameter = this.addParameter();
    this._blankParameter.on('change', this._onChangeBlankParameter);
};

p._onToggleKey = function () {

    var time = am.timeline.currTime;
        allHaveKey = this._isAllParamsHaveKey(time);

    this._parameters.forEach(function (param) {

        if (param.isValid()) {

            if (allHaveKey) {
                param.deleteKey(param.getKey(time));
            }
            else {
                param.addKey({time: time});
            }
        }
    });

    this._refreshBtnToggleKey();
};

p._isAllParamsHaveKey = function (time) {

    return this._parameters.every(function (param) {

        return param.getKey(time) || !param.isValid();
    });
} 

p.getParameter = function (name) {

    return this._parameters.find(function(param) {

        return param.name === name;
    });
};

p.addParameter = function (opt) {

    opt = opt || {};

    var param = this.getParameter(opt.name);

    if (param) {

        return param
    }
    else {

        if (opt.name === 'transform') {

            param = new TransformCssParameter(opt);
        }
        else {

            param = new CssParameter(opt);
        }

        this._parameters.push(param);
        param.on('change', this._onChangeParameter);

        this.deOptions.appendChild(param.deOptions);
        this.deKeys.appendChild(param.deKeyline);
        this.emit('changeHeight');

        return param;
    }
};

p._refreshBtnToggleKey = function () {

    var allHaveKey = this._isAllParamsHaveKey(am.timeline.currTime);
    this._btnToggleKey.style.color = allHaveKey ? amgui.color.text : 'rgba(255,255,255,.23)';
};


p._refreshHeadKeyline = function () {

    var times = [], oldKeys = this._headKeys.splice(0);

    this._parameters.forEach(function (param) {

        times = times.concat(param.getKeyTimes());
    });

    times = _.uniq(times);

    times.forEach(function (time) {

        var key = oldKeys.pop() || new Key({
            deKeyline: this._deHeadKeyline
        });

        key.time = time;

        this._headKeys.push(key);
    }, this);

    _.invoke(_.difference(oldKeys, this._headKeys), 'dispose');
};

p.getScript = function () {

    var keys = [], code = '', options, selectors, 
        longestOffset = 0;

    this._parameters.forEach(function (prop) {

        prop._keys.forEach(function (key) {

            var offset = key.time;
            getKey(offset)[prop.name] = key.value;

            if (longestOffset < offset) longestOffset = offset; 
        });
    });

    keys.forEach(function (key) {

        key.offset /= longestOffset; 
    });

    keys.sort(function (a, b) {

        return a.offset - b.offset;
    });

    function getKey(time) {

        var key = keys.find(function (_key) {
            return time === _key.offset;
        });

        if (!key) {
            
            key = {offset: time};
            keys.push(key);
        }

        return key;
    }

    options = {
      direction: "norma;", 
      duration: longestOffset, 
      iterations: 1
    };

    selectors = this._selectors.join(',').replace('\\','\\\\');

    code = '(function () {                                                                     \n' 
         + '                                                                                   \n'
         + '    var animations = [],                                                           \n'
         + '        keys = ' + JSON.stringify(keys) + ',                                       \n'
         + '        options = ' + JSON.stringify(options) + ',                                 \n'
         + '        elems = document.querySelectorAll("' + selectors + '");                    \n'
         + '                                                                                   \n'
         + '    for (var i = 0; i < elems.length; ++i) {                                       \n'
         + '                                                                                   \n'
         + '        animations.push(new Animation(elems[i], keys, options));                   \n'
         + '    }                                                                              \n'
         + '                                                                                   \n'
         + '    return new AnimationGroup(animations);                                         \n'
         + '}())                                                                               \n';
    
    return code;
};

p.getMagnetPoints = function () {

    var times = [];

    this._headKeys.forEach(function (key) {

        times.push(key.time);
    });

    return times;
};
                                                                                   


p._createHeadOptions = function (){

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = '100%';
    de.style.height = this._opt.baseH + 'px';
    de.style.background = 'linear-gradient(to bottom, #063501 18%,#064100 96%)';
    this.deOptions.appendChild(de);

    this.deHighlight = document.createElement('div');
    this.deHighlight.style.display = 'inline-block';
    this.deHighlight.style.width = '2px';
    this.deHighlight.style.height = this._opt.baseH + 'px';
    this.deHighlight.style.background = 'gold';
    this.deHighlight.style.opacity = 0;
    de.appendChild(this.deHighlight);

    this._deToggleDropDown = amgui.createToggleIconBtn({
        iconOn: 'angle-down',
        iconOff: 'angle-right',
        height: this._opt.baseH,
    });
    this._deToggleDropDown.addEventListener('toggle', function (e) {
        this._isOpened = e.detail.state;
        this.emit('changeHeight', this.height());
    }.bind(this));
    this._deToggleDropDown.style.display = 'inline-block';
    de.appendChild(this._deToggleDropDown);

    this._deOptionsBtn = amgui.createIconBtn({icon: 'cog', height: this._opt.baseH});
    this._deOptionsBtn.style.position = 'absolute';
    this._deOptionsBtn.style.right = '21px';
    this._deOptionsBtn.style.top = '0px';
    de.appendChild(this._deOptionsBtn);

    this._btnToggleKey = amgui.createIconBtn({icon: 'key', height: this._opt.baseH});
    this._btnToggleKey.style.position = 'absolute';
    this._btnToggleKey.style.right = '0px';
    this._btnToggleKey.style.top = '0px';
    this._btnToggleKey.addEventListener('click', this._onToggleKey);
    de.appendChild(this._btnToggleKey);
    this._refreshBtnToggleKey();

    return de;
};

p.isOwnedDomElement = function (de) {

    return this._selectedElements.indexOf(de) !== -1;
};

p.selectElements = function () {

    var list = [];

    this._selectors.forEach(function (selector) {

        var items = am.deRoot.querySelectorAll(selector);
        items = Array.prototype.slice.call(items);
        list = list.concat(items);
    });

    this._selectedElements = list;
};

module.exports = cssSequence;




