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
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && am.selectedElem === deCookiejar) {

                        tour.checkIn(0);
                        tour.removePointer(this._cookiePointer);
                    }

                    if (!tour.isChecked(1) && am.timeline.sequences.length) {

                        tour.checkIn(1);
                    }
                }
            },
            {
                title: 'Transform it!',
                content: getStep2Content(),
                checklistLength: 1,
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0)) {

                        am.timeline.sequences.forEach(function (sequ) {
                            sequ._parameters.forEach(function (param) {
                                if (param.name === 'transform') {
                                    tour.checkIn(0);
                                }
                            });
                        });
                    }
                }
            },
            {
                title: 'Animate it!',
                content: getStep3Content(),
                checklistLength: 2,
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && am.timeline.currTime !== 0) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(1)) {

                        am.timeline.sequences.forEach(function (sequ) {
                            sequ._parameters.forEach(function (param) {
                                if (param._keys.length > 1) {
                                    tour.checkIn(1);
                                }
                            });
                        });
                    }
                }
            },
            {
                title: 'Save it!',
                content: getStep3Content(),
                checklistLength: 3,
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && isSavePanelOpened) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(1) && isWebStorageSelected) {

                        tour.checkIn(1);
                    }
                    if (!tour.isChecked(2) && isSaved) {

                        tour.checkIn(2);

                        window.localStorage.amQuickTourSavedFlag = true;
                    }
                }
            },
            {
                title: 'Load it!',
                content: getStep4Content(),
                checklistLength: 3,
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && isSavePanelOpened) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(1) && isWebStorageSelected) {

                        tour.checkIn(1);
                    }
                    if (!tour.isChecked(2) && isAnimLoaded) {

                        tour.checkIn(2);

                        window.localStorage.amQuickTourSavedFlag = false;
                    }
                }
            },
        ],
    });

    if (window.localStorage.amQuickTourSavedFlag) {

        tour.goto(5);
    }

});

function getStep0Content() {

    return '<img src="http://zippy.gfycat.com/FluffySecondaryGnu.gif" style="width:100%;">'
    + '<p>Hi! We\'ve made a quick tour to show how to use Animachine Beta.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>Click on the <span class="icon-angle-right"></span> for the first step.</p>';
}

function getStep1Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>First, select the cookie jar on the screen by click on it</p>'
    + '<p> Than, click on the <span class="icon-ellipsis-vert"></span> in the right-left corner of the <a>Dom Picker<a/> and select the "new css track" menu.</p>';
}

function getStep2Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>Now, you can move, rotate and scale the cookie jar with the green transform tool around it.</p>';
}

function getStep3Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>If you move the pointer on the timeline into an other position and make some other changes with the transform tool, you\'ll have two keys witch is makes an animation!!:)</p>'
    + '<p>Click on the <span class="play"></span> to see it moving!</p>';
}

function getStep4Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>To save you animation:</p>'
    + '<p> -click ont the menu in the toolbar</p>'
    + '<p> -select the save option</p>'
    + '<p> -select the web storage<span class="play"></span></p> on the right</p>'
    + '<p> -give some name to it and save.</p>'
    + '<p>Now your animation is saved in your browser. You can refresh the browser and continue with the last step.</p>';
}

function getStep4Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>To open you animation:</p>'
    + '<p> -click ont the menu in the toolbar</p>'
    + '<p> -select the open option</p>'
    + '<p> -select the web storage<span class="play"></span></p> on the right</p>'
    + '<p> -if the animation is saved, you\'ll find it in the list. Select it and click on the open.</p>'
    + '<p>Now you can play it again and continue the editing</p>'
    + '<p>You can find more tours <a href="">here</a></p>';
}

function getStep4Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>Thanks for</p>'
    + '<p> -click ont the menu in the toolbar</p>'
    + '<p> -select the open option</p>'
    + '<p> -select the web storage<span class="play"></span></p> on the right</p>'
    + '<p> -if the animation is saved, you\'ll find it in the list. Select it and click on the open.</p>'
    + '<p>Now you can play it again and continue the editing</p>'
    + '<p>You can find more tours <a href="">here</a></p>';
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