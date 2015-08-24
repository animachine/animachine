import {recurseKeys} from './recursers'

export function getKeysAtTime({keyHolder, time}) {
  const result = []
  recurseKeys(keyHolder, key => {
    if (key.time === time) {
      result.push(key)
    }
  })
  return result
}
