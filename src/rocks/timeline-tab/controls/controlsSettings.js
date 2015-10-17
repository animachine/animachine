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
      // {
      //   icon: 'cube',
      //   style: {opacity: connect.value.show3d ? 1 : 0.4},
      //   onClick: handleToggle3d
      // },
      {
        icon: 'plus',
        tooltip: 'add a new param to this track',
        onClick: connect => {
          BETON.require('project-manager').actions.addParamToTrack({
            trackId: connect.value.id,
          })
          showItemSettingsDialog()
        }
      }
    ],
    highlighted: connect => {
      const track = getParentTrack(connect)
      const timeline = getParentTimeline(connect)
      return timeline.currentTrackId === track.id
    },
    contextMenu: {
      items: [
        {
          label: 'new track',
          icon: 'plus',
          onClick: connect => {
            BETON.require('project-manager').actions.addTrackToTimeline({
              timelineId: connect.parent.id,
            })
            showItemSettingsDialog()
          }
        }, {
          label: 'new param',
          icon: 'add',
          onClick: connect => {
            BETON.require('project-manager').actions.addParamToTrack({
              trackId: connect.value.id,
            })
            showItemSettingsDialog()
          }
        }
      ]
    }
  }, {
    selector: createTypeSelector(['param']),
    label: connect => connect.value.name,
    open: connect => connect.value.openInTimeline,
    onClick: handleSelectClick,
    onToggleOpen: handleToggleOpen,
    children: null,
  }, {
    selector: createTypeSelector(['track', 'param']),
    // buttons: connect => [
    //   {
    //     icon: 'cog',
    //     onClick: () => showItemSettingsDialog()
    //   }
    // ],
    contextMenu: {
      items: [
        {
          label: 'settings',
          icon: 'cog',
          onClick: connect => {
            handleSelectClick(connect)
            showItemSettingsDialog()
          }
        }
      ]
    }
  },
  createParamSettings
]

function showItemSettingsDialog() {
  BETON.require('item-settings-dialog').show()
}

function handleToggle3d(connect) {
  const {actions} = BETON.require('project-manager')
  const {showThreeDimensionalParams, id} = connect.value
  actions.setShowThreeDimensionalParamsOfTrack({
    trackId: id,
    showThreeDimensionalParams: !showThreeDimensionalParams
  })
}

function handleToggleOpen(connect) {
  const {actions} = BETON.require('project-manager')
  const {type, id} = connect.value
  if (type === 'param') {
    actions.toggleOpenInTimelnieOfParam({paramId: id})
  }
  else if (type === 'track') {
    actions.toggleOpenInTimelnieOfTrack({trackId: id})
  }
}

function handleSelectClick(connect) {
  const {actions} = BETON.require('project-manager')
  const {id: currentTrackId} = getParentTrack(connect)
  const {id: timelineId} = getParentTimeline(connect)

  actions.setLastSelectedItemId({itemId: connect.value.id})
  actions.setCurrentTrackIdOfTimeline({timelineId, currentTrackId})
}
