import React from 'react'
import {afflatus, createComputedValue, transaction} from 'afflatus'
import {CSSTranshand} from 'transhand'
import {createTargets} from 'animachine-connect'

const key2ParamName = {
  tx: 'x',
  ty: 'y',
  sx: 'scaleX',
  sy: 'scaleY',
  rz: 'rotationZ',
  ox: 'transformOriginX',
  oy: 'transformOriginY',
}

@afflatus
export default class TransformTool extends React.Component {
  handleChange = (change) => {
    const {state} = BETON.require('project-manager')
    const track = state.currentTrack

    transaction(() => {
      Object.keys(change).forEach(key => {
        const paramName = key2ParamName[key]
        let value = change[key]
        if (paramName === 'rotationZ') {
          value = value / Math.PI * 180
        }

        track.setValueAtTime(
          paramName,
          value,
          state.currentTimeline.currentTime
        )
      })
    })
  }

  handleStartDrag = () => {
    const {state} = BETON.require('project-manager')
    this.endFlag = state.currentProject.history.startFlag()
  };

  handleEndDrag = () => {
    this.endFlag && this.endFlag()
  };

  render() {
    const {state} = BETON.require('project-manager')
    const track = state.currentTrack
    if (!track) {
      return <div hidden/>
    }
    const target = track.targets[0]
    if (!target) {
      return <div hidden/>
    }

    const currentTime = state.currentTimeline.currentTime

    const getValue = (paramName, defaultValue) => {
      const param = track.params.find(param => param.name === paramName)
      const value = param && param.currentValue
      return value === undefined ? defaultValue : value
    }

    const transform = {
      tx: getValue('x', 0),
      ty: getValue('y', 0),
      sx: getValue('scaleX', 1),
      sy: getValue('scaleY', 1),
      rz: getValue('rotationZ', 0) / 180 * Math.PI,
      ox: getValue('transformOriginX', 0.5),
      oy: getValue('transformOriginY', 0.5)
    }

    return <CSSTranshand
      transform = {transform}
      deTarget = {target}
      onChange = {this.handleChange}
      onStartDrag = {this.handleStartDrag}
      onEndDrag = {this.handleEndDrag}
      autoUpdateCoordinatorFrequency={12345}/>
  }
}
