import camelCase from 'lodash/string/camelCase'
import snakeCase from 'lodash/string/snakeCase'

const store = BETON.getRock('store')

const constantCase = str => snakeCase(str).toUpperCase()

const actions = {}
export default actions

autoAddAction('set', 'currentTimelineId', 'project')
autoAddAction('add', 'timeline', 'project')
autoAddAction('remove', 'timeline', 'project')

autoAddAction('set', 'name', 'timelne')
autoAddAction('set', 'isPlaying', 'timelne')
autoAddAction('set', 'currentTime', 'timelne')
autoAddAction('set', 'length', 'timelne')
autoAddAction('set', 'width', 'timelne')
autoAddAction('set', 'start', 'timelne')
autoAddAction('set', 'startMargin', 'timelne')
autoAddAction('set', 'visibleTime', 'timelne')
autoAddAction('set', 'end', 'timelne')
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

autoAddAction('set', 'time', 'ease')
autoAddAction('set', 'pointAX', 'ease')
autoAddAction('set', 'pointAY', 'ease')
autoAddAction('set', 'pointBX', 'ease')
autoAddAction('set', 'pointBY', 'ease')
autoAddAction('set', 'roughEase', 'ease')
autoAddAction('set', 'roughStrength', 'ease')
autoAddAction('set', 'roughPoints', 'ease')
autoAddAction('set', 'roughClamp', 'ease')
autoAddAction('set', 'roughRandomise', 'ease')
autoAddAction('set', 'roughTaper', 'ease')

addAction('SELECT_KEYS_AT_TIME', ['keyHolderId', 'time'])
addAction('DESELECT_ALL_KEYS', ['keyHolderId', 'time'])
addAction('TOGGLE_KEYS_SELECTION_AT_TIME', ['keyHolderId', 'time'])
addAction('TRANSLATE_SELECTED_KEYS', ['keyHolderId', 'time'])

function addAction(type, params) {
  actions[type] = type
  actions[camelCase(type)] = function (payload) {
    if (__DEV__) {
      let payloadKeys = Object.keys(payload)
      if (!params.every(param => payloadKeys.indexOf(param) !== -1)) {
        console.warn(`Missing param "${param}" in action "${type}"`)
      }
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

function autoAddAction(command, value, target) {
  addAction(getType(), getParams())

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
        return [`${value}Id`]
      case 'add':
        return [value]
      case 'remove':
        return [`${value}Id`]
    }
  }
}
