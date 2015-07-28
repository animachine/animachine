import React from 'react'
import DebuggerTab from './DebuggerTab'


BETON.getRock('workspace', init)

function init(workspace) {
  workspace.setTabContent('debugger', () => <DebuggerTab/>)
}
