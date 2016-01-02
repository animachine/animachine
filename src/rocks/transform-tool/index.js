import React from 'react'
import TransformTool from './TransformTool'

BETON.define({
  id: 'transform-tool',
  dependencies: ['workspace', 'store'],
  init: ({workspace, store}) => {
    workspace.overlays.setOverlay('transform-tool', {
      index: 100,
      getElement: () => <div/>//</div><TransformTool/>
    })
  }
})
