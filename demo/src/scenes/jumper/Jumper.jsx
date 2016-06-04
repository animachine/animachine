import React from 'react'
import ReactDOM from 'react-dom'
import animachine from 'animachine'
import animations from './jumping.am'
const image = require('url!./obj_cookiejar001.png')
const artist = require('url!./2dgame.png')

const style = {
  link: {
    position: 'fixed'
  }
}

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
    return (
      <div>
        <a
          style={{position: 'fixed', top: 0, right: 0}}
          href='http://2dgameartforfree.blogspot.hu/'
        >
          <img style={{width: 123}} src={artist}/>
        </a>
        <img className='jar' src={image}/>
      </div>
    )
  }
}
