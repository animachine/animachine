$(function () {

    am.open();
    am.workspace.loadWorkspaces(getWs());
    am.workspace.load('tour');

    am.tour.setup({

        steps: [
            {
                title: 'Hello!',
                content: getStep0Content(),
            },
            {
                title: 'Make a track!',
                content: getStep1Content(),
                checkboxCound: 2,
            },

        ]
    })

});

function getStep0Content() {

    return '<img src="http://giphy.com/embed/IerVAJUS26GQg" style="width:100%;">'
    + '<p>Hi! we\'ve made a quick tour to show how to use Animachine.</p>'
    + '<p>If you wanna be quick, you can just watch the gif animations and do what you see, but you\'ll find the detailed version below them if it\'s needed.</p>'
    + '<p>Click on the <span class="icon-angle-left"></span> for the first step.</p>';
} 

function getStep1Content() {

    return '<img src="http://giphy.com/embed/IerVAJUS26GQg" style="width:100%;">'
    + '<p>First, select the cookie jar on the screen by click on it</p>'
    + '<p> Than, click on the <span class="icon-ellipsis-vert"></span> in the right-left corner of the <a>Dom Picker<a/> and select the "new css track" menu.</p>';
}

function getWs() {

    return {
        tour: {
            type: 'container',
            direction: 'column',
            children: [{
                type: 'panel',
                size: 32,
                scaleMode: 'fix',
                noHead: true,
                tabs: [{name: 'tools'}],
            },{
                type: 'container',
                direction: 'row',
                size: 10,
                scaleMode: 'flex',
                children: [{                    
                    type: 'panel',
                    size: 3,
                    scaleMode: 'flex',
                    tabs: [
                        {name: 'Css Style'},
                        {name: 'Dom Tree'},
                        {name: 'History'},
                    ]
                }, {                    
                    type: 'panel',
                    empty: true,
                    size: 12,
                    scaleMode: 'flex'
                },{                    
                    type: 'panel',
                    size: 3,
                    scaleMode: 'flex',
                    noHead: true,
                    tabs: [{name: 'tour'}]
                }]
            }, {
                type: 'panel',
                size: 4,
                scaleMode: 'flex',
                noHead: true,
                tabs: [{name: 'timeline'}],
            }]
        }
    };
}