/* @flow */

import {Key, Param, Track, Timeline, Project} from '../models'
import {recurseKeys, recurseParams} from '../recursers'
import {getValueOfParamAtTime} from '../getters'
import {wrap} from './history'
import {set, add, remove, createItem} from './basic'

export const setValueOfParamAtTime = wrap((
  param: Param,
  value: string,
  time: number
) => {
  let key: Key = param.keys.find(key => key.time === time)
  if (!key) {
    key = new Key({time})
    add(param, 'keys', key)
  }
  key.value = value
})

export const setValueOfTrackAtTime = wrap((
  track: Track,
  paramName: string,
  value: string,
  time: number
) => {
  let param: Param = track.params.find(param => param.name === paramName)
  if (!param) {
    param = new Param({name: paramName})
    add(track, 'params', param)
  }
  setValueOfParamAtTime(param)
})

export const deselectAllKeys = wrap((keyHolder: object) => {
  recurseKeys(keyHolder, key => set(key, 'selected', false))
})

export const translateSelectedKeys = wrap((keyHolder: object, offset) => {
  recurseKeys(keyHolder, key => {
    if (key.selected) {
      set(key, 'time', key.time + offset)
    }
  })
})

export const selectKeysAtTime = wrap((keyHolder, time) => {
  recurseParams(keyHolder, param => {
    const key = param.keys.find(key => key.time === time)
    if (key) {
      set(key, 'selected', true)
    }
  })
})

export const toggleKeysAtTime = wrap((keyHolder, time) => {
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
})
