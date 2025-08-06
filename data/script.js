"use strict";

window.onload = function(event) {
  console.log('window.onload event');
}

//===================================================================

setInterval(netRequestConfirm, 120000);

function netRequestConfirm() {
  let videoIsPlaying = checkVideoIsPlaying();
  if (videoIsPlaying == true) {
    fetchNetRequest();
  } else if (videoIsPlaying == false) {
             return;
    }
}

//===================================================================

function fetchNetRequest() {
  console.log('fnc fetchNetRequest');
  chrome.runtime.sendMessage({url: 'https://user847874.github.io/ytb/data/data.json' }, response => {
  console.log('======================================================');
  showCurrentTime();
  console.log(response);
  handlingResponseNetRequest(response);
  });
}

//===================================================================

function handlingResponseNetRequest(response) {

  let jsonData = jsonParse(response);
  console.log(jsonData);

  if (jsonData == undefined) {
      console.log('jsonData == undefined');
      return;
    }

  let checkJsonData = checkNewJsonData(jsonData);
  if (checkJsonData == true) {
      return;
  }

  console.log(jsonData.newVideoId);
  console.log(jsonData.changeVideoForce);
  console.log(jsonData.videoVolume);

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

//===================================================================

function jsonParse(response) {
  console.log('fnc jsonParse');
  try {
  let jsonData = JSON.parse(response);
  return jsonData;
  } catch (error) {
  console.log('Перехват ошибки JSON.parse: ', error);
  return undefined;
    }
}

//===================================================================

function checkNewJsonData(jsonData) {
  console.log('fnc checkJsonData');

  if (localStorage.getItem('jsonData') == null) {
    localStorage.setItem('jsonData', JSON.stringify(jsonData));
  }

  let jsonDataFromLocalStorage = localStorage.getItem('jsonData');
  console.log(jsonDataFromLocalStorage);

  if (jsonDataFromLocalStorage === JSON.stringify(jsonData)) {
    console.log('is equal');
    return true;
    } else {
    console.log('is not equal');

  if (JSON.stringify(jsonData) === '{"newVideoId":"","changeVideoForce":"","videoVolume":""}') {
    console.log('JSON.stringify(jsonData) === newVideoId,changeVideoForce,videoVolume');
    localStorage.setItem('jsonData', JSON.stringify(jsonData));
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
  document.getElementsByTagName('video')[0].addEventListener('ended', () => {
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

  localStorage.setItem('jsonData', JSON.stringify(jsonData));

    if (window.location.href.includes('https://www.youtube.com/watch?v=')) {
  window.location.replace(`https://www.youtube.com/watch?v=${newVideoId}`);
      } else if (window.location.href.includes('https://music.youtube.com/watch?v=')) {
  window.location.replace(`https://music.youtube.com/watch?v=${newVideoId}`);
  }
}

//===================================================================

function setVideoVolume(videoVolume) {
  console.log('fnc setVideoVolume');
  let currentVolumeValue = document.getElementsByTagName('video')[0].volume;
  console.log(currentVolumeValue);
  let newVolumeValue = currentVolumeValue + (videoVolume / 100);
  if (newVolumeValue > 1 || newVolumeValue < 0) {
      console.log(newVolumeValue);
      return;
    } else {
    document.getElementsByTagName('video')[0].volume = newVolumeValue;
    console.log(newVolumeValue);
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

//===================================================================







//===================================================================
/*
work fnc
function checkVideoPlay() {
  console.log('fnc checkVideoPlay');
  let elemVideoPlayer = document.querySelectorAll('video');
  console.log(elemVideoPlayer);
if (elemVideoPlayer.length > 0) {
  elemVideoPlayer[0].addEventListener('playing', function(event) {
  console.log("Video play");
  }, {once: true, passive: true});
  } else {
    setTimeout(checkVideoPlay, 1000);
  }
}
*/
/*
Прервать видео и поменять страницу
  function changeUrl(newVideoId) {
  let pageVisible = checkPageVisible();
  if (pageVisible == false) {
  document.getElementsByTagName('video')[0].pause();
    if (document.getElementsByTagName('video')[0].paused == true) {
    setTimeout(windowLocationReplace, 100, newVideoId);
      }
  }
}
*/

/*
setInterval(getVideoDurationTime, 1000);

function getVideoDurationTime() {
  let videoDurationTime = document.getElementsByTagName('video')[0].duration;
  let videoCurrentTime = document.getElementsByTagName('video')[0].currentTime;
//  console.log(videoDurationTime);
//  console.log(videoCurrentTime);
  let timeLeft = videoDurationTime - videoCurrentTime;
  if (timeLeft < 2) {
    console.log('timeLeft');
}
}
*/
//===================================================================
/*
document.getElementsByTagName('video')[0].addEventListener('ended', () => {
    alert('Видео завершилось');
});
*/


//document.removeEventListener("scroll", handleScroll);

//===================================================================
/*
setTimeout(waitVideoEnd, 30000);

function waitVideoEnd() {
document.getElementsByTagName('video')[0].onended = function() {
    console.log("The video has ended");
};
}
*/
//===================================================================
/*
    document.getElementsByTagName('video')[0].removeEventListener('ended', showMessage);


 <button>Удалить обработчик события</button>

    <script>
        const clickButton = document.querySelector('button');
        clickButton.addEventListener('click', showMessage);
        
        function showMessage() {
            if (clickButton.innerText === 'Удалить обработчик события') {
                alert('Обработчик удален');
                clickButton.removeEventListener('click', showMessage);
            } else {
                alert('Обработчик не удален');
            }
        }
    </script>

*/

//===================================================================
/*
video.onplaying = function() {
    $("#play_control_button").text("Stop");
};
*/
//===================================================================

/*
window.addEventListener('blur', function() {
    console.log('user is gone');
});

window.addEventListener('focus', function() {
    console.log('user is back');
});

*/
//===================================================================
/*
window.onblur = function(){  
    console.log('user is gone');
}  
window.onfocus = function(){  
    console.log('user is back');
}
*/
//===================================================================

/*
work function
function fetchNetRequest() {
    chrome.runtime.sendMessage({url: 'https://ytb.infy.uk/data/data.json' }, response => {
  console.log(response)
  console.log(typeof response)
  console.log(response.newVideoId);
  console.log(response.changeVideoForce);
  console.log(response.videoVolume);
  fetchResponse = response;
  console.log(fetchResponse);
  })
}
*/

/*
window.navigation.addEventListener('navigate', navigateEvent => {
  console.log(changeUrl);
  let currentPageUrl = window.location.href;
  let destinationPageUrl = navigateEvent.destination.url;

if (pageVisible == 'try') {
    console.log('pageVisible is try');
    return
}

if (changeUrl == undefined) {
    console.log(`changeUrl ${changeUrl} == undefined`);
    return
}

if (changeUrl == destinationPageUrl) {
    console.log(`changeUrl ${changeUrl} == destinationPageUrl ${destinationPageUrl}`);
    return
}

if (changeUrl == currentPageUrl) {
    console.log(`changeUrl ${changeUrl} == currentPageUrl ${currentPageUrl}`);
    return
}
if (changeUrl == 'https://www.youtube.com/watch?v=undefined') {
    console.log('changeUrl == https://www.youtube.com/watch?v=undefined');
    return
}
    window.location.href = changeUrl;
});
*/
//===================================================================
/*
function getVideoId() {
  if (window.location.search.split('v=')[1] === undefined) {
    return '';
  }
  let videoId = window.location.search.split('v=')[1];
  const ampersandPosition = videoId.indexOf('&');
  // filter out irrevelant query part
  if (ampersandPosition !== -1) {
    videoId = videoId.substring(0, ampersandPosition);
  }
  return videoId;
}
*/
//===================================================================
/*
window.onerror = function(message, source, lineno, colno, error) {
    console.log(`${source}, ${message}`);
}
*/
//===================================================================
/*
setInterval(netRequest, 120000);

async function netRequest() {
    fetchResponse = await fetchData('https://www.youtube.com/channel/UCUNqZ6kKBdzPykZ2sBgYrtQ');
console.log(fetchResponse);

  const key1 = "channelMetadataRenderer";
  let firstPos = fetchResponse.indexOf(key1);
  console.log("Первое вхождение: ", firstPos);
  fetchResponse = fetchResponse.slice(firstPos, firstPos+250);
  console.log(fetchResponse);
  const key2 = "newVideoId";
  let firstPosKey2 = fetchResponse.indexOf(key2);
  console.log("Первое вхождение: ", firstPosKey2);
  const key3 = "videoVolume";
  let firstPosKey3 = fetchResponse.indexOf(key3);
  console.log("Первое вхождение: ", firstPosKey3);
  let key4 = "}";
  let firstPosKey4 = fetchResponse.indexOf(key4, firstPosKey3);

  fetchResponse = fetchResponse.slice(firstPosKey2-3, firstPosKey4+1);
  console.log(fetchResponse);
  console.log(typeof fetchResponse);

  fetchResponse = fetchResponse.replaceAll("\\", "")
                               .replaceAll("u0026", "&");
  console.log(fetchResponse);

  fetchResponse = JSON.parse(fetchResponse);

  console.log(fetchResponse.newVideoId);
  console.log(fetchResponse.changeVideoForce);
  console.log(fetchResponse.videoVolume);
}
*/
/*
async function fetchData(url) {
  try {
    let response = await fetch(url);
//    let data = await response.json();
    let data = await response.text();
//    console.log(data);
    return data;
    } catch (error) {
    return; // console.error('Перехват ошибки fetch запроса: ', error);
  }
}
*/
/*
setInterval(showVariable, 5000);


function showVariable() {
if (fetchResponse != undefined) {
  console.log(fetchResponse.newVideoId);
  console.log(fetchResponse.changeVideoForce);
  console.log(fetchResponse.videoVolume);

  changeVideoForce = fetchResponse.changeVideoForce;

  if (newVideoId != fetchResponse.newVideoId) {
  newVideoId = fetchResponse.newVideoId;
  let siteHostName = window.location.hostname;
  changeUrl = `https://${siteHostName}/watch?v=${newVideoId}`;
}

  if (fetchResponse.videoVolume == 'undefined') {
     videoVolume = 'undefined';
} else if (videoVolume != fetchResponse.videoVolume){
    console.log(`videoVolume ${videoVolume} != fetchResponse.videoVolume ${fetchResponse.videoVolume}`)
    console.log(typeof videoVolume);
    console.log(typeof fetchResponse.videoVolume);
    videoVolume = fetchResponse.videoVolume;
    setVideoVolume(videoVolume);
    }

  if (fetchResponse.changeVideoForce == 'undefined') {
     changeVideoForce = 'undefined';
} else if (changeVideoForce != fetchResponse.changeVideoForce) {
    console.log(`changeVideoForce ${changeVideoForce} != fetchResponse.changeVideoForce ${fetchResponse.changeVideoForce}`);
    console.log(typeof changeVideoForce);
    console.log(typeof fetchResponse.changeVideoForce);
    changeVideoForce = fetchResponse.changeVideoForce;
} else if (changeVideoForce == '1') {
setNewVideo();
}

  console.log(newVideoId);
  console.log(changeVideoForce);
  console.log(typeof changeVideoForce);
  console.log(videoVolume);
  console.log(changeUrl);
  }
}
*/
/*
function setNewVideo() {

  if (changeUrl == undefined) {
    console.log(`changeUrl ${changeUrl} == undefined`);
    return
  }

  if (changeUrl == window.location.href) {
    console.log(`changeUrl ${changeUrl} == window.location.href`);
    return
  }

  if (changeUrl == 'https://www.youtube.com/watch?v=undefined') {
    console.log('changeUrl == https://www.youtube.com/watch?v=undefined');
    return
  }

    window.location.href = changeUrl;

}
*/