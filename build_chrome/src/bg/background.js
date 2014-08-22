// if you checked "fancy-settings" in extensionizr.com, uncomment this lines

// var settings = new Store("settings", {
//     "sample_setting": "This is how you use Store.js to remember values"
// });

console.log('fsdfsdfsd')

chrome.browserAction.onClicked.addListener(function (tab) {
    
    console.log('clicked', tab.id);

    chrome.tabs.executeScript(tab.id, {file: "js/content_script.js"});
    chrome.tabs.insertCSS(tab.id, {file: "assets/fontello/css/amgui-embedded.css"});
    chrome.tabs.insertCSS(tab.id, {file: "assets/dialog-polyfill.css"});
});