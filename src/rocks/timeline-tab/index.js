import React from 'react'
import Timeline from './Timeline'


BETON.define({
  id: 'timeline-tab',
  dependencies: [
    'workspace',
    'store',
    'project-manager',
    'toolbar',
    'item-settings-dialog'
  ],
  init
})

function init({workspace}) {
  workspace.setTabContent('timeline', <Timeline/>)
}
