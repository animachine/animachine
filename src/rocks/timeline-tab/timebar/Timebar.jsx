import React from 'react'
import {observer} from 'mobservable-react'
import Pointer from './Pointer'
import Timetape from './Timetape'
import Navigator from './Navigator'

@observer
export default class Timebar extends React.Component {
  render() {
    const {height, timeline, actions} = this.props
    return <div style={{position: 'relative'}}>
      <Timetape {...{height, timeline, actions}}/>
      <Navigator {...{timeline, actions}}/>
      <Pointer {...{timeline}}/>
    </div>
  }
}
