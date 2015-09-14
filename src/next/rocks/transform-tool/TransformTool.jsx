import React from 'react'
import {CSSTranshand} from 'transhand'
import {createTarget} from 'react-animachine-enhancer'
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
  (state) => {
    const {selectors} = BETON.getRock('project-manager')
    const project = selectors.getCurrentProject()
    const timeline = selectors.getCurrentTimeline()
    if (!timeline) {
      return {}
    }
    const previewComponents = selectors.getPreviewComponentsOfProject({
      projectId: project.id
    })
    const trackId = timeline.currentTrackId
    if (!trackId || previewComponents.length === 0) {
      return {}
    }

    const track = selectors.getItemById({id: trackId})
    let selectedTarget
    track.selectors.forEach(selector => {
      previewComponents.forEach(previewComponent => {
        // debugger
        const target = createTarget(previewComponent.__itemTree)
          .findWithCommands(selector)
        if (target.length !== 0) {
          selectedTarget = target[0]
        }
      })
    })

    if (!selectedTarget) {
      return {}
    }

    const getValue = (paramName, defaultValue) => {
      const param = selectors.getParamOfTrackByName({
        trackId,
        paramName
      })
      const value = param && selectors.getValueOfParamAtTime({
        paramId: param.id,
        time: timeline.currentTime
      })
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
      trackId,
      currentTime: timeline.currentTime
    }
  },
  () => {
    const projectManager = BETON.getRock('project-manager')
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
    const {selectedTarget, tx, ty, sx, sy, rz, ox, oy} = this.props

    if (!selectedTarget) {
      return <div hidden />
    }

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
