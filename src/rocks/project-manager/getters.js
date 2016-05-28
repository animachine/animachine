export function getValueOfParamAtTime(param: Param, time: number) {
  let previousKey, nextKey, exactKey
  param.keys && param.keys.forEach(key => {
    if (key.time === time) {
      exactKey = key
    }
    else if (key.time < time) {
      if (!previousKey || previousKey.time < key.time) {
        previousKey = key
      }
    }
    else if (key.time > time) {
      if (!nextKey || nextKey.time > key.time) {
        nextKey = key
      }
    }
  })

  if (exactKey) {
    return exactKey.value
  }
  else {
    if (previousKey && nextKey) {
      const fullTime = nextKey.time - previousKey.time
      const percent = (time - previousKey.time) / fullTime
      const {easer} = nextKey.ease
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
