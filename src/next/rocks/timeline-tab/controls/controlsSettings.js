import createParamSettings from './createParamSettings'

const createTypeSelector = type => connect => {
  return connect.value && connect.value.type === type
}

export default [{
    selector: 'root',
    hiddenHead: true,
    children: connect => connect.value.tracks,
  }, {
    selector: createTypeSelector('track'),
    label: connect => connect.value.name,
    open: connect => connect.value.openInTimeline,
    onToggleOpen: handleToggleOpen,
    children: connect => connect.value.params
  }, {
    selector: createTypeSelector('param'),
    label: connect => connect.value.name,
    open: connect => connect.value.openInTimeline,
    onToggleOpen: handleToggleOpen,
    children: connect => connect.value.params || null
  },
  createParamSettings
]

function handleToggleOpen(connect) {
  const {store, actions} = BETON.getRockAsync('store')
  const {id} = connect.value
  store.dispatch(actions.toggleOpenInTimelnie({id}))
}
