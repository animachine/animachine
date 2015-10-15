import React from 'react'
import TimelineTab from './TimelineTab'


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
  workspace.setTabContent('timeline', <TimelineTab/>)
}
