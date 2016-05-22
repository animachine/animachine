import {serialise} from 'afflatus'
const rawBundle = require('raw!./bundled/bundle.js')

BETON.define({
  id: 'create-bundle-file',
  dependencies: ['project-manager'],
  init
})

function replacePlaceholder(source, name, value) {
  const rx = new RegExp(`['|"]PLACEHOLDER_${name}['|"]`, `g`)
  return source.replace(rx, value)
}

function stringify(obj) {
  return JSON.stringify(obj)
    .replace(/"/g, '\\"')
}

function init({projectManager}) {
  return function() {
    const {currentProject} = projectManager.state
    const projectSource = serialise(currentProject)
    const timelineSources = currentProject.timelines.map(timeline => {
      return timeline.animationSource
    })
    const name = currentProject.name || 'unnamed'
    let source = replacePlaceholder(rawBundle, 'LIBRARY_NAME', `'${name}'`)
    source = replacePlaceholder(source, 'PROJECT_SOURCE', stringify(projectSource))
    source = replacePlaceholder(source, 'TIMELINE_SOURCES', stringify(timelineSources))

    return {
      fileName: `${name}.am.js`,
      source: source
    }
  }
}
