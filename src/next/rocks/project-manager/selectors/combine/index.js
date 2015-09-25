import combine from './combine'
import {getItemById} from '../'

const createCombiner = (mod, {dontMerge}={}) => id => {
  const item = getItemById({id})

  if (__DEV__) {
    if (!item) {
      throw Error(`Can't find item with id: ${id}`)
    }
  }

  return combine(item, mod(item), {dontMerge})
}

const map = (item, fn) => item && item.map(fn)

export const combineSelectorCommand = createCombiner(item => {
  const reducer = (a, b) => ({...a, [b.key]: b.value})
  const selector = item.selectorCommandParams.reduce(reducer, {})
  return {
    type: item.commandType,
    selector
  }
}, {dontMerge: true})

export const combineSelector = createCombiner(item => {
  return map(item.selectorCommands, combineSelectorCommand)
}, {dontMerge: true})

export const combineKey = createCombiner(item => ({
  ease: getItemById({id: item.ease})
}))

export const combineParam = createCombiner(item => ({
  params: map(item.params, combineParam),
  keys: map(item.keys, combineKey)
}))

export const combineTrack = createCombiner(item => ({
  params: map(item.params, combineParam),
  selectors: map(item.selectors, combineSelector)
}))

export const combineTimeline = createCombiner(item => ({
  tracks: map(item.tracks, combineTrack)
}))

export const combineProject = createCombiner(item => ({
  timelines: map(item.timelines, combineTimeline)
}))
