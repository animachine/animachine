import capitalize from 'lodash/string/capitalize'
import handleSetSource from './handleSetSource'
import handleGetSource from './handleGetSource'


export default function defineChildren(descriptor) {
  return (Class) => {
    const proto = Class.prototype
    const children = []
    const {name, ChildClass} = descriptor
    const names = {
      source: `${name}s`,
      add: `add${capitalize(name)}`,
      remove: `remove${capitalize(name)}`,
      get: `get${capitalize(name)}`,
      forEach: `forEach${capitalize(name)}s`,
      select: `select${capitalize(name)}`,
      findBy: `find${capitalize(name)}By`,
    }
    console.log({name, ChildClass, names})

    handleSetSource(proto, function (source) {
      const childSources = source[names.source]
      if (childSources) {
        childSources.forEach(childSource => this[names.add](childSource))
      }
    })

    handleGetSource(proto, function (source) {
      source[names.source] = children.map(child => child.getSource())
    })

    proto[names.add] = function (child) {
      if (!(child instanceof ChildClass)) {
        child = new ChildClass(child)
      }
      children.push(child)
    }

    proto[names.get] = function (index) {
      return children[index]
    }

    proto[names.findBy] = function (key, value) {
      for (var i = 0, l = children.length; i < l; ++i) {
        let child = children[i]
        if (child[key] === value) {
          return child
        }
      }
    }

    return Class
  }
}
