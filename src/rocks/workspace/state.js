import {defineModel, createModel} from 'afflatus'

defineModel({
  type: 'WorkspaceState',
  simpleValues: {
    collapsed: {defaultValue: false},
    launchButtonX: {defaultValue: 0},
    launchButtonY: {defaultValue: 0},
  }
})

export default createModel('WorkspaceState')
