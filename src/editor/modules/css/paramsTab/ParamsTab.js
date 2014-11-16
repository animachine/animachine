'use strict';

var amgui = require('../../../amgui');
var Input = require('./Input');
var OptionLine = require('../../../utils/OptionLine');

function ParamsTab() {

    this._paramOptionLines = [];

    this._onSelectTrack = this._onSelectTrack.bind(this);
    this._onDeselectTrack = this._onDeselectTrack.bind(this);
    this._onTrackAddParam = this._onTrackAddParam.bind(this);

    this._createBase();

    am.on('selectTrack', this._onSelectTrack);
    am.on('deselectTrack', this._onDeselectTrack);
}

var p = ParamsTab.prototype;





p._onSelectTrack = function (track) {

    this._unlisten();

    this._currTrack = track;

    this._listen();
};

p._onDeselectTrack = function () {

    this._unlisten();
};


p._onInputChange = function (paramName, value) {

    if (!this._currTrack) return;

    var param = this._currTrack.getParam(paramName);

    if (!param) {

        var value = input.value;
        param = this._currTrack.addParam({name: paramName});
        param.addKey({value: value});
    }
}

p._onTrackAddParam = function () {
console.log('_onTrackAddParam')

    this._listen();
}






p._unlisten = function () {

    if (!this._currTrack) return;

    this._currTrack.removeListener('addParam', this._onTrackAddParam);

    this._forEachInput(function (input, paramName) {

        var param = this._currTrack.getParam(paramName);

        if (param) {

            param.detachInput(input);
            input.reset();
        }
    }, this);
};

p._listen = function () {
console.log('_listen')
    this._currTrack.on('addParam', this._onTrackAddParam);

    this._forEachInput(function (input, paramName) {

        var param = this._currTrack.getParam(paramName);

        if (param) {

            input.value = param.getValue();
            param.attachInput(input);
        }
    }, this);
};

p._forEachInput = function (fn, thisArg) {

    this._paramOptionLines.forEach(function (optionLine) {

        Object.keys(optionLine.inputs).forEach(function (paramName) {

            fn.call(thisArg, optionLine.inputs[paramName], paramName);
        });
    }, this);
}








p._createBase = function () {

    var that = this;

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%';
    this.domElem.style.height = '100%';
    this.domElem.style.background = amgui.color.bg0;

    this._scrollCont = document.createElement('div');
    this._scrollCont.style.width = '100%';
    this.domElem.appendChild(this._scrollCont);

    amgui.makeScrollable({
        deCont: this.domElem,
        deTarget: this._scrollCont
    });

    var boderStyleOptions = 'none,hidden,dotted,dashed,solid,double,groove,ridge,inset,outset,initial,inherit'.split(',');

    var paramTree = [

        {
            title: 'font',
            children: [
                {title: 'font-family', input: 'string'},
                {title: 'font-size', input: 'string'},
                {title: 'font-weight', input: 'string'},
                {title: 'font-style', input: 'string'},
                {title: 'font-variant', input: 'string'},
                {title: 'text-transform', input: 'string'},
                {title: 'text-decoration', input: 'string'},
                {title: 'color', input: 'color'},
            ],
        },
        {title: 'border', children: [
            {title: 'borderColor', children: [
                {title: 'borderTopColor', input: 'color'},
                {title: 'borderRightColor', input: 'color'},
                {title: 'borderBottomColor', input: 'color'},
                {title: 'borderLeftColor', input: 'color'},
            ]},
            {title: 'Width', children: [
                {title: 'borderTopWidth', input: {type: 'unit', units: ['px']}},
                {title: 'borderRightWidth', input: {type: 'unit', units: ['px']}},
                {title: 'borderBottomWidth', input: {type: 'unit', units: ['px']}},
                {title: 'borderLeftWidth', input: {type: 'unit', units: ['px']}},
            ]},
            {title: 'Style', children: [
                {title: 'borderTopStyle', input: {type: 'select', options: boderStyleOptions}},
                {title: 'borderRightStyle', input: {type: 'select', options: boderStyleOptions}},
                {title: 'borderBottomStyle', input: {type: 'select', options: boderStyleOptions}},
                {title: 'borderLeftStyle', input: {type: 'select', options: boderStyleOptions}},
            ]},
        ]},
        {title: 'background', children: []},
        {title: 'transform', children: [
            {title: 'translate', children: [
                {title: 'x', input: {}},
                {title: 'y', input: {}},
                {title: 'z', input: {}},
            ]},
            {title: 'scale', children: [
                {title: 'scaleX', input: {}},
                {title: 'scaleY', input: {}},
                {title: 'scaleZ', input: {}},
            ]},
            {title: 'rotation', children: [
                {title: 'rotationX', input: {}},
                {title: 'rotationY', input: {}},
                {title: 'rotationZ', input: {}},
            ]},
        ]},
        {title: 'layout', children: []},
    ];
    var build = function (nodeList, parent, indent) {

        nodeList.forEach(function (node) {

            var optionLine,
                isChildrenVisible = true;

            node.indent = indent;

            if (node.input) {

                if (typeof(node.input) === 'string') {
                    node.input = {type: node.input};
                }

                node.input.name = node.title;

                node.inputs = [node.input];
                delete node.input;
            }

            if (node.inputs) {

                node.btnKey = true;
            }



            if (node.children) {

                node.tgglChildren = {
                    onClick: onToggleChildren,
                }   
            }

            //create
            optionLine = new OptionLine(node);
            this._paramOptionLines.push(optionLine);

            //listen to inputs
            Object.keys(optionLine.inputs).forEach(function (inputName) {

                var changeHandler = this._onInputChange.bind(this, inputName);

                optionLine.inputs[inputName].on('change', changeHandler)
            }, this);


            //append to parent
            if (parent.addSubline) {

                parent.addSubline(optionLine.domElem);
            }
            else {
                parent.appendChild(optionLine.domElem);
            }


            if (node.children) {

                onToggleChildren();

                build(node.children, optionLine, indent + 1);
            }


            function onToggleChildren() {

                isChildrenVisible = !isChildrenVisible;

                optionLine.buttons.tgglChildren.setToggle(isChildrenVisible);

                if (isChildrenVisible) {

                    optionLine.showSubline();
                }
                else {
                    optionLine.hideSubline();
                }
            }

        }, this);

    }.bind(this);

    build(paramTree, this._scrollCont, 0);
};

module.exports = ParamsTab;
