import EventEmitter from 'eventman'
import Project from './Project'
import pull from 'lodash/array/pull'

const projectManager = new class extends EventEmitter {
  constructor() {
    super()

    this.openedProjects = []
    this.currentProject = null

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
    console.log({project})
    global.project = project
    this.currentProject = project
  }
  getCurrentProject() {
    return this.currentProject
  }
  openProject(project) {
    this.openedProjects.push(project)
  }
  closeProject(project) {
    pull(this.openedProjects, project)
    if (this.getCurrentProject() === project) {
      this.setCurrentProject(this.openedProjects[0])
    }
  }
}()

export default projectManager
