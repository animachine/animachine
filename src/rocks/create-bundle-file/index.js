import {serialise} from 'afflatus'

BETON.define({
  id: 'create-bundle-file',
  dependencies: ['project-manager'],
  init
})

function init({projectManager}) {
  return function() {
    const {currentProject} = projectManager.state
    const projectSource = serialise(currentProject)
    const timelineSources = currentProject.timelines.map(timeline => {
      return {
        name: timeline.name,
        source: timeline.animationSource,
      }
    })
    const name = currentProject.name || 'unnamed'
    return {
      fileName: `${name}.am.js`,
      source: create(timelineSources, projectSource)
    }
  }
}

function create(timelineSources, projectSource) {
  return `
var createAnimationSource = require('animachine-connect/create-animation-source')

//TODO: remove in prod
var projectSource = ${JSON.stringify(projectSource)}

var loadProject = new Promise(function (resolve) {
  var intervalID = setInterval(function () {
    if (typeof window.__animachineLoadProject === 'function') {
      clearInterval(intervalID)
      var project = window.__animachineLoadProject(projectSource)
      resolve(project)
    }
  }, 100)
})

var timelineSources = ${JSON.stringify(timelineSources)}
var animations = {}

timelineSources.forEach(function (timelineSource, index) {
  var gsapSource = createAnimationSource(
    timelineSource,
    //TODO remove in prod
    (rootTarget, gsapAnimation) => {
      loadProject
        .then(function (project) {
          project.timelines
            .find(function (timeline) {
              return timeline.name === timelineSource.name
            })
            .registerPreview(rootTarget, gsapAnimation)
        })
    }
  )
  animations[timelineSource.name] = gsapSource
})

module.exports = animations`
}
