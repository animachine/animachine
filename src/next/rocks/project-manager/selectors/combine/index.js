import combine from './combine'
import {getItemById} from '../'

const createCombiner = mod => id => {
  const item = getItemById({id})
  if (__DEV__) {
    if (!item) {
      throw Error(`Can't find item with id: ${id}`)
    }
  }
  return combine(item, mod(item))
}

const map = (item, fn) => item && item.map(fn)

export const combineKey = createCombiner(item => ({
  ease: getItemById({id: item.ease})
}))

export const combineParam = createCombiner(item => ({
  keys: map(item.keys, combineKey),
  params: map(item.params, combineParam)
}))

export const combineTrack = createCombiner(item => ({
  params: map(item.params, combineParam)
}))

export const combineTimeline = createCombiner(item => ({
  tracks: map(item.tracks, combineTrack)
}))

export const combineProject = createCombiner(item => ({
  timelines: map(item.timelines, combineTimeline)
}))
