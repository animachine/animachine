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
      const {setPickedDOMNode} = domPicker.actions
      const {
        getTargetNodesOfTrack,
      } = projectManager.selectors
      const {clientX: x, clientY: y} = e
      const timeline = projectManager.state.selectedTimeline

      node.style.pointerEvents = 'none'
      const pickedDOMNode = document.elementFromPoint(x, y)
      node.style.pointerEvents = 'auto'

      let isFindATrackBelongsToThePickedNode = false
      if (timeline) {
        let selectedTrackId

        timeline.tracks.forEach(trackId => {
          const targets = getTargetNodesOfTrack({trackId})
          if (targets.indexOf(pickedDOMNode) !== -1) {
            selectedTrackId = trackId
          }
        })

        if (selectedTrackId) {
          isFindATrackBelongsToThePickedNode = true
          projectManager.actions.setCurrentTrackIdOfTimeline({
            currentTrackId: selectedTrackId,
            timelineId: timeline.id
          })
        }
      }

      if (!isFindATrackBelongsToThePickedNode) {
        setPickedDOMNode({pickedDOMNode})
      }
    }

    workspace.setTabContent('hole', <ContactLayer
      ref = {handleRef}
      onPick = {handlePick}/>)
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
