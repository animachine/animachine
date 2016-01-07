import React, {PropTypes} from 'react'
import ReactDOM from 'react-dom'
import {observer} from 'mobservable-react'
import customDrag from 'custom-drag'
import sortBy from 'lodash/collection/sortBy'
import {getTheme} from 'react-matterkit'
import {createEaser} from 'animachine-connect'
import Key from './Key'
import Ease from './Ease'
import {
  convertPositionToTime,
  convertTimeToPosition,
  getVisibleTime,
  closestNumber
} from '../utils'

function getMouseTime(props, monitor) {
  const {x: position} = monitor.getSourceClientOffset()
  const timeline = props.keyHolder.parentTimeline
  return convertPositionToTime(timeline, position)
}

const dragOptions = {
  onDown(props, monitor) {
    const {keyHolder, actions} = props
    const {pxpms} = keyHolder.parentTimeline
    const mouseTime = getMouseTime(props, monitor)
    const time = closestNumber(keyHolder.keyTimes, mouseTime)
    
    // prevent dragging if the mouse is not close enough to the closest key
    if ((Math.abs(mouseTime - time) * pxpms) > 4) {
      return false
    }

    monitor.setData({hitKeys: true})

    const {shiftKey, ctrlKey} = monitor.getLastEvent().nativeEvent

    if (!shiftKey && !ctrlKey) {
      actions.deselectAllKeys(keyHolder)
    }

    if (shiftKey || ctrlKey) {
      actions.toggleKeysSelectionAtTime(keyHolder, time)
    }
    else {
      actions.selectKeysAtTime(keyHolder, time)
    }

    monitor.setData({
      lastMouseTime: mouseTime
    })
  },

  onDrag(props, monitor) {
    const {keyHolder, actions} = props
    const mouseTime = getMouseTime(props, monitor)
    const offset = mouseTime - monitor.data.lastMouseTime

    monitor.setData({
      lastMouseTime: mouseTime
    })

    actions.translateSelectedKeys(keyHolder, offset)
  },

  onClick(props, monitor) {
    //bail if it hit a key
    if (monitor.data.hitKeys) {
      return
    }

    const {state} = BETON.require('project-manager')
    const {keyHolder, actions, top, height} = props
    const timeline = keyHolder.parentTimeline
    const mouseTime = getMouseTime(props, monitor)
    const nextKeyTime = keyHolder.keyTimes.find(time => time > mouseTime)
    if (nextKeyTime === undefined) {
      return
    }
    actions.deselectAllKeys(timeline)
    actions.selectKeysAtTime(keyHolder, nextKeyTime)

    actions.set(timeline, 'inlineEaseEditor', {
      top,
      height,
      targetKey: state.selectedKeys[0],
      controlledEases: state.selectedKeys.map(key => key.ease),
    })
  }
}

@customDrag(dragOptions, connect => ({
  dragRef: connect.getDragRef()
}))
@observer
export default class Keyline extends React.Component {
  static propTypes = {
    keyHolder: PropTypes.object.isRequired,
    top: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
  }

  getColors() {
    const {
      selected,
      grey2: normal,
      bg: border,
      red
    } = getTheme(this).getStyle('colors')

    return {
      selected,
      normal,
      border,
      red,
      ease: 'rgba(225,225,225,.23)'
    }
  }

  render() {
    const {height, top, dragRef, keyHolder} = this.props
    const timeline = keyHolder.parentTimeline
    const colors = this.getColors()
    const isGroup = keyHolder.params

    function renderParam(param) {
      const result = param.keys.map(key => (
        <Key
          key = {key.id}
          _key = {key}
          isGroup = {isGroup}
          colors = {colors}
          height = {height}/>
      ))
      for (let i = 1; i < param.keys.length; ++i) {
        result.push(
          <Ease
            key = {param.keys[i].ease.id}
            height = {height}
            colors = {colors}
            beforeKey = {param.keys[i-1]}
            afterKey = {param.keys[i]}/>
        )
      }
      return result
    }

    return <svg
      ref = {dragRef}
      style = {{
        position: 'absolute',
        left: 0,
        top,
        width: timeline.width,
        height
      }}>
        {isGroup
          ? keyHolder.params.map(param => renderParam(param))
          : renderParam(keyHolder)
        }
      </svg>
  }
}
