import filter from 'lodash/collection/filter'
import find from 'lodash/collection/find'

const createTypeSelector = type => connect => {
  return connect.value && connect.value.type === type
}

const getWhitelist = type => {
  switch (type) {
    case 'project':
      return ['name']
    case 'timeline':
      return ['name']
    case 'track':
      return ['name']
    case 'param':
      return ['name']

  }
}

function createInputSettingsNode(itemType, key, onChange) {
  return {
    selector: connect => (
      connect.parent &&
      connect.parent.type === itemType &&
      connect.key === key
    ),
    input: {
      onChange(value, connect) {
        const {actions} = BETON.getRock('project-manager')
        onChange(value, connect.parent.id, actions)
      }
    }
  }
}

export default [
  {
    selector: 'root',
    label: connect => connect.value.type,
    whitelist: connect => getWhitelist(connect.value.type),
  },
  createInputSettingsNode('track', 'name', (value, itemId, actions) =>
    actions.setNameOfTrack({name: value, trackId: itemId})),
  createInputSettingsNode('param', 'name', (value, itemId, actions) =>
    actions.setNameOfParam({name: value, paramId: itemId})),
]
