require('babel/polyfill')

import BETON from './beton'
import modelFactory from './rocks/model-factory'
import componentInspector from './rocks/component-inspector'
import projectManager from './rocks/project-manager'
import workspace from './rocks/workspace'
import config from './rocks/config'
import debuggerTab from './rocks/debugger-tab'
import timelineTab from './rocks/timeline-tab'

const animachine = {
  init() {
    BETON.setRock('model-factory', modelFactory)
    BETON.setRock('component-inspector', componentInspector)
    BETON.setRock('project-manager', projectManager)
    BETON.setRock('workspace', workspace)
    BETON.setRock('config', config)
    BETON.setRock('debugger-tab', debuggerTab)
    BETON.setRock('timeline-tab', timelineTab)
  }
}

export default animachine
