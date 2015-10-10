import {
  ADD_COMPONENT_TO_INSPECTED_COMPONENTS
} from './actions'

const initialState = {
  inspectedComponents: []
}

export default function (componentInspector = initialState, action) {
  switch (action.type) {
    case ADD_COMPONENT_TO_INSPECTED_COMPONENTS: {
      return {
        ...componentInspector,
        inspectedComponents: [
          ...componentInspector.inspectedComponents,
          action.component
        ]
      }
    }
    default:
      return componentInspector
  }
}
