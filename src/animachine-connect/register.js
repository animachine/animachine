function getWaitingList() {
  if (!global.__animachineRegisterWaitingList) {
    global.__animachineRegisterWaitingList = []
  }
  return global.__animachineRegisterWaitingList
}

function exec(command, ...args) {
  if (global.__animachineRegistry) {
    global.__animachineRegistry[command](...args)
  }
  else {
    getWaitingList().push({command, args})
  }
}

export function registerRunningTimelie(timeline, rootTarget, gsapTimeline) {
  exec('registerRunningTimeline', timeline, rootTarget, gsapTimeline)
}
