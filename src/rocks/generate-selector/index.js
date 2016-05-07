import generateReactSelector from './generateReactSelector'
import generateQuerySelector from './generateQuerySelector'
import ReactDOM from 'react-dom'

BETON.define({
  id: 'generate-selector',
  dependencies: ['project-manager'],
  init: ({projectManager}) => {
    return ({node, type='css'}) => {
      const previews = projectManager.state.currentTimeline
        && projectManager.state.currentTimeline.previews

      if (!previews) {
        return ''
      }

      if (type === 'react') {
        // const {selectors} = projectManager
        // const projectId = selectors.getCurrentProjectId()
        // const previewComponents =
        // selectors.getPreviewComponentsOfProject({projectId})
        // const rootComponent = previewComponents.find(component => {
        //   const testRootNode = ReactDOM.findDOMNode(component)
        //   return testRootNode.contains(node)
        // })
        // if (rootComponent) {
        //   return generateReactSelector(node, rootComponent)
        // }
        // else {
        //   return false
        // }
      }
      else if (type === 'css') {
        for (let i = 0; i < previews.length; ++i) {
          const selector = generateQuerySelector(node, previews[i].rootTarget)
          if (selector) {
            return selector
          }
        }
      }
    }
  }
})
