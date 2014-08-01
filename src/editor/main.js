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