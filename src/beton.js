import assign from 'lodash/object/assign'
import camelCase from 'lodash/string/camelCase'
const resolvedRocks = new Map()
const waitingRocks = new Map()

function define({id, dependencies = [], init = () => {}}) {
  if (!id) {
    throw Error(`[BETON] you tried to define a rock without id.
It needs to be a string like {id: 'module-name', ...}`)
  }
  waitingRocks.set(id, {dependencies, init})
  tryToResolve()

  // if (!resolvedRocks.get(id)) {
  //   resolvedRocks.set(id, {isWaitingToResolve: true})
  // }
}

function tryToResolve() {
  let resolvedANewRock = false

  waitingRocks.forEach(({init, dependencies}, id) => {
    if (dependencies.every(depId => hasRock(depId))) {
      const dependencyMap = dependencies.reduce((map, depId) => {
        return {...map, [camelCase(depId)]: getRock(depId)}
      }, {})
      const rock = init(dependencyMap)
      // const placeholderRock = resolvedRocks.get(id)
      waitingRocks.delete(id)

      // if (placeholderRock) {
      //   delete placeholderRock.isWaitingToResolve
      //   placeholderRock.__proto__ = rock
      // }
      // else {
        resolvedRocks.set(id, rock)
      // }

      BETON[camelCase(id)] = rock
      console.log(`[BETON] resolve rock - ${id}`)
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
    return resolvedRocks.has(id) /*&&
      !resolvedRocks.get(id).isWaitingToResolve*/
  })
}

const BETON = {
  define,
  getRock,
  hasRock,
}

setTimeout(() => {
  // resolvedRocks.forEach((rock, id) => console.log(id, rock))
  waitingRocks.forEach((rock, id) => console.error(`[BETON] ${id} is still waiting!`, rock.dependencies.filter(id => !hasRock(id))))
}, 1234)

global.BETON = BETON
export default BETON
