import React from 'react'
import Timeline from './Timeline'


BETON.define({
  id: 'timeline-tab',
  dependencies: [
    'workspace',
    'project-manager',
    'toolbar',
    'selector-editor-dialog'
  ],
  init
})

function init({workspace}) {
  workspace.setTabContent('timeline', <Timeline/>)
}
