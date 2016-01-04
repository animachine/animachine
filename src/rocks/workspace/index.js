import React from 'react'
import ReactDOM from 'react-dom'
import source from './source'
import {SpacemanStore} from 'spaceman'
import createMountNode from './createMountNode'
import App from './App'


BETON.define({
  id: 'workspace',
  dependencies: ['toolbar'],
  init: ({toolbar}) => {

    toolbar.actions.addItem({item: {
      icon: 'compress',
      onClick: actions.collapse,
    }})

    const workspace = new SpacemanStore(source)
    const mountNode = createMountNode()

    ReactDOM.render(<App workspace={workspace}/>, mountNode)

    return workspace
  }
})
