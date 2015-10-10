export default function createMountNode() {
  var de = document.createElement('div')
  de.style.position = 'fixed'
  de.style.left = '0px'
  de.style.top = '0px'
  de.style.width = '100%'
  de.style.height = '100%'
  de.style.pointerEvents = 'none'

  var zIndex = getMaxZIndex()
  if (zIndex) {
      de.style.zIndex = zIndex + 1000
  }

  document.body.appendChild(de)

  return de
}

function getMaxZIndex() {
  var zIndex = 0, els, x, xLen, el, val

  els = document.querySelectorAll('*')
  for (x = 0, xLen = els.length; x < xLen; x += 1) {
    el = els[x]
    if (window.getComputedStyle(el).getPropertyValue('position') !== 'static') {
      val = window.getComputedStyle(el).getPropertyValue('z-index')
      if (val) {
        val = +val
        if (val > zIndex) {
          zIndex = val
        }
      }
    }
  }
  return zIndex
}
