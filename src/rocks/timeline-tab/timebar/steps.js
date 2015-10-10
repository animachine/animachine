export default [
  {
    small: 5,
    big: 50,
    time: 50,
    format: function (ms) {
      return ms + 'ms'
    }
  },
  {
    small: 10,
    big: 100,
    time: 100,
    format: function (ms) {
      return ms + 'ms'
    }
  },
  {
    small: 100,
    big: 1000,
    time: 1000,
    format: function (ms) {
      var min = parseInt(ms/60000)
      var sec = parseInt(ms/1000) % 60

      return (min ? min+':'+two(sec) : sec) + 's'
    }
  },
  {
    small: 500,
    big: 5000,
    time: 5000,
    format: function (ms) {
      var min = parseInt(ms/60000)
      var sec = parseInt(ms/1000) % 60

      return (min ? min+':'+two(sec) : sec) + 's'
    }
  },
  {
    small: 10000,
    big: 60000,
    time: 60000,
    format: function (ms) {
      var min = parseInt(ms/60000) % 60
      var hour = parseInt(ms/3600000)

      return (hour ? hour+':'+two(min) : min) + 'm'
    }
  },
  {
    small: 60000,
    big: 5*60000,
    time: 5*60000,
    format: function (ms) {
      var min = parseInt(ms/60000) % 60
      var hour = parseInt(ms/3600000)

      return (hour ? hour+':'+two(min) : min) + 'm'
    }
  }
]

function two(num) {
  return ('00' + num).substr(-2)
}
