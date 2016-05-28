import React from 'react'
import QuickInterface from 'quick-interface'
import createValueInputDescriber from './createValueInputDescriber'
import KeyStepper from './KeyStepper'
import {createNameSettings} from '../utils'

function showSelectorEditorDialog(track) {
  BETON.require('selector-editor-dialog').show(track)
}

function handleSelectClick(paramOrTrack) {
  const {actions} = BETON.require('project-manager')
  const currentTrack = paramOrTrack.type === 'Track'
    ? paramOrTrack
    : paramOrTrack.parent('Track')

  actions.set(paramOrTrack.parent('Timeline'), 'currentTrack', currentTrack)
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
        createNameSettings(track),
        {
          type: 'button',
          describe: () => ({
            icon: 'plus',
            tooltip: 'add a new param to this track',
            onClick: () => {
              track.addParam()
            }
          }),
        }
      ],
      highlighted: track.parent('Timeline').currentTrack === track,
      contextMenu: {
        items: [
          {
            label: 'new track',
            icon: 'plus',
            onClick: () => {
              const track = track.parent('Timeline').addTrack({})
              track.isRenaming = true
            }
          }, {
            label: 'new param',
            icon: 'add',
            onClick: () => {
              const param = track.addParam({})
              param.isRenaming = true
            }
          }, {
            label: 'edit selectors',
            icon: 'add',
            onClick: () => {
              showSelectorEditorDialog(track)
            }
          }, {
            label: 'rename',
            icon: 'cog',
            onClick: () => {
              track.isRenaming = true
            }
          }
        ]
      },
    }),
    describeChildren: () => track.params.map(param => (
      <QuickInterface
        key = {param.uid}
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
        createNameSettings(param),
        {type: 'input', describe: () => createValueInputDescriber(param)},
        {
          type: 'button',
          describe: () => ({
            icon: 'plus',
            tooltip: 'add a new param to this track',
            onClick: () => {
              track.addParam()
            }
          }),
        }, {
          type: 'button',
          describe: () => ({
            getElement: () => <KeyStepper keyHolder={param}/>
          })
        }
      ],
      contextMenu: {
        items: [
          {
            label: 'settings',
            icon: 'cog',
            onClick: () => {
              handleSelectClick(param)
            }
          }, {
            label: 'rename',
            icon: 'cog',
            onClick: () => {
              param.isRenaming = true
            }
          }
        ]
      },
    })
  }
}


const renderTracks = tracks => {
  return tracks
    .map(track => (
      <QuickInterface {...{
        key: track.uid,
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
