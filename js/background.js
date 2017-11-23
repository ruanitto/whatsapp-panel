/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// Add event listeners
window.addEventListener("message", receiveUnreadMessages, false);
browser.webRequest.onHeadersReceived.addListener(removeResponseHeaders, {"urls": ["*://*.web.whatsapp.com/*"]}, ["blocking", "responseHeaders"]);

var Ext={
    os:null,
    version:null,
    win:"Alt+Shift+W",
    mac:"Alt+Shift+W",
    gotPlatformInfo:function(info){
        Ext.os=info.os;
        browser.runtime.getBrowserInfo(Ext.gotBrowserInfo);
    },
    gotBrowserInfo:function(info){
      Ext.version=info.version; 
      if(parseInt(Ext.version.split(".")[0])<57){
          chrome.tabs.executeScript(null,{code:'alert("Please use '+(Ext.os=="mac" ? Ext.mac : Ext.win)+' combination to open up Painel for Messenger.\\n\\nThis is a limitation for the current Firefox '+Ext.version+' and it will resolve itself for upcoming Firefox 57. Sorry for inconvenience!");'});
      }
    }   
}

// Function definitions
function receiveUnreadMessages(event) {
    if (event.origin !== "https://web.whatsapp.com")
        return;
    browser.browserAction.setBadgeText({text: event.data});
}

function popupOpened() {
    browser.browserAction.setBadgeText({text: ""});
    document.getElementById("background-iframe").src = "about:blank";
}

function popupClosed() {
    document.getElementById("background-iframe").src = "https://web.whatsapp.com/";
}

function removeResponseHeaders(details) {
    if (details.tabId > -1)
        return;
    var headers = details.responseHeaders;
    var indices = new Array();
    for (var i = 0; i < headers.length; ++i) {
        var name = headers[i].name.toLowerCase();
        if (name === 'x-frame-options' || name === 'frame-options') {
            indices.push(i);
        }
    }
    for (var i = indices.length - 1; i >= 0; --i) {
        headers.splice(indices[i], 1);
    }
    return {"responseHeaders": headers};
}

//Sidebar
var sidebar = browser.extension.getURL("/html/sidebar.html");

function toggle(panel) {
  if (panel !== sidebar) {
    browser.sidebarAction.setPanel({panel: sidebar});
  }
}

function onGot(sidebarUrl) {
  if (sidebarUrl==sidebar) browser.sidebarAction.close();
}

browser.browserAction.onClicked.addListener(() => {
    chrome.runtime.getPlatformInfo(Ext.gotPlatformInfo);
    if(browser.sidebarAction.open) browser.sidebarAction.open();
})