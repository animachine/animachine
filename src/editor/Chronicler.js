function Chronicler() {

    this._stack = [], 
    this._pointer = -1;
    this._chains = [];
}

var p = Chronicler.prototype;

p.undo = function () {

    if (this._pointer > -1) {

        call(this._stack[this._pointer--].undo);
    }
};

p.redo = function () {

    if (this._pointer < this.stack.length - 1) {

        call(this._stack[++this._pointer].redo);
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

    this._stack.splice(this._pointer, this._stack.length, reg);
};

p.saveChain = function (id, undo, redo, delay) {

    var chain = this._findChain(id);

    if (chain) {

        chain.reg.redo = redo;
    }
    else {
        chian = {
            id: id,
            reg: this.save(undo, redo)
        };
    }

    if (delay === undefined) {
        delay = 312;
    }

    clearTimeout(chain.tid);
    chain.tid = setTimeout(this.closeChain.bind(this, id), delay);
};

p.closeChain = function (id) {

    var chain = this._findChain(id);

    if (!chain) {
        return;
    }

    clearTimeout(chain.tid);
    this._chains.splice(this._chains.indexOf(chain), 1);
};

p._findChain = function (id) {

    return this._chains.find(function (chain) {

        return chain.id === id;
    });
};

module.exports = Chronicler;