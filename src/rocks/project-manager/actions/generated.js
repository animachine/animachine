import camelCase from 'lodash/string/camelCase'
import capitalize from 'lodash/string/capitalize'
import {
  getMaxTimelineStart,
  getItemById,
  getParentTimelineIdByChildId,
} from '../selectors'

const constantCase = str => {
  return str.replace(/[A-Z]/g, cap => `_${cap.toLowerCase()}`)
            .toUpperCase()
}
const min = minValue => value => Math.max(minValue, value)
const max = maxValue => value => Math.min(maxValue, value)
const minmax = (minValue, maxValue) => value =>
  Math.min(maxValue, Math.max(minValue, value))

const actions = {}
Object.defineProperty(actions, '__esModule', {
  value: true
})
module.exports = actions//HACK!!!

autoAddAction('set', 'name', 'project')
autoAddAction('add', 'timeline', 'project')
autoAddAction('remove', 'timeline', 'project')
autoAddAction('set', 'currentTimelineId', 'project')

autoAddAction('set', 'name', 'timeline')
autoAddAction('set', 'isPlaying', 'timeline')
autoAddAction('set', 'currentTime', 'timeline', null, value => min(0)(parseInt(value)))
autoAddAction('set', 'pxpms', 'timeline', null, minmax(0.0001, 3))
autoAddAction('set', 'length', 'timeline')
autoAddAction('set', 'width', 'timeline')
autoAddAction('set', 'start', 'timeline', null, (value, {timelineId}) => max(getMaxTimelineStart({timelineId}))(value))
autoAddAction('set', 'startMargin', 'timeline')
autoAddAction('set', 'currentTrackId', 'timeline')
autoAddAction('set', 'inlineEaseEditor', 'timeline')
autoAddAction('add', 'track', 'timeline')
autoAddAction('remove', 'track', 'timeline')

autoAddAction('set', 'name', 'track')
autoAddAction('set', 'selectors', 'track')
autoAddAction('set', 'openedInTimeline', 'track')
autoAddAction('set', 'showThreeDimensionalParams', 'track')
autoAddAction('add', 'param', 'track')
autoAddAction('remove', 'param', 'track')

autoAddAction('set', 'name', 'param')
autoAddAction('set', 'openedInTimeline', 'param')
autoAddAction('add', 'key', 'param')
autoAddAction('remove', 'key', 'param')

autoAddAction('set', 'time', 'key', true, min(0))
autoAddAction('set', 'value', 'key', true)
autoAddAction('set', 'selected', 'key', true)

autoAddAction('set', 'pointAX', 'ease', null, minmax(0, 1))
autoAddAction('set', 'pointAY', 'ease')
autoAddAction('set', 'pointBX', 'ease', null, minmax(0, 1))
autoAddAction('set', 'pointBY', 'ease')
autoAddAction('set', 'roughEase', 'ease')
autoAddAction('set', 'roughStrength', 'ease')
autoAddAction('set', 'roughPoints', 'ease')
autoAddAction('set', 'type', 'ease')
autoAddAction('set', 'roughClamp', 'ease')
autoAddAction('set', 'roughRandomise', 'ease')
autoAddAction('set', 'roughTaper', 'ease')

autoAddAction('add', 'selector', 'track')
autoAddAction('remove', 'selector', 'track')
autoAddAction('add', 'selectorCommand', 'selector')
autoAddAction('remove', 'selectorCommand', 'selector')
autoAddAction('remove', 'selector', 'track')
autoAddAction('add', 'selectorCommandParam', 'selectorCommand')
autoAddAction('remove', 'selectorCommandParam', 'selectorCommand')
autoAddAction('set', 'key', 'selectorCommandParam')
autoAddAction('set', 'value', 'selectorCommandParam')

addAction('OPEN_PROJECT', ['projectSource', 'previewComponents'])

addAction('SET_LAST_SELECTED_ITEM_ID', ['itemId'])
addAction('SET_VISIBLE_TIME_OF_TIMELINE', ['timelineId', 'visibleTime'])
addAction('SET_VALUE_OF_PARAM_AT_TIME', ['paramId', 'time', 'value'])
addAction('SET_VALUE_OF_TRACK_AT_TIME', ['trackId', 'paramName', 'time', 'value'])
addAction('SELECT_KEYS_AT_TIME', ['keyHolderId', 'time'])
addAction('TOGGLE_KEYS_AT_TIME', ['keyHolderId', 'time'])
addAction('DESELECT_ALL_KEYS', ['keyHolderId'])
addAction('TOGGLE_KEYS_SELECTION_AT_TIME', ['keyHolderId', 'time'])
addAction('TRANSLATE_SELECTED_KEYS', ['keyHolderId', 'offset'])
addAction('UNDO', ['timelineId'])
addAction('REDO', ['timelineId'])

console.log({actions})

function addAction(type, params, fixPayload) {
  actions[type] = type
  actions[camelCase(type)] = function (payload = {}) {
    const store = BETON.getRock('store')

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
}

function autoAddAction(command, valueKey, targetKey, history, fixValue) {
  const fixPayload = payload => {
    const value = fixValue
      ? fixValue(payload[valueKey], payload)
      : payload[valueKey]

    return {
      ...payload,
      [valueKey]: value,
      historyInfo: getHistoryInfo()
    }

    function getHistoryInfo() {
      if (!history) {
        return
      }

      const itemId = payload[getTargetIdKey()]
      const item = getItemById({id: itemId})

      return {
        timelineId: getParentTimelineIdByChildId({itemId}),
        redo: {
          type: payload.type,
          [valueKey]: item.value
        }
      }
    }
  }

  addAction(getType(), getParams(), fixPayload)

  function getType() {
    switch (command) {
      case 'set':
        return `SET_${constantCase(valueKey)}_OF_${constantCase(targetKey)}`
      case 'add':
        return `ADD_${constantCase(valueKey)}_TO_${constantCase(targetKey)}`
      case 'remove':
        return `REMOVE_${constantCase(valueKey)}_FROM_${constantCase(targetKey)}`
    }
  }

  function getParams() {
    switch (command) {
      case 'set':
        return [valueKey, getTargetIdKey()]
      case 'add':
        return [getTargetIdKey()]
      case 'remove':
        return [`child${capitalize(valueKey)}Id`, getTargetIdKey()]
    }
  }

  function getTargetIdKey() {
    return `${targetKey}Id`
  }
}
