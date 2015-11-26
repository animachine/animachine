//based on http://codepen.io/chrisgannon/pen/PqOOrR
import React from 'react'
import animachine from 'react-animachine-enhancer'
import animations from './pointless-task.am'

@animachine(animations)
export default class Robots extends React.Component {
  render() {
    const pincerStyle = {
      overflow: 'visible',
      position: 'absolute',
      left: -287,
      top: -255,
    }
    const createBotStyle = (color, width, height, left=0, top=0) =>({
      position: 'absolute',
      left,
      top,
      width,
      height,
      backgroundColor: color,
      borderRadius: height / 2
    })
    const createJoinStyle = (color, size, left=0, top=0) =>({
      borderStyle: 'solid',
      position: 'absolute',
      boxSizing: 'border-box',
      left,
      top,
      width: size,
      height: size,
      borderWidth: 10,
      borderColor: '#ededed',
      borderRadius: size,
      backgroundColor: color,
    })
    const shoulderStyle = createBotStyle('#E9B400', 380, 140, 100, 400)
    const shoulderJoinStyle = createJoinStyle('#E9B400', 60, 280, 40)
    const armStyle = createBotStyle('#343434', 540, 80, 270, 30)
    const armJoinStyle = createJoinStyle('#343434', 60, 470, 10)
    const forearmStyle = createBotStyle('#E9B400', 280, 40, 480, 20)
    const forearmJoinStyle = createJoinStyle('#E9B400', 60, 230, -10)
    return <div style={{transform: 'scale(0.5)'}}>
      <div name='shoulder' style={shoulderStyle}>
        <div name='armGroup' style={armStyle}>
          <div name='forearmGroup' style={forearmStyle}>
            <svg name='pincerGroup' style={pincerStyle} width="170" height="140">
              <polygon name='pincerL' fill='#343434' points='29.7,69 64.3,118.7 64,137.9 0,65.6 65.6,0 83.9,18.3'/>
              <polygon name='pincerR' fill='#343434' points='144.2,69 109.6,118.7 109.9,137.9 173.9,65.6 108.3,0 90,18.3'/>
            </svg>
            <div style={forearmJoinStyle}/>
          </div>
          <div style={armJoinStyle}/>
        </div>
        <div style={shoulderJoinStyle}/>
      </div>
      <svg style={{overflow: 'visible'}}>
        <g name='conveyorGroup'>
          <path name='conveyor' fill='none' stroke='#343434' strokeWidth='18' strokeMiterlimit='10' d='M724.8,568H496.9c-28.5,0-51.9-23.3-51.9-51.9v0
          	c0-28.5,23.3-51.9,51.9-51.9h227.8c28.5,0,51.9,23.3,51.9,51.9v0C776.6,544.7,753.3,568,724.8,568z'/>
          <path name='wheelL' fill='#343434' d='M527,521v-8h-7c-0.5-3.6-1.8-7-3.7-9.9l5.4-5.4l-5.7-5.7l-5.2,5.2c-2.6-2-5.6-3.4-8.9-4.2V486h-8v6.6
          	c-4.2,0.5-8.2,2.1-11.4,4.5l-5-5l-5.7,5.7l5.1,5.1c-2,3-3.4,6.4-3.9,10.2H467v8h6.4c0.7,3.5,2.2,6.7,4.3,9.4l-4.6,4.6l5.7,5.7
          	l4.8-4.8c3.1,2,6.6,3.4,10.4,3.8v6.3h8v-6.8c2.9-0.7,5.5-1.9,7.9-3.5l5,5l5.7-5.7l-4.9-4.9c2-2.7,3.4-5.8,4.1-9.2H527z M510.3,516.1
          	c0,7.5-6.1,13.7-13.7,13.7s-13.7-6.1-13.7-13.7s6.1-13.7,13.7-13.7S510.3,508.6,510.3,516.1z'/>
          <path name='wheelR' fill='#343434' d='M754,521v-8h-6.6c-0.5-3.6-1.8-7-3.7-9.9l5.4-5.4l-5.7-5.7l-5.4,5.2c-2.6-2-5-3.4-9-4.2V486h-8v6.6
          	c-4,0.5-8,2.1-11.3,4.5l-4.9-5l-5.6,5.7l5.1,5.1c-2,3-3.4,6.4-3.9,10.2H694v8h6.8c0.7,3.5,2.2,6.7,4.3,9.4l-4.6,4.6l5.7,5.7l4.7-4.8
          	c3.1,2,7.3,3.4,10.3,3.8v6.3h8v-6.8c3-0.7,5.7-1.9,8.1-3.5l5.1,5l5.7-5.7l-4.9-4.9c2-2.7,3.4-5.8,4.1-9.2H754z M737.6,516.1
          	c0,7.5-6.1,13.7-13.7,13.7s-13.7-6.1-13.7-13.7s6.1-13.7,13.7-13.7S737.6,508.6,737.6,516.1z'/>
        </g>
        <path name='base' fill='#343434' stroke='#ededed' strokeWidth='4' d='M290.9,577.5H24.1c-5.6,0-10.1-4.5-10.1-10.1V436.9c0-5.6,4.5-10.1,10.1-10.1h266.8c5.6,0,10.1,4.5,10.1,10.1
        	v130.5C301,572.9,296.5,577.5,290.9,577.5z'/>
        <path name='minirobot' fill='#2967A7' d='M525.4,413.3h-10.9v10.2h10.9V413.3L525.4,413.3z M517.3,420.3c-1,0-1.8-0.8-1.8-1.8c0-1,0.8-1.8,1.8-1.8
        	c1,0,1.8,0.8,1.8,1.8C519.1,419.5,518.3,420.3,517.3,420.3z M522.6,420.3c-1,0-1.8-0.8-1.8-1.8c0-1,0.8-1.8,1.8-1.8s1.8,0.8,1.8,1.8
        	C524.4,419.5,523.6,420.3,522.6,420.3z M537.7,435.9c-0.2-3.5-1.6-5.9-3.5-7.3c-1.5-1.2-3.2-1.8-4.6-2v-1.2h-19.4v1.2
        	c-1.4,0.2-3,0.8-4.6,2c-1.8,1.4-3.3,3.9-3.5,7.3c-1.3,0.5-2.3,1.7-2.3,3.2c0,1.9,1.5,3.4,3.4,3.4v-1.5c-1,0-1.9-0.8-1.9-1.9
        	c0-1,0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9h1.5c0-1.5-1-2.8-2.3-3.2c0.2-2.8,1.3-4.5,2.7-5.6c1-0.8,2.2-1.3,3.2-1.5v11.7h1.7v7.7
        	c-2,0.7-3.4,2.6-3.4,4.7h10.1c0-2.2-1.4-4-3.4-4.7v-7.7h9.2v7.7c-2,0.7-3.4,2.6-3.4,4.7h10.1c0-2.2-1.4-4-3.4-4.7v-7.7h1.7v-11.7
        	c1,0.2,2.2,0.6,3.2,1.5c1.4,1.1,2.5,2.8,2.7,5.6c-1.4,0.4-2.3,1.7-2.3,3.2h1.5c0-1,0.8-1.9,1.9-1.9c1,0,1.9,0.8,1.9,1.9
        	c0,1-0.8,1.9-1.9,1.9v1.5c1.9,0,3.4-1.5,3.4-3.4C539.9,437.6,539,436.3,537.7,435.9z M518.5,435.4h-1.9v-1.9h1.9V435.4z
        	 M518.5,433.1h-1.9v-1.9h1.9V433.1z M520.9,435.4H519v-1.9h1.9V435.4z M520.9,433.1H519v-1.9h1.9V433.1z M523.3,435.4h-1.9v-1.9h1.9
        	V435.4z M523.3,433.1h-1.9v-1.9h1.9V433.1z M529.5,417c0-1.5-1.2-2.7-2.7-2.7v5.5C528.3,419.8,529.5,418.5,529.5,417z M513.1,419.8
        	v-5.5c-1.5,0-2.7,1.2-2.7,2.7C510.4,418.5,511.6,419.8,513.1,419.8z'/>
      </svg>
    </div>
  }
}
