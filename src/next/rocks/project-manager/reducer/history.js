import {getItemById} from '../selectors'
import {setItem} from './utils'

export default (projectManager, action, next) => {
  if (action.historyInfo) {
    const {historyInfo, ...redo} = action
    const timeline = getItemById({id: historyInfo.timelineId})
    const {historyStack, historyPosition} = timeline

    projectManager = setItem({projectManager, item: {
      ...timeline,
      historyPosition: historyPosition + 1,
      historyStack: [
        ...historyStack.slice(timeline.historyPosition),
        {historyInfo.undo, redo}
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
  }
}
