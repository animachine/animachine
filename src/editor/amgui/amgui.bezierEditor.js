'use strict';

var amgui = {

    createBezierEditor: createBezierEditor,
};

module.exports = amgui;





function createBezierEditor(opt) {

    opt = opt || {};

    var p0 = {x: 0.3, y: 0},
        p1 = {x: 0.7, y: 1},
        w = opt.width || 312,
        h = opt.height || 312;

    var de = document.createElement('div');
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

        p0.x = points.cp0x;
        p0.y = points.cp0y;
        p1.x = points.cp1x;
        p1.y = points.cp1y;
        
        render();
    };
    
    render();
  
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

        return ((p - min) / full) * h;
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
        deCp.style.cursor = 'drag';
        deCp.style.boxSizing = 'border-box';
        deCp.style.width = r*2 + 'px';
        deCp.style.height = r*2 + 'px';
        deCp.style.borderRadius = r + 'px';
        deCp.style.background = 'rgba(256, 256, 256, 1)';
        de.appendChild(deCp);
      
        deCp.addEventListener('mousedown', onDown);
      
        deCp.refreshPosition = function () {
            
            deCp.style.left = (x(point.x) ) + 'px';
            deCp.style.top = (y(point.y)) + 'px';
        };
        deCp.refreshPosition();
      
        return deCp;

        function onDown() {
          
            mdMinY = minY();
            mdFullY = maxY() - mdMinY;

            deCp.style.cursor = 'dragging';

            window.addEventListener('mousemove', onDrag);
            window.addEventListener('mouseup', onUp);
            window.addEventListener('mouseleave', onUp);
        }

        function onDrag(e) {

            var br = de.getBoundingClientRect();

            point.x = Math.max(0, Math.min(1, (e.pageX - br.left) / w));
            point.y = (((e.pageY - br.top) / h) * mdFullY) - mdMinY;
          
            render();
          
            de.dispatchEvent(new CustomEvent('change', {detail: {value: de.getValue()}}));
        }

        function onUp() {

            deCp.style.cursor = 'drag';

            window.removeEventListener('mousemove', onDrag);
            window.removeEventListener('mouseup', onUp);
            window.removeEventListener('mouseleave', onUp);
        }
    }
}