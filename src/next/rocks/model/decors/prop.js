export default function prop(opt) {

  var Symbol = require('es6-symbol')

  return (Class) => {
    var proto = Class.prototype

    if (_.isArray(opt)) {
        opt.forEach(o => defineCompactProperty(proto, o))
        return
    }

    if (!_.has(opt, 'name')) throw Error

    var valMap = new WeakMap()
    var name = opt.name
    var history = opt.history
    var startValue = opt.startValue
    var onChange = opt.onChange
    var evtName = opt.event || opt.evtName || 'change.' + name

    if (history) {
      if (typeof(history) !== 'object') history = {}
      if (!history.hasOwnProperty('tag')) history.tag = 'change ' + name
      if (!history.hasOwnProperty('chainId')) history.chainId = Symbol();//TODO make this unique per instance
    }

    Object.defineProperty(proto, name, {set: set, get: get})

    return {
      name: name,
      evtName: evtName,
    }


    ///////////////////////////////////////////////////////////////

    function get() {
        return valMap.has(this) ? valMap.get(this) : startValue
    }

    function set(v) {

        v = fixType(v)
        var value = get.call(this)

        if (v === value || isInvalidValue(v)) {
            return
        }

        save.call(this, value, v)

        value = v

        valMap.set(this, value)

        if (onChange) onChange.call(this, value)

        this.emit(evtName, value)
    }

    function save(oldValue, newValue) {

        if (!history) return

        am.history.saveChain({
            id: history.chainId,
            undo: [set, this, oldValue],
            redo: [set, this, newValue],
            name: history.tag,
            delay: 312,
        })
    }

    function fixType(v) {

        switch (opt.type) {
            case 'float': v = parseFloat(v); break
            case 'int': v = parseInt(v); break
            case 'boolean': v = !!v; break
            case 'string': v = '' + v; break
        }

        return v
    }

    function isInvalidValue(v) {

        return ((opt.type === 'float' || opt.type === 'int') && !_.isFinite(v))
    }
  }
}
