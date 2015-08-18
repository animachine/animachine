import actions from './actions'
import reducer from './reducer'

BETON.define('project', ['store', 'project-manager'], (store, projectManager) {
  store.setReducer('project', reducer)

  function getCurrentProject() {
    const currentProjectManager = projectManager.getCurrentProjectManager()
    if (currentProjectManager) {
      return currentProjectManager.project
    }
  }

  function getCurrentTimeline() {
    const currentProject = getCurrentProject()
    if (currentProject) {
      {currentTimelineId} = currentProject
      return getItemById(currentTimelineId)
    }
  }

  function getItemById(id) {
    return store.getState().project.items.find(item => item.id === id)
  }

  return {
    ...actions({store}),
    getCurrentProject,
    getCurrentTimeline,
    getItemById,
  }
})





store.subscribe(() => {
  if (!getCurrnetProjectContainer()) {
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
    }
  }
})

export function getCurrnetProjectContainer() {
  const {projectContainer} = store.getState()
  const {projectContainers, currentProjectContainerIndex} = projectContainer
  return projectContainers[currentProjectContainerIndex]
}

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
    this.emit('change.currentProjectNode')
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
      openedProjects: this.openedProjects.map(projectNode => ({
        uid: projectNode.model.uid,
        currentTimelineName: projectNode.model.getCurrentTimeline().name,
        previewComponents: projectNode.previewComponents.map(previewComponent => {
          const node = React.findDOMNode(previewComponent)
          const reactId = node.getAttribute('react-id')
          return {reactId}
        })
      }))
    }

    storage.set('reopen-state', reopenState)
  }

  loadReopenState() {
    const reopenState = storage.get('reopen-state')
    return reopenState
  }

  showWelcomeDialog() {

  }
}()
global.projectManager = projectManager
export default projectManager
