import React from 'react'
import ReactDOM from 'react-dom'
import ContactLayer from './ContactLayer'

BETON.define({
  id: 'contact-layer',
  dependencies: ['workspace', 'project-manager', 'dom-picker'],
  init: ({workspace, projectManager, domPicker}) => {
    let node

    function handleRef(component) {
      node = ReactDOM.findDOMNode(component)
    }

    function handlePick(e) {
      const domPicker = BETON.require('dom-picker')
      const {setPickedDOMNode} = domPicker.actions
      const {clientX: x, clientY: y} = e
      const timeline = projectManager.state.currentTimeline


      node.style.pointerEvents = 'none'
      const pickedDOMNode = document.elementFromPoint(x, y)
      node.style.pointerEvents = 'auto'

      let isFindATrackBelongsToThePickedNode = false
      if (timeline) {
        const selectedTrack = timeline.tracks.find(track => {
          return track.targets.indexOf(pickedDOMNode) !== -1
        })

        if (selectedTrack) {
          isFindATrackBelongsToThePickedNode = true
          projectManager.actions.set(
            selectedTrack.parent('Timeline'),
            'currentTrack',
            selectedTrack,
          )
        }
      }

      const isPickedNodeIsOrChildOfAPreviewNode =
        timeline.previews.some(({rootTarget}) => {
          return rootTarget.contains(pickedDOMNode)
        })

      if (
        !isFindATrackBelongsToThePickedNode
        && isPickedNodeIsOrChildOfAPreviewNode
      ) {
        setPickedDOMNode(pickedDOMNode)
      }
    }

    workspace.setTabContent('hole', (
      <ContactLayer
        ref = {handleRef}
        onPick = {handlePick}
      />
    ))
  }
})

function isPickableDomElem(deTest) {
  //TODO use .compareDocumentPosition()
  if (!deTest) {
      return false
  }

  return step(deTest)

  function step(de) {
    if (!de) {
      return false
    }
    else if (de.nodeType === 9) {
      return false
    }
    else if (de.hasAttribute('data-am-pick')) {
      return true
    }
    else if (de.hasAttribute('data-am-nopick')) {
      return false
    }
    else if (de === document.body) {
      return de !== deTest
    }
    else if (de) {
      return step(de.parentNode)
    }
  }
}
