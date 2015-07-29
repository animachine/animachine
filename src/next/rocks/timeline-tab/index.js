import React from 'react'
import TimelineTab from './TimelineTab'


BETON.getRock('workspace', init)

function init(workspace) {
  workspace.setTabContent('timeline', () => <TimelineTab/>)
}
