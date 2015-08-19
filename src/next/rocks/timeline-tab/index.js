import React from 'react'
import TimelineTab from './TimelineTab'


BETON.define('timeline-tab', ['workspace', 'store', 'project-manager'], init)

function init(workspace) {
  workspace.setTabContent('timeline', () => <TimelineTab/>)
}
