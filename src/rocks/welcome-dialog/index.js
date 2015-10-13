import React from 'react'
import DialogComponent from './DialogComponent'
import messages from './messages'
import localstorage from 'putainde-localstorage'

const storage = localstorage.create({namespace: 'welcome-dialog@animachine'})

BETON.define({
  id: 'welcome-dialog',
  dependencies: ['workspace'],
  init
})

function init({workspace}) {

  function showNext() {
    const seen = storage.get('seen') || {}
    const message = messages.find(msg => !seen[msg.id])

    if (!message) {
      return
    }

    workspace.dialogs.show({
      getElement({onClose}) {
        return <DialogComponent
          {...message}
          onClose = {() => {
            onClose()
            storage.set('seen', {...messages, [message.id]: true})
            showNext()
          }}/>
      }
    })
  }

  return {
    showNext,
  }
}
