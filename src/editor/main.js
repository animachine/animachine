var bowser = require('bowser').browser;

if (!bowser.chrome && !bowser.opera) {

    alertUnsupportedBrowsers();
    throw Error('unsupported browser');
}

window.am = require('./am/am');

function alertUnsupportedBrowsers() {

    var deSorry = document.createElement('div');
    deSorry.textContent = 'Sorry, this demo is currently only supported by the newest chrome and opera.';
    deSorry.style.display = 'fixed';
    deSorry.style.margin = 'auto';
    deSorry.style.fontFamily = 'Open Sans';
    deSorry.style.fontSize = '21px';
    deSorry.style.color = 'white';
    deSorry.style.background = 'rgba(0,0,0,0.3)';
    deSorry.style.top = 0;
    deSorry.style.right = 0;
    deSorry.style.bottom = 0;
    deSorry.style.left = 0;
    document.body.innerHTML = '';
    var emo = document.createElement('span');
    emo.className = 'icon-emo-unhappy';
    deSorry.appendChild(emo);
    // amgui.createIcon({icon: 'emo-unhappy', parent: deSorry, display: 'inline'});
    document.body.appendChild(deSorry);
}
