import {
  collectSelectedKeys,
  getItems,
} from '../selectors'
import {
  removeKeyFromParam,
} from './generated'

function getParentParamOfKey({keyId}) {
  const items = getItems()
  const isIt = item => item.type === 'param' && item.keys.indexOf(keyId) !== -1
  const param = items.find(isIt)
  return param.id
}

export function removeSelectedKeysOfTimeline({timelineId}) {
  const selectedKeys = collectSelectedKeys({keyHolderId: timelineId})
  selectedKeys.forEach(({id: keyId}) => {
    const paramId = getParentParamOfKey({keyId})
    removeKeyFromParam({paramId, childKeyId: keyId})
  })
}
