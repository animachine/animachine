import React from 'react'
import {afflatus} from 'afflatus'
import Pointer from './Pointer'
import Timetape from './Timetape'
import Navigator from './Navigator'

@afflatus
export default class Timebar extends React.Component {
  render() {
    const {height, timeline} = this.props
    return <div style={{position: 'relative'}}>
      <Timetape {...{height, timeline}}/>
      <Navigator {...{timeline}}/>
      <Pointer {...{timeline}}/>
    </div>
  }
}
