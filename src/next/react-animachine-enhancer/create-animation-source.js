import createEaser from './createEaser'

const sortKeys = (a, b) => a.time - b.time

export default function createAnimationSource({projectSource, timeline}) {
  function animationSource(connect) {
    const tlRoot = new TimelineMax()

    function addParams(params, targets) {
      params.forEach(param => {
        const tlParam = new TimelineMax()
        tlRoot.add(tlParam, 0)
        let headTime = 0

        if (param.keys && param.keys.length) {
          param.keys.sort(sortKeys).forEach(key => {
            const duration = key.time - headTime

            tlParam.to(
              targets,
              duration / 1000,
              {
                [param.name]: key.value,
                ease: createEaser(key.ease)
              },
              headTime / 1000
            )
            headTime = key.time
          })
        }

        if (param.params) {
          addParams(param.params, targets)
        }
      })
    }

    timeline.tracks.forEach(track => {
      const targets = track.selectors.map(selector => {
        return connect.getTargetByKeys(selector)
      })

      addParams(track.params, targets)
    })

    return tlRoot
  }

  animationSource._amProjectSource = projectSource
  animationSource._amTimelineName = timeline.name

  return animationSource
}
