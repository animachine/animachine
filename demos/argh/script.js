$(function () {

    $('.setter').click(function () {

        this.src = this.src.replace(/zombie(\d)/, function (match, p1) {
            return 'zombie' + ((p1+1)%3);
        });
    });

    $('#shake')
        .click(function () {

            this.src = this.src.replace(/zombie(\d)/, function (match, p1) {
                return 'zombie' + parseInt(3 * Math.random());
            });
        });

    $('#release').click(releaseZombie);
    releaseZombie();

    function releaseZombie() {

        var $zombie = $('<div>')
                .css({
                    position: 'absolute',
                    width: '100px',
                    height: '100px',
                })
                .appendTo('body'),
            $root = $('<div>').css('position', 'absolute').appendTo($zombie),
            $lfoot = create('lfoot');
            $rfoot = create('rfoot');
            $lhand = create('lhand');
            $rhand = create('rhand');
            $lshoulder = create('lshoulder');
            $rshoulder = create('rshoulder');
            $head = create('head');
        
        if (false) { //edit
            am.open('save.json');
            am.timeline.setInputs({
                root: $root,
                lfoot: $lfoot,
                rfoot: $rfoot,
                lhand: $lhand,
                rhand: $rhand,
                lshoulder: $lshoulder,
                rshoulder: $rshoulder,
                head: $head,
            });
            $zombie.css({
                left: '50%',
                top: '50%',
                border: '1px tomato solid'
            });
            $('#base').remove();
        }
        else {
            var anim = am.anims.amsave.create({
                root: $root,
                lfoot: $lfoot,
                rfoot: $rfoot,
                lhand: $lhand,
                rhand: $rhand,
                lshoulder: $lshoulder,
                rshoulder: $rshoulder,
                head: $head,
            }).repeat(-1).play();

            TweenMax.set($zombie, getRandomPos());
            sendZombie($zombie);
        }



        function create(name) {

            return $('<img>')
                .attr('src', $('#' + name).attr('src'))
                .css('position', 'absolute')
                .appendTo($root);
        }
    };

    function sendZombie($zombie) {

        var target = getRandomPos(),
            gst = $zombie.get(0)._gsTransform,
            dx = target.x - gst.x,
            dy = target.y - gst.y,
            d = Math.sqrt(dx*dx + dy*dy);

        TweenMax.to($zombie, 0.34, {
            rotation: ((Math.atan2(dy, dx) / Math.PI * 180) + 90) + '_short',
        }); 

        TweenMax.to($zombie, d/123, {
            x: target.x, 
            y: target.y,
            onComplete: sendZombie.bind(null, $zombie),
            ease: Linear.easeNone,
        });
    }

    function getRandomPos() {

        return {
            x: window.innerWidth * Math.random(),
            y: window.innerHeight * Math.random(),
        };
    }
});