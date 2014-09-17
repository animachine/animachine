'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createBezierEditor: createBezierEditor,

        EASE2BEZIER: {
            'ease': 'cubic-bezier(.25,.1,.25,1)',
            'linear': 'cubic-bezier(0,0,1,1)',
            'ease-in': 'cubic-bezier(.42,0,1,1)',
            'ease-out': 'cubic-bezier(0,0,.58,1)',
            'ease-in-out': 'cubic-bezier(.42,0,.58,1)',
        },
    }
};


function createBezierEditor(opt) {

    opt = opt || {};

    var p0 = {x: 0.3, y: 0.3},
        p1 = {x: 0.7, y: 0.7},
        w = opt.width || 312,
        h = opt.height || 312;

    var de = document.createElement('div');
    de.style.position = 'relative';
    de.style.width = w + 'px';
    de.style.height = h + 'px';

    var c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    de.appendChild(c);

    var ctx = c.getContext('2d');
  
    var deCp0 = createCp(p0);
    var deCp1 = createCp(p1);

    de.getValue = function () {

        return 'cubic-bezier('+p0.x+','+p0.y+','+p1.x+','+p1.y+')';
    };

    de.setValue = function (points) {

        if (amgui.EASE2BEZIER.hasOwnProperty(points)) {

            points = amgui.EASE2BEZIER[points];
        }

        if (typeof(points) === 'string') {

            var rx = /cubic-bezier\(\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*,\s*([\d\.]+)\s*\)/,
                m = rx.exec(points);

            if (m) {
                points = {
                    cp0x: m[1],
                    cp0y: m[2],
                    cp1x: m[3],
                    cp1y: m[4],
                };
            }
            else {
                points = {
                    cp0x: .3,
                    cp0y: .3,
                    cp1x: .7,
                    cp1y: .7,
                };
            }
        }

        p0.x = points.cp0x;
        p0.y = points.cp0y;
        p1.x = points.cp1x;
        p1.y = points.cp1y;
        
        render();
    };
    
    render();

    if (opt.onChange) {
        de.addEventListener('change', opt.onChange);
    }

    if (opt.parent) {
        opt.parent.appendChild(de);
    }
  
    return de;
  

  
  

    function render() {

        ctx.clearRect(0, 0, w, h);
        ctx.beginPath();
        ctx.moveTo(x(p0.x), y(p0.y));
        ctx.lineTo(0, y(0));
        ctx.bezierCurveTo(
            x(p0.x), y(p0.y),
            x(p1.x), y(p1.y),
            x(1), y(1));
        ctx.lineTo(x(p1.x), y(p1.y));
        
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.rect(x(0), y(0), x(1), y(1) - y(0));
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 1;
        ctx.stroke();
      
        deCp0.refreshPosition();
        deCp1.refreshPosition();
    }

    function x (p) {
        return p * w;
    }

    function y (p) {

        var min = minY(),
            max = maxY(),
            full = max - min;

        return h - (((p - min) / full) * h);
    }
  
    function minY() {
    
        return Math.min(0, p0.y, p1.y);
    }
  
    function maxY() {
    
        return Math.max(1, p0.y, p1.y);
    }

    function createCp(point) {

        var r = 6, mdMinY, mdFullY;

        var deCp = document.createElement('div');
        deCp.style.position = 'absolute';
        deCp.style.cursor = 'grab';
        deCp.style.boxSizing = 'border-box';
        deCp.style.width = r*2 + 'px';
        deCp.style.height = r*2 + 'px';
        deCp.style.transform = 'translate(-'+r+'px,-'+r+'px)';
        deCp.style.borderRadius = r + 'px';
        deCp.style.background = 'rgba(256, 256, 256, 1)';
        de.appendChild(deCp);
      
        amgui.makeDraggable({
            deTarget: deCp,
            onDown: function () {

                deCp.style.cursor = 'grabbing';

                var md = {};
                md.minY = minY();
                md.fullY = maxY() - md.minY;    
                return md;
            },
            onMove: function (md, mx, my) {

                var br = de.getBoundingClientRect();

                point.x = Math.max(0, Math.min(1, (mx - br.left) / w));
                point.y = (((br.bottom - my) / h) * md.fullY) - md.minY;
                
                var fix = 1000;
                point.x = parseInt(point.x * fix) / fix;
                point.y = parseInt(point.y * fix) / fix;

                render();
              
                de.dispatchEvent(new CustomEvent('change', {detail: {value: de.getValue()}}));
            },
            onUp: function () {

                deCp.style.cursor = 'grab';
            }
        });
      
        deCp.refreshPosition = function () {
            
            deCp.style.left = x(point.x) + 'px';
            deCp.style.top = y(point.y) + 'px';
        };
        deCp.refreshPosition();
      
        return deCp;
    }
}