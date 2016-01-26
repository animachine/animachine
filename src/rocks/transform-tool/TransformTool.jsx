import React from 'react'
import {observable} from 'mobservable'
import {observer} from 'mobservable-react'
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

@observer
export default class TransformTool extends React.Component {
  handleChange = (change) => {
    const {actions, state} = BETON.require('project-manager')
    const track = state.currentTrack

    Object.keys(change).forEach(key => {
      const paramName = key2ParamName[key]
      let value = change[key]
      if (paramName === 'rotationZ') {
        value = value / Math.PI * 180
      }

      actions.setValueOfTrackAtTime(
        track,
        paramName,
        value,
        state.currentTimeline.currentTime
      )
    })
  }

  @observable get target() {
    const {state} = BETON.require('project-manager')
    const track = state.currentTrack
    const previews = state.currentPreviews

    for (let i = 0; i < previews.length; ++i) {
      for (let j = 0; j < track.selectors.length; ++j) {
        const targets = createTargets(
          previews[i].rootTarget,
          track.selectors[j]
        )
        if (targets.length > 0) {
          return targets[0]
        }
      }
    }
  }

  render() {
    const {state} = BETON.require('project-manager')
    const track = state.currentTrack
    const target = this.target
    if (!track || !target) {
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
      autoUpdateCoordinatorFrequency={1234}/>
  }
}
