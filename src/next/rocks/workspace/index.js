import React from 'react'
import {Spaceman, SpacemanStore} from 'spaceman'
import createMountNode from './createMountNode'
import source from './source'
import HTML5Backend from 'react-dnd/modules/backends/HTML5'
import { DragDropContext } from 'react-dnd'

const workspace = new SpacemanStore(source)
export default workspace

@DragDropContext(HTML5Backend)
class App {
  render() {
    return <Spaceman store={workspace}/>
  }
}

const mountNode = createMountNode()
React.render(<App/>, mountNode)
