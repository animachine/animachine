console.log('init animachine')

var script = document.createElement('script')
var sourceUrl = window.ANIMACHINE_SOURCE_URL || 'https://rawgit.com/animachine/animachine/next/browser/animachine.js' 
script.setAttribute('src', sourceUrl)
document.head.appendChild(script)
