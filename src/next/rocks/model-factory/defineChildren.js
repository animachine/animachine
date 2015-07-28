import capitalize from 'lodash/string/capitalize'
import handleSetSource from './handleSetSource'
import handleGetSource from './handleGetSource'


export default function defineChildren(descriptor) {
  return (Class) => {
    const proto = Class.prototype
    const childrenMap = new WeakMap()
    const selectionMap = new WeakMap()
    const {name, ChildClass, multiselect} = descriptor
    const names = {
      length: `get${capitalize(name)}sLength`,
      add: `add${capitalize(name)}`,
      remove: `remove${capitalize(name)}`,
      get: `get${capitalize(name)}`,
      forEach: `forEach${capitalize(name)}s`,
      select: `select${capitalize(name)}`,
      findBy: `find${capitalize(name)}By`,
      getAll: `get${capitalize(name)}s`,
      eventAdd: `add${capitalize(name)}`,
      eventRemove: `remove${capitalize(name)}`,
      eventChangeChild: `change.${name}`,
    }
    console.log({name, ChildClass, names})

    function getChildren(instance) {
      if (!childrenMap.has(instance)) {
        childrenMap.set(instance, [])
      }
      return childrenMap.get(instance)
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

    proto[names.add] = function (child) {
      const children = getChildren(this)
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

    return Class
  }
}
