import React from 'react'
import ReactDOM from 'react-dom'
import animachine from 'animachine'
import animations from './jumping.am'

export default class Box extends React.Component {
  componentDidMount() {
    const node = ReactDOM.findDOMNode(this)
    animations.jumping(node)

    animachine.init()
  }

  render() {
    var style = {
      backgroundColor: '#0074D9',
      width: '80px',
      height: '80px',
    }
    return <div id='box' style={style}/>
  }
}
