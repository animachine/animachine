BETON.define({
  id: 'create-source-file',
  dependencies: ['project-manager'],
  init
})

function init({projectManager}) {
  return function() {
    const {getters} = projectManager
    const currentProject = getters.getCurrentProject()
    const projectSource = currentProject.getSource()
    const timelineSources = currentProject.timelines.map(timeline => {
      return {
        name: timeline.name,
        source: timeline.getProductionSource(),
      }
    })
    const name = currentProject.name || 'unnamed'
    return {
      fileName: `${name}.am.js`,
      source: create(timelneSources, projectSource)
    }
  }
}

function create(timelineSources, projectSource) {
  return `var animachineEnhancer = require('react-animachine-enhancer')
var createAnimationSource = animachineEnhancer.createAnimationSource

var projectSource = ${JSON.stringify(projectSource)} //TODO: remove in prod
var timelneSources = ${JSON.stringify(timelneSources)}
var animations = {}

timelineSources.forEach(function (timeline) {
  var gsapSource = createAnimationSource({projectSource, timeline})
  animations[timeline.name] = gsapSource
})

module.exports = {
  projectSource: projectSource,
  createAnimation: function (timelineName) {
    for (var i = 0; i < projectSource.timelines.length; ++i) {
      var timeline = projectSource.timelines[i]
      if (timeline.name === timelineName) {
        return createAnimationSource(timeline, projectSource)
      }
    }

    throw Error('Can\'t find a timeline with the name: "' +timelineName + '"')
  }
}`
}
