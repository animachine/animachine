var snap = require('snapsvg');

function Bund() {

}

var p = Bund.prototype;

p.setup = function (opt) {

    this.domElem.width = opt.width;
    this.domElem.width = opt.height;
}

p.generateGraphics = function () {

    this.domElem = document.createElement('svg');

    pick.mousedown(function () {
        
    });
}

module.exports = Bund;
