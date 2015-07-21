const livingComponents = []

global._registerMountedAnimachineComponent = registerComponent

if (global._waitingMountedAnimachineComponents) {
  global._waitingMountedAnimachineComponents.forEach(component => {
    registerComponent(component)
  })
  delete global._waitingMountedAnimachineComponents
}

function registerComponent(component) {
  livingComponents.push(component)
}

function getProjects() {
  var projects = new Set()

  livingComponents.forEach(component => {
    var runningAnimations = component.__runningAnimations
    if (!runningAnimations) {
      return
    }

    runningAnimations.forEach(animation => {
      var sourceAnimation = animation._gsapAnimationFactory
      if (sourceAnimation && sourceAnimation._animachineProject) {
        projects.add(sourceAnimation._animachineProject)
      }
    })
  })

  return projects
}

function getComponentsWithProject(project) {
  livingComponents.forEach(component => {

  })
}

export default {
  getProjects,
  getComponentsWithProject
}
