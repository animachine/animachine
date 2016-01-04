import React from 'react'
import animachine from 'animachine-connect/react'
import animations from './jumping.am'

@animachine()
export default class Box extends React.Component {
  componentDidMount() {
    this.addAnimation(animations.jumping)
  }

  render() {
    var style = {
      backgroundColor: '#0074D9',
      width: '80px',
      height: '80px',
    }
    return <div key='box' style={style}/>
  }
}
