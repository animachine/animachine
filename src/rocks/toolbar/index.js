import {createArray} from 'afflatus'

BETON.define({
  id: 'toolbar',
  dependencies: [],
  init: () => {
    const state = createArray().get()
    state.push({
      icon: 'bullhorn',
      label: 'feedback',
      order: 20,
      onClick: () => {
        window.open('https://github.com/animachine/animachine/issues', '_blank')
      },
    })

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
