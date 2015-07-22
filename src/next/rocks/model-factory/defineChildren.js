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
      select: `select${capitalize(name)}`
    }

    handleSetSource(proto, source => {
      const childSources = source[names.source]
      if (childSources) {
        childSources.forEach(childSource => this[name.add](childSource))
      }
    })

    handleGetSource(proto, source => {
      source[names.source] = children.map(child => child.getSource())
    })

    proto[names.add] = function (child) {
      if (!(child instanceof ChildClass)) {
        child = new ChildClass(child)
      }
      children.push(child)
    }

    return Class
  }
}
