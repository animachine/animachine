'use strict';

var amgui = require('../../../amgui');
var Input = require('./Input');
var OptionLine = require('../../../utils/OptionLine');

function ParamsTab() {

    this._paramOptionLines = [];

    this._onSelectTrack = this._onSelectTrack.bind(this);
    this._onDeselectTrack = this._onDeselectTrack.bind(this);

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







p._unlisten = function () {

    if (!this._currTrack) return;

    this._paramOptionLines.forEach(function (optionLine) {
        
        var param = this._currTrack.getParam(optionLine.title);

        if (param) {
            
            param.detachInput(optionLine.inputs.input);
            optionLine.inputs.input.reset();
        }
    });
};

p._listen = function () {

    this._paramOptionLines.forEach(function (optionLine) {

        var param = this._currTrack.getParam(optionLine.title);

        if (param) {

            optionLine.inputs.input.value = param.getValue();
        }
    }, this);
};








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

    var drawers = {};

    var boderStyleOptions = 'none,hidden,dotted,dashed,solid,double,groove,ridge,inset,outset,initial,inherit'.split(',');

    var paramTree = [

        {
            title: 'Font',
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
        {title: 'Border', children: [
            {title: 'Color', children: [
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
        {title: 'Background', children: []},
        {title: 'Transform', children: []},
        {title: 'Layout', children: []},
    ];
    var build = function (nodeList, parent, indent) {

        nodeList.forEach(function (node) {

            var optionLine;

            if (node.input) {

                if (typeof(node.input) === 'string') {
                    node.input = {type: node.input};
                }

                node.inputs = [node.input];
                delete node.input;
            }

            if (node.children) {

                optionLine = this._createGroup(node);

                build(node.children, optionLine, indent + 1);
            }
            else {
                
                optionLine = this._createParam(node);
            }


            if (parent.addSubline) {

                parent.addSubline(optionLine.domElem);
            }
            else {
                
                parent.appendChild(optionLine.domElem);
            }

            optionLine.indent = indent;

        }, this);

    }.bind(this);

    build(paramTree, this._scrollCont, 0);

    // addDrawer('Text');
    // addDrawer('Font');
    // addDrawer('Border');
    // addDrawer('Background');
    // addDrawer('Transform');
    // addDrawer('Layout');

    // addInput('font-family', 'Font');
    // addInput('font-size', 'Font');
    // addInput('font-weight', 'Font');
    // addInput('font-style', 'Font');
    // addInput('font-variant', 'Font');
    // addInput('text-transform', 'Font', {optionLine: ['uppercase', 'lovercase', 'capitalise', 'none']});
    // addInput('text-decoration', 'Font', {optionLine: ['underline', 'overline', 'line-trough', 'none']});
    // addInput('color', 'Font', {type: 'color'});

    // function addDrawer(name) {

    //     var drawer = drawers[name] = amgui.createDrawer({
    //         text: name,
    //         parent: that._scrollCont
    //     });
    // }

    // function addInput(name, drawerName) {

    //     var input;

    //     switch (name) {

    //         default:
    //             input = new Input({name: name});
    //     }

    //     input.on('create', that._onInputCreate);
    //     drawers[drawerName].deContent.appendChild(input.domElem);

    //     that._inputs.push(input);
    // }
};

p._createGroup = function (opt) {

    var isChildrenVisible = true;

    var inpOpt = {
        title: opt.title,
        tgglChildren: {
            onClick: onToggleChildren,
        }
    };

    var optionLine = new OptionLine(inpOpt);

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

    onToggleChildren();

    return optionLine;
};

p._createParam = function (opt) {

    var inpOpt = {
        btnKey: true,
        title: opt.title,
        inputs: opt.inputs,
    };

    var optionLine = new OptionLine(inpOpt);

    this._paramOptionLines.push(optionLine);

    return optionLine;
};


module.exports = ParamsTab;
