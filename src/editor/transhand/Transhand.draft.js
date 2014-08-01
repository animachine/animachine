var Bund = require('./hands/Bund'),
    Zebra = require('./hands/Zebra'),
    Circ3D = require('./hands/Circ3D');

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

//Hand

function Hand() {


}

var p = Hand.prototype;

p.setup = function (opt) {

    this.domElem.width = opt.width;
    this.domElem.width = opt.height;
}

p.generateGraphics = function () {

    this.domElem = document.createElement('svg');

    pick.mousedown(function () {
        this.t
    })
}

//////////
var de = getElementById('alamamag');
var br = de.getBoundingClientRect();
var transhand = new Transhand();
transhand.setup({
    hand: {
        type: 'bund',
        params: {
            x: br.left, 
            y: br.top, 
            w: br.width, 
            h: br.height,
        }
    },
    change: function (params, correct) {
        
        Object.keys(params).forEach(function (key) {

            switch (key) {
                case 'x': de.style.left = params[key] + 'px'; break;
                case 'y': de.style.top = params[key] + 'px'; break;
                case 'w': de.style.width = params[key] + 'px'; break;
                case 'h': de.style.height = params[key] + 'px'; break;
            }
        });
    }
});