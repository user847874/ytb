chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
  fetch('https://ytb.infy.uk/data/data.json')
    .then(res => {
    return res.text();
  }).then(res => {
    sendResponse(res);
  })
  return true
});
