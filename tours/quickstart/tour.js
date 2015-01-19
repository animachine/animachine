$(function () {
    'use strict';

    am.open();
    setupWorkspace();

    var deCookiejar = document.querySelector('#cookie'),
        numberOfSavesAtStart = getNumberOfSaves();

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

                    if (!tour.isChecked(0) && am.storage.dialog && am.storage.dialog.isOpened) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(1) && am.storage.selectedStorageType === 'webstorage') {

                        tour.checkIn(1);
                    }
                    if (!tour.isChecked(2) && getNumberOfSaves() > numberOfSavesAtStart) {

                        tour.checkIn(2);

                        window.localStorage.amQuickTourSavedFlag = +new Date();
                    }

                    function isSaved() {

                        return 
                    }
                },
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

                    if (!tour.isChecked(0) && am.storage.dialog && am.storage.dialog.isOpened) {

                        tour.checkIn(0);
                    }
                    if (!tour.isChecked(1) && am.timeline._tracks.length) {

                        tour.checkIn(1);

                        window.localStorage.amQuickTourSavedFlag = '';
                    }
                }
            },
            {
                title: 'Done!)',
                content: getStep6Content(),
                checklist: [
                ],
                onReady: function (tour) {
                },
                runningLoop: function (tour) {
                }
            },
        ],
    });
    
    var saved = window.localStorage.amQuickTourSavedFlag;
    if (saved && saved - (+new Date()) < 1000*60*5) {
        am.tour.goto(5);
    }

});

function getNumberOfSaves() {

    var count = 0;

    Object.keys(localStorage).forEach(function (key) {
    
        if (key.indexOf('_webstorageman/') === 0) {

            ++count;
        } 
    });

    return count;
}

function walkObj(obj, cb) {

    return Object.keys(obj).some(function (key) {

        var value = obj[key];
        
        if (cb(value, key, obj)) {
            return true;
        }

        if (typeof(value) === 'object') {

            return walkObj(value, cb);
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
    + '<p>First select the cookie jar on the screen by clicking on it.</p>'
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
    + '<p>To save your animation:</p>'
    + '<ul style="list-style-type:disc">'
    + '<li>click ont the floppy (<span class="icon-floppy"></span>) in the toolbar</li>'
    + '<li>select the save option</li>'
    + '<li>select the web storage (<span class="icon-bullseye"></span>) on the right of the opened dialog</li>'
    + '<li>than give some name to it and save.</li>'
    + '</ul>'
    + '<p>Now your animation is saved in your browser. You can refresh the page and continue with the last step.</p>';
}

function getStep5Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>To open your animation:</p>'
    + '<ul style="list-style-type:disc">'
    + '<li>click ont the floppy (<span class="icon-floppy"></span>) in the toolbar</li>'
    + '<li>select the open option</li>'
    + '<li>select the web storage (<span class="icon-bullseye"></span>) on the right</li>'
    + '<li>if the animation is saved, you\'ll find it in the list. Select it and click on the open.</li>'
    + '</ul>'
    + '<p>Now you can play it again and continue the editing</p>'
}

function getStep6Content() {

    return '<img src="http://zippy.gfycat.com/ImpureSplendidHyracotherium.gif" style="width:100%;">'
    + '<p>Thanks for trying out the Animachine(alpha)! For more information check out the project page on <a href="https://github.com/animachine/animachine">github</a></p>';
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