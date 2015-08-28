import React from 'react'
import {CSSTranshand} from 'transhand'
import {getTargetByKeys} from 'react-animachine-enhancer'
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
    if (!trackId) {
      return {}
    }
    return {
      trackId,
      currentTime: timeline.currentTime,
      previewComponents,
    }
  },
  () => {
    const projectManager = BETON.getRock('project-manager')
    return {
      actions: projectManager.actions,
      selectors: projectManager.selectors,
    }
  }
)
export default class TransformTool extends React.Component {
  handleChange = (change) => {
    const {trackId, currentTime, actions, selectors} = this.props

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
    console.log('RENENENERNEN')
    const {previewComponents, currentTime, trackId, selectors} = this.props

    if (!previewComponents || previewComponents.length === 0 || !trackId) {
      return <div hidden />
    }

    const track = selectors.getItemById({id: trackId})
    var selectedTarget
    track.selectors.forEach(selector => {
      previewComponents.forEach(previewComponent => {
        const target = getTargetByKeys(previewComponent.__itemTree, selector)
        if (target) {
          selectedTarget = target
        }
      })
    })

    if (!selectedTarget) {
    console.log('EXIERXXEXXEXIt')
      return <div hidden/>
    }

    const getValue = (paramName, defaultValue) => {
      const param = selectors.getParamOfTrackByName({
        trackId,
        name: paramName
      })
      const value = param && selectors.getValueOfParamAtTime({
        paramId: param.id,
        time: currentTime
      })
      return value === undefined ? defaultValue : value
    }

    const transform = {
      tx: getValue('x', 0),
      ty: getValue('y', 0),
      sx: getValue('scaleX', 1),
      sy: getValue('scaleY', 1),
      rz: getValue('rotationZ', 0),
      ox: getValue('transformOriginX', 0.5),
      oy: getValue('transformOriginY', 0.5),
    }

    transform.rz = transform.rz / 180 * Math.PI
console.log({transform})
    return <CSSTranshand
      transform = {transform}
      deTarget = {selectedTarget}
      onChange = {this.handleChange}
      autoUpdateCoordinatorFrequency={1234}/>
  }
}
