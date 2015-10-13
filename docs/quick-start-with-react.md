
Quick start with [React]

 - [Make components animatable]()
 - [Connect to animachine]()
 - [Animate with timeline]()
 - [Save and use the animation]()
 - [Other features]()

Make components animatable
To make animachine able to connect your component you have to decorate it with [react-animachine-enhancer]
```javascript
  /*ES5*/
  var animachine = require('react-animachine-enhancer')
  var MyComponent = React.createClass(/*...*/)
  module.exports = animachine()(MyComponent)

  //and if your animation is ready
  var myAnimation = require('my-animation.am')
  module.exports = animachine(myAnimation)(MyComponent)
```
For more information please check out [react-animachine-enhancer] but in short the API is looks like this:
```javascript
React.createClass({
  handleClick: function() {
    var animation = this.addAnimation('name-of-the-timeline')
    //the API of the animation is the same as the [GSAP animations have][gsap-docs]
    animation.timescale(2).play()
  }
})
```

Connect to animachine
1. install the [animachine browser extension][#extension] (only for Chrome at the moment),
2. open your project in chrome
3. click on the ![animachine icon](chrome/src/icons/icon19.png)
4.

[gsap-docs]:  http://greensock.com/docs/#/HTML5/GSAP/TimelineMax/
[react-animachine-enhancer]:  https://github.com/azazdeaz/react-animachine-enhancer
[react-gsap-enhancer]:  https://github.com/azazdeaz/react-gsap-enhancer
[React]:  https://github.com/facebook/react
