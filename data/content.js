"use strict";

window.onload = function(event) {
  console.log('window.onload event');
//  setPlayerVolume();
//  eventPlayerLoadeddata();
//  eventVolumeChange();
//  removeItemYtPlayerVolumeFromStorage();
}

//===================================================================

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name === "netResponseFromBg") {
    showCurrentTime();
    console.log(request.response);
  let videoIsPlaying = checkVideoIsPlaying();
  if (videoIsPlaying == true) {
    let jsonData = request.response;
    handlingResponseNetRequest(jsonData);
  } else if (videoIsPlaying == false) {
             return;
        }
     }
  });

//===================================================================

function handlingResponseNetRequest(jsonData) {

  let checkJsonData = checkNewJsonData(jsonData);
  if (checkJsonData == true) {
      return;
  }

  console.log(jsonData.newVideoId);
  console.log(jsonData.nextVideoForce);
  console.log(jsonData.videoVolume);

  let newVideoId = jsonData.newVideoId;
  newVideoId = String(newVideoId);
  if (newVideoId.length > 0) {
      checkCurrentPageUrl(newVideoId, jsonData);
    }

  let videoVolume = jsonData.videoVolume;
  videoVolume = String(videoVolume);
  if (videoVolume.length > 0) {
      setVideoVolume(videoVolume, 100);
    }
}

//===================================================================

function checkNewJsonData(jsonData) {
  console.log('fnc checkJsonData');

  if (localStorage.getItem('yt-player-playlist') == null) {
    localStorage.setItem('yt-player-playlist', '{"newVideoId":"","nextVideoForce":"","videoVolume":""}');
  }

  let jsonDataFromLocalStorage = localStorage.getItem('yt-player-playlist');
  console.log(jsonDataFromLocalStorage);

  if (jsonDataFromLocalStorage === JSON.stringify(jsonData)) {
    console.log('is equal');
    return true;
    } else {
    console.log('is not equal');

  if (JSON.stringify(jsonData) === '{"newVideoId":"","nextVideoForce":"","videoVolume":""}') {
    localStorage.setItem('yt-player-playlist', JSON.stringify(jsonData));
    return;
  }

    return false;
  }
}

//===================================================================

function checkCurrentPageUrl(newVideoId, jsonData) {
    console.log(newVideoId);

    if (window.location.href.includes(newVideoId)) {
        console.log('if window.location.href.includes(newVideoId)');
      return;
  }

  let playlistId;
  if (newVideoId.includes('&list=')) {
    const separatorKey = "&list=";
    let separatorKeyPos = newVideoId.indexOf(separatorKey);
    playlistId = newVideoId.slice(separatorKeyPos+6);
  }

    if (window.location.href.includes(playlistId)) {
        console.log('if window.location.href.includes(playlistId)');
      return;
  }

        waitVideoEnd(newVideoId, jsonData);
}

//===================================================================

function waitVideoEnd(newVideoId, jsonData) {
  console.log('fnc waitVideoEnd');
  document.querySelector('video').addEventListener('ended', () => {
  console.log("The video has ended");
  changeUrl(newVideoId, jsonData);
  }, {once: true});
}

//===================================================================

  function changeUrl(newVideoId, jsonData) {
  console.log('fnc changeUrl');
  console.log(jsonData);
  let pageVisible = checkPageVisible();
  if (pageVisible == false) {
  windowLocationReplace(newVideoId, jsonData);
    }
}

//===================================================================

function checkPageVisible() {
  console.log('fnc checkPageVisible');
  let focused = document.hasFocus();
  return focused;
}

//===================================================================

function windowLocationReplace(newVideoId, jsonData) {
  console.log('fnc windowLocationReplace');

  localStorage.setItem('yt-player-playlist', JSON.stringify(jsonData));

    if (window.location.href.includes('https://www.youtube.com/watch?v=')) {
  window.location.replace(`https://www.youtube.com/watch?v=${newVideoId}`);
      } else if (window.location.href.includes('https://music.youtube.com/watch?v=')) {
  window.location.replace(`https://music.youtube.com/watch?v=${newVideoId}`);
  }
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

function checkVideoIsPlaying() {
if (!document.querySelector('video').paused &&
      !document.querySelector('video').ended) {
      return true;
} else {
    return false;
  }
}

//===================================================================

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    if (request.name === "msgFromBgLocationReplaceForce") {

      let newVideoId = request.newVideoId;
      windowLocationReplaceForce(newVideoId);
      }
});

//===================================================================

function windowLocationReplaceForce(newVideoId) {
  console.log('fnc windowLocationReplaceForce');
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

//===================================================================

function setPlayerVolume() {
  let volumeFromLocalStorage = localStorage.getItem('yt-player-current-volume');
  console.log(volumeFromLocalStorage);
  console.log(typeof volumeFromLocalStorage);

  if (volumeFromLocalStorage == null) {
    let currentVolume = document.querySelector('video').volume;
    localStorage.setItem('yt-player-current-volume', String(currentVolume));
    } else {
          document.querySelector('video').volume = volumeFromLocalStorage;
          }
}

function eventPlayerLoadeddata() {
  document.querySelector('video').addEventListener('loadeddata', function () {
  console.log('event player loadeddata');
  let volumeFromLocalStorage = localStorage.getItem('yt-player-current-volume');
  document.querySelector('video').volume = volumeFromLocalStorage;
  });
}

function eventVolumeChange() {
document.querySelector('video').addEventListener('volumechange', function () {
          let currentVolume = document.querySelector('video').volume;
          console.log(`volume ${currentVolume}`);
          localStorage.setItem('yt-player-current-volume', String(currentVolume));
          setTimeout(removeItemYtPlayerVolumeFromStorage, 1000)
  });
}

//===================================================================

function setVideoVolume(videoVolume, speedVolumeChange) {
  console.log('fnc setVideoVolume');

      console.log(videoVolume);

  let elemVideo = document.querySelector('video');
        console.log(elemVideo);
  let currentVolume = elemVideo.volume;
          console.log(currentVolume);
          console.log(typeof currentVolume);
  let newVolume = currentVolume + (videoVolume / 100);
          console.log(newVolume);
          console.log(typeof newVolume);
  if (newVolume > 0.95) {
    newVolume = 0.95;
          console.log(newVolume);
          console.log(typeof newVolume);
    } else if (newVolume < 0.01) {
    newVolume = 0.01;
          console.log(newVolume);
          console.log(typeof newVolume);
    };

    let intervalId = setInterval(function() {

    console.log('setInterval is work');

          console.log(`newVolume ${newVolume}`);
          console.log(typeof newVolume);
          console.log(`currentVolume ${currentVolume}`);
          console.log(typeof currentVolume);

  if (newVolume < currentVolume) {

          console.log('if (newVolume < currentVolume)');

      let calcNewVolume = elemVideo.volume - 0.01;
      console.log(calcNewVolume);
      if (calcNewVolume < newVolume) {
          clearInterval(intervalId);
          return;
          } else {
                elemVideo.volume = calcNewVolume;
};

    } else if (newVolume > currentVolume) {

          console.log('if (newVolume > currentVolume)');

      let calcNewVolume = elemVideo.volume + 0.01;
      if (calcNewVolume > newVolume) {
          clearInterval(intervalId);
          return;
          } else {
                elemVideo.volume = calcNewVolume;
};
}

}, speedVolumeChange);
}

//===================================================================

function removeItemYtPlayerVolumeFromStorage() {
  sessionStorage.removeItem('yt-player-volume');
  localStorage.removeItem('yt-player-volume');
}




