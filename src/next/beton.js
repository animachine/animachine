const rockMap = new Map()
const waitingHandlers = new Map()

function addRock(id, rock) {
  rockMap.set(id, rock)
  resolveWaitingHandlers()
}

function getRock(ids, handler) {
  if (typeof ids === 'string') {
    ids = [ids]
  }

  if (hasRock(...ids)) {
    let rocks = ids.map(id => rockMap.get(id))
    handler(...rocks)
  }
  else {
    waitingHandlers.set(ids, handler)
  }
}

function hasRock(...ids) {
  return ids.every(id => rockMap.has(id))
}

function resolveWaitingHandlers() {
  waitingHandlers.forEach((handler, ids) => {
    if (hasRock(...ids)) {
      getRock(ids, handler)
      waitingHandlers.delete(ids)
    }
  })
}

const BETON = {
  addRock,
  getRock,
  hasRock
}

export default BETON
global.BETON = BETON
