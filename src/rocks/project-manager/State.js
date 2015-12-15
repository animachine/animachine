import {observable} from 'mobservable'
import {Key, Project} from './models'
import {recurseKeyHolders, recurseKeys} from './recursers'

export default class State {
  @observable projects: Array<Project> = []
  @observable selectedProjectId: ?string = null

  @observable selectedProject: ?Project = function () {
    const {projects, selectedProjectId} = this
    return this.projects.find(({id}) => id === selectedProjectId) || null
  }

  @observable selectedTimeline: ?Timeline = function () {
    if (this.currentProject) {
      const {selectedTimelineId} = this.currentProject
      return currentProject.projects.find(({id}) => id === selectedTimelineId)
        || null
    }
  }

  @observable selectedKeyholder: ?Project = function () {
    if (this.currentProject) {
      const {selectedKeyholderId} = this.currentProject
    }
  }

  @observable selectedKeys: Array<Key> = function () {
    const result: Array<Key> = []
    if (this.currentTimeline) {
      recurseKeys(this.currentTimeline, key => result.push(key))
    }
    return result
  }
}
