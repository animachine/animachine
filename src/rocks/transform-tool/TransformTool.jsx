import React from 'react'
import {CSSTranshand} from 'transhand'
import {connect} from 'react-redux'

const key2ParamName = {
  tx: 'x',
  ty: 'y',
  sx: 'scaleX',
  sy: 'scaleY',
  rz: 'rotationZ',
  ox: 'transformOriginX',
  oy: 'transformOriginY',
}

@connect(
  () => {
    const {state, getters} = BETON.require('project-manager')
    const track = state.lastSelectedTrack

    if (!track) {
      return {}
    }

    const currentTime = state.selectedTimeline.currentTime

    const getValue = (paramName, defaultValue) => {
      const param = track.params.find(paramv => param.name === paramName)
      const value = param && getters.getValueOfParamAtTime(param, currentTime)
      return value === undefined ? defaultValue : value
    }

    return {
      selectedTarget,
      tx: getValue('x', 0),
      ty: getValue('y', 0),
      sx: getValue('scaleX', 1),
      sy: getValue('scaleY', 1),
      rz: getValue('rotationZ', 0),
      ox: getValue('transformOriginX', 0.5),
      oy: getValue('transformOriginY', 0.5),
      currentTime
    }
  },
  () => {
    const projectManager = BETON.require('project-manager')
    return {
      actions: projectManager.actions
    }
  }
)
export default class TransformTool extends React.Component {
  handleChange = (change) => {
    const {trackId, currentTime, actions} = this.props

    Object.keys(change).forEach(key => {
      const paramName = key2ParamName[key]
      let value = change[key]
      if (paramName === 'rotationZ') {
        value = value / Math.PI * 180
      }
      actions.setValueOfTrackAtTime({
        trackId,
        paramName,
        time: currentTime,
        value
      })
    })
  }

  render() {
    const {hidden, tx, ty, sx, sy, rz, ox, oy} = this.props

    const transform = {
      tx,
      ty,
      sx,
      sy,
      rz: rz / 180 * Math.PI,
      ox,
      oy
    }

    return <CSSTranshand
      transform = {transform}
      deTarget = {selectedTarget}
      onChange = {this.handleChange}
      autoUpdateCoordinatorFrequency={1234}/>
  }
}
