import React from 'react'
import {connect} from 'react-redux'

@connect(store => {
  
})
export default class ContactLayer extends React.Component {
  render() {
    return <div
      onClick = {handlePick}
      style = {{width: '100%', height: '100%', background: 'red'}}/>
  }
}
