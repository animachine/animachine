import forIn from 'lodash/object/forIn'

export function getInspectedComponents() {
  const store = BETON.require('store')
  return store.getState().componentInspector.inspectedComponents
}

//select all the projectSources added to the component
export function getProjectSourcesOfComponent({component}) {
  const result = []

  forEachProjectSourceOfComponents(({component: c, projectSource}) => {
    if (c === component && result.indexOf(projectSource) === -1) {
      result.push(projectSource)
    }
  })
  return result
}

export function getMountedComponentsOfProjectSource({projectSource}) {
  const result = []

  forEachProjectSourceOfComponents(({component, projectSource: ps}) => {
    if (ps === projectSource && result.indexOf(component) === -1) {
      result.push(component)
    }
  })
  return result
}

export function getProjectSources() {
  const result = []
  forEachProjectSourceOfComponents(({projectSource}) => {
    if (result.indexOf(projectSource) === -1) {
      result.push(projectSource)
    }
  })
  return result
}

function forEachProjectSourceOfComponents(callback) {
  const inspectedComponents = getInspectedComponents()

  inspectedComponents.forEach(component => {
    const animationSourceMap = component.__animationSourceMap
    const runningAnimations = component.__runningAnimations

    if (animationSourceMap) {
      forIn(animationSourceMap, testAnimationSource)
    }

    if (runningAnimations) {
      runningAnimations.forEach(animation => {
        if (animation._animationSource) {
          testAnimationSource(animation._animationSource)
        }
      })
    }

    function testAnimationSource(animationSource) {
      const projectSource = animationSource._amProjectSource
      if (projectSource) {
        callback({projectSource, component})
      }
    }
  })
}
