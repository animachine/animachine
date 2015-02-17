'use strict';

$(function () {

    am.open('bezier_tour.am.js');
    setupWorkspace();

    am.tour.setup({

        steps: [
            {
                title: 'Hi!',
                content: getStep0Content(),
            },
            {
                title: 'Turn to bezier!',
                content: getStep1Content(),
                checklist: [
                    'turn to bezier',
                    'add an extra point to it',
                ],
                runningLoop: function (tour) {

                    var save;

                    if (!tour.isChecked(0) || !tour.isChecked(1)) {

                        save = am.projectMap.currProject.getSave();
                    }

                    if (!tour.isChecked(0)) {

                        walkObj(save, function(val, key, obj) {

                            if (obj.name === 'bezier' && !obj.hidden) {

                                tour.checkIn(0);
                            }
                        });
                    }
                    if (!tour.isChecked(1)) {

                        walkObj(save, function (value, key) {

                            if (key === 'value' &&
                                value instanceof Array &&
                                value.length > 1)
                            {
                                tour.checkIn(1);
                            }
                        });
                    }
                }
            },
            {
                title: 'Done!)',
                content: getStep2Content(),
            },
        ],
    });
});


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
}


function getStep0Content() {

    return '<img src="http://i.imgur.com/EWLWHV8.gif" style="width:100%;">' +
        '<p>This a quick tutorial to the bezier paths (or motion paths if you like).</p>' +
        '<p>On the timeline you see a track with a simple animation. If you hit the play button you\'ll see that the bullet leaves the cannon. It\'s looks pretty dummy but we can turn this point to point movement into curve</p>';
}

function getStep1Content() {

    return '<img src="http://i.imgur.com/j6tomTs.gif" style="width:100%;">' +
        '<p>So just click on the bezier<span class="icon-vector"></span> button on the right of the translate group and you\'ll see a blue line on the screen which shows the route of the bullet. If you familiar with any vector graphics editor you can easily modify the path by adding, editing and removing points. If you stop your over the path, anchor or handle the hints will show up.</p>';
}

function getStep2Content() {

    return '<img src="http://i.imgur.com/EWLWHV8.gif" style="width:100%;">' +
        '<p>That\'s it. If you click to the translate<span class="icon-chart-line"></span> you can convert bezier param back to linear translate.</p>' +
        '<p>Thanks for trying out animachine! For more information check out the project on <a href="https://github.com/animachine/animachine">github</a></p>';
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
