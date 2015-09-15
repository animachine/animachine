import {getItemById} from '../selectors'
import {setItem} from './utils'

export default (projectManager, action, next) => {
  // return next(projectManager, action)

  if (action.historyInfo) {
    const {historyInfo, ...redo} = action
    const timeline = getItemById({id: historyInfo.timelineId})
    const {historyStack, historyPosition} = timeline

    projectManager = setItem({projectManager, item: {
      ...timeline,
      historyPosition: historyPosition + 1,
      historyStack: [
        ...historyStack.slice(timeline.historyPosition),
        {
          undo: historyInfo.undo,
          redo,
          recordTime: performance.now()
        }
      ]
    }})
  }

  const {type} = action
  switch (type) {
    case action.UNDO: {
      const {timelineId} = action
      const timelne = getItemById({id: timelineId})
      const {historyStack, historyPosition} = timeline

      if (historyPosition < 0) {
        return projectManager
      }

      const historyReg = historyStack[historyPosition]
      projectManager = setItem({projectManager, item: {
        ...timeline,
        historyPosition: historyPosition - 1
      }})
      return next(projectManager, historyReg.undo)
    }
    case action.REDO: {
      const {timelineId} = action
      const timelne = getItemById({id: timelineId})
      const {historyStack, historyPosition} = timeline

      if (historyPosition >= historyStack.length - 1) {
        return projectManager
      }

      const nextHistoryPosition = historyPosition + 1

      const historyReg = historyStack[nextHistoryPosition]
      projectManager = setItem({projectManager, item: {
        ...timeline,
        historyPosition: nextHistoryPosition
      }})
      return next(projectManager, historyReg.undo)
    }
    default:
      return next(projectManager, action)
  }
}
