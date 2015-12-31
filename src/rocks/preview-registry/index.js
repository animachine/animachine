import {map, observeble} from 'mobservable'

class Store() {
  runningTimelinesMap: map()
}

class TimelineReg {
  @observeble previews: [],
}

class PreviewReg {
  @observeble gsapAnimation: null,
  @observeble rootTarget: null,

  constructor(gsapAnimation, rootTarget) {
    this.gsapAnimation = gsapAnimation
    this.rootTarget = rootTarget
  }
}

BETON.define({
  id: 'preview-registry',
  dependencies: [],
  init: () => {

    const store = new Store()

    function registerRunningTimelie(timeline, rootTarget, gsapAnimation) {
      let timelineReg
      if (store.runningTimelinesMap.has(timeline)) {
        timelineReg = store.runningTimelinesMap.get(timeline)
      }
      else {
        timelineReg = new TimelineReg()
        store.runningTimelinesMap.set(timeline, timelineReg)
      }


    }

    return {
      store
    }
  }
})
