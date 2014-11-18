var EventEmitter = require('events').EventEmitter;
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
    'redo': ['ctrl+shift+z'],
    'selectAll': ['ctrl+c'],
    'undo': ['ctrl+z'],
    'save': ['ctrl+s'],
    'save': ['ctrl+shift+s'],
    'play/pause': ['space'],
    'groupElements': ['ctrl+g'],
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