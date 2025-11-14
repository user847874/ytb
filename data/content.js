"use strict";

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name === "netResponseFromBg") {
  let videoIsPlaying = checkVideoIsPlaying();
  if (videoIsPlaying == true) {
    let jsonData = request.response;
    handlingResponseNetRequest(jsonData);
  } else if (videoIsPlaying == false) {
             return;
        }
     }
  });

function handlingResponseNetRequest(jsonData) {
  let checkJsonData = checkNewJsonData(jsonData);
  if (checkJsonData == true) {
      return;
  }
  let newVideoId = jsonData.newVideoId;
  newVideoId = String(newVideoId);
  if (newVideoId.length > 0) {
      checkCurrentPageUrl(newVideoId, jsonData);
    }
}

function checkNewJsonData(jsonData) {
  if (localStorage.getItem('yt-player-playlist') == null) {
    localStorage.setItem('yt-player-playlist', '{"newVideoId":"","nextVideoForce":"","videoVolume":""}');
  }
  let jsonDataFromLocalStorage = localStorage.getItem('yt-player-playlist');
  if (jsonDataFromLocalStorage === JSON.stringify(jsonData)) {
    return true;
    } else {
  if (JSON.stringify(jsonData) === '{"newVideoId":"","nextVideoForce":"","videoVolume":""}') {
    localStorage.setItem('yt-player-playlist', JSON.stringify(jsonData));
    return;
  }
    return false;
  }
}

function checkCurrentPageUrl(newVideoId, jsonData) {
    if (window.location.href.includes(newVideoId)) {
      return;
  }
  let playlistId;
  if (newVideoId.includes('&list=')) {
    const separatorKey = "&list=";
    let separatorKeyPos = newVideoId.indexOf(separatorKey);
    playlistId = newVideoId.slice(separatorKeyPos+6);
  }
    if (window.location.href.includes(playlistId)) {
      return;
  }
        waitVideoEnd(newVideoId, jsonData);
}

function waitVideoEnd(newVideoId, jsonData) {
  document.querySelector('video').addEventListener('ended', () => {
  changeUrl(newVideoId, jsonData);
  }, {once: true});
}

  function changeUrl(newVideoId, jsonData) {
  let pageVisible = checkPageVisible();
  if (pageVisible == false) {
  windowLocationReplace(newVideoId, jsonData);
    }
}

function checkPageVisible() {
  let focused = document.hasFocus();
  return focused;
}

function windowLocationReplace(newVideoId, jsonData) {
  localStorage.setItem('yt-player-playlist', JSON.stringify(jsonData));
    if (window.location.href.includes('https://www.youtube.com/watch?v=')) {
  window.location.replace(`https://www.youtube.com/watch?v=${newVideoId}`);
      } else if (window.location.href.includes('https://music.youtube.com/watch?v=')) {
  window.location.replace(`https://music.youtube.com/watch?v=${newVideoId}`);
  }
}

function checkVideoIsPlaying() {
if (!document.querySelector('video').paused &&
      !document.querySelector('video').ended) {
      return true;
} else {
    return false;
  }
}

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name === "msgFromBgLocationReplaceForce") {
      let newVideoId = request.newVideoId;
      windowLocationReplaceForce(newVideoId);
      }
});

function windowLocationReplaceForce(newVideoId) {
    if (window.location.href.includes('https://www.youtube.com/watch?v=')) {
  window.location.replace(`https://www.youtube.com/watch?v=${newVideoId}`);
      } else if (window.location.href.includes('https://music.youtube.com/watch?v=')) {
  let videoIsPlaying = checkVideoIsPlaying();
      if (videoIsPlaying == true) {
          let elemVideo = document.querySelector('video');
          elemVideo.pause();
          elemVideo.addEventListener('pause', function () {
       window.location.replace(`https://music.youtube.com/watch?v=${newVideoId}`);
  });
     } else if (videoIsPlaying == false) {
       window.location.replace(`https://music.youtube.com/watch?v=${newVideoId}`);
        }
  }
}
