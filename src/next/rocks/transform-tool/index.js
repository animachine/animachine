import React from 'react'
import TransformTool from './TransformTool'
import {Provider} from 'react-redux'

BETON.define('transform-tool', ['workspace', 'store'], (workspace, store) => {
  console.log({workspace})
  workspace.overlays.setOverlay('transform-tool', {
    index: 100,
    getElement: () => {
      return <Provider store={store}>
        {() => <TransformTool/>}
      </Provider>
    }
  })
})
