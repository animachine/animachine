require('./beton')
require('./rocks/debugger-tab')
require('./rocks/component-inspector')
require('./rocks/config')
require('./rocks/create-source-file')
require('./rocks/file-save')
require('./rocks/hack-open-first-possible-project')
require('./rocks/item-settings-dialog')
require('./rocks/preview-animation-synchronizer')
require('./rocks/project-manager')
require('./rocks/store')
require('./rocks/timeline-pusher')
require('./rocks/timeline-tab')
require('./rocks/toolbar')
require('./rocks/tracker')
require('./rocks/transform-tool')
require('./rocks/welcome-dialog')
require('./rocks/workspace')

const animachine = {
  init() {
    BETON.getRock('welcome-dialog').showNext()
  }
}

export default animachine
