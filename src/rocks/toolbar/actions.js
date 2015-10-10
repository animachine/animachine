const store = BETON.getRock('store')

export const ADD_ITEM_TO_TOOLBAR = 'ADD_ITEM_TO_TOOLBAR'
export function addItemToToolbar({item}) {
  store.dispatch({
    type: ADD_ITEM_TO_TOOLBAR,
    item,
  })
}
