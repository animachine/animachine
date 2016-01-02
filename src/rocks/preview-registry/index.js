import {map, observeble, fastArray, autorun} from 'mobservable'


BETON.define({
  id: 'preview-registry',
  dependencies: [],
  init: () => {
    const state = {
      runningTimelinesMap: map()//[timelines:[rootTargets:gsapAnimations]]
    }

    function registerRunningTimeline(timeline, rootTarget, gsapAnimation) {
      if (!state.runningTimelinesMap.has(timeline)) {
        state.runningTimelinesMap.set(timeline, map())
      }
      state.runningTimelinesMap.get(timeline).set(rootTarget, gsapAnimation)
    }

    global.__animachineRegisterRunningTimeline = fastArray(
      global.__animachineRegisterRunningTimeline
    )
    let pos = 0
    autorun(() => {
      while(pos < global.__animachineRegisterRunningTimeline.length) {
        const args = global.__animachineRegisterRunningTimeline[pos]
        registerRunningTimeline(...args)
        ++pos
      }
    })

    return {
      state,
      actions: {
        registerRunningTimeline
      },
      getters: {
        getPreviewsOfTimelnie(timeline) {
          const result = []
          (state.runningTimelinesMap.get(timelne) || map()).forEach(
            (rootTarget, gsapAnimation) => result.push({
              rootTarget,
              gsapAnimation
            })
          )
          return result
        }
      }
    }
  }
})
