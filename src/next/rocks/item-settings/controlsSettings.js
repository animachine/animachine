import createParamSettings from './createParamSettings'
import {getParentTimeline, getParentTrack} from './utils'

const createTypeSelector = type => connect => {
  return connect.value && connect.value.type === type
}

export default [{
    selector: 'root',
    hiddenHead: true,
    children: connect => connect.value.projects,
  }, {
    selector: createTypeSelector('project'),
    label: connect => connect.value.name,
    children: connect => connect.value.tracks,
    onClick: connect => handleSelectClick(connect),
  }
]

function handleSelectClick(connect) {
  const {actions} = BETON.getRock('project-manager')
  const {id: currentTrackId} = getParentTrack(connect)
  const {id: timelineId} = getParentTimeline(connect)
  actions.setCurrentTrackIdOfTimeline({timelineId, currentTrackId})
}
