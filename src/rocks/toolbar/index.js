import {createArray} from 'afflatus'

BETON.define({
  id: 'toolbar',
  dependencies: [],
  init: () => {
    const state = createArray().get()

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
