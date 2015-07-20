import React from 'react'

export default class Box extends React.Component {
  render() {
    var style = {
      backgroundColor: '#88ce02',
      width: '100px',
      height: '100px',
    }
    return <div style={style}/>
  }
}
