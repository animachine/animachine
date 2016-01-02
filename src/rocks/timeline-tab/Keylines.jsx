import React from 'react'
import Keyline from './Keyline'
import {convertTimeToPosition, getVisibleTime} from './utils'
import {ContextMenu} from 'react-matterkit'
import union from 'lodash/array/union'

export default class Keylines extends React.Component {
  // shouldComponentUpdate() {
  //   return !this.props.timeline.isPlaying
  // }

  renderPointerLine({height}) {
    const {timeline} = this.props
    const position = convertTimeToPosition({
      timeline,
      time: timeline.currentTime
    })
    const style = {
      position: 'absolute',
      transform: `translate(${position}px)`,
      left: 0,
      top: 0,
      width: 1,
      height,
      backgroundColor: '#FF4136',
    }
    return <div style={style}/>
  }

  render() {
    return <div hidden/>
    console.time('calc keylines data')
    const {timeline, actions, style} = this.props
    const {start} = timeline
    const end = start + getVisibleTime({timeline})
    const height = BETON.require('config').size
    const children = []
    let pos = 0
    const visibleKeysByParamId = {}
    timeline.tracks.forEach(track => {
      track.params.forEach(param => {
        const keyTimes = param.keyTimes
        //select the first and last key to render
        //if there are off screen key we have to include the first and last
        // to render they eases
        const lastIdx = keyTimes.length - 1
        let firstKeyIdx = 0
        let lastKeyIdx = lastIdx
        keyTimes.forEach((key, idx) => {
          if (idx !== lastIdx && key.time < start && keyTimes[idx + 1].time > start) {
            firstKeyIdx = idx
          }
          if (idx !== 0 && key.time > end && key[idx - 1].time < end) {
            lastKeyIdx = idx
          }
        })
        const visibleKeys = keyTimes.slice(firstKeyIdx, lastKeyIdx + 1)
        visibleKeysByParamId[param.id] = visibleKeys
      })
    })
    const toPosition = time =>
      parseInt(convertTimeToPosition({time, timeline})) + 0.5

    const renderKeyline = (keyHolderId, paramIds) => {
      const keySequences = []
      const easeSequences = []
      paramIds.forEach(paramId => {
        const ks = visibleKeysByParamId[paramId]
        const es = [toPosition(ks[0].time)]
        for (let i = 1; i < ks.length; ++i) {
          const key = ks[i]
          es.push(getItemById({id: key.ease}), toPosition(key.time))
        }
        keySequences.push(ks)
        easeSequences.push(es)
      })
      const timeSequences = keySequences.map(ks => ks.map(key => key.time))
      const timeSequence = union(...timeSequences)
      const selectedSequence = timeSequence.map(time => {
        return timeSequences.every((ts, sequenceIdx) => {
          const idx = ts.indexOf(time)
          return idx === -1 || keySequences[sequenceIdx][idx].selected
        })
      })


      children.push(<Keyline
        {...{timeline, actions, selectors}}
        top = {pos}
        height = {height}
        keyHolderId = {keyHolderId}
        easeSequences = {easeSequences}
        positionSequence = {timeSequence.map(time => toPosition(time))}
        selectedSequence = {selectedSequence}
        isGroup = {paramIds.length > 1}
        key = {keyHolderId}/>)

      pos += height
    }

    timeline.tracks.forEach(trackId => {
      const {params:paramIds} = getItemById({id: trackId})
      renderKeyline(trackId, paramIds)
      paramIds.forEach(paramId => renderKeyline(paramId, [paramId]))
    })

    const menuItems = [
      {label: 'delete selected keys', onClick: () => {
        const {actions} = BETON.require('project-manager')
        actions.removeSelectedKeysOfTimeline({timelineId: timeline.id})
      }}
    ]

    console.timeEnd('calc keylines data')
    return <ContextMenu items={menuItems}>
      <div style={{...style, position: 'relative'}}>
        {children}
        {this.renderPointerLine({height: pos})}
      </div>
    </ContextMenu>
  }
}
