'use strict';

function Chronicler() {

    this._stack = [], 
    this._pointer = -1;
    this._chains = [];
}

module.exports = Chronicler;
var p = Chronicler.prototype;

p.undo = function() {

    if (this._pointer < 0) {

        return false;
    }

    var rec = this._stack[this._pointer--];

    if (rec instanceof Flag) {

        var startFlagIdx = this._stack.indexOf(rec.pair);

        if (startFlagIdx !== -1) {

            while (this._pointer !== startFlagIdx) {

                call(this._stack[this._pointer--].undo);
            }

            this._pointer--;
        }
    }
    else {
        call(rec.undo);
    }
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

                call(this._stack[this._pointer].redo);
            }
        }
    }
    else {
        call(rec.redo);
    }
};

function call(reg) {

    if (typeof reg === 'function') {

        reg();
    }
    else {
        reg[0].apply(reg[1], reg.slice(2));
    }
}

p.save = function (undo, redo, name) {

    var reg = {undo: undo, redo: redo, name: name};

    this._saveReg(reg);

    return reg;
};


p._saveReg = function (reg) {

    this._stack.splice(++this._pointer, this._stack.length, reg);
};



p.getNames = function () {

    var names = [], currFlag;

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
    });

    return names;


    function add(name, idx) {

        names.push({
            name: name || 'unnamed redord',
            idx: idx
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
};

p.getChain = function (id) {

    return this._chains.find(function (chain) {

        return chain.id === id;
    });
};