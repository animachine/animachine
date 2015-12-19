module.exports = function(source, map) {
  console.log('--loader-------\n', source)
  this.callback(null, source, map)
}
