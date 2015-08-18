
export default function item (items = [], action) {
  switch (action.type) {
  case SET_KEY_VALUE:
    return setKeyValue({items, itemId: action.itemId, value: action.value})
  case SET_KEY_TIME:
    return setKeyValue({items, itemId: action.itemId, time: action.time})
    return state

  case SET_VALUE_OF_TRACK_AT_TIME: {
    const {trackId, name, time, value} = action
    items = createParamWithName({items, trackId, name})
    const param = findParamByName({items, trackId, name})
    items = createKeyWithTime({items, paramId: param.itemId, time})
    const key = findKeyInTime({items, trackId, name})
    setKeyValue({keyId: key.id, value})
  }
  case SET_VALUE_OF_PARAM_AT_TIME: {
  }
  case TOGGLE_KEYS_AT_TIME: {
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

function toggleKeys() {
  const hasKeyNow = this.hasKeyNow()
  const time = timeline.currentTime

  if (param.getParamsLength() > 0) {
    param.forEachParam(childParam => {
      toggle(childParam)
    })
  }
  else {
    toggle(param)
  }

  function toggle(param) {
    if (hasKeyNow) {
      let key = param.getKeyBy('time', time)
      param.removeKey(key)
    }
    else {
      let value = param.getValueAtTime(time)
      let key = param.demandKeyLike({time})
      key.value = param.getValueAtTime(time)
    }
  }
}

hasKeyNow() {
  const hasKeyNow = this.hasKeyNow()
  const time = timeline.currentTime

  if (param.getParamsLength() > 0) {
    param.forEachParam(childParam => {
      toggle(childParam)
    })
  }
  else {
    toggle(param)
  }

  function toggle(param) {
    if (hasKeyNow) {
      let key = param.getKeyBy('time', time)
      param.removeKey(key)
    }
    else {
      let value = param.getValueAtTime(time)
      let key = param.demandKeyLike({time})
      key.value = param.getValueAtTime(time)
    }
  }
}

hasKeyNow() {
  const {param, timeline} = this.props
  const time = timeline.currentTime

  if (param.getParamsLength() > 0) {
    let allHas = true
    param.forEachParam(childParam => {
      if (!childParam.findKeyBy('time', time)) {
        allHas = false
      }
    })
    return allHas
  }
  else {
    return param.findKeyBy('time', time)
  }

  function toggle(param) {
    if (hasKeyNow) {
      let key = param.getKeyBy('time', time)
      param.removeKey(key)
    }
    else {
      let value = param.getValueAtTime(time)
      let key = param.demandKeyLike({time})
      key.value = param.getValueAtTime(time)
    }
  }

  hasKeyNow() {
    const {param, timeline} = this.props
    const time = timeline.currentTime

    if (param.getParamsLength() > 0) {
      let allHas = true
      param.forEachParam(childParam => {
        if (!childParam.findKeyBy('time', time)) {
          allHas = false
        }
      })
      return allHas
    }
    else {
      return param.findKeyBy('time', time)
    }
  }
}
