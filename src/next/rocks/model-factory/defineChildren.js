import capitalize from 'lodash/string/capitalize'
import handleSetSource from './handleSetSource'
import handleGetSource from './handleGetSource'


export default function defineChildren(descriptor) {
  return (Class) => {
    const proto = Class.prototype
    const childrenMap = new WeakMap()
    const selectionMap = new WeakMap()
    const currentMap = new WeakMap()
    const {name, ChildClass, selection, current} = descriptor
    const names = {
      length: `get${capitalize(name)}sLength`,
      add: `add${capitalize(name)}`,
      remove: `remove${capitalize(name)}`,
      get: `get${capitalize(name)}`,
      forEach: `forEach${capitalize(name)}s`,
      findBy: `find${capitalize(name)}By`,
      getAll: `get${capitalize(name)}s`,
      source: `${name}s`,

      getCurrent: `getCurrent${capitalize(name)}`,
      setCurrent: `setCurrent${capitalize(name)}`,

      select: `select${capitalize(name)}`,
      deselect: `deselect${capitalize(name)}`,
      selectAll: `selectAll${capitalize(name)}s`,
      deselectAll: `deselectAll${capitalize(name)}s`,

      eventAdd: `add${capitalize(name)}`,
      eventRemove: `remove${capitalize(name)}`,
      eventChangeChild: `change.${name}`,
    }

    handleSetSource(proto, function (source) {
      const childSources = source[names.source] || []
      if (childSources) {
        childSources.forEach(childSource => this[names.add](childSource))
      }
    })

    handleGetSource(proto, function (source) {
      const children = getChildren(this)
      if (children.length !== 0) {
        source[names.source] = children.map(child => child.getSource())
      }
    })

    function getFromMap(instance, map, initValue) {
      if (!map.has(instance)) {
        map.set(instance, initValue)
      }
      return map.get(instance)
    }

    function getChildren(instance) {
      return getFromMap(instance, childrenMap, [])
    }

    function getSelection(instance) {
      return getFromMap(instance, selectionMap, [])
    }

    function getCurrent(instance) {
      return getFromMap(instance, currentMap, null)
    }

    proto[names.add] = function (child) {
      const children = getChildren(this)
      console.log(`add ${name}`)
      this[`__debug${name}Children`] = children
      if (!(child instanceof ChildClass)) {
        child = new ChildClass(child)
      }
      children.push(child)

      child.on('change', () => this.emit(names.eventChangeChild))
      this.emit(names.eventAdd, child)
      this.emit(names.eventChangeChild)
    }

    proto[names.get] = function (index) {
      const children = getChildren(this)
      return children[index]
    }

    proto[names.findBy] = function (key, value) {
      const children = getChildren(this)
      for (var i = 0, l = children.length; i < l; ++i) {
        let child = children[i]
        if (child[key] === value) {
          return child
        }
      }
    }

    proto[names.getAll] = function () {
      const children = getChildren(this)
      return children
    }

    proto[names.length] = function () {
      const children = getChildren(this)
      return children.length
    }

    if (current) {
      proto[names.getCurrent] = function () {
        return getCurrent(this)
      }

      proto[names.setCurrent] = function (item) {
        return currentMap.set(this, item)
      }
    }

    return Class
  }
}
