export default function (state = [], action) {
  switch (action.type) {
    INSPECT_COMPONENT:
      return [...state, action.component]
    default:
      return state
  }
}
