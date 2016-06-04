import React from 'react'
import ReactDOM from 'react-dom'
import animachine from 'animachine'
import animations from './new-project.am'

const styles = {
  root: {
    display: 'flex',
    flex: 1,
    justifyContent: 'center'
  },
  container1: {
    marginTop: 100,
    backgroundColor: '#DDDDDD',
    width: 300,
    height: 300,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  container2: {
    backgroundColor: '#AAAAAA',
    width: 250,
    height: 250,
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  box: {
    width: 50,
    height: 50,
  }
}

function Box({color, className}) {
  return <div
    className={className}
    style={{...styles.box, backgroundColor: color}}
  />
}

export default class Picker extends React.Component {
  handleRoot = (comp) => {
    if (comp) {
      const node = ReactDOM.findDOMNode(comp)
      animations['new timeline'](node)

      animachine.init()
    }
  };
  render() {
    return (
      <div style={styles.root} className='root'>
        <div
          ref={this.handleRoot}
          style={styles.container1}
          className='container1'
        >
          <div style={styles.container2} className='container2'>
            <Box color='#FF851B' className='first'/>
            <Box color='#FF4136' className='second'/>
            <Box color='#85144b' className='last'/>
          </div>
        </div>
      </div>
    )
  }
}
