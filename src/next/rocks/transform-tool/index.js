import React from 'react'
import TransformTool from './TransformTool'
import {Provider} from 'react-redux'

BETON.define('transform-tool', ['workspace', 'store'], (workspace, store) => {
  workspace.overlays.setOverlay('transform-tool', {
    getElement: () => {
      return <Provider store={store}>
        {() => <TransformTool/>}
      </Provider>
    }
  })
})
