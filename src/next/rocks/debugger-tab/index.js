import React from 'react'
import DebuggerTab from './DebuggerTab'
import settings from './settings'

BETON.getRock(['workspace', 'project-manager'], init)

function init(workspace, projectManager) {
  workspace.setTabContent('debugger', () => {
    const {model} = projectManager.getCurrentProject()
    return <DebuggerTab settings={settings} value={model}/>
  })
}
