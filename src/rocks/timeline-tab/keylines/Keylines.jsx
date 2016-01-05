import React from 'react'
import {observer} from 'mobservable-react'
import Keyline from './Keyline'
import PointerLine from './PointerLine'
import {convertTimeToPosition, getVisibleTime} from './utils'
import {ContextMenu} from 'react-matterkit'
import union from 'lodash/array/union'

@observer
export default class Keylines extends React.Component {
  render() {
    return <div hidden/>
    const {timeline, actions, style} = this.props
    const height = BETON.require('config').size
    const children = []
    let pos = 0

    const renderKeyline = (keyHolderId, paramIds) => {
      children.push(<Keyline
        keyHolder = {keyHolder}
        top = {pos}
        height = {height}/>)

      pos += height
    }

    timeline.tracks.forEach(track => {
      renderKeyline(track)
      track.params.forEach(param => renderKeyline(param))
    })

    const menuItems = [
      {label: 'delete selected keys', onClick: () => {
        const {actions} = BETON.require('project-manager')
        actions.removeSelectedKeysOfTimeline({timelineId: timeline.id})
      }}
    ]

    return <ContextMenu items={menuItems}>
      <div style={{...style, position: 'relative'}}>
        {children}
        <PointerLine timeline={timeline}/>
      </div>
    </ContextMenu>
  }
}
