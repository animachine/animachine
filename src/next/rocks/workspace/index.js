import React from 'react'
import {Spaceman, SpacemanStore} from 'spaceman'
import createMountNode from './createMountNode'
import source from './source'

const workspace = new SpacemanStore(source)
export default workspace

const mountNode = createMountNode()
React.render(<Spaceman store={workspace}/>, mountNode)
