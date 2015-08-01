import EventEmitter from 'eventman'
import ProjectNode from './ProjectNode'
import pull from 'lodash/array/pull'
import localStorage from 'putainde-localstorage'

const storage = localStorage.create(namespace: 'project-manager')

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
    if (!this.getCurrentProjectNode()) {
      var projectSources = this.componentInspector.getProjectSources()

      if (projectSources.length) {
        const projectSource = projectSources[0]
        const previewComponents =
          this.componentInspector.getComponentsWithProjectSource(projectSource)
        const projectNode = new ProjectNode(
          projectSource,
          previewComponents
        )

        this.openProjectNode(projectNode)
        this.setCurrentProjectNode(projectNode)
        this.componentInspector.off(
          'register-component',
          this.handleRegisterComponent
        )
      }
    }
  }

  setCurrentProjectNode(projectNode) {
    global.projectNode = projectNode
    this._currentProject = projectNode
    this.emit('change.currentProject')
  }

  getCurrentProjectNode() {
    return this._currentProject
  }

  openProjectNode(projectNode) {
    this._openedProjects.push(projectNode)
  }

  closeProjectNode(projectNode) {
    pull(this._openedProjects, projectNode)
    if (this.getCurrentProjectNode() === projectNode) {
      this.setCurrentProjectNode(this._openedProjects[0])
    }
  }

  storeReopenState() {
    var reopenState = {
      openedProjects: this.openedProjects.map(projectNode => {{
        uid: projectNode.model.uid,
        currentTimelineName: projectNode.model.getCurrentTimeline().name,
        previewComponents: projectNode.previewComponents.map(previewComponent => ({
          reactId: React.fincDOMNode(previewComponent).getAttribute('react-id')
        }))
      }})
    }

    storage.set('reopen-state', reopenState)
  }

  loadReopenState() {
    const reopenState = storage.get('reopen-state')
  }

  showWelcomeDialog() {

  }
}()

export default projectManager
