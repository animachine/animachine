import React from 'react'
import Pointer from './Pointer'
import Timetape from './Timetape'
import Navigator from './Navigator'

export default class Timebar extends React.Component {
  render() {
    const {height, timeline, actions} = this.props
    return <div style={{position: 'relative'}}>
      <Timetape {...{height, timeline}}/>
      <Navigator {...{timeline, actions}}/>
      <Pointer {...{timeline}}/>
    </div>
  }
}
