import React from 'react'
import TransformTool from './TransformTool'

BETON.define({
  id: 'transform-tool',
  dependencies: ['workspace'],
  init: ({workspace}) => {
    workspace.overlays.setOverlay('transform-tool', {
      index: 100,
      getElement: () => <TransformTool/>
    })
  }
})
