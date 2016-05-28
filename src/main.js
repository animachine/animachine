let inited = false

function init() {
  if (inited) {
    return
  }
  inited = true

  console.log('INIT ANIMACHINE')
  require('./beton')
  require('./rocks/dom-picker')
  require('./rocks/config')
  require('./rocks/contact-layer')
  require('./rocks/create-bundle-file')
  require('./rocks/file-save')
  require('./rocks/generate-selector')
  require('./rocks/hack-open-first-possible-project')
  require('./rocks/selector-editor-dialog')
  // require('./rocks/open-project-dialog')
  require('./rocks/preview-animation-synchronizer')
  require('./rocks/preview-registry')
  require('./rocks/project-manager')
  require('./rocks/timeline-pusher')
  require('./rocks/timeline-tab')
  require('./rocks/toolbar')
  require('./rocks/tracker')
  require('./rocks/transform-tool')
  require('./rocks/welcome-dialog')
  // require('./rocks/welcome-process')
  require('./rocks/workspace')

  BETON.require('welcome-dialog').show()
  BETON.require('hack-open-first-possible-project')()
}

const animachine = {
  init
}
export default animachine

if (!SKIP_AUTO_INIT_ANIMACHINE) {
  animachine.init()
}

import Perf from 'react-addons-perf'
global.perfSeek = function () {
  PPP.clear()
  Perf.start()
  BETON.projectManager.state.currentTimeline.currentTime = ~~(2000 * Math.random())
  setTimeout(function () {
    Perf.stop()
    Perf.printInclusive()
    Perf.printExclusive()
    Perf.printWasted()
    PPP.log()
  }, 200)
}
global.Perf = Perf
global.PPP = (function () {
  let data = {}
  return {
    clear() {
      data = {}
    },
    start(name) {
      const t = performance.now()
      return () => data[name] = (data[name] || 0) + (performance.now() - t)
    },
    log() {
      console.log(data)
    }
  }
}())
