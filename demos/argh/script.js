$(function () {

    $('.setter').click(function () {

        this.src = this.src.replace(/zomb(\d)/, function (match, p1) {
            return 'zomb' + ((p1+1)%3);
        });
    });

    $('#sheak').click(function () {

        this.src = this.src.replace(/zomb(\d)/, function (match, p1) {
            return 'zomb' + parseInt(3 * Math.ramdom());
        });
    });

    $('#release').click(releaseZombie);
    releaseZombie();

    function releaseZombie() {

        var $zombie = $('<div>').css('position', 'absolute'),
            $root = $('<div>').css('position', 'absolute').appendTo($zombie),
            $lfoot = create('lfoot');
            $rfoot = create('rfoot');
            $lhand = create('lhand');
            $rhand = create('rhand');
            $lshoulder = create('lshoulder');
            $rshoulder = create('rshoulder');
            $head = create('head');

        var anim = am.anims.walk.create({
            root: $root,
            lfoot: $lfoot,
            rfoot: $rfoot,
            lhand: $lhand,
            rhand: $rhand,
            lshoulder: $lshoulder,
            rshoulder: $rshoulder,
            head: $head,
        }).play();

        TweenMax.set($zombie, getRandomPos());
        sendZombie($zombie);

        function create(name) {

            return $('<img>')
                .attr('src', $('#scr_' + name).attr('src')),
                .css('position', 'absolute'),
                .appendTo($root);
        }
    };

    function sendZombie($zombie) {

        var target = getRandomPos(),
            gst = $zombie.get(0)._gsTransform,
            dx = target.x - gst.x,
            dy = target.y - gst.y,
            d = Math.sqrt(dx*dx + dy*dy);

        TweenMax.to($zombie, 0.034, {rotation: Math.atan2(dy, dx) / Math.PI * 180}); 

        TweenMax.to($zombie, d/123, {
            x: target.x, 
            y: target.y,
            onComplete: sendZombie.bind(null, $zombie),
        });
    }

    function getRandomPos() {

        return {
            x: window.innerWidth * Math.random(),
            y: window.innerHeight * Math.random(),
        };
    }
});