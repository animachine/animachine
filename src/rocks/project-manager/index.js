import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import {autorun, createArray} from 'afflatus'
import models from './models'

BETON.define({
  id: 'project-manager',
  dependencies: ['toolbar'],
  init: (toolbar) => {
    // Project bundle files use this method to load they project source in
    //  animachine.

    global.__animachineLoadProject = projectSource => {
      const project = state.loadProject(projectSource)
      return project
    }

    setTimeout(() => { //TODO use something like BETON.loaded.then(...)
      const toolbar = BETON.require('toolbar')
      toolbar.actions.addItem({
        icon: 'undo',
        label: 'undo',
        order: 10,
        onClick: () => {
          if (state.currentTimeline) {
            state.currentTimeline.history.undo()
          }
        },
      })
      toolbar.actions.addItem({
        icon: 'repeat',
        label: 'redo',
        order: 11,
        onClick: () => {
          if (state.currentTimeline) {
            state.currentTimeline.history.redo()
          }
        },
      })
    })

    return {state, actions, getters}
  }
})
