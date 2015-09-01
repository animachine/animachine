import React from 'react'
import TimelineTab from './TimelineTab'


BETON.define(
  'timeline-tab',
  ['workspace', 'store', 'project-manager', 'toolbar'],
  init
)

function init(workspace) {
  workspace.setTabContent('timeline', () => <TimelineTab/>)
}
