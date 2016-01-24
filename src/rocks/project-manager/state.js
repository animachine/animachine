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

class History {
  stack = fastArray()
  @observable position = -1
}

class State {
  @observable projects: Array<Project> = []
  @observable currentProject: ?Project = null

  history = new History()

  @observable get currentTimeline(): ?Timeline {
    const {currentProject} = this
    if (currentProject) {
      const {currentTimelineId} = currentProject
      return currentProject.timelines.find(({id}) => id === currentTimelineId)
        || null
    }
  }

  @observable get currentTrack(): ?Track {
    if (this.currentTimeline) {
      return this.currentTimeline.tracks.find(track =>
        track.id === this.currentTimeline.currentTrackId
      )
    }
  }

  @observable get selectedKeys(): Array<Key> {
    const result: Array<Key> = []
    if (this.currentTimeline) {
      recurseKeys(this.currentTimeline, key => {
        if (key.selected) {
          result.push(key)
        }
      })
    }
    return result
  }

  @observable get currentPreviews() {
    const previewRegistry = BETON.require('preview-registry')
    const timeline = this.currentTimeline
    const result = timeline
      ? previewRegistry.getters.getPreviewsOfTimeline(timeline)
      : []
    return result
  }
}

export default new State()
