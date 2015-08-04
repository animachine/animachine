import endsWith from 'lodash/string/endsWith'
import _isFinite from 'lodash/lang/isFinite'

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
  input: {
    type: 'multi',
    types: [
      {
        type: 'number',
        addonLabel: 'px',
        precision: 1,
        prepareExportValue: value => value + 'px',
        acceptType: value => _isFinite(value) || endsWith(value, 'px'),
      }, {
        type: 'number',
        addonLabel: '%',
        precision: 2,
        prepareExportValue: value => value + '%',
        acceptType: value => endsWith(value, '%'),
      }, {
        type: 'string',
        addonIcon: 'quote-right',
        hints: ['auto', 'inherits'],
        acceptType: value => typeof value === 'string',
      },
    ]
  }
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
    label: connect => connect.value.name
  }
}
