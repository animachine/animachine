import createBezierEasing from 'bezier-easing'

export default function (ease) {
  if (!ease) {
    return Power0.easeNone
  }

  const bezierEasing = createBezierEasing(...ease.bezierPoints)
  var easer = new GreenSockGlobals.Ease(bezierEasing)

  if (ease.roughEase) {
    easer = new GreenSockGlobals.RoughEase({
      template: easer,
      strength: ease.roughStrength,
      points: ease.roughPoints,
      clamp: ease.roughClamp,
      randomise: ease.roughRandomise,
      taper: ease.roughTaper,
    })
  }

  return easer
}
