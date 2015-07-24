import BETON from './beton'
import modelFactory from './rocks/model-factory'
import componentInspector from './rocks/component-inspector'
import projectManager from './rocks/project-manager'
import workspace from './rocks/workspace'
import debuggerTab from './rocks/debugger-tab'

const animachine = {
  init() {
    BETON.setRock('model-factory', modelFactory)
    BETON.setRock('component-inspector', componentInspector)
    BETON.setRock('project-manager', projectManager)
    BETON.setRock('workspace', workspace)
    BETON.setRock('debugger-tab', debuggerTab)
  }
}

export default animachine
