
export default function (items = [], action) => {
  switch (action.type) {
    case SET_KEY_VALUE:
      return setKeyValue({items, itemId: action.itemId, value: action.value})
    case SET_KEY_TIME:
      return setKeyValue({items, itemId: action.itemId, time: action.time})
      return state

    case SET_VALUE_AT_TIME: {
      const {trackId, name, time, value} = action
      items = createParamWithName({items, trackId, name})
      const param = findParamByName({items, trackId, name})
      items = createKeyWithTime({items, paramId: param.itemId, time})
      const key = findKeyInTime({items, trackId, name})
      setKeyValue({keyId: key.id, value})
    }
    default:
      return items
  }
}

function findParamByName(trackId, name) {
  recurseParams(trackId, param => {
    if (param.name === action.name) {
      param = param
    }
  })
}

function setKeyValue({items, itemId, value}) {
  const key = findItemById({items, itemId})
  return replaceItem({items, oldItem: key, newItem: {...key, value}})
}

function setKeyTime({items, itemId, time}) {
  const key = findItemById({items, itemId})
  return replaceItem({items, oldItem: key, newItem: {...key, time}})
}

function replaceItem({items, oldItem, newItem}) {
  const index = items.indexOf(oldItem)
  return [
    ...items.slice(0, index),
    newItem,
    ...items.slice(index + 1)
  ]
}
