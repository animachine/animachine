BETON.define({
  id: 'create-bundle-file',
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
  return `
var createAnimationSource = require('animachine-connect/create-animation-source')

//TODO: remove in prod
var projectSource = ${JSON.stringify(projectSource)}
var project
var registerRunningTimelineWaitingList = []

function handleLoadProject(_project) {
  project = _project
  while (registerRunningTimelineWaitingList.length !== 0) {
    registerRunningTimeline(
      ...registerRunningTimelineWaitingList.pop()
    )
  }
}

function registerRunningTimeline(index, rootTarget, gsapSource) {
  if (project) {
    if (!window.__animachineRegisterRunningTimeline) {
      window.__animachineRegisterRunningTimeline = []
    }

    window.__animachineRegisterRunningTimeline.push([
      project.timelines[index],
      rootTarget,
      gsapSource
    ])
  }
  else {
    registerRunningTimelineWaitingList.push(arguments)
  }
}

if (!window.__animachineLoadProject) {
  window.__animachineLoadProject = []
}
window.__animachineLoadProject.push(
  [projectSource, handleLoadProject]
)

var timelneSources = ${JSON.stringify(timelneSources)}
var animations = {}

timelineSources.forEach(function (timeline, index) {
  var gsapSource = createAnimationSource(
    timeline,
    (rootTarget, gsapAnimation) => {
      registerRunningTimeline(index, rootTarget, gsapAnimation)
    }
  )
  animations[timeline.name] = gsapSource
})

module.exports = animations`
}
