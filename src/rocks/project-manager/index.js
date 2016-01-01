import * as actions from './actions/actions'
import * as getters from './getters'
import state from './state'

BETON.define({
  id: 'project-manager',
  dependencies: [],
  init: () => {
    global.__animachineLoadProject = fastArray(
      global.__animachineLoadProject
    )
    let pos = 0
    autoRun(() => {
      while(pos < global.__animachineLoadProject.length) {
        const [projectSource, callback] = global.__animachineLoadProject[pos]
        const project = getters.loadProject(projectSource)
        callback(project)
        ++pos
      }
    })

    return {state, actions, getters}
  }
})
