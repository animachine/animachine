import {observable} from 'mobservable'
import {Key, Project} from './models'
import {recurseKeyHolders, recurseKeys} from './recursers'

class State {
  @observable projects: Array<Project> = []
  @observable currentProject: ?Project = null

  @observable get currentTimeline(): ?Timeline {
    const {currentProject} = this
    if (currentProject) {
      const {currentTimelineId} = currentProject
      return currentProject.timelines.find(({id}) => id === currentTimelineId)
        || null
    }
  }

  @observable get currentParam(): ?Param {
    if (this.currentTimeline) {
      const {currentParamId} = this.currentTimeline
      let result
      recurseParams(this.currentTimeline, param => {
        if (param.id === currentParamId) {
          result = param
          return true //break
        }
      })
      return result
    }
  }

  @observable get currentTrack(): ?Track {
    if (this.currentParam) {
      return this.currentTimeline.tracks.find(track =>
        track.params.indexOf(this.currentParam) !== -1
      )
    }
  }

  @observable get selectedKeys(): Array<Key> {
    const result: Array<Key> = []
    if (this.currentTimeline) {
      recurseKeys(this.currentTimeline, key => result.push(key))
    }
    return result
  }
}

export default new State()
