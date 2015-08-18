import assign from 'lodash/object/assign'
const resolvedRocks = new Map()
const waitingRocks = new Map()

function define(id, dependencies, resolve) {
  resolvedRocks.set(id, {})
  waitingRocks.set(id, {dependencies, resolve})
  tryToResolve()
}

tryToResolve() {
  waitingRocks.forEach({resolve, dependencies}, id) {
    if (dependencies.every(depId => hasRock(depId))) {
      const rock = resolve(dependencies.map(depId => getRock(depId)))
      waitingRocks.delete(id)
      assign(getRock(id), rock)
    }
  }
}

function getRock(id) {
  return resolvedRocks.get(id)
}

// function setRock(id, rock) {
//   rockMap.set(id, rock)
//   resolveWaitingHandlers()
// }
//
// function getRock(ids, handler) {
//   if (typeof ids === 'string') {
//     ids = [ids]
//   }
//
//   const promise = new Promise(function (resolve) {
//     resolveQuery(ids, (...rocks) => {
//       resolve(...rocks)
//       if (handler) {
//         handler(...rocks)
//       }
//     })
//   })
//
//   return promise
// }
//
// async function getRockAsync(...args) {
//   return await getRock(...args)
// }

function hasRock(...ids) {
  return ids.every(id => rockMap.has(id))
}

// function resolveQuery(ids, resolve) {
//   if (hasRock(...ids)) {
//     let rocks = ids.map(id => rockMap.get(id))
//     resolve(...rocks)
//   }
//   else {
//     waitingHandlers.set(ids, resolve)
//   }
// }
//
// function resolveWaitingHandlers() {
//   waitingHandlers.forEach((resolve, ids) => {
//     if (hasRock(...ids)) {
//       resolveQuery(ids, resolve)
//       waitingHandlers.delete(ids)
//     }
//   })
// }

const BETON = {
  setRock,
  getRock,
  getRockAsync,
  hasRock,
}

export default BETON
global.BETON = BETON
