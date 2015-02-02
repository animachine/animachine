'use strict';

var EventEmitter = require('eventman');
var inherits = require('inherits');

function Chronicler() {

    EventEmitter.call(this);

    this._stack = [], 
    this._pointer = -1;
    this._chains = [];
    this._saveSuspended = false;
}

inherits(Chronicler, EventEmitter);
module.exports = Chronicler;
var p = Chronicler.prototype;

Object.defineProperty(p, 'saveSuspended', {
    set: function (v) {
        this._saveSuspended = !!v;
    },
    get: function (v) {
        return this._saveSuspended;
    }
})

p.undo = function() {

    if (this._pointer < 0) {

        return false;
    }

    var rec = this._stack[this._pointer--];

    if (rec instanceof Flag) {

        var startFlagIdx = this._stack.indexOf(rec.pair);

        if (startFlagIdx !== -1) {

            while (this._pointer !== startFlagIdx) {

                this._call(this._stack[this._pointer--].undo);
            }

            this._pointer--;
        }
    }
    else {
        this._call(rec.undo);
    }

    this.emit('change');
};

p.redo = function() {

    if (this._pointer >= this._stack.length - 1) {

        return false;
    }

    var rec = this._stack[++this._pointer];
    
    if (rec instanceof Flag) {

        var endFlagIdx = this._stack.indexOf(rec.pair);

        if (endFlagIdx !== -1) {

            while (++this._pointer !== endFlagIdx) {

                this._call(this._stack[this._pointer].redo);
            }
        }
    }
    else {
        this._call(rec.redo);
    }

    this.emit('change');
};

p._call = function (reg) {

    var ssSave = this.saveSuspended;//TODO replace this with something
    this.saveSuspended = true;

    if (typeof reg === 'function') {

        reg();
    }
    else {
        reg[0].apply(reg[1], reg.slice(2));
    }

    this.saveSuspended = ssSave;
}

p.save = function (...args) {

    if (this.saveSuspended) return;

    if (args.length === 0) throw Error;

    var reg = args[0];

    if (args.length !== 1) {

        reg = {
            undo: args[0],
            redo: args[1],
            name: args[2],
        }
    }

    this._saveReg(reg);
    
    this.emit('change');

    return reg;
};


p._saveReg = function (reg) {

    this._stack.splice(++this._pointer, this._stack.length, reg);
};



p.getRecords = function () {

    var items = [], currFlag, pointer = this._pointer;

    this._stack.forEach(function (item, idx) {

        if (currFlag) {

            if (item === currFlag.pair) {

                currFlag = undefined;
            }
        }
        else {

            if (item instanceof Flag) {

                currFlag = item;
                add(item.name, this._stack.indexOf(item.pair) - 1);
            }
            else {
                add(item.name, idx);
            }
        }
    }, this);

    return items;


    function add(name, idx) {

        items.push({
            name: name || 'unnamed record',
            idx: idx,
            executed: idx <= pointer
        });
    }
};

p.goto = function (idx) {

    idx = Math.max(-1, Math.min(this._stack.length-1, parseInt(idx)));

    if (idx < this._pointer) {

        while (idx < this._pointer) {

            this.undo();
        }
    }
    else if (idx > this._pointer) {

        while (idx > this._pointer) {

            this.redo();
        }
    }
};







function Flag(name, pair) {

    this.name = name;
    this.pair = pair || new Flag(name, this);
    
    Object.freeze(this);
}

p.startFlag = function (name) {

    var flag = new Flag(name);

    this._saveReg(flag);

    return flag.pair;
};

p.endFlag = function (flag) {

    this._saveReg(flag);
};

p.wrap = function (fn, ctx) {

    return function () {

        var endFlag = this.startFlag();

        fn.apply(ctx, Array.prototype.slice.call(arguments,  2));

        this.endFlag(endFlag);
    }.bind(this);
};








p.saveChain = function (id, undo, redo, name, delay) {

    if (this.saveSuspended) return;

    var chain = this.getChain(id);

    if (chain) {
        
        chain.reg.redo = redo;
    }
    else {

        chain = {
            id: id,
            reg: this.save(undo, redo, name)
        };
        this._chains.push(chain);
    }

    if (delay === undefined) {
        delay = 312;
    }

    clearTimeout(chain.tid);
    chain.tid = setTimeout(this.closeChain.bind(this, id), delay);
};

p.closeChain = function (id) {

    var chain = this.getChain(id);

    if (!chain) {
        return;
    }

    clearTimeout(chain.tid);
    this._chains.splice(this._chains.indexOf(chain), 1);
};

p.clear = function () {

    while (this._chains.length) {
        this.closeChain(this._chains[0].id);
    }
    
    this._stack.length = 0, 
    this._pointer = -1;

    this.emit('change');
};

p.getChain = function (id) {

    return this._chains.find(function (chain) {

        return chain.id === id;
    });
};







//TODO
// p.wrapFunctionPairs(opt) {

//     var slice = Array.prototype.slice,
//         oriUndoFn = opt.undoRoot[opt.undoFnName],
//         history = this,
//         dummyHistory = {
//             save: function () {},
//             flag: function () {},
//             endFlag: function () {},
//         },
//         undoHistory = Object.create(dummyHistory),
//         redoHistory = Object.create(dummyHistory);

//     undoHistory.save = function () {

//         history.save([opt.undo.addParam, this, param, true],
//             [this.removeParam, this, param, true], 'remove param ' + opt.name);
//     }

//     opt.undo.parent[opt.undo.fnName] = function () {

//         var args = slice.call(arguments);
//         args.push(undoHistory);

//         oriUndoFn.apply(opt.undo.thisArg, args)
//     }
// }