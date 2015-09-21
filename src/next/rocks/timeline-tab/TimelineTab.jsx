import React from 'react'
import {Provider} from 'react-redux'
import Timeline from './Timeline'
import {HotKeys} from 'react-hotkeys'
import hotkeyMap from './hotkeyMap'

export default class TimelineTab extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const {timeline} = this.state
    const store = BETON.getRock('store')
    return <Provider store={store}>
      {() => <HotKeys keyMap={hotkeyMap}><Timeline/></HotKeys>}
    </Provider>

  }
}
