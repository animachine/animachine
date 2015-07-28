import EventEmitter from 'eventman'
import Project from './Project'
import pull from 'lodash/array/pull'

const projectManager = new class extends EventEmitter {
  constructor() {
    super()

    this._openedProjects = []
    this._currentProject = null

    BETON.getRock('component-inspector', componentInspector => {
      this.componentInspector = componentInspector
      this.componentInspector.on(
        'register-component',
        this.handleRegisterComponent
      )
      this.handleRegisterComponent()
    })
  }

  handleRegisterComponent = () => {
    if (!this.getCurrentProject()) {
      var projectSources = this.componentInspector.getProjectSources()

      if (projectSources.length) {
        const projectSource = projectSources[0]
        const previewComponents =
          this.componentInspector.getComponentsWithProjectSource(projectSource)
        const project = new Project(
          projectSource,
          previewComponents
        )

        this.openProject(project)
        this.setCurrentProject(project)
        this.componentInspector.off(
          'register-component',
          this.handleRegisterComponent
        )
      }
    }
  }

  setCurrentProject(project) {
    global.project = project
    this._currentProject = project
    this.emit('change.currentProject')
  }

  getCurrentProject() {
    return this._currentProject
  }

  openProject(project) {
    this._openedProjects.push(project)
  }

  closeProject(project) {
    pull(this._openedProjects, project)
    if (this.getCurrentProject() === project) {
      this.setCurrentProject(this._openedProjects[0])
    }
  }
}()

export default projectManager
