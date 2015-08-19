import Key from './Key'
import Model from '../Model'
import defineProperties from '../defineProperties'
import defineChildren from '../defineChildren'
import defineType from '../defineType'
import controlKeys from '../controlKeys'
import mandatoryParamGroups from '../mandatoryParamGroups'
import {recurseParams} from '../recursers'
import {createEaser} from 'react-animachine-enhancer'

@defineProperties([
  {name: 'name', type: 'string'},
  {name: 'openInTimeline', type: 'boolean', initValue: true},
])
@defineChildren({name: 'key', ChildClass: Key, selection: true})
@defineChildren({name: 'param', ChildClass: Param})
@defineType
@controlKeys
export default class Param extends Model {
  demandKeyLike(keySource) {
    var demandedKey = this.findKeyBy('time', keySource.time)
    if (!demandedKey) {
      demandedKey = new Key(keySource)
      this.addKey(demandedKey)
    }
    return demandedKey
  }

  getValueAtTime(time) {
    var previousKey, nextKey, rightKey
    this.forEachKey(key => {
      if (key.time === time) {
        rightKey = key
      }
      else if (key.time < time) {
        if (!previousKey) {
          previousKey = key
        }
        else if (previousKey.time < key.time) {
          previousKey = key
        }
      }
      else if (key.time > time) {
        if (!nextKey) {
          nextKey = key
        }
        else if (nextKey.time > key.time) {
          nextKey = key
        }
      }
    })

    if (rightKey) {
      return rightKey.value
    }
    else {
      if (previousKey && nextKey) {
        const fullTime = nextKey.time - previousKey.time
        const percent = (time - previousKey.time) / fullTime
        const easer = createEaser(nextKey.ease)
        const ratio = easer.getRatio(percent)
        return previousKey.value + (nextKey.value - previousKey.value) * ratio
      }
      else if (previousKey) {
        return previousKey.value
      }
      else if (nextKey) {
        return nextKey.value
      }
      else {
        return 0
      }
    }
  }
}
