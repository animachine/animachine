function getCurrentTime(id) {
  const {selectors} = BETON.require('project-manager')
  return selectors.getParentTimelineIdByChildId({childId: id}).currentTime
}

export function getParamValue(id) {
  const {selectors} = BETON.require('project-manager')
  const currentTime = getCurrentTime(id)
  return selectors.getValueOfParamAtTime({paramId: id, time: currentTime})
}

export function setParamValue(id, value) {
  const {actions} = BETON.require('project-manager')
  const currentTime = getCurrentTime(id)
  actions.setValueOfParamAtTime({
    paramId: id,
    time: currentTime,
    value,
  })
}
