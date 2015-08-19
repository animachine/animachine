import React from 'react'
import {Spaceman, SpacemanStore} from 'spaceman'
import createMountNode from './createMountNode'
import source from './source'
import HTML5Backend from 'react-dnd/modules/backends/HTML5'
import { DragDropContext } from 'react-dnd'
import matterkitTheme from './matterkitTheme'

const workspace = new SpacemanStore(source)
BETON.define('workspace', [], () => workspace)

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
