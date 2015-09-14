export const ADD_COMPONENT_TO_INSPECTED_COMPONENTS = 'ADD_COMPONENT_TO_INSPECTED_COMPONENTS'
export function registerComponent({component}) {
  const store = BETON.getRock('store')

  store.dispatch({
    type: ADD_COMPONENT_TO_INSPECTED_COMPONENTS,
    component,
  })
}
