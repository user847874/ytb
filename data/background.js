chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  fetch("https://user847874.github.io/ytb/data/data.json")
    .then(res => {
    return res.text();
  }).then(res => {
    sendResponse(res);
  })
  return true
});
