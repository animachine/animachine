import React from 'react'

BETON.define({
  id: 'select-track-on-click-preview-component',
  dependencies: ['workspace', 'project-manager'],
  init: ({workspace, projectManager}) => {
    let node

    function handleRef(component) {
      node = React.findDOMNode(component)
    }

    function handlePick(e) {
      const {clientX: x, clientY: y} = e
      node.pointerEvents = 'none'
      const pickedNode = document.elementFromPoint(x, y)
      node.pointerEvents = 'auto'
      cosnt {setCurrent}

      if (isPickableDomElem(pickedNode)) {

      }
      else {
      }
    }

    workspace.setOverlay('contact-layer', {
      level: 1000,
      getElement: () => <ContactLayer
        ref = {handleRef}
        onPick = {handlePick}/>
    })
  }
})

// am.isPickableDomElem = function (deTest) {
//   //TODO use .compareDocumentPosition()
//   if (!deTest) {
//       return false
//   }
//
//   return step(deTest)
//
//   function step(de) {
//     if (!de) {
//       return false
//     }
//     else if (de.nodeType === 9) {
//       return false
//     }
//     else if (de.hasAttribute('data-am-pick')) {
//       return true
//     }
//     else if (de.hasAttribute('data-am-nopick')) {
//       return false
//     }
//     else if (de === document.body) {
//       return de !== deTest
//     }
//     else if (de) {
//       return step(de.parentNode)
//     }
//   }
// }
