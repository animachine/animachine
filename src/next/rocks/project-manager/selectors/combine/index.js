import combine from './combine'
import {findItemById} from '../'

const createCombiner = mod => id => {
  const item = getItemById({id})
  return combine(item, mod(item))
}

export const combineKey = createCombiner(item => ({
  ease: findItemById({id: item.ease.id})
}))

export const combineParam = createCombiner(item => ({
  keys: item.keys.map(combineKey),
  params: item.params.map(combineParam)
}))

export const combineTrack = createCombiner(item => ({
  params: item.params.map(combineParam)
}))

export const combineTimeline = createCombiner(item => ({
  tracks: item.tracks.map(combineTrack)
}))

export const combineProject = createCombiner(item => ({
  timelines: item.timelines.map(combineTimeline)
}))
