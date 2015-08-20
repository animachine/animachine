import React from 'react'
import KeyStepper from './KeyStepper'
import find from 'lodash/collection/find'
import ifit from './ifit'
import {getParamValueAtTime} from '../utils'

export default function createParamSettings(connect) {
  if (!connect.value || connect.value.type !== 'param') {
    return null
  }

  const param = connect.value
  const timeline = findParentTimeline(connect)
  const toggleKeys = () => {
    const {actions} = BETON.getRock('project-manager')
    actions.toggleKeysAtTime({
      keyHolderId: param.id,
      time: timelien.currentTime,
    })
  }

  const input = {
    value: getParamValue,
    onChange: setParamValue
  }
  const settings = {
    selector: 'all',
    extraInputs: [input],
    buttons: [{
      getElement: () => <KeyStepper {...{param, timeline, toggleKeys}}/>
    }]
  }

  ifit(connect)
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
      input.precision = 2
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
    .is('borderTopWidth,borderTopLeftRadius,borderTopColor,borderTopStyle', () => opt.label = 'top')
    .is('borderRightWidth,borderTopRightRadius,borderRightColor,borderRightStyle', () => opt.label = 'right')
    .is('borderBottomWidth,borderBottomLeftRadius,borderBottomColor,borderBottomStyle', () => opt.label = 'bottom')
    .is('borderLeftWidth,borderBottomRightRadius,borderLeftColor,borderLeftStyle', () => opt.label = 'left')
    .is('transformOriginX,perspectiveOriginX,scaleX,rotateX,textShadowX,boxShadowX,skeewX', () => opt.label = 'x')
    .is('transformOriginY,perspectiveOriginY,scaleY,rotateY,textShadowY,boxShadowY,skeewY', () => opt.label = 'y')
    .is('transformOriginZ,perspectiveOriginZ,scaleZ,rotateZ', () => opt.label = 'z')
    .is('bezier', () => {
        opt.optionLine.inputs = []
    })

  return settings
}

function findParentTimeline(connect) {
  return find(connect.path, model => model.type === 'timeline')
}

function getParamValue(connect) {
  const param = connect.value
  const {currentTime} = findParentTimeline(connect)
  const {selectors} = BETON.getRock('project-manager')
  return selectors.getParamValueAtTime({paramId: param.id, time: currentTime})
}

function setParamValue(value, connect) {
  const {actions} = BETON.getRock('project-manager')
  const param = connect.value
  const {currentTime} = findParentTimeline(connect)
  actions.setValueOfParamAtTime({
    paramId: param.id,
    time: currentTime,
    value,
  })
}
