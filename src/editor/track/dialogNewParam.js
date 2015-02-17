'use strict';

var Dialog = require('../utils/Dialog');
var StringInput = require('../utils/StringInput');
var shortcuts = require('../shortcuts');

var GSAPSpecProps = 'WebkitUserSelect,alpha,autoAlpha,autoRound,backfaceVisibility,backgroundPosition,backgroundSize,bezier,border,borderRadius,borderWidth,boxShadow,className,clearProps,clip,cssFloat,directionalRotation,float,force3D,margin,opacity,padding,parseTransform,perspective,perspectiveOrigin,physics2D,physicsProps,rotation,rotationX,rotationY,rotationZ,scale,scaleX,scaleY,scaleZ,shortRotation,shortRotationX,shortRotationY,shortRotationZ,skewX,skewY,strictUnits,styleFloat,textShadow,throwProps,transform,transformOrigin,transformPerspective,transformStyle,userSelect,x,y,z';
var AMCSSModuleProps = 'translate';
var MDNCSSProps = 'animation,animationDelay,animationDirection,animationDuration,animationFillMode,animationIterationCount,animationName,animationPlayState,animationTimingFunction,transition,transitionDelay,transitionDuration,transitionProperty,transitionTimingFunction,transform,transformOrigin,transformStyle,perspective,perspectiveOrigin,backfaceVisibility,color,opacity,columns,columnWidth,columnCount,columnGap,columnRule,columnRuleColor,columnRuleStyle,columnRuleWidth,breakBefore,breakAfter,breakInside,columnSpan,columnFill,hyphens,letterSpacing,wordWrap,overflowWrap,textTransform,tabSize,textAlign,textAlignLast,textIndent,whiteSpace,wordBreak,wordSpacing,lineBreak,textDecoration,textDecorationColor,textDecorationStyle,textDecorationLine,textDecorationSkip,textShadow,textUnderlinePosition,direction,unicodeBidi,writingMode,textOrientation,alignContent,alignItems,alignSelf,flexBasis,flexDirection,flexFlow,flexGrow,flexShrink,flex,flexWrap,justifyContent,order,background,backgroundAttachment,backgroundClip,backgroundColor,backgroundImage,backgroundOrigin,backgroundPosition,backgroundRepeat,backgroundSize,border,borderBottom,borderBottomColor,borderBottomLeftRadius,borderBottomRightRadius,borderBottomStyle,borderBottomWidth,borderColor,borderImage,borderImageOutset,borderImageRepeat,borderImageSlice,borderImageSource,borderImageWidth,borderLeft,borderLeftColor,borderLeftStyle,borderLeftWidth,borderRadius,borderRight,borderRightColor,borderRightStyle,borderRightWidth,borderStyle,borderTop,borderTopColor,borderTopLeftRadius,borderTopRightRadius,borderTopStyle,borderTopWidth,borderWidth,boxDecorationBreak,boxShadow,margin,marginBottom,marginLeft,marginRight,marginTop,padding,paddingBottom,paddingLeft,paddingRight,paddingTop,boxSizing,maxHeight,minHeight,height,maxWidth,minWidth,width,overflow,overflowX,overflowY,visibility,borderCollapse,borderSpacing,captionSide,emptyCells,tableLayout,verticalAlign,bottom,left,right,top,float,clear,position,zIndex,font,fontFamily,fontVariant,fontWeight,fontStretch,fontSize,lineHeight,fontFeatureSettings,fontLanguageOverride,fontSizeAdjust,fontStyle,fontSynthesis,fontKerning,fontVariantLigatures,fontVariantPosition,fontVariantCaps,fontVariantNumeric,fontVariantEastAsian,fontVariantAlternates,objectFit,objectPosition,imageRendering,imageOrientation,counterIncrement,counterReset,listStyle,listStyleImage,listStylePosition,listStyleType,orphans,pageBreakAfter,pageBreakBefore,pageBreakInside,widows,outline,outlineColor,outlineWidth,outlineStyle,outlineOffset,cursor,resize,textOverflow,content,quotes,boxDecorationBreak,clip,display,imeMode,all,willChange,backgroundBlendMode,mixBlendMode,isolation,shapeOutside,shapeMargin,shapeImageThreshold,touchAction,initialLetter,initialLetterAlign,displayInside,displayOutside,displayList,boxSuppress,scrollBehavior,blockSize,inlineSize,minBlockSize,minInlineSize,maxBlockSize,maxInlineSize,marginBlockStart,marginBlockEnd,marginInlineStart,marginInlineEnd,offsetBlockStart,offsetBlockEnd,offsetInlineStart,offsetInlineEnd,paddingBlockStart,paddingBlockEnd,paddingInlineStart,paddingInlineEnd,borderBlockStartWidth,borderBlockEndWidth,borderInlineStartWidth,borderInlineEndWidth,borderBlockStartStyle,borderBlockEndStyle,borderInlineStartStyle,borderInlineEndStyle,borderBlockStartColor,borderBlockEndColor,borderInlineStartColor,borderInlineEndColor,borderBlockStart,borderBlockEnd,borderInlineStart,borderInlineEnd';

var inited = false,
    inpParamName,
    dialog = new Dialog({
        title: 'New param',
    });
module.exports = dialog;

dialog.addButton('add', add);
dialog.addButton('close', 'hide');

dialog.on('show', function () {

    createContent();

    shortcuts.on('enter', add);

    inpParamName.value = '';
});

dialog.on('hide', function () {

    shortcuts.off('enter', add);
});


dialog.addProperty({name: 'track', input: inpParamName});


function add() {

    if (inpParamName.value) {

        dialog.track.addParam({name: inpParamName.value});
    }

    dialog.hide();
}

function createContent() {

    if (inited) return;
    inited = true;

    var suggestions = [AMCSSModuleProps,GSAPSpecProps,MDNCSSProps].join().split(',');

    inpParamName = new StringInput({
        parent: dialog.deContent,
        placeholder: 'css parameter name',
        suggestions: suggestions,
        value: 'ref'
    });
}







// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_values_syntax

// var mdnCssSyntax = [];
// $('tbody tr').each(function () {
//
//     var children = $(this).children();
//
//     var info = {
//         property: $(children[0]).text(),
//         syntax: $(children[1]).text(),
//         initialValue: $(children[2]).text(),
//         inherited: $(children[3]).text(),
//         media: $(children[4]).text(),
//     };
//
//     if (!info.property.match(/[@\/]/)) {
//
//         mdnCssSyntax.push(camelCase(info.property));
//     }
// });
//
// function camelCase(input) {
//   return input.toLowerCase().replace(/-(.)/g, function(match, group1) {
//       return group1.toUpperCase();
//   });
// }
//
// copy(mdnCssSyntax.join(','));
