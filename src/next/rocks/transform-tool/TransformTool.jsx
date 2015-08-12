import React from 'react'
import {CSSTranshand} from 'transhand'
import {getTargetByKeys} from 'react-animachine-enhancer'

const key2ParamName = {
  tx: 'x',
  ty: 'y',
  sx: 'scaleX',
  sy: 'scaleY',
  rz: 'rotationZ',
  ox: 'transformOriginX',
  oy: 'transformOriginY',
}

export default class TransformTool extends React.Component {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    BETON.getRock('project-manager', projectManager => {
      this.trackCurrentProjectNode(projectManager.getCurrentProjectNode())
      projectManager.on('change.currentProjectNode', this.trackCurrentProjectNode)
    })
  }

  trackCurrentProjectNode = (nextCurrentProjectNode) => {
    if (this._currentProjectNode) {
      this._currentProjectNode.model.off('change.currentTimeilne', this.trackCurrentTimeline)
    }
    this._currentProjectNode = nextCurrentProjectNode
    this._currentProjectNode.model.on('change.currentTimeilne', this.trackCurrentTimeline)

    this.trackCurrentTimeline(this._currentProjectNode.model.getCurrentTimeline())
    this.setState({previewComponents: this._currentProjectNode.previewComponents})
  }

  trackCurrentTimeline = (nextCurrentTimeline) => {
    if (this._currentTimeline) {
      this._currentTimeline.off('change.currentTrack', this.trackCurrentTrack)
      this._currentTimeline.off('change.currentTime', this.trackCurrentTime)
    }
    this._currentTimeline = nextCurrentTimeline
    this._currentTimeline.on('change.currentTrack', this.trackCurrentTrack)
    this._currentTimeline.on('change.currentTime', this.trackCurrentTime)

    this.trackCurrentTrack(this._currentTimeline.getCurrentTrack())
    this.trackCurrentTime(this._currentTimeline.currentTime)
    this.setState({timeline: this._currentTimeline})
  }

  trackCurrentTrack = (nextCurrentTrack) => {
    if (this._currentTrack) {
      this._currentTrack.off('change', this.handleCurrentTrackChange)
    }
    this._currentTrack = nextCurrentTrack
    this._currentTrack.on('change', this.handleCurrentTrackChange)
    this.setState({track: nextCurrentTrack})
  }

  trackCurrentTime = (currentTime) => {
    this.setState({currentTime})
  }

  handleCurrentTrackChange = () => {
    this.forceUpdate()
  }

  handleChange = (change) => {
    const {track, currentTime} = this.state

    Object.keys(change).forEach(key => {
      const paramName = key2ParamName[key]
      let value = change[key]
      if (paramName === 'rotationZ') {
        value = value / Math.PI * 180
      }
      track.setValueOfParamAtTime(paramName, currentTime, value)
    })
  }

  render() {
    const {previewComponents, currentTime, track} = this.state

    if (!previewComponents || previewComponents.length === 0 || !track) {
      return <div hidden/>
    }

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
      return <div hidden/>
    }

    const getValue = (paramName, defaultValue) => {
      var value = track.getValueOfParamAtTime(paramName, currentTime)
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

    return <CSSTranshand
      transform = {transform}
      deTarget = {selectedTarget}
      onChange = {this.handleChange}
      autoUpdateCoordinatorFrequency={1234}/>
  }
}
