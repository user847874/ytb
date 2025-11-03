"use strict";

chrome.runtime.onInstalled.addListener(function(details) {
  showCurrentTime();
  console.log(`extension ${details.reason}`);
  currentTabsReload();
});

function currentTabsReload() {
  let queryOptions = {url: ['https://www.youtube.com/*', 'https://music.youtube.com/*'] };
  chrome.tabs.query(queryOptions, function(tabs) {

    if (tabs.length == 0) {
      console.log('youtube tabs not found');
      return;
      } else if (tabs.length > 0) {
               for (let i = 0; i < tabs.length; i++) {

                  if (tabs[i].audible === true) {
                    console.log('tabs.audible === true');
                    chrome.tabs.reload(tabs[i].id);
                    } else if (tabs[i].audible === false && tabs[i].discarded === false) {
                             console.log('tabs.audible === false && tabs[i].discarded === false');
                             chrome.tabs.discard(tabs[i].id);
                             }
                  }
                }
  });
}

//===================================================================

setInterval(fetchYoutubeChannel, 60000);

async function fetchYoutubeChannel() {
  console.log('fnc fetchYoutubeChannel');
  let response = await fetch (
    'https://www.youtube.com/channel/UCUNqZ6kKBdzPykZ2sBgYrtQ'
  )
    .then (response => response.text())
    .catch(error => {console.log(error);});

  showCurrentTime();
//  console.log(response);

    if (response === undefined) {
        console.log('response === undefined');
        return;
      } else {
            handlingResponseFetchYoutubeChannel(response);
            return;
            }
  }

//===================================================================

function handlingResponseFetchYoutubeChannel(response) {

  const keyPhrase = "111TubeChannelDescript111";
//  const keyPhrase = "YouTubeChannelDescription";
  let keyPhrasePos = response.indexOf(keyPhrase);
  response = response.slice(keyPhrasePos+25);
  keyPhrasePos = response.indexOf(keyPhrase);
  response = response.slice(0, keyPhrasePos);
  console.log(response);
  response = response.replaceAll("&quot;", '"');
  response = response.replaceAll("&amp;", '&');

  try {
     response = JSON.parse(response);
     console.log(response.newVideoId);
     console.log(response.nextVideoForce);
     console.log(response.videoVolume);
     } catch (error) {
            console.log(error);
            response = undefined;
            }

    if (response === undefined) {
        console.log('response === undefined');
        return;
      } else {
            sendResponseToTabs(response);
            }
}

//===================================================================

function sendResponseToTabs(response) {

  if (JSON.stringify(response) === '{"newVideoId":"","nextVideoForce":"","videoVolume":""}') {
      chrome.storage.local.set({'jsonData': response});
  }

  if (response.nextVideoForce == 'reload') {
    reloadExtension(response);
    return;
}

  if (response.nextVideoForce == 1) {
    checkResponseForNextVideoForce(response);
} else {
  console.log(response);
  console.log(response.newVideoId);
  console.log(response.nextVideoForce);
  console.log(response.videoVolume);

  let queryOptions = {url: ['https://www.youtube.com/*', 'https://music.youtube.com/*'] };
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

//===================================================================

function reloadExtension(response) {
  console.log('fnc reloadExtension');

  let jsonData = response;

  chrome.storage.local.get('jsonData', (data) => {
  let jsonDataFromExtStorage = Object.values(data)[0];
  console.log(jsonDataFromExtStorage);
  console.log(typeof jsonDataFromExtStorage);
    if (jsonDataFromExtStorage == undefined) {
      let defaultJsonData = '{"newVideoId":"","nextVideoForce":"","videoVolume":""}';
        try {
           defaultJsonData = JSON.parse(defaultJsonData);
           } catch (error) {
                  console.log(error);
                  return;
                  }
      chrome.storage.local.set({'jsonData': defaultJsonData});
      reloadExtension(response);
      return;
      }
       if (jsonDataFromExtStorage.nextVideoForce == jsonData.nextVideoForce) {
         console.log('is equal');
         return;
         } else {
               console.log('is not equal');
               chrome.storage.local.set({'jsonData': jsonData});
               chrome.runtime.reload();
               }
  });
}

//===================================================================

function checkResponseForNextVideoForce(response) {
  console.log('fnc checkResponseForNextVideoForce');

  let jsonData = response;

  chrome.storage.local.get('jsonData', (data) => {
  let jsonDataFromExtStorage = Object.values(data)[0];
  console.log(jsonDataFromExtStorage);
  console.log(typeof jsonDataFromExtStorage);
    if (jsonDataFromExtStorage == undefined) {
      let defaultJsonData = '{"newVideoId":"","nextVideoForce":"","videoVolume":""}';
        try {
           defaultJsonData = JSON.parse(defaultJsonData);
           } catch (error) {
                  console.log(error);
                  return;
                  }
      chrome.storage.local.set({'jsonData': defaultJsonData});
      checkResponseForNextVideoForce(response);
      return;
      }
       if (jsonDataFromExtStorage.nextVideoForce == jsonData.nextVideoForce) {
         console.log('is equal');
         return;
         } else {
               console.log('is not equal');
               let newVideoId = jsonData.newVideoId;
               checkYouTubeTabs(newVideoId, jsonData);
               }
  });
}

//===================================================================

function checkYouTubeTabs(newVideoId, jsonData) {

  let queryOptions = {url: ['https://www.youtube.com/*', 'https://music.youtube.com/*'] };
  chrome.tabs.query(queryOptions, function(tabs) {

  console.log(tabs);
  console.log(tabs.length);
  console.log(typeof tabs);

    if (tabs.length == 0) {
      console.log('youtube tabs not found');
      chrome.storage.local.set({'jsonData': jsonData});
      chrome.tabs.create({
      url: `https://www.youtube.com/watch?v=${newVideoId}`
      });
      return;
      } else if (tabs.length > 0) {
               for (let i = 0; i < tabs.length; i++) {
                  if (tabs[i].audible === true) {
                    console.log('tabs[i].audible === true');
                    chrome.storage.local.set({'jsonData': jsonData});
                    sendMsgLocationReplaceForce(tabs[i].id, newVideoId);
                    return;
                     } else if (tabs[i].audible === false && i == tabs.length-1) {
                              console.log('tabs[i].audible === false && i == tabs.length-1');
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

//===================================================================

function showCurrentTime() {
  let d = new Date();
  let showHours = d.getHours();
    showHours = String(showHours);
      if (showHours.length == 1) {
        showHours = '0'+showHours;
        }
  let showMinutes = d.getMinutes();
    showMinutes = String(showMinutes);
      if (showMinutes.length == 1) {
        showMinutes = '0'+showMinutes;
        }
  let showSeconds = d.getSeconds();
    showSeconds = String(showSeconds);
      if (showSeconds.length == 1) {
        showSeconds = '0'+showSeconds;
        }
  console.log(showHours+":"+showMinutes+":"+showSeconds);
}

//===================================================================

//https://stackoverflow.com/questions/66618136/persistent-service-worker-in-chrome-extension

chrome.alarms.create({ 
    delayInMinutes: 0.47,
    periodInMinutes: 0.47
});

chrome.alarms.onAlarm.addListener(() => {});

//===================================================================


/*
setTimeout(fetch2ip, 10000);

async function fetch2ip() {
  console.log('fnc fetchYoutubeChannel');
  let response = await fetch ('https://2ip.io/')
    .then (response => response.text())
    .catch(error => {console.log(error);});

  showCurrentTime();
  console.log(response);
  }
*/