'use strict';

module.exports = function (that, opt) {

    var value = opt.startValue, 
        name = opt.name,
        evtName = opt.evtName || 'change' + name.charAt(0).toUpperCase() + name.slice(1);

    Object.defineProperty(that, name, {

        set: opt.set || function (v) {
            
            switch (opt.type) {
                case 'float': v = parseFloat(v); break;
                case 'int': v = parseInt(v); break;
                case 'boolean': v = !!v; break;
                case 'string': v = '' + v; break;
            }

            if (v === value) return;

            value = v;
            refreshInput();

            that.emit(evtName, value);
        },
        get: opt.get || function (v) {

            return value;
        }
    });

    if (opt.input) {

        opt.input.on('change', function (v) {

            that[name] = v;
        }.bind(that));

        refreshInput();
    }

    function refreshInput() {

        if (opt.input && opt.input.value !== value) {

            opt.input.value = value;
        }
    }

    return {
        name: name,
        evtName: evtName,
    };
};