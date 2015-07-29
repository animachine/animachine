import handleGetSource from './handleGetSource'
import handleSetSource from './handleSetSource'
import _isFinite from 'lodash/lang/isFinite'

export default function defineProperties(descriptors) {
  return (Class) => {
    const proto = Class.prototype

    descriptors.forEach(descriptor => defineCompactProperty(proto, descriptor))

    return Class
  }

  function defineCompactProperty(proto, descriptor) {
    const {
      name,
      type,
      history,
      initValue,
      eventName = `change.${name}`
    } = descriptor
    const valueMap = new WeakMap()

    if (!name) {
      throw Error
    }

    // if (history) {
    //   if (typeof(history) !== 'object') history = {}
    //   if (!history.hasOwnProperty('tag')) history.tag = 'change ' + name
    //   if (!history.hasOwnProperty('chainId')) history.chainId = Symbol();//TODO make this unique per instance
    // }

    Object.defineProperty(proto, name, {set, get, enumerable: true})
    handleSetSource(proto, function (source) {
      if (source.hasOwnProperty(name)) {
        set.call(this, source[name])
      }
    })
    handleGetSource(proto, function (source) {
      source[name] = get.call(this)
    })

    function get() {
      return valueMap.has(this) ? valueMap.get(this) : initValue
    }

    function set(v) {
      v = fixType(v)
      var value = get.call(this)

      if (v === value || isInvalidValue(v)) {
          return
      }

      save.call(this, value, v)

      value = v

      valueMap.set(this, value)

      this.emit(eventName, value)
    }

    function save(oldValue, newValue) {
      if (!history) return

      history.saveChain({
        id: history.chainId,
        undo: [set, this, oldValue],
        redo: [set, this, newValue],
        name: history.tag,
        delay: 312,
      })
    }

    function fixType(v) {
      switch (type) {
        case 'float': v = parseFloat(v); break
        case 'int': v = parseInt(v); break
        case 'boolean': v = !!v; break
        case 'string': v = '' + v; break
      }

      return v
    }

    function isInvalidValue(v) {
      return ((type === 'float' || type === 'int') && !_isFinite(v))
    }
  }
}
