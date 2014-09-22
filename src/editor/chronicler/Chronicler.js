'use strict';

function Chronicler() {

    this._stack = [], 
    this._pointer = -1;
    this._chains = [];
    this._flagCounter = 0;
}

var p = Chronicler.prototype;

p.undo = function () {

    if (this._pointer > -1) {

        call(this._stack[this._pointer--].undo);
    }
};

p.redo = function () {

    if (this._pointer < this._stack.length - 1) {

        call(this._stack[++this._pointer].redo);
    }
};

p.undo = function() {

    if (this._pointer < 0) {

        return false;
    }

    var rec = this._stack[this._pointer--];

    if (typeof(rec) === 'number') {

        var startFlagIdx = this._stack.indexOf(rec - 1);

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
    
    if (typeof(rec) === 'number') {

        var endFlagIdx = this._stack.indexOf(rec + 1);

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
        reg[0].apply(reg[1], reg.slice(2))
    }
}

p.save = function (undo, redo) {

    var reg = {undo: undo, redo: redo};

    this._stack.splice(++this._pointer, this._stack.length, reg);

    return reg;
};







p.startFlag = function () {

        this.save([this._flagCounter++]);
        return this._flagCounter++;
};

p.endFlag = function (flag) {

    this.save([flag]);
};

p.wrap = function (fn, ctx) {

    return function () {

        var endFlag = this.startFlag();

        fn.apply(ctx, Array.prototype.slice.call(arguments,  2));

        this.endFlag(endFlag);
    }.bind(this);
};








p.saveChain = function (id, undo, redo, delay) {

    var chain = this.getChain(id);

    if (chain) {
        
        chain.reg.redo = redo;
    }
    else {

        chain = {
            id: id,
            reg: this.save(undo, redo)
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
    };
    
    this._stack.length = 0, 
    this._pointer = -1;
}

p.getChain = function (id) {

    return this._chains.find(function (chain) {

        return chain.id === id;
    });
};

module.exports = Chronicler;