
export const ADD_ITEM_TO_TOOLBAR = 'ADD_ITEM_TO_TOOLBAR'
export function addItemToToolbar({item}) {
  const store = BETON.require('store')

  store.dispatch({
    type: ADD_ITEM_TO_TOOLBAR,
    item,
  })
}
