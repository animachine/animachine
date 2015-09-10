import React from 'react'
import TimelineTab from './TimelineTab'


BETON.define({
  id: 'timeline-tab',
  dependencies: ['workspace', 'store', 'project-manager', 'toolbar'],
  init
})

function init({workspace}) {
  workspace.setTabContent('timeline', () => <TimelineTab/>)
}
