import generateReactSelector from './generateReactSelector'
import ReactDOM from 'react-dom'

BETON.define({
  id: 'generate-selector',
  dependencies: ['project-manager'],
  init: ({projectManager}) => {
    return ({node, type='react'}) => {
      const {selectors} = projectManager
      const projectId = selectors.getCurrentProjectId()
      const previewComponents =
        selectors.getPreviewComponentsOfProject({projectId})

      if (type === 'react') {
        const rootNode = previewComponents.map(component => {
            return ReactDOM.findDOMNode(component)
          })
          .find(testRootNode => testRootNode.contains(node))
        return generateReactSelector(node, rootNode)
      }
      else if (type === 'dom') {
        return generateQuerySelector()
      }
    }
  }
})
