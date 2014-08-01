(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({"./src/editor/main.js":[function(require,module,exports){
console.log('run')
var Transhand = require('./transhand/Transhand');

var transhand = new Transhand();

var de = document.createElement('div');
var br = de.getBoundingClientRect();
var transhand = window.transhand(new Transhand());
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
},{"./transhand/Transhand":"c:\\Users\\Andras\\am\\main\\src\\editor\\transhand\\Transhand.js"}],"c:\\Users\\Andras\\am\\main\\node_modules\\snapsvg\\Gruntfile.js":[function(require,module,exports){
module.exports = function(grunt) {

    var pkg = grunt.file.readJSON("package.json");

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: pkg,
        banner: grunt.file.read("./src/copy.js")
            .replace(/@VERSION/, pkg.version)
            .replace(/@DATE/, grunt.template.today("yyyy-mm-dd")) + "\n",
        // Task configuration.
        uglify: {
            options: {
                banner: "<%= banner %>",
                report: "min"
            },
            dist: {
                src: "<%= concat.target.dest %>",
                dest: "dist/snap.svg-min.js"
            }
        },
        concat: {
            options: {
                banner: "<%= banner %>"
            },
            target: {
                dest: "dist/snap.svg.js",
                src: [
                    "./node_modules/eve/eve.js",
                    "./src/amd-banner.js",
                    "./src/mina.js",
                    "./src/svg.js",
                    "./src/matrix.js",
                    "./src/attr.js",
                    "./src/attradd.js",
                    "./src/paper.js",
                    "./src/path.js",
                    "./src/set.js",
                    "./src/equal.js",
                    "./src/mouse.js",
                    "./src/filter.js",
                    "./src/amd-footer.js"
                ]
            }
        },
        exec: {
            dr: {
              command: "node node_modules/dr.js/dr dr.json"
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-exec");

    grunt.registerTask("default", ["concat", "uglify", "exec"]);
};
},{}],"c:\\Users\\Andras\\am\\main\\src\\editor\\transhand\\Transhand.js":[function(require,module,exports){
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
},{"./hands/Bund":"c:\\Users\\Andras\\am\\main\\src\\editor\\transhand\\hands\\Bund.js"}],"c:\\Users\\Andras\\am\\main\\src\\editor\\transhand\\hands\\Bund.js":[function(require,module,exports){
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

},{"snapsvg":"c:\\Users\\Andras\\am\\main\\node_modules\\snapsvg\\Gruntfile.js"}]},{},["./src/editor/main.js"]);
