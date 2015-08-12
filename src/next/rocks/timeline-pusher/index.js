BETON.getRock('project-manager', projectManager => {
  var lastTime = performance.now()

  function findCurrentTimeilne() {
    const currentProjectNode = projectManager.getCurrentProjectNode()
    if (!currentProjectNode) {
      return
    }
    return currentProjectNode.model.getCurrentTimeline()
  }

  function push() {
    const time = performance.now()
    const timeline = findCurrentTimeilne()
    if (timeline && timeline.playing) {
      let nextTime = timeline.currentTime + time - lastTime
      nextTime %= timeline.length
      timeline.currentTime = nextTime
    }
    lastTime = time
    window.requestAnimationFrame(push)
  }
  window.requestAnimationFrame(push)
})
