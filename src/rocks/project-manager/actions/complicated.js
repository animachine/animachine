/* @flow */

import {recurseKeys, recurseParams} from '../recursers'
import {getValueOfParamAtTime} from '../getters'
import {wrap} from './history'
import {set, remove, createItem} from './basic'

// export const setValueOfParamAtTime = wrap((
//   param: Param,
//   value: string,
//   time: number
// ) => {
//   let key = param.keys.find(key => key.time === time)
//   if (!key) {
//     key = param.addKey({time})
//   }
//   key.value = value
// })
//
// export const setValueOfTrackAtTime = wrap((
//   track: Track,
//   paramName: string,
//   value: string,
//   time: number
// ) => {
//   let param: Param = track.params.find(param => param.name === paramName)
//   if (!param) {
//     param = track.addParam({name: paramName})
//   }
//   setValueOfParamAtTime(param, value, time)
// })

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
