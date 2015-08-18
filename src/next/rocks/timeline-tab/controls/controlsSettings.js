import createParamSettings from './createParamSettings'

export default [{
    selector: 'root',
    hiddenHead: true,
    children: connect => connect.value.getTracks(),
  }, {
    selector: connect => connect.value.modelType === 'track',
    label: connect => connect.value.name,
    open: connect => connect.value.openInTimeline,
    onToggleOpen: handleToggleOpen,
    children: connect => connect.value.getParams()
  }, {
    selector: connect => connect.value.modelType === 'param',
    label: connect => connect.value.name,
    open: connect => connect.value.openInTimeline,
    onToggleOpen: handleToggleOpen,
    children: connect => connect.value.getParams()
  },
  createParamSettings
]

function handleToggleOpen(connect) {
  const {store, actions} = BETON.getRockAsync('store')
  const {itemId} = connect.value
  store.dispatch(actions.toggleOpenInTimelnie({itemId}))
}
