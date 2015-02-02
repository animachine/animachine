var EventEmitter = require('eventman');
var dialogSettings = require('./dialogSettings');

var shortcuts = new EventEmitter();
module.exports = shortcuts;

var map = {
    'copy': ['ctrl+c'],
    'cut': ['ctrl+x'],
    'delete': ['del', 'backspace'],
    'duplicate': ['ctrl+d'],
    'keyboardShortcuts': ['ctrl+k'],
    'paste': ['ctrl+v'],
    'undo': ['ctrl+z'],
    'redo': ['ctrl+y', 'ctrl+shift+z'],
    'selectAll': ['ctrl+c'],
    'save': ['ctrl+s'],
    'saveAs': ['ctrl+shift+s'],
    'play/pause': ['space'],
    'groupElements': ['ctrl+g'],
    'show/hidePanels': ['tab'],
};

shortcuts.readMap = function (map) {

    Mousetrap.reset();

    Object.keys(map).forEach(function (key) {

        map[key].forEach(function (stroke) {
            // Mousetrap.bind(stroke, this.emit.bind(this, key));
            Mousetrap.bind(stroke, function () {
                console.log(key, stroke);
                this.emit(key);
            }.bind(this));
        }, this);
    }, this);
};

shortcuts.readMap(map);

shortcuts.getShortcut = function (key) {

    return map[key].join(', ');
}

Mousetrap.record(function(strokes) {

    var stroke = strokes[strokes.length-1];
});