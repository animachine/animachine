import {Param, Track, Timeline, Project} from '../models'
import state from '../state'
import {recurseKeys} from '../recursers'

function oneTransaction(fn) {
  return (...args) => transaction(fn(...args))
}

export function historySave(undo, redo) {
  redo()
}

export function set(target: object, name: string, value: any) {
  oldValue = target[name]

  historySave(
    () => target[name] = value,
    () => target[name] = oldValue
  )
}

export function add(container: Array<object>, item: object) {
  historySave(
    () => container.remove(item),
    () => container.push(item)
  )
}

export function remove(container: Array<object>, item: object) {
  historySave(
    () => container.push(item),
    () => container.remove(item)
  )
}

export function openProject(source: object) {
  const project = new Project(source)
  state.openedProjects.push(project)
  state.currentProjectId = project.id
}

export function setValueOfParamAtTime(
  param: Param,
  value: string,
  time: number
) {
  const key: Key = param.keys.find(key => key.time === time)
  if (!key) {
    key = new Key()
    add(param.keys, key)
  }
  key.value = value
}

export function setValueOfTrackAtTime(
  track: Track,
  paramName: string,
  value: string,
  time: number
) {
  const param: Param = track.params.find(param => param.name === paramName)
  if (!param) {
    param = new Param()
    add(track.params, param)
  }
  setValueOfParamAtTime(param)
}

export function deselectAllKeys(keyHolder: object) {
  forEachKeys(keyHolder, key => set(key, 'selected', false))
}

export function toggleKeysSelectionAtTime(keyHolder, time) {

}

addAction('SET_LAST_SELECTED_ITEM_ID', ['itemId'])
addAction('SET_VISIBLE_TIME_OF_TIMELINE', ['timelineId', 'visibleTime'])
// addAction('SET_VALUE_OF_PARAM_AT_TIME', ['paramId', 'time', 'value'])
// addAction('SET_VALUE_OF_TRACK_AT_TIME', ['trackId', 'paramName', 'time', 'value'])
addAction('SELECT_KEYS_AT_TIME', ['keyHolderId', 'time'])
addAction('TOGGLE_KEYS_AT_TIME', ['keyHolderId', 'time'])
// addAction('DESELECT_ALL_KEYS', ['keyHolderId'])
addAction('TOGGLE_KEYS_SELECTION_AT_TIME', ['keyHolderId', 'time'])
addAction('TRANSLATE_SELECTED_KEYS', ['keyHolderId', 'offset'])
addAction('UNDO', ['timelineId'])
addAction('REDO', ['timelineId'])
