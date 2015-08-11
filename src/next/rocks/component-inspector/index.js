import EventEmitter from 'eventman'
import forOwn from 'lodash/object/forOwn'

const componentInspector = new class extends EventEmitter {
  constructor() {
    super()
    this.livingComponents = []
  }

  registerComponent = (component) => {
    this.livingComponents.push(component)

    this.emit('register-component')
  }

  getProjectSources() {
    var projectSources = []

    this.livingComponents.forEach(component => {
      var runningAnimations = component.__runningAnimations
      if (!runningAnimations) {
        return
      }

      runningAnimations.forEach(animation => {
        var sourceAnimation = animation._animationSource
        var projectSource = sourceAnimation && sourceAnimation._amProjectSource
        if (projectSource && projectSources.indexOf(projectSource) === -1) {
          projectSources.push(projectSource)
        }
      })
    })

    return projectSources
  }

  getComponentsWithProjectSource(projectSource) {
    const ret = []

    this.livingComponents.forEach(component => {
      const animationSourceMap = component.__animationSourceMap

      if (animationSourceMap) {
        forOwn(animationSourceMap, animationSource => {
          if (
            animationSource._amProjectSource === projectSource &&
            ret.indexOf(component) === -1
          ) {
            ret.push(component)
          }
        })
      }
    })

    return ret
  }
}()

global._registerMountedAnimachineComponent = componentInspector.registerComponent

if (global._waitingMountedAnimachineComponents) {
  global._waitingMountedAnimachineComponents.forEach(component => {
    componentInspector.registerComponent(component)
  })
  delete global._waitingMountedAnimachineComponents
}

global.componentInspector = componentInspector//HACK for debugging
export default componentInspector
