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
        const rootComponent = previewComponents.find(component => {
          const testRootNode = ReactDOM.findDOMNode(component)
          return testRootNode.contains(node)
        })
        return generateReactSelector(node, rootComponent)
      }
      else if (type === 'dom') {
        return generateQuerySelector()
      }
    }
  }
})
