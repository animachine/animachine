import forOwn from 'lodash/object/forOwn'


export function getInspectedComponents() {
  const store = BETON.getRock('store')
  return store.getState().componentInspector.inspectedComponents
}

//select all the projectSources added to the component
export function getProjectSourcesOfComponent({component}) {
  const result = []

  const runningAnimations = component.__runningAnimations
  if (runningAnimations) {
    runningAnimations.forEach(animation => {
      const sourceAnimation = animation._animationSource
      const projectSource = sourceAnimation && sourceAnimation._amProjectSource
      if (projectSource && result.indexOf(projectSource) === -1) {
        result.push(projectSource)
      }
    })
  }

  return result
}

export function getMountedComponentsOfProjectSource({projectSource}) {
  const store = BETON.getRock('store')
  const {inspectedComponents} = store.getState().componentInspector
  const result = []

  inspectedComponents.forEach(component => {
    const runningAnimations = component.__runningAnimations
    const animationSourceMap = component.__animationSourceMap

    if (animationSourceMap) {
      forOwn(animationSourceMap, animationSource => {
        if (
          animationSource._amProjectSource === projectSource &&
          result.indexOf(component) === -1
        ) {
          result.push(component)
        }
      })
    }
  })

  return result
}

function forEachProjectSourceOfComponents(component, callback) {
  const inspectedComponents = getInspectedComponents()

  function testAnimationSource(animationSource) {
    const projectSource = animationSource._amProjectSource
    if (projectSource) {
      callback({projectSource, component})
    }
  }

  inspectedComponents.forEach(component => {
    const runningAnimations = component.__runningAnimations
    const animationSourceMap = component.__animationSourceMap

    if (animationSourceMap) {
      forOwn(animationSourceMap, testAnimationSource)
    }

    if (runningAnimations) {
      runningAnimations.forEach(animation => {
        if (animation._animationSource) {
          testAnimationSource(animation._animationSource)
        }
      })
    }
  })
}
