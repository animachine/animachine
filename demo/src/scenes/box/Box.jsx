import React from 'react'
import animachine from 'react-animachine-enhancer'
import animations from './jumping.am'

@animachine(animations)
export default class Box extends React.Component {
  componentDidMount() {
    this.addAnimation('jump')
  }

  render() {
    var style = {
      backgroundColor: '#88ce02',
      width: '160px',
      height: '160px',
    }
    return <div key='box' style={style}/>
  }
}
