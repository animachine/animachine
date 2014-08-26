var stack = [], pointer = -1;

var history = {

    undo: function () {

        if (pointer > -1) {

            stack[pointer--].undo();
        }
    },

    redo: function () {

        if (pointer < stack.length - 1) {

            stack[++pointer].redo();
        }
    },

    save: function (undoFn, redoFn) {

        stack.splice(pointer, stack.length, {

            undo: undoFn,
            redo: redoFn
        });
    }
}