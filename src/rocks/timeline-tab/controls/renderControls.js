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
              const newParam = track.addParam()
              newParam.isRenaming = true
            }
          }),
        },
        {
          type: 'button',
          describe: () => ({
            getElement: () => <KeyStepper keyHolder={track}/>
          })
        }
      ],
      highlighted: track.parent('Timeline').currentTrack === track,
      contextMenu: {
        items: [
          {
            label: 'new track',
            icon: 'plus',
            onClick: () => {
              const newTrack = track.parent('Timeline').addTrack({})
              newTrack.isRenaming = true
            }
          }, {
            label: 'new param',
            icon: 'plus',
            onClick: () => {
              const newParam = track.addParam({})
              newParam.isRenaming = true
            }
          }, {
            label: 'edit selectors',
            icon: 'bullseye',
            onClick: () => {
              showSelectorEditorDialog(track)
            }
          }, {
            label: 'rename',
            icon: 'pencil',
            onClick: () => {
              track.isRenaming = true
            }
          }, {
            label: 'remove',
            icon: 'trash',
            onClick: () => {
              track.parent('Timeline').removeTrack(track)
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
            getElement: () => <KeyStepper keyHolder={param}/>
          })
        }
      ],
      contextMenu: {
        items: [
          {
            label: 'rename',
            icon: 'pencil',
            onClick: () => {
              param.isRenaming = true
            }
          },
          {
            label: 'remove',
            icon: 'trash',
            onClick: () => {
              param.parent('Track').removeParam(param)
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
