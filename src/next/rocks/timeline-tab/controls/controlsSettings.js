import createParamSettings from './createParamSettings'
import {getParentTimeline, getParentTrack} from './utils'

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
    children: connect => connect.value.params,
    highlighted: connect => {
      const track = getParentTrack(connect)
      const timeline = getParentTimeline(connect)
      return timeline.currentTrackId === track.id
    },
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
  const {actions} = BETON.getRockAsync('store')
  const {type, id} = connect.value
  if (type === 'param') {
    actions.toggleOpenInTimelnieOfParam({paramId: id})
  }
  else if (type === 'track') {
    actions.toggleOpenInTimelnieOfTrack({trackId: id})
  }
}
