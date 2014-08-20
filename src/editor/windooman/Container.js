function Container(opt) {

    this._flow = opt.flow || 'lr';
    this._children = [];
    this._division = [];
    this._savedDivision;
}

var p = Container.prototype;

Object.defineProperty(p, 'flow', {

    set: function (v) {

        if (v === this._flow) return;

        this._flow = v;

        var lr = this._flow === 'lr',
            div = this._division;

        this._children.forEach(function (child, idx)) {

            this.domElem.style.width = lr ? div[idx]*100 + '%' : '100%';
            this.domElem.style.height = lr ? '100%' : div[idx]*100 + '%';
        }
    }

    get: function () {

        return this._flow;
    }
});

p.addPlane = function (plane, idx) {

    if (this._children.length === 0) {

        this._children.push(child);
        this._division.push(1);
    }
    else {
        //TODO...
    }
}

p._createDomElem = function () {

    this.domElem = document.createElement('div');
    this.domElem.style.width = '100%'
}

module.exports = Container;