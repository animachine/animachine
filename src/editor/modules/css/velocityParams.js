module.exports = [
//__layout__________________
'top', // - top
'right', // - right
'bottom', // - bottom
'left', // - left
'width', // - width
'height', // - height
'minWidth', // - minWidth (won't show)
'minHeight', // - minHeight (won't show)
'maxWidth', // - maxWidth (won't show)
'maxHeight', // - maxHeight (won't show)
'paddingTop', // - paddingTop
'paddingRight', // - paddingRight
'paddingBottom', // - paddingBottom
'paddingLeft', // - paddingLeft
'marginTop', // - marginTop
'marginRight', // - marginRight
'marginBottom', // - marginBottom
'marginLeft', // - marginLeft

//___border______________
    //>borderWidth - borderTopWidth (no %)
'borderTopWidth', // - borderTopWidth (no %)
'borderRightWidth', // - borderRightWidth (no %)
'borderBottomWidth', // - borderBottomWidth (no %)
'borderLeftWidth', // - borderLeftWidth (no %)
// 'borderColor', // - borderColor (hex string)
'borderColorRed', // - borderColorRed (unitless or %)
'borderColorGreen', // - borderColorGreen (unitless or %)
'borderColorBlue', // - borderColorBlue (unitless or %)
'borderColorAlpha', // - borderColorAlpha (unitless)
// - (plus individual border colors)
    //>borderRadius - borderRadius (IE9+)
'borderTopLeftRadius', // - borderRadius (IE9+)
'borderTopRightRadius', // - borderRadius (IE9+)
'borderBottomLeftRadius', // - borderRadius (IE9+)
'borderBottomRightRadius', // - borderRadius (IE9+)
'outlineWidth', // - outlineWidth (no %)

//___font_______ - ------------
'fontSize', // - fontSize
'lineHeight', // - lineHeight
'letterSpacing', // - letterSpacing (no %)
'wordSpacing', // - wordSpacing (no %)

'undefined', // - ------------
'opacity', // - opacity
'color', // - color (hex string)
// colorRed - colorRed (unitless or %)
// colorGreen - colorGreen (unitless or %)
// colorBlue - colorBlue (unitless or %)
// colorAlpha - colorAlpha (unitless)
'backgroundColor', // - backgroundColor (hex string)
// 'backgroundColorRed', // - backgroundColorRed (unitless or %)
// 'backgroundColorGreen', // - backgroundColorGreen (unitless or %)
// 'backgroundColorBlue', // - backgroundColorBlue (unitless or %)
// 'backgroundColorAlpha', // - backgroundColorAlpha (unitless or %)
'outlineColor', // - outlineColor (hex string)
// 'outlineColorRed', // - outlineColorRed (unitless or %)
// 'outlineColorGreen', // - outlineColorGreen (unitless or %)
// 'outlineColorBlue', // - outlineColorBlue (unitless or %)
// 'outlineColorAlpha', // - outlineColorAlpha (unitless)

'backgroundPositionX', // - backgroundPositionX (won't show) (IE9+)
'backgroundPositionY', // - backgroundPositionY (won't show) (IE9+)
'textShadowX', // - textShadowX (no %) (IE9+)
'textShadowY', // - textShadowY (no %) (IE9+)
'textShadowBlur', // - textShadowBlur (no %) (IE9+)
'boxShadowX', // - boxShadowX (no %)
'boxShadowY', // - boxShadowY (no %)
'boxShadowBlur', // - boxShadowBlur (no %)
'boxShadowSpread', // - boxShadowSpread (no %)
//__transform
'translateX', // - translateX
'translateY', // - translateY
'translateZ', //     - translateZ (IE10+)
// 'scale', // - scale (unitless or %)
'scaleX', // - scaleX (unitless or %)
'scaleY', // - scaleY (unitless or %)
'scaleZ', // - scaleZ (unitless or %) (won't show) (IE10+)
'rotateX', // - rotateX (unitless or deg) (IE10+)
'rotateY', // - rotateY (unitless or deg) (IE10+)
'rotateZ', // - rotateZ (unitless or deg)
'skewX', // - skewX (unitless or deg)
'skewY', // - skewY (unitless or deg)
'transformPerspective', // - transformPerspective (no %) (won't show) (IE10+)
// 'perspective', // - perspective (no %) (won't show) (IE10+)
'perspectiveOriginX', // - perspectiveOriginX (won't show) (IE10+)
'perspectiveOriginY', // - perspectiveOriginY (won't show) (IE10+)
'transformOriginX', // - transformOriginX (won't show) (IE10+)
'transformOriginY', // - transformOriginY (won't show) (IE10+)
'transformOriginZ', // - transformOriginZ (won't show) (IE10+)
//clipping // - ------------
'clipTop', // - clipTop (needs position:abs)
'clipRight', // - clipRight (needs position:abs)
'clipBottom', // - clipBottom (needs position:abs)
'clipLeft', // - clipLeft (needs position:abs)
'undefined', // - ------------
//effects
'blur' // - blur (px/em/rem) (no IE, no FF, Android 4.4+) 
];