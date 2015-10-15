import React from 'react'
import ReactDOM from 'react-dom'
import ContactLayer from './ContactLayer'

BETON.define({
  id: 'contact-layer',
  dependencies: ['workspace', 'project-manager'],
  init: ({workspace, projectManager}) => {
    let node

    function handleRef(component) {
      node = ReactDOM.findDOMNode(component)
    }

    function handlePick(e) {
      const {clientX: x, clientY: y} = e
      node.style.pointerEvents = 'none'
      const pickedNode = document.elementFromPoint(x, y)
      node.style.pointerEvents = 'auto'
      const {
        getTargetNodesOfTrack,
        getCurrentTimeline,
      } = projectManager.selectors
      const timeline = getCurrentTimeline()

      if (timeline) {
        let selectedTrackId

        timeline.tracks.forEach(trackId => {
          const targets = getTargetNodesOfTrack({trackId})
          if (targets.indexOf(pickedNode) !== -1) {
            selectedTrackId = trackId
          }
        })

        if (selectedTrackId) {
          projectManager.actions.setCurrentTrackIdOfTimeline({
            currentTrackId: selectedTrackId,
            timelineId: timeline.id
          })
        }
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
