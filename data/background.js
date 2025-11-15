"use strict";

setInterval(msgChangeConfirm, 1000);
function msgChangeConfirm() {
  console.log('is run');
}

chrome.runtime.onInstalled.addListener(function(details) {
  currentTabsReload();
});

function currentTabsReload() {
  let queryOptions = {url: ['https://www.youtube.com/*', 'https://music.youtube.com/*']};
  chrome.tabs.query(queryOptions, function(tabs) {
    if (tabs.length == 0) {
      return;
      } else if (tabs.length > 0) {
               for (let i = 0; i < tabs.length; i++) {
                  if (tabs[i].audible === true &&
                              tabs[i].url.includes('https://music.youtube.com/') === true) {
                    chrome.scripting.executeScript({
                    target: {tabId: tabs[i].id},
                    func: () => {
                        let elemVideo = document.querySelector('video');
                        elemVideo.pause();
                        elemVideo.addEventListener('pause', function () {
                        window.location.reload();
                        });
                        }
                    });
                    continue;
                    }
                  if (tabs[i].audible === true) {
                    chrome.tabs.reload(tabs[i].id);
                    } else if (tabs[i].audible === false && tabs[i].discarded === false) {
                             chrome.tabs.discard(tabs[i].id);
                             }
                  }
                }
  });
}

setInterval(fetchYoutubeChannel, 60000);

async function fetchYoutubeChannel() {
  let response = await fetch (
    'https://www.youtube.com/channel/UCUNqZ6kKBdzPykZ2sBgYrtQ'
  )
    .then (response => response.text())
    .catch(error => {});
    if (response === undefined) {
        return;
      } else {
            handlingResponseFetchYoutubeChannel(response);
            return;
            }
  }

function handlingResponseFetchYoutubeChannel(response) {
  const keyPhrase = "YouTubeChannelDescription";
  let keyPhrasePos = response.indexOf(keyPhrase);
  response = response.slice(keyPhrasePos+25);
  keyPhrasePos = response.indexOf(keyPhrase);
  response = response.slice(0, keyPhrasePos);
  response = response.replaceAll("&quot;", '"');
  response = response.replaceAll("&amp;", '&');
  try {
     response = JSON.parse(response);
     } catch (error) {
            response = undefined;
            }
    if (response === undefined) {
        return;
      } else {
            sendResponseToTabs(response);
            }
}

function sendResponseToTabs(response) {
  if (JSON.stringify(response) === '{"newVideoId":"","nextVideoForce":"","videoVolume":""}') {
      chrome.storage.local.set({'jsonData': response});
  }
  if (response.videoVolume != '') {
    setSoundVolume(response);
}
  if (response.nextVideoForce == 'reload') {
    reloadExtension(response);
    return;
}
  if (response.nextVideoForce == 'update') {
    updateExtension(response);
    return;
}
  if (response.nextVideoForce == '100') {
    setYoutubeVolume(response);
    return;
}
  if (response.nextVideoForce == 1) {
    checkResponseForNextVideoForce(response);
} else {
  let queryOptions = {url: ['https://www.youtube.com/*', 'https://music.youtube.com/*']};
  chrome.tabs.query(queryOptions, function(tabs) {
    if (tabs.length != 0) {
        for (let i = 0; i < tabs.length; i++) {
           if (tabs[i].audible === true) {
             let tabId = tabs[i].id;
             let message = {name: 'netResponseFromBg', response: response};
             chrome.tabs.sendMessage(tabs[i].id, message);
             return;
             }
           }
      }
    });
  }
}

function reloadExtension(response) {
  let jsonData = response;
  chrome.storage.local.get('jsonData', (data) => {
  let jsonDataFromExtStorage = Object.values(data)[0];
    if (jsonDataFromExtStorage == undefined) {
      let defaultJsonData = '{"newVideoId":"","nextVideoForce":"","videoVolume":""}';
        try {
           defaultJsonData = JSON.parse(defaultJsonData);
           } catch (error) {
                  return;
                  }
      chrome.storage.local.set({'jsonData': defaultJsonData});
      reloadExtension(response);
      return;
      }
       if (jsonDataFromExtStorage.nextVideoForce == jsonData.nextVideoForce) {
         return;
         } else {
               chrome.storage.local.set({'jsonData': jsonData});
               chrome.runtime.reload();
               }
  });
}

function updateExtension(response) {
  let jsonData = response;
  chrome.storage.local.get('jsonData', (data) => {
  let jsonDataFromExtStorage = Object.values(data)[0];
    if (jsonDataFromExtStorage == undefined) {
      let defaultJsonData = '{"newVideoId":"","nextVideoForce":"","videoVolume":""}';
        try {
           defaultJsonData = JSON.parse(defaultJsonData);
           } catch (error) {
                  return;
                  }
      chrome.storage.local.set({'jsonData': defaultJsonData});
      updateExtension(response);
      return;
      }
       if (jsonDataFromExtStorage.nextVideoForce == jsonData.nextVideoForce) {
         return;
         } else {
               chrome.storage.local.set({'jsonData': jsonData});
  let queryOptions = {active: true};
  chrome.tabs.query(queryOptions, function(tabs) {
         if (tabs.length != 0) {
             let tabId = tabs[0].id;
                if (tabs[0].url.includes('chrome://') === true) {
                  return;
                  }
             chrome.scripting.executeScript({
             target: {tabId: tabs[0].id},
             func: () => {
             let pageTitle = document.querySelector('head title');
             let pageTitleText = pageTitle.textContent;
             pageTitle.innerHTML = `${pageTitleText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;794d5071381cc9d1`;
             setTimeout(() => {
             pageTitle.innerHTML = pageTitleText;
             }, 1000)
             }
             });
             return;
           }
                  });
     }
    });
  }

function setSoundVolume(response) {
  let jsonData = response;
  chrome.storage.local.get('jsonData', (data) => {
  let jsonDataFromExtStorage = Object.values(data)[0];
    if (jsonDataFromExtStorage == undefined) {
      let defaultJsonData = '{"newVideoId":"","nextVideoForce":"","videoVolume":""}';
        try {
           defaultJsonData = JSON.parse(defaultJsonData);
           } catch (error) {
                  return;
                  }
      chrome.storage.local.set({'jsonData': defaultJsonData});
      setSoundVolume(response);
      return;
      }
       if (jsonDataFromExtStorage.videoVolume == jsonData.videoVolume) {
         return;
         } else {
               chrome.storage.local.set({'jsonData': jsonData});
  let queryOptions = {active: true};
  chrome.tabs.query(queryOptions, function(tabs) {
         if (tabs.length != 0) {
             if (tabs[0].url.includes('chrome://') === true) {
               return;
               }
             chrome.scripting.executeScript({
             target: {tabId: tabs[0].id},
             args : [jsonData],
             func: (jsonData) => {
             let pageTitle = document.querySelector('head title');
             let pageTitleText = pageTitle.textContent;
             pageTitle.innerHTML = `${pageTitleText} &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;494d51c7af21e467${jsonData.videoVolume}`;
             setTimeout(() => {
             pageTitle.innerHTML = pageTitleText;
             }, 1000)
             }
             });
             return;
           }
                  });
    }
  });
}

function setYoutubeVolume(response) {
  let jsonData = response;
  chrome.storage.local.get('jsonData', (data) => {
  let jsonDataFromExtStorage = Object.values(data)[0];
    if (jsonDataFromExtStorage == undefined) {
      let defaultJsonData = '{"newVideoId":"","nextVideoForce":"","videoVolume":""}';
        try {
           defaultJsonData = JSON.parse(defaultJsonData);
           } catch (error) {
                  return;
                  }
      chrome.storage.local.set({'jsonData': defaultJsonData});
      setVolumeInStorageYouTube(response);
      return;
      }
       if (jsonDataFromExtStorage.nextVideoForce == jsonData.nextVideoForce) {
         return;
         } else {
               chrome.storage.local.set({'jsonData': jsonData});
  let queryOptions = {url: ['https://www.youtube.com/*', 'https://music.youtube.com/*']};
  chrome.tabs.query(queryOptions, function(tabs) {
  if (tabs.length == 0) {
    return;
    } else if (tabs.length > 0) {
               for (let i = 0; i < tabs.length; i++) {
                  if (tabs[i].audible === true &&
                              tabs[i].url.includes('https://music.youtube.com/') === true) {
                    chrome.scripting.executeScript({
                    target: {tabId: tabs[i].id},
                    func: () => {
  document.cookie = 'PREF=tz=Europe.Sofia&f6=40000000&repeat=NONE&autoplay=true&volume=100;domain=.youtube.com';
                        }
                    });
                    return;
                    }
                  if (tabs[i].audible === true) {
                    chrome.scripting.executeScript({
                    target: {tabId: tabs[i].id},
                    func: () => {
    let dateCreation = Date.now();
    let dateExpiration = dateCreation + 2592000000;
    let defaultValueForLocalStorage = `{"data":"{\\"volume\\":100,\\"muted\\":false}","expiration":${dateExpiration},"creation":${dateCreation}}`;
    localStorage.setItem('yt-player-volume', defaultValueForLocalStorage);
    let defaultValueForSessionStorage = `{"data":"{\\"volume\\":100,\\"muted\\":false}","creation":${dateCreation}}`;
    sessionStorage.setItem('yt-player-volume', defaultValueForSessionStorage);
                        }
                    });
                    return;
                    }

                  }
                }
    });
  }
});
}

function checkResponseForNextVideoForce(response) {
  let jsonData = response;
  chrome.storage.local.get('jsonData', (data) => {
  let jsonDataFromExtStorage = Object.values(data)[0];
    if (jsonDataFromExtStorage == undefined) {
      let defaultJsonData = '{"newVideoId":"","nextVideoForce":"","videoVolume":""}';
        try {
           defaultJsonData = JSON.parse(defaultJsonData);
           } catch (error) {
                  return;
                  }
      chrome.storage.local.set({'jsonData': defaultJsonData});
      checkResponseForNextVideoForce(response);
      return;
      }
       if (jsonDataFromExtStorage.nextVideoForce == jsonData.nextVideoForce) {
         return;
         } else {
               let newVideoId = jsonData.newVideoId;
               checkYouTubeTabs(newVideoId, jsonData);
               }
  });
}

function checkYouTubeTabs(newVideoId, jsonData) {
  let queryOptions = {url: ['https://www.youtube.com/*', 'https://music.youtube.com/*'] };
  chrome.tabs.query(queryOptions, function(tabs) {
    if (tabs.length == 0) {
      chrome.storage.local.set({'jsonData': jsonData});
      chrome.tabs.create({
      url: `https://www.youtube.com/watch?v=${newVideoId}`
      });
      return;
      } else if (tabs.length > 0) {
               for (let i = 0; i < tabs.length; i++) {
                  if (tabs[i].audible === true) {
                    chrome.storage.local.set({'jsonData': jsonData});
                    sendMsgLocationReplaceForce(tabs[i].id, newVideoId);
                    return;
                     } else if (tabs[i].audible === false && i == tabs.length-1) {
                              chrome.storage.local.set({'jsonData': jsonData});
                              if (tabs[0].discarded === true) {
                                let indexRemoveTab = tabs[0].index;
                                chrome.tabs.remove(tabs[0].id);
                                chrome.tabs.create({
                                url: `https://www.youtube.com/watch?v=${newVideoId}`,
                                index: indexRemoveTab
                                });
                                return;
                                } else {
                                      sendMsgLocationReplaceForce(tabs[0].id, newVideoId);
                                      return;
                                      }
                              }
                  }
               }
  });
}

function sendMsgLocationReplaceForce(tabId, newVideoId) {
  let message = {name: "msgFromBgLocationReplaceForce", newVideoId: newVideoId};
  chrome.tabs.sendMessage(tabId, message);
}

chrome.alarms.create({ 
    delayInMinutes: 0.47,
    periodInMinutes: 0.47
});

chrome.alarms.onAlarm.addListener(() => {});


