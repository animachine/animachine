import React from 'react'
import {Spaceman} from 'spaceman'
import {connect} from 'react-redux'
import {collapse, uncollapse, move} from './state/actions'
import matterkitTheme from './matterkitTheme'
import LaunchButton from './LaunchButton'
import state from './state'
import HTML5Backend from 'react-dnd/modules/backends/HTML5'
import {DragDropContext} from 'react-dnd'

@DragDropContext(HTML5Backend)
export default class App extends React.Component{
  static childContextTypes = {
    matterkitTheme: React.PropTypes.object
  }

  getChildContext() {
    return {matterkitTheme}
  }

  render() {
    const {workspace} = this.props
    return state.collapsed
      ? <LaunchButton/>
      : <Spaceman store={workspace}/>
  }
}
