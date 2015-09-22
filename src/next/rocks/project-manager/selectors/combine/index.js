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

export const combineSelectorCommand = createCombiner(item =>
  item.selectorCommandParams.reduce((a, b) => ({...a, [b.key]: b.value}), {})
)

export const combineSelector = createCombiner(item => {
  return map(item.selectorCommands, combineSelectorCommand)
})

export const combineKey = createCombiner(item => ({
  ease: getItemById({id: item.ease})
}))

export const combineParam = createCombiner(item => ({
  params: map(item.params, combineParam)
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
