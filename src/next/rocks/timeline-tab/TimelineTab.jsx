import React from 'react'
import {Provider} from 'react-redux'
import Timeline from './Timeline'

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
