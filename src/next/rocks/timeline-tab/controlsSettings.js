import endsWith from 'lodash/string/endsWith'
import _isFinite from 'lodash/lang/isFinite'
import find from 'lodash/collection/find'

export default [{
  selector: 'root',
  hiddenHead: true,
  children: connect => connect.value.getTracks(),
}, {
  selector: connect => connect.value.modelType === 'Track',
  label: connect => connect.value.name,
  open: connect => connect.value.openInTimeline,
  onToggleOpen: handleToggleOpen,
  children: connect => connect.value.getParams()
}, {
  selector: connect => connect.value.modelType === 'Param',
  label: connect => connect.value.name,
  open: connect => connect.value.openInTimeline,
  onToggleOpen: handleToggleOpen,
  children: connect => connect.value.getParams()
}, {
  ...selectParam('x,y,top,right,bottom,left'),
  extraInputs: [{
    type: 'number',
    addonLabel: 'px',
    precision: 1,
    value: getParamValue,
    onChange: setParamValue
  }]
}]

function handleToggleOpen(connect) {
  connect.value.openInTimeline = !connect.value.openInTimeline
}

function selectParam(keys) {
  keys = keys.split(',')
  return {
    selector: connect => {
      return connect.parent &&
        connect.parent.modelType === 'Param' &&
        keys.indexOf(connect.value.name) !== -1
    },
    label: connect => connect.value.name,
  }
}

function getParamValue(connect) {
  const param = connect.value
  const timeline = findParentTimeline(connect)
  return param.getValueAtTime(timeline.currentTime)
}

function setParamValue(value, connect) {
  const param = connect.value
  const timeline = findParentTimeline(connect)
  const key = param.demandKeyLike({time: timeline.currentTime})
  key.value = value
}

function findParentTimeline(connect) {
  return find(connect.path, model => model.modelType === 'Timeline')
}
