import BETON from './beton'
import store from './rocks/store'
import currentProject from './rocks/current-project'
import componentInspector from './rocks/component-inspector'
import projectManager from './rocks/project-manager'
import workspace from './rocks/workspace'
import config from './rocks/config'
import debuggerTab from './rocks/debugger-tab'
import timelineTab from './rocks/timeline-tab'
import transformTool from './rocks/transform-tool'
import timelinePusher from './rocks/timeline-pusher'

const animachine = {
  init() {
    BETON.setRock('store', store)
    BETON.setRock('currentProject', currentProject)
    BETON.setRock('component-inspector', componentInspector)
    BETON.setRock('project-manager', projectManager)
    BETON.setRock('workspace', workspace)
    BETON.setRock('config', config)
    BETON.setRock('debugger-tab', debuggerTab)
    BETON.setRock('timeline-tab', timelineTab)
    BETON.setRock('transform-tool', transformTool)
    BETON.setRock('timeline-pusher', timelinePusher)
  }
}

export default animachine
