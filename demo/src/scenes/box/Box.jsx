import React from 'react'
import animachine from 'react-animachine-enhancer'
import animations from './jumping.am'

@animachine(animations)
export default class Box extends React.Component {
  componentDidMount() {
    this.addAnimation('jumping')
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
