import {
  collectSelectedKeys,
  getParentParamOfKey,
} from '../selectors'
import {
  removeKeyFromParam,
} from './generated'

export function removeSelectedKeysOfTimeline({timelineId}) {
  const selectedKeys = collectSelectedKeys({keyHolderId: timelineId})
  selectedKeys.forEach(({id: keyId}) => {
    const paramId = getParentParamOfKey({keyId}).id
    removeKeyFromParam({paramId, childKeyId: keyId})
  })
}
