const store = BETON.getRock('store')

export const ADD_COMPONENT_TO_INSPECTED_COMPONENTS = 'ADD_COMPONENT_TO_INSPECTED_COMPONENTS'
export function registerComponent({component}) {
  store.dispatch({
    type: ADD_COMPONENT_TO_INSPECTED_COMPONENTS,
    component,
  })
}
