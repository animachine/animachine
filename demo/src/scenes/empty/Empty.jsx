import React from 'react'
import ReactDOM from 'react-dom'
// import animations Emoty './jumping.am'

export default class Box extends React.Component {

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
