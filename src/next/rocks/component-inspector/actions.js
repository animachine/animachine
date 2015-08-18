export const ADD_COMPONENT_TO_INSPECTED_COMPONENTS = 'ADD_COMPONENT_TO_INSPECTED_COMPONENTS'
export function registerComponent({component}) {
  return {
    type: ADD_COMPONENT_TO_INSPECTED_COMPONENTS,
    component,
  }
}
