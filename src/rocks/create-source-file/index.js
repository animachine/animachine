BETON.define({
  id: 'create-source-file',
  dependencies: ['project-manager'],
  init
})

function init({projectManager}) {
  return function() {
    const {selectors} = projectManager
    const currentProject = selectors.getCurrentProject()
    const combinedProject = selectors.combineProject(currentProject.id)
    const name = currentProject.name || 'unnamed'
    return {
      fileName: `${name}.am.js`,
      source: create(combinedProject)
    }
  }
}

function create(combinedProject) {
  return `var animachineEnhancer = require('react-animachine-enhancer')
var createAnimationSource = animachineEnhancer.createAnimationSource

var projectSource = ${JSON.stringify(combinedProject)}
var animations = {}

projectSource.timelines.forEach(function (timeline) {
  var gsapSource = createAnimationSource({projectSource, timeline})
  animations[timeline.name] = gsapSource
})

module.exports = animations`
}
