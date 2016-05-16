import React from 'react'
import ReactDOM from 'react-dom'
import animachine from 'animachine'

export default class Box extends React.Component {
  componentDidMount() {
    animachine.init()
  }

  render() {
    var style = {
      backgroundColor: '#7FDBFF',
      width: '80px',
      height: '80px',
    }
    return (
      <div>
        <div id='box' style={style}/>
      </div>
    )
  }
}
