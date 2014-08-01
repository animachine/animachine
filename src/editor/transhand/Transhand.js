var Bund = require('./hands/Bund');

function Transhand() {

    this.hands = {};

    [Bund, Zebra, Circ3D].forEach(function (Hand) {

        this.hands[Hand.id] = new Hand();
    });
}

var p = Transhand.prototype;

p.setup = function () {

    var hand = this.hands[opt.hand.type];
    hand.setup(opt.hand);
}

module.exports = Transhand;