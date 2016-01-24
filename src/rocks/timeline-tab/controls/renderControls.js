import React from 'react'
import QuickInterface from 'quick-interface'
import createValueInputDescriber from './createValueInputDescriber'
import KeyStepper from './KeyStepper'

const createNameInputDescriber = paramOrTrack => ({
  value: paramOrTrack.name,
  mod: {kind: 'stamp'},
  onChange: (value) => {
    const {actions} = BETON.require('project-manager')
    actions.set(paramOrTrack, 'name', value)
  }
})

function showItemSettingsDialog() {
  BETON.require('item-settings-dialog').show()
}

function handleSelectClick(paramOrTrack) {
  const {actions} = BETON.require('project-manager')
  const currentTrackId = paramOrTrack.params
    ? paramOrTrack.id
    : paramOrTrack.parentTrack.id

  actions.set(paramOrTrack.parentTimeline, 'currentTrackId', currentTrackId)
}

function handleToggleOpen(paramOrTrack) {
  const {actions} = BETON.require('project-manager')
  actions.set(paramOrTrack, 'openInTimeline', !paramOrTrack.openInTimeline)
}


function createTrackSettings(track) {
  return {
    open: track.openInTimeline,
    onToggleOpen: handleToggleOpen.bind(null, track),
    describeRow: () => ({
      onClick: handleSelectClick.bind(null, track),
      items: [
        {type: 'input', describe: () => createNameInputDescriber(track)},
        {
          type: 'button',
          describe: () => ({
            icon: 'plus',
            tooltip: 'add a new param to this track',
            onClick: () => {
              const param = new Param()
              BETON.require('project-manager').actions.add(track, 'params', param)
              showItemSettingsDialog()
            }
          }),
        }
      ],
      highlighted: track.parentTimeline.currentTrackId === track.id,
      contextMenu: {
        items: [
          {
            label: 'new track',
            icon: 'plus',
            onClick: () => {
              const track = new Track()
              BETON.require('project-manager').actions.add(
                track.parentTimeline,
                'tracks',
                track
              )
              showItemSettingsDialog()
            }
          }, {
            label: 'new param',
            icon: 'add',
            onClick: () => {
              const param = new Param()
              BETON.require('project-manager').actions.add(track, 'params', param)
              showItemSettingsDialog()
            }
          }, {
            items: [
              {
                label: 'settings',
                icon: 'cog',
                onClick: () => {
                  handleSelectClick()
                  showItemSettingsDialog()
                }
              }
            ]
          }
        ]
      },
    }),
    describeChildren: () => track.params.map(param => (
      <QuickInterface
        key = {param.id}
        describe = {() => createParamSettings(param)}/>
    ))
  }
}

function createParamSettings(param) {
  return {
    open: param.openInTimeline,
    onToggleOpen: handleToggleOpen.bind(null, param),
    describeRow: () => ({
      onClick: handleSelectClick.bind(null, param),
      items: [
        {type: 'input', describe: () => createNameInputDescriber(param)},
        {type: 'input', describe: () => createValueInputDescriber(param)},
        {
          type: 'button',
          describe: () => ({
            icon: 'plus',
            tooltip: 'add a new param to this track',
            onClick: () => {
              const param = new Param()
              BETON.require('project-manager').actions.add(track, 'params', param)
              showItemSettingsDialog()
            }
          }),
        }, {
          type: 'button',
          describe: () => ({
            getElement: () => <KeyStepper keyHolder={param}/>
          })
        }
      ],
      contextMenu: [{
        items: [
          {
            label: 'settings',
            icon: 'cog',
            onClick: () => {
              handleSelectClick(param)
              showItemSettingsDialog()
            }
          }
        ]
      }],
    })
  }
}


const renderTracks = tracks => {
  return tracks
    .map(track => (
      <QuickInterface {...{
        key: track.id,
        describe: () => createTrackSettings(track)
      }}/>
    ))
}

export default tracks => (
  <QuickInterface
    describe={() => ({
      hiddenHead: true,
      describeChildren: () => renderTracks(tracks)
    })}/>
)
