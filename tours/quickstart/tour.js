$(function () {
    'use strict';

    am.open();
    setupWorkspace();

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
                checklist: [
                    'select the cookiejar',
                    'create a track',
                ],
                onReady: function (tour) {

                    if (!tour.isChecked(0)) {

                        this._cookiePointer = tour.addPointer({
                            deTarget: deCookiejar,
                        });
                    }
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && am.selectedDomElem === deCookiejar) {

                        tour.checkIn(0);
                        tour.removePointer(this._cookiePointer);
                    }

                    if (!tour.isChecked(1) && am.timeline._tracks.length) {

                        tour.checkIn(1);
                    }
                }
            },
            {
                title: 'Transform it!',
                content: getStep2Content(),
                checklist: [
                    'make some transforms',
                ],
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0)) {

                        var save = am.timeline.getSave();
                        if(/"translate"|"scale"|"rotation"/.test(save)) {
                            tour.checkIn(0);
                        }
                    }
                }
            },
            {
                title: 'Animate it!',
                content: getStep3Content(),
                checklist: [
                    'move the timeline pointer',
                    'create a new key',
                ],
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && am.timeline.currTime !== 0) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(1)) {

                        var save = JSON.parse(am.timeline.getSave());

                        walkObj(save, function (value, key, obj) {

                            if (key === 'keys' && value.length > 1) {

                                tour.checkIn(1);
                                return true;
                            }
                        });
                    }
                }
            },
            {
                title: 'Save it!',
                content: getStep4Content(),
                checklist: [
                    'open the "Save" dialog',
                    'select the web storage',
                    'save it!',
                ],
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && am.storage.dialog.isOpened) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(1) && am.storage.selectedStorageType === 'webstorage') {

                        tour.checkIn(1);
                    }
                    if (!tour.isChecked(2) && isSaved()) {

                        tour.checkIn(2);

                        window.localStorage.amQuickTourSavedFlag = true;
                    }

                    function isSaved() {

                        return Object.keys(localStorage).some(function (key) {
                        
                            return key.indexOf('_webstorageman/') === 0;
                        });
                    }
                }
            },
            {
                title: 'Load it!',
                content: getStep5Content(),
                checklist: [
                    'open the "Open" dialog',
                    'save it!',
                ],
                onReady: function (tour) {
                },
                runningLoop: function (tour) {

                    if (!tour.isChecked(0) && am.storage.dialog.isOpened) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(2) && 'isAnimLoaded') {

                        tour.checkIn(2);

                        window.localStorage.amQuickTourSavedFlag = false;
                    }
                }
            },
        ],
    });

    if (window.localStorage.amQuickTourSavedFlag) {

        // am.tour.goto(5);
    }

});

function walkObj(obj, cb) {

    return Object.keys(obj).some(function (key) {

        var value = obj[key];
        
        if (cb(value, key, obj)) {
            return true;
        }

        if (typeof(value) === 'object') {

            return walkObj(value, cb)
        }
    });
};


function getStep0Content() {

    return '<img src="http://zippy.gfycat.com/MelodicPerfectAlpinegoat.gif" style="width:100%;">'
    + '<p>Hi! We\'ve made a quick tour to show how to use Animachine.</p>'
    + '<p>If you want to be quick, you can just watch the gif animations and do what you see, but you\'ll always find the detailed instructions under here.</p>'
    + '<p>Click on the <span class="icon-angle-right"></span> for the first step.</p>';
}

function getStep1Content() {

    return '<img src="http://zippy.gfycat.com/PoshHighlevelFalcon.gif" style="width:100%;">'
    + '<p>First select the cookie jar on the screen by click on it.</p>'
    + '<p> Than click on the <span class="icon-plus"></span> in the right-left corner of the <a>Dom Picker.<a/></p>';
}

function getStep2Content() {

    return '<img src="http://zippy.gfycat.com/IndolentBowedBustard.gif" style="width:100%;">'
    + '<p>Now you can move, rotate and scale the cookie jar with the green transform tool around it.</p>';
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

function getStep5Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>To open you animation:</p>'
    + '<p> -click ont the menu in the toolbar</p>'
    + '<p> -select the open option</p>'
    + '<p> -select the web storage<span class="play"></span></p> on the right</p>'
    + '<p> -if the animation is saved, you\'ll find it in the list. Select it and click on the open.</p>'
    + '<p>Now you can play it again and continue the editing</p>'
    + '<p>You can find more tours <a href="">here</a></p>';
}

function getStep6Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>Thanks for</p>'
    + '<p> -click ont the menu in the toolbar</p>'
    + '<p> -select the open option</p>'
    + '<p> -select the web storage<span class="play"></span></p> on the right</p>'
    + '<p> -if the animation is saved, you\'ll find it in the list. Select it and click on the open.</p>'
    + '<p>Now you can play it again and continue the editing</p>'
    + '<p>You can find more tours <a href="">here</a></p>';
}

function setupWorkspace() {

    var ws = am.workspace.getWorkspace('base');
    ws.children[0].children.push({                    
        type: 'panel',
        noHead: true,
        size: 1,
        scaleMode: 'flex',
        tabs: [{name: 'tour'}]
    });
    am.workspace.load('tour', ws);
}