/* @flow */

import {Param, Track, Timeline, Project} from '../models'
import state from '../state'
import {recurseKeys} from '../recursers'
import {getValueOfParamAtTime} from '../getters'

function oneTransaction(fn) {
  return (...args) => transaction(fn(...args))
}

function historySave(redo: Function, undo: Function) {
  redo()
}

export function set(target: object, name: string, value: any) {
  oldValue = target[name]

  historySave(
    () => target[name] = value,
    () => target[name] = oldValue
  )
}

export function add(parent: object, containerName: string, item: object) {
  historySave(
    () => {
      parent[containerName].push(item)
      item.parent = parent
    },
    () => {
      parent[containerName].remove(item)
      item.parent = null
    }
  )
}

export function remove(parent: object, containerName: string, item: object) {
  historySave(
    () => {
      parent[containerName].remove(item)
      item.parent = null
    },
    () => {
      parent[containerName].push(item)
      item.parent = parent
    }
  )
}

export function loadProject(source: object) {
  const project = new Project(source)
  state.projects.push(project)
  return project
}

export function setValueOfParamAtTime(
  param: Param,
  value: string,
  time: number
) {
  let key: Key = param.keys.find(key => key.time === time)
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
  let param: Param = track.params.find(param => param.name === paramName)
  if (!param) {
    param = new Param()
    add(track.params, param)
  }
  setValueOfParamAtTime(param)
}

export function deselectAllKeys(keyHolder: object) {
  forEachKeys(keyHolder, key => set(key, 'selected', false))
}

export function selectKeysAtTime(keyHolder, time) {
  recurseParams(keyHolder, param => {
    const key = param.keys.find(key => key.time === time)
    if (key) {
      set(key, 'selected', true)
    }
  })
}

export function toggleKeysSelectionAtTime(keyHolder, time) {
  let allHasKey = true

  recurseParams(keyHolder, param => {
    const key = param.keys.find(key => key.time === time)
    if (!key) {
      allHasKey = false
    }
  })

  recurseParams(keyHolder, param => {
    const key = param.keys.find(key => key.time === time)
    if (allHasKey) {
      if (key) {
        remove(param.keys, key)
      }
    }
    else {
      if (!key) {
        const value: string = getValueOfParamAtTime(param, time)
        setValueOfParamAtTime(param, value, time)
      }
    }
  })
}
