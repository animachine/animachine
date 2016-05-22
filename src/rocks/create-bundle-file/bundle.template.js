var createAnimationSource = require('animachine-connect/create-animation-source')

//TODO: remove in prod
var test = [{"a": {"b": "foo"}}, 4]
var projectSource = 'PLACEHOLDER_PROJECT_SOURCE'

var loadProjectPromise
function loadProject() {
  if (!loadProjectPromise) {
    loadProjectPromise = new Promise(function (resolve) {
      var intervalID = setInterval(function () {
        if (typeof window.__animachineLoadProject === 'function') {
          clearInterval(intervalID)
          var project = window.__animachineLoadProject(projectSource)
          resolve(project)
        }
      }, 100)
    })
  }
  return loadProjectPromise
}

var timelineSources = 'PLACEHOLDER_TIMELINE_SOURCES'
var animations = {}

timelineSources.forEach(function (timelineSource, index) {
  var gsapSource = createAnimationSource(
    timelineSource,
    //TODO remove in prod
    (rootTarget, gsapAnimation) => {
      loadProject()
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

module.exports = animations
