const store = BETON.getRock('store')

export default function ({itemId}) {
  return store.getState().project.items.find(item => item.itemId = itemId)
}
