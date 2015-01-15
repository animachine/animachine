'use strict';

module.exports = function defineCompactProperty(that, opt) {

    if (_.isArray(opt)) {

        opt.forEach(o => defineCompactProperty(that, o));
        return;
    }

    var value = opt.startValue, 
        name = opt.name,
        history = opt.history,
        chainId = Symbol(),
        evtName = opt.evtName || 'change' + name.charAt(0).toUpperCase() + name.slice(1);

    if (history && typeof(history) !== 'object') history = {};

    Object.defineProperty(that, name, {

        set: set,
        get: () => value,
    });


    if (opt.input) {

        opt.input.on('change', function (v) {

            that[name] = v;
        }.bind(that));

        refreshInput();
    }

    return {
        name: name,
        evtName: evtName,
    };


    ///////////////////////////////////////////////////////////////

    function set(v, skipHistory) {

        v = fixType(v);

        if (v === value || isInvalidValue(v)) {
            return;
        }

        if (!skipHistory) save(value, v);

        value = v;

        refreshInput();

        that.emit(evtName, value);
    }

    function save(oldValue, newValue) {

        if (!history) return;

        var tag = history.tag || 'change ' + name;

        am.history.saveChain(chainId, [set, oldValue, true], [set, newValue, true], tag, 789);
    }

    function refreshInput() {

        if (opt.input && opt.input.value !== value) {

            opt.input.value = value;
        }
    }

    function fixType(v) {

        switch (opt.type) {
            case 'float': v = parseFloat(v); break;
            case 'int': v = parseInt(v); break;
            case 'boolean': v = !!v; break;
            case 'string': v = '' + v; break;
        }

        return v;
    }

    function isInvalidValue(v) {

        return ((opt.type === 'float' || opt.type === 'int') && !_.isFinite(v));
    }
};