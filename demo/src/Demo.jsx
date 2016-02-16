window.__ANIMACHINE_OPEN_FIRST__ = true

import React from 'react'
import animachine from 'animachine'
import * as scenes from './scenes'

export default class Demo extends React.Component {
  static contextTypes = {
    router: React.PropTypes.object
  }

  constructor(params) {
    super(params)
    this.state = {
      sceneName: this.props.params.name
    }
  }

  componentDidMount() {
    window.onNameParamChange = name => {
      this.setState({sceneName: name})
    }
  }

  render() {
    var {sceneName} = this.state
    var Component = scenes[sceneName]
    return <Component/>
  }
}
