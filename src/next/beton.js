import assign from 'lodash/object/assign'
import camelCase from 'lodash/string/camelCase'
const resolvedRocks = new Map()
const waitingRocks = new Map()

function define({id, dependencies = [], init = () => {}}) {
  waitingRocks.set(id, {dependencies, init})
  tryToResolve()

  if (!resolvedRocks.get(id)) {
    resolvedRocks.set(id, {isWaitingToResolve: true})
  }
}

function tryToResolve() {
  let resolvedANewRock = false

  waitingRocks.forEach(({init, dependencies}, id) => {
    if (dependencies.every(depId => {
      var result = hasRock(depId)
      return result
    })) {
      const dependencyMap = dependencies.reduce((depId, map) => {
        return {...map, [camelCase(depId)]: getRock(depId)}
      }, {})
      const rock = init(dependencyMap)
      const placeholderRock = resolvedRocks.get(id)
      waitingRocks.delete(id)

      if (placeholderRock) {
        delete placeholderRock.isWaitingToResolve
        placeholderRock.__proto__ = rock
      }
      else {
        resolvedRocks.set(id, rock)
      }

      BETON[camelCase(id)] = rock

      resolvedANewRock = true
    }
  })

  if (resolvedANewRock) {
    tryToResolve()
  }
}

function getRock(id) {
  return resolvedRocks.get(id)
}

function hasRock(...ids) {
  return ids.every(id => {
    return resolvedRocks.has(id) &&
      !resolvedRocks.get(id).isWaitingToResolve
  })
}

const BETON = {
  define,
  getRock,
  hasRock,
}

setTimeout(() => {
  // resolvedRocks.forEach((rock, id) => console.log(id, rock))
  waitingRocks.forEach((rock, id) => console.log(`${id} is still waiting!`))
}, 1234)

export default BETON
global.BETON = BETON
