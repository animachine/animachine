import React from 'react'
import KeyStepper from './KeyStepper'
import ifit from './ifit'
import {getParentTimeline, getParentTrack} from './utils'

export default function createParamSettings(connect) {
  if (!connect.value || connect.value.type !== 'param') {
    return null
  }

  const param = connect.value
  const track = getParentTrack(connect)
  const timeline = getParentTimeline(connect)

  const input = {
    value: getParamValue,
    onChange: setParamValue
  }
  const nameInput = {
    value: connect => connect.value.name,
    mod: {kind: 'stamp'},
    onChange: (value, connect) => {
      const {setNameOfParam} = BETON.require('project-manager').actions
      setNameOfParam({name: value, paramId: connect.value.id})
    }
  }
  const settings = {
    selector: 'all',
    label: null,
    extraInputs: [nameInput, input],
    buttons: [/*{
      getElement: connect => {
        return <KeyStepper
          keyHolderId = {param.id}
          timelineId = {timeline.id}
        />
      }
    }*/]
  }

  ifit(connect.value.name)
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

function getParamValue(connect) {
  const param = connect.value
  const {currentTime} = getParentTimeline(connect)
  const {selectors} = BETON.require('project-manager')
  return selectors.getValueOfParamAtTime({paramId: param.id, time: currentTime})
}

function setParamValue(value, connect) {
  const {actions} = BETON.require('project-manager')
  const param = connect.value
  const {currentTime} = getParentTimeline(connect)
  actions.setValueOfParamAtTime({
    paramId: param.id,
    time: currentTime,
    value,
  })
}
