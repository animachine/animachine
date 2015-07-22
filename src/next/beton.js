const rockMap = new Map()
const waitingHandlers = new Map()

const BETON = {
  addRock(id, rock) {
    rockMap.set(id, rock)

    const waitList = waitingHandlers.get(id)
    if (waitList) {
      waitList.forEach(handler => handler(rock))
      waitingHandlers.delete(id)
    }
  },

  getRock(id, handler) {
    const rock = rockMap.get(id)
    if (rock) {
      handler(rock)
    }
    else {
      let list = waitingHandlers.get(id)
      if (list) {
        list.push(handler)
      }
      else {
        list = [handler]
        waitingHandlers.set(id, list)
      }
    }
  }
}

export default BETON
global.BETON = BETON
