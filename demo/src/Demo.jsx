import React from 'react'
// import gsap from 'animachine-enhancer'
import scenes from './scenes'

export default class Demo extends React.Component {
  static contextTypes = {
    router: React.PropTypes.func
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
