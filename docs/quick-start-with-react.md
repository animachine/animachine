
###Quick start with [React]
*work in progress*

 - [Make components animatable](#make-components-animatable)
 - [Install and connect to animachine](#install-and-connect-to-animachine)
 - [Animate with timeline](#animate-with-timeline)
 - [Save and use the animation](#save-and-use-the-animation)

###Make components animatable
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

###Install and connect to animachine
1. install the [animachine browser extension][extension] (only for Chrome at the moment),
2. open your project in chrome
3. click on the ![animachine icon](chrome/src/icons/icon19.png)
4. the upcoming dialogs will help you opening a project or creating a new one

###Animate with timelnie
```//TODO```

###Save and use the animation
Click on the floppy icon to save your project in a file and use as it was described it the [first step](#make-components-animatable)

[gsap-docs]: http://greensock.com/docs/#/HTML5/GSAP/TimelineMax/
[react-animachine-enhancer]: https://github.com/azazdeaz/react-animachine-enhancer
[react-gsap-enhancer]: https://github.com/azazdeaz/react-gsap-enhancer
[React]: https://github.com/facebook/react
