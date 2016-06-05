import React from 'react'
import ifit from './ifit'

export default function createParamSettings(param) {
  const {actions, getters} = BETON.require('project-manager')

  const input = {
    type: 'string',
    value: param.currentValue,
    onChange: v => {
      const time = param.parent('Timeline').currentTime
      param.setValueAtTime(v, time)
    },
    style: {flex: 1},
    onStartDrag() {
      return param.parent('Timeline').history.startFlag()
    },
    onEndDrag(endFlag) {
      endFlag()
    },
  }

  ifit(param.name)
    .is('x,y,z,transformOriginZ', () => {
      input.type = 'number'
      input.addonLabel = 'px'
      input.precision = 2
    })
    .is('scaleX,scaleY,scaleZ', () => {
      input.type = 'number'
      input.dragSpeed = 0.01
      input.precision = 2
    })
    .is('rotationX,rotationY,rotationZ', () => {
      input.type = 'number'
      input.addonLabel = 'deg'
      input.precision = 1
    })
    .is('transformOriginX,transformOriginY', () => {
      input.type = 'number'
      input.addonLabel = '%'
      input.dragSpeed = 0.01
      input.precision = 5
    })
    .is('xPercent,yPercent', () => {
      input.type = 'number'
      input.dragSpeed = 1
      input.precision = 1
    })
    .is('color,borderColorTop,borderColorRight,borderColorBottom,borderColorLeft,backgroundColor', () => {
      input.type = 'color'
    })
    .is('borderWidth,top,right,bottom,left,width,height', () => {
      input.type = 'number'
      input.addonLabel = 'px'
    })
    .is('opacity', () => {
      input.type = 'number'
      input.dragSpeed = 0.01
      input.precision = 2
    })
    // .is('borderTopWidth,borderTopLeftRadius,borderTopColor,borderTopStyle', () => settings.label = 'top')
    // .is('borderRightWidth,borderTopRightRadius,borderRightColor,borderRightStyle', () => settings.label = 'right')
    // .is('borderBottomWidth,borderBottomLeftRadius,borderBottomColor,borderBottomStyle', () => settings.label = 'bottom')
    // .is('borderLeftWidth,borderBottomRightRadius,borderLeftColor,borderLeftStyle', () => settings.label = 'left')
    // .is('transformOriginX,perspectiveOriginX,scaleX,rotateX,textShadowX,boxShadowX,skeewX', () => settings.label = 'x')
    // .is('transformOriginY,perspectiveOriginY,scaleY,rotateY,textShadowY,boxShadowY,skeewY', () => settings.label = 'y')
    // .is('transformOriginZ,perspectiveOriginZ,scaleZ,rotateZ', () => settings.label = 'z')
    // .is('z,rotationX,rotationY,scaleZ', () => {
    //   if(!track.show3d) {
    //     settings.hidden = true
    //   }
    // })

  return input
}
