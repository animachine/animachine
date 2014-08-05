'use strict';

var domready = require('domready');
var Transhand = require('./transhand/Transhand');
var transhand = window.transhand = new Transhand();

domready(function () {
console.log('form main.js')
    var de = document.createElement('div');
    de.style.position = 'absolute';
    de.style.backgroundColor = 'blue';
    de.style.left = '55px';
    de.style.top = '55px';
    de.style.width = '55px';
    de.style.height = '55px';
    document.body.appendChild(de);


    document.body.addEventListener('click', function (e) {

        var de = e.target;
        var br = de.getBoundingClientRect();
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
            on: {
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
            }
        });
    });
});