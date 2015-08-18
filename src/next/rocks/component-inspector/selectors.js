import forOwn from 'lodash/object/forOwn'

const store = BETON.getRock('store')

export function getProjectSources({component}) {
  const result = []

  const runningAnimations = component.__runningAnimations
  if (!runningAnimations) {
    return
  }

  runningAnimations.forEach(animation => {
    const sourceAnimation = animation._animationSource
    const projectSource = sourceAnimation && sourceAnimation._amProjectSource
    if (projectSource && result.indexOf(projectSource) === -1) {
      result.push(projectSource)
    }
  })

  return result
}

export function getComponentsWithProjectSource({projectSource}) {
  const {inspectedComponents} = store.getState().componentInspector
  const result = []

  inspectedComponents.forEach(component => {
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
