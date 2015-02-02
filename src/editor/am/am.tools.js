var amgui = require('../amgui');

module.exports = function tools (am) {

    am.dePickLayer.style.pointerEvents = 'auto';

    var mode = 'interact';

    var cursors = {
        interact: 'auto',
        pick: 'auto',
        move: '-webkit-grab',
    }

    var currMode, modes = [
        {
            type: 'interact',
            text: 'normal page interact',
            icon: 'cursor',
            cursor: 'auto', 
        },
        {
            type: 'pick',
            text: 'dom picking mode',
            icon: 'target',
            cursor: 'auto', 
        },
        {
            type: 'move',
            text: 'drag ',
            icon: 'move',
            cursor: '-webkit-grab', 
        },
        {
            type: 'zoom',
            text: 'zoom ',
            icon: 'zoom-in',
            cursor: '-webkit-zoom-in',  
        },
    ]

    function selectMode(m) {

        if (m === currMode) return;

        if (m.type === 'zoom') {
            am.dialogs.WIP.show();
            return;
        }

        currMode = m;

        btn.setIcon(currMode.icon);

        am.dePickLayer.style.pointerEvents = currMode.type === 'interacy' ? 'none' : 'auto';
        am.dePickLayer.style.cursor = currMode.cursor;
    }

    var btn = amgui.createIconBtn({
        tooltip: 'toggle dom picking mode',
        icon: 'target',
        defaultToggle: true,
        size: 24,
        display: 'inline-block'
    });

    am._staticToolbarIcons.push(btn);

    selectMode(_.find(modes, {type: 'pick'}));

    var dropdown = amgui.createDropdown({
        options: modes.map((m, idx) => {
            return {
                text: m.text, 
                icon: m.icon,
                onClick: () => selectMode(modes[idx]),
            };
        }),
    });

    amgui.bindDropdown({deTarget: btn, deDropdown: dropdown});

    amgui.on('fontLoaded', () => {

        var pickMode = _.find(modes, {type: 'pick'});

        pickMode.cursor = amgui.createCursorFromText({
            icon: 'target',
            color: amgui.color.text,
            width: 22,
            height: 22,
            hotspotX: 11,
            hotspotY: 11,
            textX: 2,
            stroke: {color:'black', width: 2},
            debug: false,
        });
    });

    am.dePickLayer.addEventListener('click',  e => {

        if (currMode.type !== 'pick') return;

        am.dePickLayer.style.pointerEvents = 'none';
        var de = document.elementFromPoint(e.x, e.y);
        am.dePickLayer.style.pointerEvents = 'auto';

        if (am.isPickableDomElem(de)) {
            
            if (de !== am.selectedDomElem) {//hack!
                
                am.domPicker.focusElem(de);
            }
        }
        else if (de === document.body || de.parentNode === document) {

            am.deselectDomElem();
        }
    });

    amgui.makeDraggable({
        deTarget: am.dePickLayer,
        onDown: e => {
            if (currMode.type !== 'move') return false;
        },
        onDrag: e => {
            document.body.style.transform = `translate(${e.dx}px, ${e.dy}px)`;
            am.deRoot.style.transform = `translate(${-e.dx}px, ${-e.dy}px)`;
        }
    });
};