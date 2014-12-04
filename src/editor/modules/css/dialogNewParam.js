'use strict';

var amgui = require('../../amgui');
var Dialog = require('../../utils/Dialog');
var StringInput = require('../../utils/StringInput');

var inpParamName,
    dialog = new Dialog({
        title: 'New param',
    }); 
module.exports = dialog;

createContent();
dialog.addButton('add', function () {

    if (inpParamName.value) {

        dialog.track.addParam({name: inpParamName.value});
    }

    dialog.hide();
});
dialog.addButton('close', 'hide');

dialog.on('show', function () {

  inpParamName.value = '';
});



dialog.addProperty({name: 'track'});


function createContent() {

    var template = [
        '<div class="guess" style="padding: 2px;color:'+amgui.color.textColor+';background-color:'+amgui.color.bg1+';">',
          '<span>{{{property}}}</span>',
          // ' – <small>{{{media}}}</small>',
          // '<br><span>{{{description}}}</span>',
        '</div>'].join('')

    inpParamName = new StringInput({
        parent: dialog.deContent,
        placeholder: 'css parameter name',
        suggestions: getCssParams(),
        typeaheadOptions: {
            hint: true,
            highlight: true,
            minLength: 0
        },
        datasetOptions: {
            displayKey: 'property',
            // `ttAdapter` wraps the suggestion engine in an adapter that
            // is compatible with the typeahead jQuery plugin
            templates: {
                suggestion: function (context) {
                    return Mustache.render(template, context);
                }
            }
        }
    });
}


// https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_values_syntax

// var mdnCssSyntax = [];
// $('tbody tr').each(function () {

//     var children = $(this).children();

//     mdnCssSyntax.push({
//         property: $(children[0]).text(),
//         syntax: $(children[1]).text(),
//         initialValue: $(children[2]).text(),
//         inherited: $(children[3]).text(),
//         media: $(children[4]).text(),
//     });
// });
// mdnCssSyntax;
// JSON.stringify(mdnCssSyntax, null, 2);

function getCssParams() {
    return [
  {
    "property": "animation",
    "syntax": "<single-animation-name> || <time> || <timing-function> || <time> || <single-animation-iteration-count> || <single-animation-direction> || <single-animation-fill-mode> || <single-animation-play-state>",
    "initialValue": "the concatenation of the initial values of its longhand properties:animation-name: noneanimation-duration: 0sanimation-timing-function: easeanimation-delay: 0sanimation-iteration-count: 1animation-direction: normalanimation-fill-mode: noneanimation-play-state: running",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-delay",
    "syntax": "<time>#",
    "initialValue": "0s",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-direction",
    "syntax": "<single-animation-direction>#\n    where <single-animation-direction> = normal | reverse | alternate | alternate-reverse",
    "initialValue": "normal",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-duration",
    "syntax": "<time>#",
    "initialValue": "0s",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-fill-mode",
    "syntax": "<single-animation-fill-mode>#\n    where <single-animation-fill-mode> = none | forwards | backwards | both",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-iteration-count",
    "syntax": "<single-animation-iteration-count>#\n    where <single-animation-iteration-count> = infinite | <number>",
    "initialValue": "1",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-name",
    "syntax": "<single-animation-name>#\n    where <single-animation-name> = none | IDENT",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-play-state",
    "syntax": "<single-animation-play-state>#\n    where <single-animation-play-state> = running | paused",
    "initialValue": "running",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "animation-timing-function",
    "syntax": "<timing-function>#",
    "initialValue": "ease",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "transition",
    "syntax": "[ none | <single-transition-property> ] || <time> || <timing-function> || <time>",
    "initialValue": "the concatenation of the initial values of its longhand properties:transition-delay: 0stransition-duration: 0stransition-property: alltransition-timing-function: ease",
    "inherited": "no",
    "media": "interactive"
  },
  {
    "property": "transition-delay",
    "syntax": "<time>#",
    "initialValue": "0s",
    "inherited": "no",
    "media": "interactive"
  },
  {
    "property": "transition-duration",
    "syntax": "<time>#",
    "initialValue": "0s",
    "inherited": "no",
    "media": "interactive"
  },
  {
    "property": "transition-property",
    "syntax": "none | <single-transition-property>#  [ ‘,’ <single-transition-property># ]*\n    \n    where <single-transition-property> = all | IDENT",
    "initialValue": "all",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "transition-timing-function",
    "syntax": "<timing-function>#",
    "initialValue": "ease",
    "inherited": "no",
    "media": "interactive"
  },
  {
    "property": "transform",
    "syntax": "none | <transform-function>+",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "transform-origin",
    "syntax": "[ <percentage> | <length> | left | center | right | top | bottom] | [ [ <percentage> | <length> | left | center | right ] && [ <percentage> | <length> | top | center | bottom ] ] <length>?",
    "initialValue": "50% 50% 0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "transform-style",
    "syntax": "flat | preserve-3d",
    "initialValue": "flat",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "perspective",
    "syntax": "none | <length>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "perspective-origin",
    "syntax": "[ <percentage> | <length> | left | center | right | top | bottom] | [ [ <percentage> | <length> | left | center | right ] && [ <percentage> | <length> | top | center | bottom ] ]",
    "initialValue": "50% 50%",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "backface-visibility",
    "syntax": "visible | hidden",
    "initialValue": "visible",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "color",
    "syntax": "<color>",
    "initialValue": "Varies from one browser to another",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "opacity",
    "syntax": "<number>",
    "initialValue": "1.0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "columns",
    "syntax": "<'column-width'> || <'column-count'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:column-width: autocolumn-count: auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-width",
    "syntax": "<length> | auto",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-count",
    "syntax": "<number> | auto",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-gap",
    "syntax": "<length> | normal",
    "initialValue": "normal",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-rule",
    "syntax": "<'column-rule-width'> || <'column-rule-style'> || <'column-rule-color'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:column-rule-width: mediumcolumn-rule-style: nonecolumn-rule-color: currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-rule-color",
    "syntax": "<color>",
    "initialValue": "currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-rule-style",
    "syntax": "<br-style>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-rule-width",
    "syntax": "<br-width>",
    "initialValue": "medium",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "break-before",
    "syntax": "auto | always | avoid | left | right | page | column | avoid-page | avoid-colum",
    "initialValue": "auto",
    "inherited": "no",
    "media": "paged"
  },
  {
    "property": "break-after",
    "syntax": "auto | always | avoid | left | right | page | column | avoid-page | avoid-colum",
    "initialValue": "auto",
    "inherited": "no",
    "media": "paged"
  },
  {
    "property": "break-inside",
    "syntax": "auto | avoid | avoid-page | avoid-column",
    "initialValue": "auto",
    "inherited": "no",
    "media": "paged"
  },
  {
    "property": "column-span",
    "syntax": "none | all",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "column-fill",
    "syntax": "auto | balance",
    "initialValue": "balance",
    "inherited": "no",
    "media": "visual, but, in continuous media, has no effect in overflow columns"
  },
  {
    "property": "hyphens",
    "syntax": "none | manual | auto",
    "initialValue": "manual",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "letter-spacing",
    "syntax": "normal | <length>",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "word-wrap",
    "syntax": "normal | break-word",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "overflow-wrap",
    "syntax": "normal | break-word",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "text-transform",
    "syntax": "none | capitalize | uppercase | lowercase | full-width",
    "initialValue": "none",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "tab-size",
    "syntax": "| <length\"><integer> | <length>",
    "initialValue": "8",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "text-align",
    "syntax": "start | end | left | right | center | justify | match-parent | start end",
    "initialValue": "start, or a nameless value that acts as left if direction is ltr, right if direction is rtl if start is not supported by the browser.",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "text-align-last",
    "syntax": "auto | start | end | left | right | center | justify",
    "initialValue": "auto",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "text-indent",
    "syntax": "<length> | <percentage> && [ hanging || each-line ]",
    "initialValue": "0",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "direction",
    "syntax": "ltr | rtl",
    "initialValue": "ltr",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "white-space",
    "syntax": "normal | pre | nowrap | pre-wrap | pre-line",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "word-break",
    "syntax": "normal | break-all | keep-all",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "word-spacing",
    "syntax": "normal | <length>",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "line-break",
    "syntax": "auto | loose | normal | strict",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "text-decoration",
    "syntax": "<'text-decoration-line'> || <'text-decoration-style'> || <'text-decoration-color'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:text-decoration-color: currentColortext-decoration-style: solidtext-decoration-line: none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "text-decoration-color",
    "syntax": "<color>",
    "initialValue": "currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "text-decoration-style",
    "syntax": "solid | double | dotted | dashed | wavy",
    "initialValue": "solid",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "text-decoration-line",
    "syntax": "none | [ underline || overline || line-through || blink ]",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "text-decoration-skip",
    "syntax": "none | [ objects || spaces || ink || edges || box-decoration ]",
    "initialValue": "objects",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "text-shadow",
    "syntax": "none | <shadow-t>#\n    where <shadow-t> = [ <length>{2,3} && <color>? ]",
    "initialValue": "none",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "text-underline-position",
    "syntax": "auto | [ under || [ left | right ] ]",
    "initialValue": "auto",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "align-content",
    "syntax": "flex-start | flex-end | center | space-between | space-around | stretch",
    "initialValue": "stretch",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "align-items",
    "syntax": "flex-start | flex-end | center | baseline | stretch",
    "initialValue": "stretch",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "align-self",
    "syntax": "auto | flex-start | flex-end | center | baseline | stretch",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "flex-basis",
    "syntax": "content | <'width'>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "flex-direction",
    "syntax": "row | row-reverse | column | column-reverse",
    "initialValue": "row",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "flex-flow",
    "syntax": "<'flex-direction'> || <'flex-wrap'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:flex-direction: rowflex-wrap: nowrap",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "flex-grow",
    "syntax": "<number>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "flex-shrink",
    "syntax": "<number>",
    "initialValue": "1",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "flex",
    "syntax": "none | [ <'flex-grow'> <'flex-shrink'>? || <'flex-basis'> ]",
    "initialValue": "the concatenation of the initial values of its longhand properties:flex-grow: 0flex-shrink: 1flex-basis: auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "flex-wrap",
    "syntax": "nowrap | wrap | wrap-reverse",
    "initialValue": "nowrap",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "justify-content",
    "syntax": "flex-start | flex-end | center | space-between | space-around",
    "initialValue": "flex-start",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "order",
    "syntax": "<integer>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background",
    "syntax": "[ <bg-layer> , ]* <final-bg-layer>\n    where <bg-layer> = <bg-image> || <position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box>{1,2}\n    and <final-bg-layer> = <bg-image> || <position> [ / <bg-size> ]? || <repeat-style> || <attachment> || <box>{1,2} || <'background-color'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:background-image: nonebackground-position: 0% 0%background-size: auto autobackground-repeat: repeatbackground-origin: padding-boxbackground-style: is itself a shorthand, its initial value is the concatenation of its own longhand propertiesbackground-clip: border-boxbackground-color: transparent",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-attachment",
    "syntax": "<attachment>#\n    where <attachment> = scroll | fixed | local",
    "initialValue": "scroll",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-clip",
    "syntax": "<box>#\n    where <box> = border-box | padding-box | content-box",
    "initialValue": "border-box",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-color",
    "syntax": "<color>",
    "initialValue": "transparent",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-image",
    "syntax": "<bg-image>#\n    where <bg-image> = none | <image>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-origin",
    "syntax": "<box>#",
    "initialValue": "padding-box",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-position",
    "syntax": "<position>#",
    "initialValue": "0% 0%",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-repeat",
    "syntax": "<repeat-style>#\n    where <repeat-style> = repeat-x | repeat-y | [repeat | space | round | no-repeat]{1,2}",
    "initialValue": "repeat",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "background-size",
    "syntax": "<bg-size>#\n    where <bg-size> = [ <length> | <percentage> | auto ]{1,2} | cover | contain",
    "initialValue": "auto auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border",
    "syntax": "<br-width> || <br-style> || <color>",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-width: the concatenation of the initial values of its longhand properties:border-top-width: mediumborder-right-width: mediumborder-bottom-width: mediumborder-left-width: mediumborder-style: the concatenation of the initial values of its longhand properties:border-top-style: noneborder-right-style: noneborder-bottom-style: noneborder-left-style: noneborder-color: the concatenation of the initial values of its longhand properties:border-top-color: currentColorborder-right-color: currentColorborder-bottom-color: currentColorborder-left-color: currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-bottom",
    "syntax": "<br-width> || <br-style> || <color>",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-bottom-width: mediumborder-bottom-style: noneborder-bottom-color: currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-bottom-color",
    "syntax": "<color>",
    "initialValue": "currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-bottom-left-radius",
    "syntax": "[ <length> | <percentage> ]{1,2}",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-bottom-right-radius",
    "syntax": "[ <length> | <percentage> ]{1,2}",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-bottom-style",
    "syntax": "<br-style>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-bottom-width",
    "syntax": "<br-width>",
    "initialValue": "medium",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-color",
    "syntax": "<color>{1,4}",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-top-color: currentColorborder-right-color: currentColorborder-bottom-color: currentColorborder-left-color: currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-image",
    "syntax": "<'border-image-source'> || <'border-image-slice'> [ / <'border-image-width'> | / <'border-image-width'>? / <'border-image-outset'> ]? || <'border-image-repeat'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-image-source: noneborder-image-slice: 100%border-image-width: 1border-image-outset: 0sborder-image-repeat: stretch",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-image-outset",
    "syntax": "[ <length> | <number> ]{1,4}",
    "initialValue": "0s",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-image-repeat",
    "syntax": "[ stretch | repeat | round ]{1,2}",
    "initialValue": "stretch",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-image-slice",
    "syntax": "[<number> | <percentage>]{1,4} && fill?",
    "initialValue": "100%",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-image-source",
    "syntax": "none | <image>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-image-width",
    "syntax": "[ <length> | <percentage> | <number> | auto ]{1,4}",
    "initialValue": "1",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-left",
    "syntax": "<br-width> || <br-style> || <color>",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-left-width: mediumborder-left-style: noneborder-left-color: currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-left-color",
    "syntax": "<color>",
    "initialValue": "currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-left-style",
    "syntax": "<br-style>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-left-width",
    "syntax": "<br-width>",
    "initialValue": "medium",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-radius",
    "syntax": "[ <length> | <percentage> ]{1,4} [ / [ <length> | <percentage> ]{1,4} ]?",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-top-left-radius: 0border-top-right-radius: 0border-bottom-right-radius: 0border-bottom-left-radius: 0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-right",
    "syntax": "<br-width> || <br-style> || <color>",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-right-width: mediumborder-right-style: noneborder-right-color: currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-right-color",
    "syntax": "<color>",
    "initialValue": "currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-right-style",
    "syntax": "<br-style>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-right-width",
    "syntax": "<br-width>",
    "initialValue": "medium",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-style",
    "syntax": "<br-style>{1,4}\n    where <br-style> = none | hidden | dotted | dashed | solid | double | groove | ridge | inset | outset",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-top-style: noneborder-right-style: noneborder-bottom-style: noneborder-left-style: none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-top",
    "syntax": "<br-width> || <br-style> || <color>",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-top-width: mediumborder-top-style: noneborder-top-color: currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-top-color",
    "syntax": "<color>",
    "initialValue": "currentColor",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-top-left-radius",
    "syntax": "[ <length> | <percentage> ]{1,2}",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-top-right-radius",
    "syntax": "[ <length> | <percentage> ]{1,2}",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-top-style",
    "syntax": "<br-style>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-top-width",
    "syntax": "<br-width>",
    "initialValue": "medium",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "border-width",
    "syntax": "<br-width>{1,4}\n    where <br-width> = <length> | thin | medium | thick",
    "initialValue": "the concatenation of the initial values of its longhand properties:border-top-width: mediumborder-right-width: mediumborder-bottom-width: mediumborder-left-width: medium",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "box-decoration-break",
    "syntax": "slice | clone",
    "initialValue": "slice",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "box-shadow",
    "syntax": "none | <shadow>#\n    where <shadow> = inset? && [ <length>{2,4} && <color>? ]",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "margin",
    "syntax": "[ <length> | <percentage> | auto ]{1,4}",
    "initialValue": "the concatenation of the initial values of its longhand properties:margin-bottom: 0margin-left: 0margin-right: 0margin-top: 0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "margin-bottom",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "margin-left",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "margin-right",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "margin-top",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "padding",
    "syntax": "[ <length> | <percentage> ]{1,4}",
    "initialValue": "the concatenation of the initial values of its longhand properties:padding-bottom: 0padding-left: 0padding-right: 0padding-top: 0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "padding-bottom",
    "syntax": "<length> | <percentage>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "padding-left",
    "syntax": "<length> | <percentage>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "padding-right",
    "syntax": "<length> | <percentage>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "padding-top",
    "syntax": "<length> | <percentage>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "box-sizing",
    "syntax": "content-box | padding-box | border-box",
    "initialValue": "content-box",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "max-height",
    "syntax": "<length> | <percentage> | none | max-content | min-content | fit-content | fill-available",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "min-height",
    "syntax": "<length> | <percentage> | auto | max-content | min-content | fit-content | fill-available",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "height",
    "syntax": "auto | <length> | <percentage>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "max-width",
    "syntax": "<length> | <percentage> | none | max-content | min-content | fit-content | fill-available",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "min-width",
    "syntax": "<length> | <percentage> | auto | max-content | min-content | fit-content | fill-available",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "width",
    "syntax": "[<length> | <percentage>] && [border-box | content-box]? | available | min-content | max-content | fit-content | auto",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "overflow",
    "syntax": "visible | hidden | scroll | auto",
    "initialValue": "visible",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "overflow-x",
    "syntax": "visible | hidden | scroll | auto",
    "initialValue": "visible",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "overflow-y",
    "syntax": "visible | hidden | scroll | auto",
    "initialValue": "visible",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "visibility",
    "syntax": "visible | hidden | collapse",
    "initialValue": "visible",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "border-collapse",
    "syntax": "collapse | separate",
    "initialValue": "separate",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "border-spacing",
    "syntax": "<length> <length>?",
    "initialValue": "0",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "caption-side",
    "syntax": "top | bottom",
    "initialValue": "top",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "empty-cells",
    "syntax": "show | hide",
    "initialValue": "show",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "table-layout",
    "syntax": "auto | fixed",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "vertical-align",
    "syntax": "baseline | sub | super | text-top | text-bottom | middle | top | bottom | <percentage> | <length>",
    "initialValue": "baseline",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "bottom",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "left",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "right",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "top",
    "syntax": "<length> | <percentage> | auto",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "float",
    "syntax": "left | right | none",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "clear",
    "syntax": "none | left | right | both",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "position",
    "syntax": "static | relative | absolute | sticky | fixed",
    "initialValue": "static",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "z-index",
    "syntax": "auto | <integer>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "font",
    "syntax": "[ [ <‘font-style’> || <font-variant-css21> || <‘font-weight’> || <‘font-stretch’> ]? <‘font-size’> [ / <‘line-height’> ]? <‘font-family’> ] | caption | icon | menu | message-box | small-caption | status-bar",
    "initialValue": "the concatenation of the initial values of its longhand properties:font-style: normalfont-variant: normalfont-weight: normalfont-stretch: normalfont-size: mediumline-height: normalfont-family: depends on user agent",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-family",
    "syntax": "[ <family-name> | <generic-family> ]#\n    where <family-name> = <string> | <IDENT>+\n    and <generic-name> = serif | sans-serif | cursive | fantasy | monospace",
    "initialValue": "depends on user agent",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-variant",
    "syntax": "normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> || stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name> #) || character-variant(<feature-value-name> #) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>) || [ small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps ] || <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero || <east-asian-variant-values> || <east-asian-width-values> || ruby ] ",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-weight",
    "syntax": "normal | bold | bolder | lighter | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-stretch",
    "syntax": "normal | ultra-condensed | extra-condensed | condensed | semi-condensed | semi-expanded | expanded | extra-expanded | ultra-expanded",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-size",
    "syntax": "<absolute-size> | <relative-size> | <length> | <percentage>\n    where <absolute-size> = xx-small | s-small | small | medium | large | x-large | xx-large\n    and <relative-size> = larger | smaller",
    "initialValue": "medium",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "line-height",
    "syntax": "normal | <number> | <length> | <percentage>",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-feature-settings",
    "syntax": "normal | <feature-tag-value>#\n    where <feature-tag-value> = <string> [ <integer> | on | off ]?",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-language-override",
    "syntax": "normal | <string>",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-size-adjust",
    "syntax": "none | <number>",
    "initialValue": "none",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-style",
    "syntax": "normal | italic | oblique",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-synthesis",
    "syntax": "none | [ weight || style ]",
    "initialValue": "weight style",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-kerning",
    "syntax": "auto | normal | none",
    "initialValue": "auto",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-variant-ligatures",
    "syntax": "normal | none | [ <common-lig-values> || <discretionary-lig-values> || <historical-lig-values> || <contextual-alt-values> ]\n    where <common-lig-values> = [ common-ligatures | no-common-ligatures ]\n    and <discretionary-lig-values> = [ discretionary-ligatures | no-discretionary-ligatures ]\n    and <historical-lig-values> = [ historical-ligatures | no-historical-ligatures ]\n    and <contextual-alt-values> = [ contextual | no-contextual ]",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-variant-position",
    "syntax": "normal | sub | super",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-variant-caps",
    "syntax": "normal | small-caps | all-small-caps | petite-caps | all-petite-caps | unicase | titling-caps",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-variant-numeric",
    "syntax": "normal | [ <numeric-figure-values> || <numeric-spacing-values> || <numeric-fraction-values> || ordinal || slashed-zero ]\n    where <numeric-figure-values> = [ lining-nums | oldstyle-nums ]\n    and <numeric-spacing-values> = [ proportional-nums | tabular-nums ]\n    and <numeric-fraction-values> = [ diagonal-fractions | stacked-fractions ]",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-variant-east-asian",
    "syntax": "normal | [ <east-asian-variant-values> || <east-asian-width-values> || ruby ] \n    where <east-asian-variant-values> = [ jis78 | jis83 | jis90 | jis04 | simplified | traditional ]\n    and <east-asian-width-values> = [ full-width | proportional-width ]",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "font-variant-alternates",
    "syntax": "normal | [ stylistic(<feature-value-name>) || historical-forms || styleset(<feature-value-name> #) || character-variant(<feature-value-name> #) || swash(<feature-value-name>) || ornaments(<feature-value-name>) || annotation(<feature-value-name>) ] \n    where <feature-value-name> = IDENT",
    "initialValue": "normal",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "object-fit",
    "syntax": "fill | contain | cover | none | scale-down",
    "initialValue": "fill",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "object-position",
    "syntax": "<position>",
    "initialValue": "50% 50%",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "image-rendering",
    "syntax": "auto | crisp-edges | pixelated",
    "initialValue": "auto",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "image-orientation",
    "syntax": "from-image | <angle> | [<angle>? flip]",
    "initialValue": "0deg",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "counter-increment",
    "syntax": "[<user-ident> <integer>?]+ | none",
    "initialValue": "none",
    "inherited": "no",
    "media": "all"
  },
  {
    "property": "counter-reset",
    "syntax": "[<user-ident> <integer>?]+ | none",
    "initialValue": "none",
    "inherited": "no",
    "media": "all"
  },
  {
    "property": "list-style",
    "syntax": "<'list-style-type'> || <'list-style-position'> || <'list-style-image'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:list-style-type: disclist-style-position: outsidelist-style-image: none",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "list-style-image",
    "syntax": "<uri> | none",
    "initialValue": "none",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "list-style-position",
    "syntax": "inside | outside",
    "initialValue": "outside",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "list-style-type",
    "syntax": "disc | circle | square | decimal | decimal-leading-zero | lower-roman | upper-roman | lower-greek | lower-latin | upper-latin | armenian | georgian | lower-alpha | upper-alpha | none",
    "initialValue": "disc",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "orphans",
    "syntax": "<integer>",
    "initialValue": "2",
    "inherited": "yes",
    "media": "visual, paged"
  },
  {
    "property": "page-break-after",
    "syntax": "auto | always | avoid | left | right",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, paged"
  },
  {
    "property": "page-break-before",
    "syntax": "auto | always | avoid | left | right",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, paged"
  },
  {
    "property": "page-break-inside",
    "syntax": "auto | avoid",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, paged"
  },
  {
    "property": "widows",
    "syntax": "<integer>",
    "initialValue": "2",
    "inherited": "yes",
    "media": "visual, paged"
  },
  {
    "property": "outline",
    "syntax": "<'outline-color'> || <'outline-style'> || <'outline-width'>",
    "initialValue": "the concatenation of the initial values of its longhand properties:outline-color: invert, for browsers supporting it, currentColor for the otheroutline-style: noneoutline-width: medium",
    "inherited": "no",
    "media": "visual, interactive"
  },
  {
    "property": "outline-color",
    "syntax": "<color> | invert",
    "initialValue": "invert, for browsers supporting it, currentColor for the other",
    "inherited": "no",
    "media": "visual, interactive"
  },
  {
    "property": "outline-width",
    "syntax": "<br-width>",
    "initialValue": "medium",
    "inherited": "no",
    "media": "visual, interactive"
  },
  {
    "property": "outline-style",
    "syntax": "auto | <br-style>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual, interactive"
  },
  {
    "property": "outline-offset",
    "syntax": "<length>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual, interactive"
  },
  {
    "property": "cursor",
    "syntax": "[ [ <uri> [<x> <y>]?,]* [ auto | default | none | context-menu | help | pointer | progress | wait | cell | crosshair | text | vertical-text | alias | copy | move | no-drop | not-allowed | e-resize | n-resize | ne-resize | nw-resize | s-resize | se-resize | sw-resize | w-resize | ew-resize | ns-resize | nesw-resize | nwse-resize | col-resize | row-resize | all-scroll | zoom-in | zoom-out | grab | grabbing ] ]",
    "initialValue": "auto",
    "inherited": "yes",
    "media": "visual, interactive"
  },
  {
    "property": "resize",
    "syntax": "none | both | horizontal | vertical",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "text-overflow",
    "syntax": "[ clip | ellipsis | <string> ]{1,2}",
    "initialValue": "clip",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "content",
    "syntax": "normal | none | [ <string> | <uri> | <counter> | attr() | open-quote | close-quote | no-open-quote | no-close-quote ]+",
    "initialValue": "normal",
    "inherited": "no",
    "media": "all"
  },
  {
    "property": "quotes",
    "syntax": "[<string> <string>]+ | none",
    "initialValue": "user agent specific",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "box-decoration-break",
    "syntax": "slice | clone",
    "initialValue": "slice",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "clip",
    "syntax": "<shape> | auto\n    where <shape> = rect(<top>, <right>, <bottom>, <left>)",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "display",
    "syntax": "none | inline | block | list-item | inline-block | inline-table | table | table-cell | table-column | table-column-group | table-footer-group | table-header-group | table-row | table-row-group | flex | inline-flex | grid | inline-grid | run-in | ruby | ruby-base | ruby-text | ruby-base-container | ruby-text-container | contents",
    "initialValue": "inline",
    "inherited": "no",
    "media": "all"
  },
  {
    "property": "unicode-bidi",
    "syntax": "normal | embed | isolate | bidi-override | isolate-override | plaintext",
    "initialValue": "normal",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "text-orientation",
    "syntax": "mixed | upright | sideways-right | sideways-left | sideways | use-glyph-orientation",
    "initialValue": "mixed",
    "inherited": "yes",
    "media": "visual"
  },
  {
    "property": "ime-mode",
    "syntax": "auto | normal | active | inactive | disabled",
    "initialValue": "auto",
    "inherited": "no",
    "media": "interactive"
  },
  {
    "property": "all",
    "syntax": "initial | inherit | unset",
    "initialValue": "There is no practical initial value for it.",
    "inherited": "no",
    "media": "There is no practical media for it."
  },
  {
    "property": "will-change",
    "syntax": "auto | <animateable-feature>#\n    where <animateable-feature> = scroll-position | contents | <custom-ident>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "all"
  },
  {
    "property": "background-blend-mode",
    "syntax": "<blend-mode>#",
    "initialValue": "normal",
    "inherited": "no",
    "media": "none"
  },
  {
    "property": "mix-blend-mode",
    "syntax": "<blend-mode>",
    "initialValue": "normal",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "isolation",
    "syntax": "auto | isolate",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "shape-outside",
    "syntax": "none | <shape-box> || <basic-shape> | <image>",
    "initialValue": "none",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "shape-margin",
    "syntax": "<length> | <percentage>",
    "initialValue": "0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "shape-image-threshold",
    "syntax": "<number>",
    "initialValue": "0.0",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "touch-action",
    "syntax": "auto | none | [ pan-x || pan-y ] | manipulation",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual"
  },
  {
    "property": "@viewport/min-width",
    "syntax": "<viewport-length>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/max-width",
    "syntax": "<viewport-length>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/width",
    "syntax": "<viewport-length>{1,2}",
    "initialValue": "the concatenation of the initial values of its longhand properties:@viewport/min-width: is itself a shorthand, its initial value is the concatenation of its own longhand properties@viewport/max-width: is itself a shorthand, its initial value is the concatenation of its own longhand properties",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/min-height",
    "syntax": "<viewport-length>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/max-height",
    "syntax": "<viewport-length>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/height",
    "syntax": "<viewport-length>{1,2}",
    "initialValue": "the concatenation of the initial values of its longhand properties:@viewport/min-height: is itself a shorthand, its initial value is the concatenation of its own longhand properties@viewport/max-height: is itself a shorthand, its initial value is the concatenation of its own longhand properties",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/zoom",
    "syntax": "auto | <number> | <percentage>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/min-zoom",
    "syntax": "auto | <number> | <percentage>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/max-zoom",
    "syntax": "auto | <number> | <percentage>",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/user-zoom",
    "syntax": "zoom | fixed",
    "initialValue": "zoom",
    "inherited": "no",
    "media": "visual, continuous"
  },
  {
    "property": "@viewport/orientation",
    "syntax": "auto | portrait | landscape",
    "initialValue": "auto",
    "inherited": "no",
    "media": "visual, continuous"
  }
];}