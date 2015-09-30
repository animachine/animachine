import createParamSettings from './createParamSettings'
import {getParentTimeline, getParentTrack} from './utils'

const createTypeSelector = types => connect => {
  return connect.value && types.indexOf(connect.value.type) !== -1
}

export default [{
    selector: 'root',
    hiddenHead: true,
    children: connect => connect.value.tracks,
  }, {
    selector: createTypeSelector(['track']),
    label: connect => connect.value.name,
    open: connect => connect.value.openInTimeline,
    onClick: handleSelectClick,
    onToggleOpen: handleToggleOpen,
    children: connect => connect.value.params,
    buttons: connect => [
      {
        icon: 'cube',
        style: {opacity: connect.value.show3d ? 1 : 0.4},
        onClick: handleToggle3d
      }
    ],
    highlighted: connect => {
      const track = getParentTrack(connect)
      const timeline = getParentTimeline(connect)
      return timeline.currentTrackId === track.id
    },
  }, {
    selector: createTypeSelector(['param']),
    label: connect => connect.value.name,
    open: connect => connect.value.openInTimeline,
    onClick: handleSelectClick,
    onToggleOpen: handleToggleOpen,
    children: connect => connect.value.params || null
  }, {
    selector: createTypeSelector(['track', 'param']),
    buttons: connect => [
      {
        icon: 'cog',
        onClick: () => BETON.getRock('item-settings-dialog').show()
      }
    ],
    contextMenu: {
      items: [
        {
          label: 'settings',
          onClick: connect => {
            handleSelectClick(connect)
            BETON.getRock('item-settings-dialog').show()
          }
        }
      ]
    }
  },
  createParamSettings
]

function handleToggle3d(connect) {
  const {actions} = BETON.getRock('project-manager')
  const {showThreeDimensionalParams, id} = connect.value
  actions.setShowThreeDimensionalParamsOfTrack({
    trackId: id,
    showThreeDimensionalParams: !showThreeDimensionalParams
  })
}

function handleToggleOpen(connect) {
  const {actions} = BETON.getRock('project-manager')
  const {type, id} = connect.value
  if (type === 'param') {
    actions.toggleOpenInTimelnieOfParam({paramId: id})
  }
  else if (type === 'track') {
    actions.toggleOpenInTimelnieOfTrack({trackId: id})
  }
}

function handleSelectClick(connect) {
  const {actions} = BETON.getRock('project-manager')
  const {id: currentTrackId} = getParentTrack(connect)
  const {id: timelineId} = getParentTimeline(connect)

  actions.setLastSelectedItemId({itemId: connect.value.id})
  actions.setCurrentTrackIdOfTimeline({timelineId, currentTrackId})
}
