import React from 'react'
import KeyStepper from './KeyStepper'
import ifit from './ifit'
import {setParamValue} from './utils'

export default function createParamSettings({id, name, value}) {
  const nameInput = {
    value: name,
    mod: {kind: 'stamp'},
    onChange: (v) => {
      const {setNameOfParam} = BETON.require('project-manager').actions
      setNameOfParam({name: v, paramId: id})
    }
  }
  const input = {
    value,
    onChange: setParamValue.bind(null, id)
  }
  const settings = {
    selector: 'all',
    inputs: [nameInput, input],
    buttons: [{
      getElement: () => {
        return <KeyStepper
          keyHolderId = {id}
        />
      }
    }]
  }

  ifit(name)
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
      input.addonLabel = 'deg'
      input.precision = 1
    })
    .is('transformOriginX,transformOriginY', () => {
      input.addonLabel = '%'
      input.dragSpeed = 0.01
      input.precision = 5
    })
    .is('xPercent,yPercent', () => {
      input.dragSpeed = 1
      input.precision = 1
    })
    .is('color,borderColorTop,borderColorRight,borderColorBottom,borderColorLeft,backgroundColor', () => {
      input.type = 'color'
    })
    .is('borderWidth,top,right,bottom,left,width,height', () => {
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
    .is('z,rotationX,rotationY,scaleZ', () => {
      if(!track.show3d) {
        settings.hidden = true
      }
    })

  return settings
}
