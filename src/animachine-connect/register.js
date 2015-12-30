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

export function registerRoot(root) {
  exec('registerRoot', root)
}

export function registerProject(root, project) {
  exec('registerProject', root, project)
}

export function registerRunningTimelie(root, project, ) {
  exec('registerRunningTimeline', root, project)
}
