require('./beton')
require('./rocks/debugger-tab')
require('./rocks/dom-picker')
require('./rocks/component-inspector')
require('./rocks/config')
require('./rocks/contact-layer')
require('./rocks/create-source-file')
require('./rocks/file-save')
require('./rocks/generate-selector')
require('./rocks/hack-open-first-possible-project')
require('./rocks/item-settings-dialog')
require('./rocks/open-project-dialog')
require('./rocks/preview-animation-synchronizer')
require('./rocks/project-manager')
require('./rocks/store')
require('./rocks/timeline-pusher')
require('./rocks/timeline-tab')
require('./rocks/toolbar')
require('./rocks/tracker')
require('./rocks/transform-tool')
require('./rocks/welcome-dialog')
require('./rocks/welcome-process')
require('./rocks/workspace')

import {Key, Param} from './rocks/project-manager/models'
import {autorun, transaction} from 'mobservable'
var key = new Key()
var param = new Param()
window.key = key
window.param = param
autorun(() => {
  console.log(`Key - value: ${key.value} | time: ${key.time}`)
})
autorun(() => {
  console.log(`Param keys - (${param.keys.length}) ${param.keys.map(key => key.time)}`)
})
key.time = 1000
key.value = '5px'
transaction(() => {
  key.time = 1200
  key.value = '15px'
})
param.keys.push(new Key())

if (!window.__ANIMACHINE_OPEN_FIRST__) {//HACK this flag is used by the demos
  BETON.require('hack-open-first-possible-project')()
}
else {
  BETON.require('welcome-process').start()
}

const animachine = {
  init() {
    //TODO start everithing on init
  }
}

import Perf from 'react-addons-perf'
global.perfSeek = function () {
  PPP.clear()
  Perf.start()
  BETON.projectManager.actions.setCurrentTimeOfTimeline({timelineId: '142', currentTime: ~~(2000 * Math.random())})
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

export default animachine
