BETON.define(
  'preview-animation-synchronizer',
  ['store', 'project-manager'],
  (store, projectManager) => {
    let prevTimelineTree
    store.subscribe(() => {
      const previewComponents = projectManager.selectors.getCurrentPreviewComponents()
      const timelineTree = projectManager.selectors.combineCurrentTimeline()

      if (testTimelinesForAnimationChange(prevTimelineTree, timelineTree)) {
        previewComponents.forEach(previewComponent => {
          const animationSource = runningAnimation._animationSource

          previewComponent.__runningAnimations.forEach(runningAnimation => {
            if (
              (
                animationSource._amProjectId === this ||
                animationSource._amProjectSource === this.projectSource
              )
              && animationSource._amTimelineName === timelineTree.name
            ) {

            }
        })
      }
    })
  }
)

testTimelinesForAnimationChange(prev, next) {
  return !prev ||
    prev.tracks.length === next.tracks.length ||
    prev.tracks.some((track, i) => track !== next.tracks[i])
}

handleSourceChange = () => {
  this.previewComponents.forEach(previewComponent => {
    previewComponent.__runningAnimations.forEach(runningAnimation => {
      if (
        runningAnimation._animationSource._amProject === this ||
        runningAnimation._animationSource._amProjectSource === this.projectSource
      ) {
        var timelineName = runningAnimation._animationSource._amTimelineName
        var timeline = this.model.findTimelineBy('name', timelineName)

        var projectSource = this.model.getSource()
        var animationSource = this.wrapAnimationSource(
          createAnimationSource(projectSource, timelineName),
          timeline
        )
        animationSource._amProject = this
        animationSource._amTimelineName = timelineName
        runningAnimation.replaceAnimationSource(animationSource)
      }
    })
  })
}
}

function createAnimationSourceWrapper() {
var disposeLast

return (animationSource, timeline) => {
  console.log('wrap')
  return (...args) => {
    const gsTimeline = animationSource(...args)
    const setTime = () => gsTimeline.time(timeline.currentTime / 1000)
    gsTimeline.pause()
    setTime()
    timeline.on('change.currentTime', setTime)

    if (disposeLast) {
      disposeLast()
    }
    disposeLast = () => timeline.off('change.currentTime', setTime)

    return gsTimeline
  }
}
}

import ProjectNode from './ProjectNode'
import pull from 'lodash/array/pull'
import localStorage from 'putainde-localstorage'
import React from 'react'

const storage = localStorage.create({namespace: 'project-manager'})
const [store, componentInspector] = BETON.getRockAsync(
  ['store', 'component-inspector']
)

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
