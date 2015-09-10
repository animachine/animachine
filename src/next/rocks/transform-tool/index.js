import React from 'react'
import TransformTool from './TransformTool'
import {Provider} from 'react-redux'

BETON.define({
  id: 'transform-tool',
  dependencies: ['workspace', 'store'],
  init: ({workspace, store}) => {
    console.log({workspace})
    workspace.overlays.setOverlay('transform-tool', {
      index: 100,
      getElement: () => {
        return <Provider store={store}>
          {() => <TransformTool/>}
        </Provider>
      }
    })
  }
})
