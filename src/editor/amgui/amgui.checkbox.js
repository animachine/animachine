'use strict';

var amgui;

module.exports = function (_amgui) {

    amgui = _amgui;

    return {
        createCheckbox: createCheckbox,
    };
};



function createCheckbox(opt) {

    var de = amgui.createDiv({
            display: 'flex',
            parent: opt.parent,
        }),
        isChecked = false;

    Object.defineProperties(de, {
        checked: {
            set: function (v) {

                v = !!v;

                if (isChecked === v) return;

                isChecked = v;

                cb.setToggle(isChecked);

                de.dispatchEvent(new CustomEvent('change', {checked: isChecked}));
            },
            get: function () {
                return isChecked;
            }
        },
        text: {
            set: function (v) {
                label.text = v;
            },
            get: function () {
                return label.text;
            }
        }
    });

    var cb = amgui.createToggleIconBtn({
        iconOn: 'check',
        iconOff: 'check-empty',
        parent: de,
        display: 'inline-block',
    });

    var label = amgui.createLabel({
        text: opt.text,
        parent: de,
    });

    de.addEventListener('click', function () {

        de.checked = !de.checked;
    });

    if (opt.onChange) {
        de.addEventListener('change', opt.onChange);
    }

    de.checked = opt.checked;

    return de;
}
