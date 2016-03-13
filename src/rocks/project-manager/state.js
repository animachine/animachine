import {observable, fastArray} from 'mobservable'
import {Key, Project} from './models'
import {recurseKeyHolders, recurseKeys, recurseParams} from './recursers'

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
    currentProject: {type: 'Project'},
    history: {type: 'History'},
  },
  arrayValues: {
    projects: {type: 'Project'},
  },
  computedValues: {
    currentTimeline() {
      return this.currentProject && this.currentProject.currnetTimeline
    },
    currentTrack() {
      return this.currentTimeline && this.currnetTimeline.currentTrack
    },
    selectedKeys() {
      const result = []
      if (this.currentTimeline) {
        recurseKeys(this.currentTimeline, key => {
          if (key.selected) {
            result.push(key)
          }
        })
      }
      return result
    },
    currentPreviews() {
      const previewRegistry = BETON.require('preview-registry')
      const timeline = this.currentTimeline
      const result = timeline
        ? previewRegistry.getters.getPreviewsOfTimeline(timeline)
        : []
      return result
    },
  }
})

export default new State()
