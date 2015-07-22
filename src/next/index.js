import BETON from './beton'
import modelFactory from './rocks/model-factory'
import componentInspector from './rocks/component-inspector'
import projectManager from './rocks/project-manager'

const animachine = {
  init() {
    BETON.addRock('model-factory', modelFactory)
    BETON.addRock('component-inspector', componentInspector)
    BETON.addRock('project-manager', projectManager)
  }
}

export default animachine
