const rockMap = new Map()
const waitingHandlers = new Map()

function setRock(id, rock) {
  rockMap.set(id, rock)
  resolveWaitingHandlers()
}

function getRock(ids, handler) {
  if (typeof ids === 'string') {
    ids = [ids]
  }

  const promise = new Promise(function (resolve) {
    resolveQuery(ids, (...rocks) => {
      resolve(...rocks)
      if (handler) {
        handler(...rocks)
      }
    })
  })

  return promise
}

function hasRock(...ids) {
  return ids.every(id => rockMap.has(id))
}

function resolveQuery(ids, resolve) {
  if (hasRock(...ids)) {
    let rocks = ids.map(id => rockMap.get(id))
    resolve(...rocks)
  }
  else {
    waitingHandlers.set(ids, resolve)
  }
}

function resolveWaitingHandlers() {
  waitingHandlers.forEach((resolve, ids) => {
    if (hasRock(...ids)) {
      resolveQuery(ids, resolve)
      waitingHandlers.delete(ids)
    }
  })
}

const BETON = {
  setRock,
  getRock,
  hasRock
}

export default BETON
global.BETON = BETON
