// from http://stackoverflow.com/questions/283956/
export default function download({uri, fileName}) {
  var link = document.createElement('a')
  if (typeof link.download === 'string') {
    document.body.appendChild(link) //Firefox requires the link to be in the body
    link.download = fileName
    link.href = uri
    link.click()
    document.body.removeChild(link) //remove the link when done
  } else {
    location.replace(uri)
  }
}
