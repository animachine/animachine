import React from 'react'
import {Spaceman, SpacemanStore} from 'spaceman'
import createMountNode from './createMountNode'
import source from './source'
import HTML5Backend from 'react-dnd/modules/backends/HTML5'
import { DragDropContext } from 'react-dnd'
import {createTheme} from 'react-matterkit'

const matterkitTheme = createTheme()

const workspace = new SpacemanStore(source)
export default workspace

@DragDropContext(HTML5Backend)
class App {
  static childContextTypes = {
    matterkitTheme: React.PropTypes.object
  }

  getChildContext() {
    return {matterkitTheme}
  }

  render() {
    return <Spaceman store={workspace}/>
  }
}

const mountNode = createMountNode()
React.render(<App/>, mountNode)
