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
      forEach: `forEach${capitalize(name)}`,
      findBy: `find${capitalize(name)}By`,
      getAll: `get${capitalize(name)}s`,
      source: `${name}s`,
      //current
      getCurrent: `getCurrent${capitalize(name)}`,
      setCurrent: `setCurrent${capitalize(name)}`,
      eventChangeCurrent: `change.current${capitalize(name)}`,
      //selection
      select: `select${capitalize(name)}`,
      deselect: `deselect${capitalize(name)}`,
      selectAll: `selectAll${capitalize(name)}s`,
      deselectAll: `deselectAll${capitalize(name)}s`,
      isSelected: `isSelected${capitalize(name)}`,

      eventAdd: `add${capitalize(name)}`,
      eventRemove: `remove${capitalize(name)}`,
      eventChangeChild: `change.${name}`,
      eventChangeSelection: `change.${name}Selection`,
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

      if (!(child instanceof ChildClass)) {
        child = new ChildClass(child)
      }
      children.push(child)

      child.on('change', () => this.emit(names.eventChangeChild))
      this.emit(names.eventAdd, child)
      this.emit(names.eventChangeChild)


      if (current && !this[names.getCurrent]()) {
        this[names.setCurrent](child)
      }
    }

    proto[names.get] = function (index) {
      const children = getChildren(this)
      return children[index]
    }

    proto[names.forEach] = function (fn) {
      const children = getChildren(this)
      children.forEach(fn)
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
      proto[names.setCurrent] = function (item) {
        currentMap.set(this, item)
        this.emit(names.eventChangeCurrent, item)
      }

      proto[names.getCurrent] = function () {
        return getCurrent(this)
      }
    }

    if (selection) {
      proto[names.select] = function (child) {
        const children = getChildren(this)
        const selection = getSelection(this)

        if (children.indexOf(child) === -1) {
          throw Error(`${child} isn't child of ${this}`)
        }

        if (selection.indexOf(child) === -1) {
          selection.push(child)
          this.emit(names.eventChangeSelection)
        }

      }

      proto[names.deselect] = function (child) {
        const selection = getSelection(this)
        const index = selection.indexOf(child)
        if (index !== -1) {
          selection.splice(index, 1)
          this.emit(names.eventChangeSelection)
        }
      }

      proto[names.selectAll] = function (child) {
        const children = getChildren(this)
        children.slice().forEach(child => {
          this[names.select](child)
        })
      }

      proto[names.deselectAll] = function (child) {
        const selection = getSelection(this)
        selection.slice().forEach(child => {
          this[names.deselect](child)
        })
      }

      proto[names.isSelected] = function (child) {
        const selection = getSelection(this)
        return selection.indexOf(child) !== -1
      }
    }

    return Class
  }
}
