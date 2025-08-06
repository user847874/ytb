"use strict";

window.onload = function(event) {
  console.log('window.onload event');
}

setInterval(netRequestConfirm, 120000);

function netRequestConfirm() {
  let videoIsPlaying = checkVideoIsPlaying();
  if (videoIsPlaying == true) {
    fetchNetRequest();
  } else if (videoIsPlaying == false) {
             return;
    }
}

function fetchNetRequest() {
  console.log('fnc fetchNetRequest');
  chrome.runtime.sendMessage({url: 'https://user847874.github.io/ytb/data/data.json' }, response => {
  handlingResponseNetRequest(response);
  });
}

function handlingResponseNetRequest(response) {

  let jsonData = jsonParse(response);

  if (jsonData == undefined) {
      console.log('jsonData == undefined');
      return;
    }

  let checkJsonData = checkNewJsonData(jsonData);
  if (checkJsonData == true) {
      return;
  }

  let newVideoId = jsonData.newVideoId;
  newVideoId = String(newVideoId);
  if (newVideoId.length > 0) {
      checkCurrentPageUrl(newVideoId, jsonData);
    }

  let changeVideoForce = jsonData.changeVideoForce;
  changeVideoForce = String(changeVideoForce);

  let videoVolume = jsonData.videoVolume;
  videoVolume = String(videoVolume);
  if (videoVolume.length > 0) {
      setVideoVolume(videoVolume);
    }
}

function jsonParse(response) {
  try {
  let jsonData = JSON.parse(response);
  return jsonData;
  } catch (error) {
  return undefined;
    }
}

function checkNewJsonData(jsonData) {

  if (localStorage.getItem('jsonData') == null) {
    localStorage.setItem('jsonData', JSON.stringify(jsonData));
  }

  let jsonDataFromLocalStorage = localStorage.getItem('jsonData');

  if (jsonDataFromLocalStorage === JSON.stringify(jsonData)) {
    return true;
    } else {

  if (JSON.stringify(jsonData) === '{"newVideoId":"","changeVideoForce":"","videoVolume":""}') {
    localStorage.setItem('jsonData', JSON.stringify(jsonData));
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
  document.getElementsByTagName('video')[0].addEventListener('ended', () => {
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

  localStorage.setItem('jsonData', JSON.stringify(jsonData));

    if (window.location.href.includes('https://www.youtube.com/watch?v=')) {
  window.location.replace(`https://www.youtube.com/watch?v=${newVideoId}`);
      } else if (window.location.href.includes('https://music.youtube.com/watch?v=')) {
  window.location.replace(`https://music.youtube.com/watch?v=${newVideoId}`);
  }
}

function setVideoVolume(videoVolume) {
  let currentVolumeValue = document.getElementsByTagName('video')[0].volume;
  let newVolumeValue = currentVolumeValue + (videoVolume / 100);
  if (newVolumeValue > 1 || newVolumeValue < 0) {
      return;
    } else {
    document.getElementsByTagName('video')[0].volume = newVolumeValue;
          }
}

function checkVideoIsPlaying() {
  let videoIsPlaying;
if (!document.querySelector('video').paused &&
      !document.querySelector('video').ended) {
    videoIsPlaying = true;
    return videoIsPlaying;
} else {
    videoIsPlaying = false;
    return videoIsPlaying;
  }
}
