const rockMap = new Map()
export default const BETON = {
  addRock(id, rock) {
    rockMap.set(id, rock)
  }

  getRock(id) {
    rockMap.get(id)
  }
}

global.BETON = BETON
