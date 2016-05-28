import React from 'react'
import ReactDOM from 'react-dom'
import source from './source'
import {collapse} from './actions'
import {SpacemanStore} from 'spaceman'
import createMountNode from './createMountNode'
import App from './App'


BETON.define({
  id: 'workspace',
  dependencies: ['toolbar'],
  init: ({toolbar}) => {

    toolbar.actions.addItem({
      icon: 'compress',
      label: 'collapse ui',
      onClick: collapse,
    })

    const workspace = new SpacemanStore(source)
    const mountNode = createMountNode()

    ReactDOM.render(<App workspace={workspace}/>, mountNode)

    return workspace
  }
})
