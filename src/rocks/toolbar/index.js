import {fastArray} from 'mobservable'

BETON.define({
  id: 'toolbar',
  dependencies: [],
  init: () => {
    const state = fastArray()

    return {
      state,
      actions: {
        addItem(item) {
          state.push(item)
        }
      }
    }
  }
})
