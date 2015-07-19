(function () {

  if (window.top !== window) {
    return;
  }

  chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
    if (request.command) {
      switch(request.command) {
        case 'a11yCheck':
          var options = {};
          if(request.rules!=null && request.rules.length>0){
            options = {runOnly: {type: "rule",values: request.rules }};
          }
          
          axe.a11yCheck(document, options, function (results) {
            results.url = window.location.href;
            sendResponse(results);
          });
          return true;
        case 'loadRules':
          var result = axe.getRules()
          sendResponse(result);
          return true;
        case 'tool':
          axe.tool(request.tool, request.selector, {}, function (result) {
            sendResponse(result);
          });
          return true;
      }
    }
  });

}());
