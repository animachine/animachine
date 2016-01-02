import React from 'react'
import ReactDOM from 'react-dom'
import source from './source'
import {SpacemanStore} from 'spaceman'
import createMountNode from './createMountNode'
import App from './App'
import * as actions from './state/actions'
import reducer from './state/reducer'
import {Provider} from 'react-redux'


BETON.define({
  id: 'workspace',
  dependencies: ['store', 'toolbar'],
  init: ({store, toolbar}) => {
    store.addReducer('workspace', reducer)

    toolbar.actions.addItem({item: {
      icon: 'compress',
      onClick: actions.collapse,
    }})

    const workspace = new SpacemanStore(source)
    const mountNode = createMountNode()
    ReactDOM.render(<Provider store={store}>
      <App workspace={workspace}/>
    </Provider>, mountNode)
    return workspace
  }
})
