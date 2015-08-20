import React from 'react'
import Timeline from './Timeline'
import {Provider} from 'react-redux'

export default class TimelineTab extends React.Component {
  constructor() {
    super()
    this.state = {}
  }

  render() {
    const {timeline} = this.state
    const store = BETON.getRock('store')
    return <Provider store={store}>
      {() => <Timeline/>}
    </Provider>
  }
}
