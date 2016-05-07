import {defineModel, createModel, deserialise} from 'afflatus'

export class HistoryFlag {
  constructor(pair) {
    this.pair = pair || new HistoryFlag(this)
  }
  isPair(pair) {
    return this.pair === pair
  }
}

export class HistoryReg {
  constructor(redo, undo) {
    this.undo = undo
    this.redo = redo
  }
}


defineModel({
  type: 'History',
  simpleValues: {
    position: {defaultValue: -1}
  },
  arrayValues: {
    stack: {}
  }
})

defineModel({
  type: 'State',
  simpleValues: {
    currentProject: {type: 'Project', canBeNull: true},
    history: {type: 'History'},
  },
  arrayValues: {
    projects: {type: 'Project'},
  },
  computedValues: {
    currentTimeline() {
      return this.currentProject && this.currentProject.currentTimeline
    },
    currentTrack() {
      return this.currentTimeline && this.currentTimeline.currentTrack
    }
  },
  untrackedValues: {
    loadProject(source) {
      const project = deserialise(source)
      this.projects.push(project)
      return project
    }
  }
})

export default createModel('State')
