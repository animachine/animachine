BETON.define('create-source-file', ['project-manager'], init)

function init(projectManager) {
  return function() {
    const {selectors} = projectManager
    const currentProject = selectors.getCurrentProject()
    const combinedProject = selectors.combineProject(currentProject.id)
    return {
      fileName: `${currentProject.name}.am.js`,
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
