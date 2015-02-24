![](https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square)
[![Gitter](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/animachine/animachine?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/animachine/animachine.svg)](https://travis-ci.org/animachine/animachine)

<img src="http://s9.postimg.org/mqolutoxb/amheader.png">

The animachine is a GUI for [GSAP].  
It lets you to create code driven animation using traditional animation tools (like timeline, transformtool, etc.).  
You don't need to add any change to your project to use animachine, just hit on the [chrome extension][extension] or embed it like any other js library and start animating.

###Why is this needed?
You have great tools to make animations for the web (like Adobe Edge, Google Webdesigner or Animatron) but all of these are only for making sandboxed animations and embed that boxes in somewhere (usually in an iframe). If you need to animate some inner part of your project (ex. when a dialog appears or a game character jumps and walks) it has to be coded by a programmer. When this animations have to be long, artistic or just done by somebody how is not a skilled programmer this work can be tedious or almost impossible, so this can prevent us from seeing more fine and shopisticated animations on the web.

###How is this working?
In a nuteshell, when you click on the extension you'll have an overlay on your page with the animation tools which you'll be familiar with if you ever made animations with prgrams like Anime Studio, Adobe Edge, Affter Effects etc.  
Then you can pick elements from your page and start animating them.  
When it's done, you can save your animation as a .js file an include it in your page.  
If later you want to change your animation, just open the animachine, load that .js file and you can continue where you stoped.  

###What is the state of this?
We're working for reach the beta state where you can start to use it in your projects, but currently it's in alpha, so things are changing day from day, many of the basic features are just draft and the save files from last week probably don't gonna work in the next week. Although you're wellcomed to play with the [extension], the demos and take the in app tours.

###Demos: [marslanding][demo-marspolip], [argh][demo-argh]
###Tours:  [quickstart][tour-quickstart], [bezier path][tour-bezier], triggers
###Videos:  react.js, WordPress
(currently only for Chrome and Opera)

<img src="http://i.imgur.com/9X2xUfz.png">


**DOM picking**   | ![Dom picking](http://i.imgur.com/LPCj6jp.gif)
-------------:|:-------------
![](http://i.imgur.com/LjBruea.gif) | **bezier path**
**advanced ease editor**   | ![](http://i.imgur.com/fZhQcc6.gif)
![](http://zippy.gfycat.com/IndolentBowedBustard.gif) | **free transform tool**
**inslnie ease editor**   | ![](http://i.imgur.com/hRiwrS2.gif) 
![](http://i.imgur.com/d9K7DpQ.gif) | **timeline navigator**

###Milestones
**1,**  
Migrate get gui rendering to React and use Flow style
Add all the the best basic timeline editing features, what we love from the good old animation tools. 
Make the UI more intuitive.  
Add more available track types for editing ~~css~~, attributes, mediaelements.  
Random key values.  
Css Transform3D support.  

**2,**  
Extended support for svg animation. (paths, filters, etc.)  
Pixi.js, Easel.js, Raphael.js, Snap.svg support.  
Add resource handling and content creating feuteres.  
Animate with skeletons.  
Support sprite sheets.  
Video file export.  


**3,**  
Three.js support.  
Create online playground.  

[extension]: https://chrome.google.com/webstore/detail/animachine/gpnfomkfgajaojpakbkikiekmajeojgd
[demo-marspolip]: http://animachine.github.io/animachine/demos/marspolip/
[demo-argh]: http://animachine.github.io/animachine/demos/argh/
[tour-quickstart]: http://animachine.github.io/animachine/tours/quickstart/
[tour-bezier]: http://animachine.github.io/animachine/tours/bezier/
[GSAP]: http://greensock.com/
