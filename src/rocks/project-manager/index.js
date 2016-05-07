import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import {autorun, createArray} from 'afflatus'
import models from './models'

BETON.define({
  id: 'project-manager',
  dependencies: [],
  init: () => {
    // Project boundle files use this method to load they project source in
    //  animachine.

    global.__animachineLoadProject = projectSource => {
      const project = state.loadProject(projectSource)
      return project
    }

    return {state, actions, getters}
  }
})
