import React from 'react'
import Pointer from './Pointer'
import Timetape from './Timetape'
import Navigator from './Navigator'

export default class Timebar extends React.Component {
  shouldComponentUpdate() {
    return !this.props.timeline.isPlaying
  }

  render() {
    const {height, timeline, actions} = this.props
    return <div style={{position: 'relative'}}>
      <Timetape {...{height, timeline, actions}}/>
      <Navigator {...{timeline, actions}}/>
      <Pointer {...{timeline}}/>
    </div>
  }
}
