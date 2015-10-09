import React from 'react'
import {Spaceman} from 'spaceman'
import {connect} from 'react-redux'
import {collapse, uncollapse, move} from './state/actions'
import matterkitTheme from './matterkitTheme'
import LaunchButton from './LaunchButton'
import HTML5Backend from 'react-dnd/modules/backends/HTML5'
import {DragDropContext} from 'react-dnd'

@DragDropContext(HTML5Backend)
@connect(state => state.workspace)
export default class App extends React.Component{
  static childContextTypes = {
    matterkitTheme: React.PropTypes.object
  }

  getChildContext() {
    return {matterkitTheme}
  }

  render() {
    const {collapsed, launchButtonX, launchButtonY, workspace} = this.props
    return collapsed
      ? <LaunchButton x={launchButtonX}  y={launchButtonY} {...{uncollapse, move}}/>
      : <Spaceman store={workspace}/>
  }
}
