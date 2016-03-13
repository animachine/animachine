import React from 'react'
import {Spaceman} from 'spaceman'
import matterkitTheme from './matterkitTheme'
import LaunchButton from './LaunchButton'
import state from './state'
import HTML5Backend from 'react-dnd/modules/backends/HTML5'
import {DragDropContext} from 'react-dnd'
import {afflatus} from 'afflatus'

@DragDropContext(HTML5Backend)
@afflatus
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
