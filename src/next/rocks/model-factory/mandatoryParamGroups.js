const mandatoryGroups = {
  padding: ['paddingTop', 'paddingRight', 'paddingBottom', 'paddingLeft'],
  margin: ['marginTop', 'marginRight', 'marginBottom', 'marginLeft'],
  borderWidth: ['borderTopWidth', 'borderRightWidth', 'borderBottomWidth', 'borderLeftWidth'],
  borderRadius: ['borderTopLeftRadius', 'borderTopRightRadius', 'borderBottomLeftRadius', 'borderBottomRightRadius'],
  borderColor: ['borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor'],
  borderStyle: ['borderTopStyle', 'borderRightStyle', 'borderBottomStyle', 'borderLeftStyle'],
  backgroundPosition: ['backgroundPositionX', 'backgroundPositionY'],
  textShadow: ['textShadowX', 'textShadowY', 'textShadowBlur'],
  translate: ['x', 'y', 'z'],
  scale: ['scaleX', 'scaleY', 'scaleZ'],
  rotation: ['rotationX', 'rotationY', 'rotationZ'],
  skeew: ['skeewX', 'skeewY'],
  perspectiveOrigin: ['perspectiveOriginX', 'perspectiveOriginY', 'perspectiveOriginZ'],
  transformOrigin: ['transformOriginX', 'transformOriginY'],
  boxShadow: ['boxShadowX', 'boxShadowY', 'boxShadowBlur'],
}

export function getParent(childName) {
  const groupNames = Object.keys(mandatoryGroups)
  for (let i = 0; i < groupNames.length; ++i) {
    const groupName = groupNames[i]
    if (mandatoryGroups[groupName].indexOf(childName) !== -1) {
      return groupName
    }
  }
}

export function getChildren(parentName) {
  return mandatoryGroups[parentName].slice()
}
