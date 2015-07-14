
function callEngine(message, callback) {
  chrome.tabs.executeScript(message.tabId, {
    file: 'scripts/content.js',
    allFrames: true,
    matchAboutBlank: true,
    runAt: 'document_start'
  }, function () {
    chrome.tabs.sendMessage(message.tabId, message, function (results) {
      callback({ err: chrome.runtime.lastError, result: results });
    });
  });
  return true;
}


chrome.runtime.onMessage.addListener(function (message, sender, callback) {
  switch (message.command) {
    case 'a11yCheck':
    case 'tool':
    case 'loadRules':
      return callEngine(message, callback);
  }
});
