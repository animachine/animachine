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

      if (!timeline) {
        return
      }

      function isInPreview(node) {
        return timeline.previews.some(({rootTarget}) => {
          return rootTarget.contains(node)
        })
      }

      function getOwnerTrack(node) {
        return timeline.tracks.find(track => {
          return track.targets.indexOf(pickedDOMNode) !== -1
        })
      }

      node.style.pointerEvents = 'none'
      const pickedDOMNode = document.elementFromPoint(x, y)
      node.style.pointerEvents = 'auto'

      setPickedDOMNode(null)
      timeline.currentTrack = null

      if (!isInPreview(pickedDOMNode)) {
        return
      }

      let selectedTrack

      if (e.metaKey || e.ctrlKey) { //select the first picked node
        selectedTrack = getOwnerTrack(pickedDOMNode)
      }
      else if (false) {
        //select the first track under straight the mouse
        node.style.pointerEvents = 'none'
        const testeds = []
        let next = pickedDOMNode
        while (!selectedTrack && isInPreview(next)) {
          selectedTrack = getOwnerTrack(next)
          if (!selectedTrack) {
            testeds.push({node: next, pointerEvents: next.style.pointerEvents})
            next.style.pointerEvents = 'none'
            next = document.elementFromPoint(x, y)
          }
        }
        testeds.forEach(({node, pointerEvents}) => {
          node.style.pointerEvents = pointerEvents
        })
        node.style.pointerEvents = 'auto'
      }
      else {
        const containers = []
        timeline.tracks.forEach(track => {
          track.targets.forEach((target) => {
            if (target.contains(pickedDOMNode)) {
              containers.push({target, track})
            }
          })
        })

        const closest = containers
          .sort((a, b) => a.target.contains(b.target) ? 1 : -1)
          .shift()

        if (closest) {
          selectedTrack = closest.track
        }
      }

      if (selectedTrack) {
        selectedTrack.parent('Timeline').currentTrack = selectedTrack
        // setPickedDOMNode(null)
      }
      else {
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
