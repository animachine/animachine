![](https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/animachine/animachine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/animachine/animachine.svg)](https://travis-ci.org/animachine/animachine)

<img src="http://s9.postimg.org/mqolutoxb/amheader.png">

##animachine
######*a GUI for [GSAP]*  
Create code driven animation using traditional animation tools (like timeline, transformtool, etc). All you have to do is install the [Chrome extension][extension], open your project in [Chrome][chrome], hit the animachine button, and start animating!

<img src="http://i.imgur.com/GNRAlz5.png">

###Status
*work in progress*

This is the second alpha release completely rewritten using [React] and [Redux]. For now, it animates only React components with a very minimal feature set but you can see in the [Todos] what's coming up.

*[Here](https://github.com/animachine/animachine/tree/first-alpha) you can check out the previous alpha version*

###[Check out the quick start with React guide!](docs/quick-start-with-react.md)

###Why is this needed?
You have great tools to make animations for the web (like [Adobe Edge][edge], [Google Webdesigner][webdesigner] or [Animatron]) but all of these are only for making sandboxed animations and embedding the boxes somewhere (usually ouin an iframe). If you need to animate some inner part of your project (ex. when a dialog appears or a game character jumps and walks) it has to be coded by a programmer. When this animation has to be long, artistic or done by somebody who is not a skilled programmer, this work can be tedious or almost impossible which can prevent us from seeing more fine and sophisticated animations on the web.

###How is this working?
In a nutshell, when you click on the extension you'll have an overlay on your page with the animation tools which you'll be familiar with if you ever made animations with programs like Anime Studio, Adobe Edge, After Effects, etc.  
Then you can pick elements from your page and start animating them.
When it's done, you can save your animation as a .js file and include it in your page.  
If you want to change your animation later just open your project and animachine again, it will recognize the animations, and offer to continue editing them.

###Demos: 
 - animations: [jumping thing][demo-jump], [pointless-robots][demo-robots]
 - components: [Zombie](https://github.com/azazdeaz/react-animated-topdown-zombie)

###Todos:
- [ ] [Select elements with click](http://i.imgur.com/LPCj6jp.gif)
- [ ] [Advanced ease editor](http://i.imgur.com/fZhQcc6.gif)
- [ ] Undo/redo history
- [ ] [Bezier motion path editor](http://i.imgur.com/LjBruea.gif)
- [ ] SVG path morphing
- [ ] Hotkeys
- [ ] In app tours
- [ ] Support for plain DOM Nodes (and jQuery)
- [ ] Param groups (like scale for scaleX and scaleY)
- [ ] 3D transform params
- [ ] resolve performance issues


![](http://zippy.gfycat.com/IndolentBowedBustard.gif) | **free transform tool**
-------------:|:-------------
**inslnie ease editor**   | ![](http://i.imgur.com/hRiwrS2.gif)
![](http://i.imgur.com/d9K7DpQ.gif) | **timeline navigator**

These separated modules are developed as part of animachine:
- [transhand](https://github.com/azazdeaz/transhand)
- [react-gsap-enhancer](https://github.com/azazdeaz/react-gsap-enhancer)
- [react-animachine-enhancer](https://github.com/animachine/react-animachine-enhancer)
- [react-matterkit](https://github.com/azazdeaz/react-matterkit)
- [json-vision](https://github.com/azazdeaz/json-vision)
- [spaceman](https://github.com/azazdeaz/spaceman)
- [react-theme](https://github.com/azazdeaz/react-theme)
- [custom-drag](https://github.com/azazdeaz/custom-drag)

[extension]: https://chrome.google.com/webstore/detail/animachine-alpha/feefkphfphgbcidiajhoapphgmnfhgod
[demo-jump]: http://animachine.github.io/animachine/#/demo/Box
[demo-robots]: http://animachine.github.io/animachine/#/demo/Robots
[GSAP]: http://greensock.com/
[React]: https://facebook.github.io/react/
[Redux]: https://github.com/rackt/redux/
[Animatron]: https://www.animatron.com/
[edge]: https://www.adobe.com/products/edge-animate.html
[webdesigner]: https://www.google.com/webdesigner/
[chrome]: https://www.google.com/chrome/browser/desktop/
