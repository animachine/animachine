import React from 'react'
import TransformTool from './TransformTool'

BETON.getRock('workspace', init)

function init(workspace) {
  workspace.overlays.setOverlay('transform-tool', {
    getElement: () => <TransformTool/>
  })
}
