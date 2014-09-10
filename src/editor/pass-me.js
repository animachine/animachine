function passMe(e) {

    var peSave = e.target.style.pointerEvents,

    e.target.style.pointerEvents = 'none';

    var nextTarget = document.elementFromPoint(e.pageX, e.pageY);

    e.target.style.pointerEvents = peSave;

    if (nextTarget) {

        nextTarget.dispatchEvent(e);
    }
}

module.exports = passMe;
