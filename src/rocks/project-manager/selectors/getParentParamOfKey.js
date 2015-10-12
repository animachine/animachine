import {
  getItems
} from '../selectors'

export function getParentParamOfKey({keyId}) {
  const items = getItems()
  const isIt = item => item.type === 'param' && item.keys.indexOf(keyId) !== -1
  const param = items.find(isIt)
  return param
}
