import camelCase from 'lodash/string/camelCase'
import {getMaxTimelineStart} from './selectors'

const store = BETON.getRock('store')

const constantCase = str => {
  return str.replace(/[A-Z]/g, cap => `_${cap.toLowerCase()}`)
            .toUpperCase()
}
const min = minValue => value => Math.max(minValue, value)
const max = maxValue => value => Math.min(maxValue, value)
const minmax = (minValue, maxValue) => value =>
  Math.min(maxValue, Math.max(minValue, value))

const actions = {}
export default actions

autoAddAction('set', 'currentTimelineId', 'project')
autoAddAction('add', 'timeline', 'project')
autoAddAction('remove', 'timeline', 'project')

autoAddAction('set', 'name', 'timeline')
autoAddAction('set', 'isPlaying', 'timeline')
autoAddAction('set', 'currentTime', 'timeline', value => min(0)(parseInt(value)))
autoAddAction('set', 'timescale', 'timeline', minmax(0.0001, 3))
autoAddAction('set', 'length', 'timeline')
autoAddAction('set', 'width', 'timeline')
autoAddAction('set', 'start', 'timeline', (value, {timelineId}) => max(getMaxTimelineStart({timelineId}))(value))
autoAddAction('set', 'startMargin', 'timeline')
autoAddAction('set', 'currentTrackId', 'timeline')
autoAddAction('set', 'inlineEaseEditor', 'timeline')
autoAddAction('add', 'track', 'timeline')
autoAddAction('remove', 'track', 'timeline')

autoAddAction('set', 'name', 'track')
autoAddAction('set', 'selectors', 'track')
autoAddAction('set', 'openedInTimeline', 'track')
autoAddAction('add', 'param', 'track')
autoAddAction('remove', 'param', 'track')

autoAddAction('set', 'name', 'param')
autoAddAction('set', 'openedInTimeline', 'param')
autoAddAction('add', 'param', 'param')
autoAddAction('remove', 'param', 'param')
autoAddAction('add', 'key', 'param')
autoAddAction('remove', 'key', 'param')

autoAddAction('set', 'time', 'key')
autoAddAction('set', 'value', 'key')
autoAddAction('set', 'selected', 'key')

autoAddAction('set', 'pointAX', 'ease', minmax(0, 1))
autoAddAction('set', 'pointAY', 'ease')
autoAddAction('set', 'pointBX', 'ease', minmax(0, 1))
autoAddAction('set', 'pointBY', 'ease')
autoAddAction('set', 'roughEase', 'ease')
autoAddAction('set', 'roughStrength', 'ease')
autoAddAction('set', 'roughPoints', 'ease')
autoAddAction('set', 'type', 'ease')
autoAddAction('set', 'roughClamp', 'ease')
autoAddAction('set', 'roughRandomise', 'ease')
autoAddAction('set', 'roughTaper', 'ease')

addAction('OPEN_PROJECT', ['projectSource', 'previewComponents'])

addAction('SET_VISIBLE_TIME_OF_TIMELINE', ['timelineId', 'visibleTime'])
addAction('SET_VALUE_OF_PARAM_AT_TIME', ['paramId', 'time', 'value'])
addAction('SET_VALUE_OF_TRACK_AT_TIME', ['trackId', 'paramName', 'time', 'value'])
addAction('SELECT_KEYS_AT_TIME', ['keyHolderId', 'time'])
addAction('TOGGLE_KEYS_AT_TIME', ['keyHolderId', 'time'])
addAction('DESELECT_ALL_KEYS', ['keyHolderId'])
addAction('TOGGLE_KEYS_SELECTION_AT_TIME', ['keyHolderId', 'time'])
addAction('TRANSLATE_SELECTED_KEYS', ['keyHolderId', 'offset'])

function addAction(type, params, fixPayload) {
  actions[type] = type
  actions[camelCase(type)] = function (payload = {}) {
    if (__DEV__) {
      let payloadKeys = Object.keys(payload)
      let missingParam = params.find(param => payloadKeys.indexOf(param) === -1)
      if (missingParam) {
        throw Error(
          `Missing param "${missingParam}" in action "${type}"\n` +
          `expected params: ${params} \n` +
          `provided params: ${payloadKeys}`
        )
      }
    }

    if (fixPayload) {
      payload = fixPayload(payload)
    }

    store.dispatch({
      type,
      ...payload
    })
  }

  function getConstant() {
    switch (command) {
      case 'set':
        return `SET_${constantCase(value)}_OF_${constantCase(target)}`
      case 'add':
        return `ADD_${constantCase(value)}_TO_${constantCase(target)}`
      case 'remove':
        return `REMOVE_${constantCase(value)}_FROM_${constantCase(target)}`
    }
  }
}

function autoAddAction(command, value, target, fixValue) {
  const fixPayload = fixValue ? payload => ({
    ...payload,
    [value]: fixValue(payload[value], payload)
  }) : undefined

  addAction(getType(), getParams(), fixPayload)

  function getType() {
    switch (command) {
      case 'set':
        return `SET_${constantCase(value)}_OF_${constantCase(target)}`
      case 'add':
        return `ADD_${constantCase(value)}_TO_${constantCase(target)}`
      case 'remove':
        return `REMOVE_${constantCase(value)}_FROM_${constantCase(target)}`
    }
  }

  function getParams() {
    switch (command) {
      case 'set':
        return [value, `${target}Id`]
      case 'add':
        return [value, `${target}Id`]
      case 'remove':
        return [`${value}`, `${target}Id`]
    }
  }
}
