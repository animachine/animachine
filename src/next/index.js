import BETON from './beton'
// import model from './rocks/model'
import componentInspector from './rocks/component-inspector'

const animachine = {
  init() {
    // BETON.addRock('model', model)
    BETON.addRock('component-inspector', componentInspector)
  }
}

export default animachine
