console.log('init animachine')
var sourceUrl = window.ANIMACHINE_SOURCE_URL || 'https://rawgit.com/animachine/animachine/browser-dist/animachine.js'
loadjscssfile('js', sourceUrl)
loadjscssfile('css', '//fonts.googleapis.com/css?family=Open+Sans:400,700,600,300&subset=latin,latin-ext')
loadjscssfile('css', '//maxcdn.bootstrapcdn.com/font-awesome/4.3.0/css/font-awesome.min.css')


function loadjscssfile(filetype, filename){
  var fileref
  if (filetype=='js'){ //if filename is a external JavaScript file
    fileref=document.createElement('script')
    fileref.setAttribute('type','text/javascript')
    fileref.setAttribute('src', filename)
  }
  else if (filetype=='css'){ //if filename is an external CSS file
    fileref=document.createElement('link')
    fileref.setAttribute('rel', 'stylesheet')
    fileref.setAttribute('type', 'text/css')
    fileref.setAttribute('href', filename)
  }
  document.head.appendChild(fileref)
}
