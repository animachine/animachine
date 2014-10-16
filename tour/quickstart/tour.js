$(function () {

    am.open();
    am.workspace.loadWorkspaces(getWs());
    am.workspace.load('tour');

    var deCookiejar = document.querySelector('#cookie')

    am.tour.setup({

        steps: [
            {
                title: 'Hello!',
                content: getStep0Content(),
            },
            {
                title: 'Make a track!',
                content: getStep1Content(),
                checklistLength: 2,
                onReady: function (tour) {

                    if (!tour.isChecked(0)) {

                        this._cookiePointer = tour.addPointer({
                            deTarget: deCookiejar
                        });
                    }

                    this._checkTestSetI = setInterval(function () {

                        if (!tour.isChecked(0) && am.selectedElement === deCookiejar) {

                            tour.checkIn(0);
                            tour.removePointer(this._cookiePointer);
                        }

                        if (!tour.isChecked(1) && am.timeline.sequences.length) {

                            tour.checkIn(1);
                        }
                    }.bind(this), 312)
                },
                onClose: function () {
                    clearInterval(this._checkTestSetI)
                }
            },

        ],
    })

});

function getStep0Content() {

    return '<img src="http://zippy.gfycat.com/FluffySecondaryGnu.gif" style="width:100%;">'
    + '<p>Hi! we\'ve made a quick tour to show how to use Animachine.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>Click on the <span class="icon-angle-left"></span> for the first step.</p>';
} 

function getStep1Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>First, select the cookie jar on the screen by click on it</p>'
    + '<p> Than, click on the <span class="icon-ellipsis-vert"></span> in the right-left corner of the <a>Dom Picker<a/> and select the "new css track" menu.</p>';
}

function getWs() {

    return {
        tour: {
            type: 'container',
            direction: 'column',
            children: [
                {
                    type: 'container',
                    direction: 'row',
                    size: 2.7,
                    scaleMode: 'flex',
                    children: [
                        {
                            type: 'container',
                            direction: 'column',
                            size: 3,
                            scaleMode: 'flex',
                            children: [
                                {
                                    type: 'panel',
                                    size: 32,
                                    scaleMode: 'fix',
                                    noHead: true,
                                    tabs: [{name: 'tools'}],
                                },{
                                    type: 'container',
                                    direction: 'row',
                                    children: [
                                        {                    
                                            type: 'panel',
                                            size: 1,
                                            scaleMode: 'flex',
                                            tabs: [
                                                {name: 'Css Style'},
                                                {name: 'Dom Tree'},
                                                {name: 'History'},
                                            ]
                                        }, {                    
                                            type: 'panel',
                                            empty: true,
                                            size: 2.7,
                                            scaleMode: 'flex'
                                        }
                                    ]
                                }
                            ]
                        }, {                    
                            type: 'panel',
                            noHead: true,
                            size: 1,
                            scaleMode: 'flex',
                            tabs: [{name: 'tour'}]
                        }
                    ]
                },{
                    type: 'panel',
                    size: 1,
                    scaleMode: 'flex',
                    noHead: true,
                    tabs: [{name: 'timeline'}],
                }
            ]
        }
    };
}