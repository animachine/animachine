import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import {autorun, fastArray} from 'mobservable'

BETON.define({
  id: 'project-manager',
  dependencies: ['preview-registry'],
  init: () => {
    global.__animachineLoadProject = fastArray(
      global.__animachineLoadProject
    )
    let pos = 0
    autorun(() => {
      while(pos < global.__animachineLoadProject.length) {
        const [projectSource, callback] = global.__animachineLoadProject[pos]
        console.log('>> catch load project',projectSource, callback)
        const project = actions.loadProject(projectSource)
        callback(project)
        ++pos
      }
    })

    return {state, actions, getters}
  }
})
