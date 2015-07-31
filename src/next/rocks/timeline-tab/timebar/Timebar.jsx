import React from 'react'
import Pointer from './Pointer'
import Timetape from './Timetape'
import Navigator from './Navigator'

export default class Timebar extends React.Component {
  render() {
    const {height, timeline} = this.props
    return <div>
      <Timetape {...{height, timeline}}/>
      <Navigator {...{timeline}}/>
      <Pointer {...{timeline}}/>
    </div>
  }
}
