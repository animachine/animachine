'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');
var Dialog = require('dialog');

var ACTIONS = [{
    method: 'play',
    arguments: [{type: 'number'}, {}],
}];

function TriggerMap(opt) {

    EventEmitter.call(this);

    this._triggers = {};
}

inherits(TriggerMap, EventEmitter);
var p = TriggerMap.prototype;
module.exports = TriggerMap;

p.getSave = function () {

    return _.cloneDeep(this._triggers);
};

p.useSave = function (save) {

    if (!save) throw Error;

    this._triggers = _.cloneDeep(this._triggers);

    this.emit('change');
};

p.editTrigger = function (trigger) {

    this._editDialog.show(trigger);
};

p.getScript = function () {

    var ret = [];

    this._triggers.forEach(trigger => {

        let args = _.pluck(trigger.action.argument, 'value').join(', '),
            action = `${trigger.action.method}(${args})`;

        ret.push(`$(${trigger.targets}).on(${trigger.events}, ${action});`);
    });

    return ret.join('\n');
}

p._createTrigger = function () {

    return {
        name: '',
        events: [],
        targets: [],
        action: {method: '', arguments: []},
    };
};

p._createEditDialog = function () {

    this._editDialog = new Dialog();
}