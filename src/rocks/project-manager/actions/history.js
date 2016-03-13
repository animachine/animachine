/* @flow */

import state, {HistoryReg, HistoryFlag} from '../state'
import {transaction} from 'afflatus'

export function startFlag() {
  const flag = new HistoryFlag()
  historyPush(flag)
  return () => historyPush(flag.pair)
}

export function wrap(fn) {
  return (...args) => {
    const endFlag = startFlag()
    transaction(() => fn(...args))
    endFlag()
  }
}

export function historyPush(item) {
  const {stack, position} = state.history
  stack.splice(position + 1)
  stack.push(item)
}

export function historySave(redo: Function, undo: Function) {
  historyPush(new HistoryReg(redo, undo))
  redo()
}

export function undo() {
  const {history} = state
  if (history.position < 0) {
    return
  }
  function stepBack() {
    item = history.stack[history.position--]
    if (reg.undo) {
      reg.undo()
    }
    return item
  }

  transaction(() => {
    const item = stepBack()
    if (item instanceof HistoryFlag) {
      const pairIndex = histoy.stack.indexOf(item.pair)
      if (pairIndex <= history.position && pairIndex !== -1) {
        while (history.position >= pairIndex) {
          stepBack()
        }
      }
    }
  })
}
