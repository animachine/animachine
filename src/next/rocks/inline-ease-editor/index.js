import React from 'react'
import Store from './Store'
import InlineEaseEditor from './InlineEaseEditor'

const store = new Store()
BETON.getRock(['workspace', 'timeline-tab'], init)

function init(workspace, timelineTab) {
  workspace.setOverlay('inline-ease-editor', {
    index: 2,
    getElement: () => {
      return <InlineEaseEditor store={store} timelineTab={timelineTab}/>
    }
  })
}

export default {
  focusKey: key => store.focusKey(key),
  blur: () => store.blurKey()
}
