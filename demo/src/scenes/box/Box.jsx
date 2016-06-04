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
  box: {
    marginTop: 50,
    width: 80,
    height: 80,
  }
}

function Box({color, className}) {
  return <div
    className={className}
    style={{...styles.box, backgroundColor: color}}
  />
}

export default class Scene extends React.Component {
  // handleRoot = (comp) => {
  //   if (comp) {
  //     const node = ReactDOM.findDOMNode(comp)
  //     animations['new timeline'](node)
  //
  //     animachine.init()
  //   }
  // };
  render() {
    return (
      <div style={styles.root} className='root'>
        <Box color='#39CCCC' className='box'/>
      </div>
    )
  }
}
