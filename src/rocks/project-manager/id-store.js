/* @flow */

import randomstring from 'randomstring'

const ids = new Set()

export function registerId(id: string) {
  ids.set(id)
}

export function createId(id: string) {
  let newId: string
  do {
    newId = randomstring(4)
  }
  while(ids.has(newId))

  return newId
}
