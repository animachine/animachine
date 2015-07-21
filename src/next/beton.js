const rockMap = new Map()
const BETON = {
  addRock(id, rock) {
    rockMap.set(id, rock)
  },

  getRock(id) {
    return rockMap.get(id)
  }
}

export default BETON
global.BETON = BETON
