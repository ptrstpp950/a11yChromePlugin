function renderError(e, transport) {
  var manifest = chrome.runtime.getManifest();
  var message = '<h1>Oops</h1>';
  if (transport) {
    message += '<p>A transport error occurred. If you want to analyze local files, you must enable "Allow access to file URLs" ' +
      'on the Chrome Extensions page for ' + manifest.name + '.';
  } else {
    message += '<p>Did you try turning it off and again?</p>';
  }
  message += '<pre>' + e.message;
  message += e.stack ? '\n\n' + e.stack + '</pre>' : '</pre>';
  results.innerHTML = message;
}

function getCheckboxesValues(groupName){
  var checkboxes = document.querySelectorAll('input[name='+groupName+']:checked');
  var val = [];
  for (var i=0, n=checkboxes.length;i<n;i++) {
    if (checkboxes[i].checked) 
    {
      val.push(checkboxes[i].value);
    }
  }
  return val;
}
function loadRules(){
  chrome.runtime.sendMessage({
      command: 'loadRules',
      tabId: chrome.devtools.inspectedWindow.tabId
    }, function(result) {
      
        
        var savedRules = localStorage["rules"];
        var selectAll = false;
        if(savedRules == null || savedRules.length==0){
          selectAll = true;
          savedRules = [];
        }

        var err = result.err,
          rules = result.result;

        var myDiv = document.getElementById("rules");
        myDiv.innerHTML = "<h1>Rules</h1>";

        for (var i = 0; i < rules.length; i++) {
          var checkBox = document.createElement("input");
          var label = document.createElement("label");
          checkBox.type = "checkbox";
          checkBox.value = rules[i].ruleId;
          checkBox.name = "rulesCheckboxes";
          checkBox.checked = selectAll || (savedRules.indexOf(rules[i].ruleId)>-1);
          myDiv.appendChild(checkBox);
          myDiv.appendChild(label);
          myDiv.appendChild(document.createElement("br"));
          label.appendChild(document.createTextNode(rules[i].ruleId + " - " +rules[i].description));
        }
    });
}
function getClosest (elem, selector) {
    var firstChar = selector.charAt(0);
    // Get closest match
    for ( ; elem && elem !== document; elem = elem.parentNode ) {
        // If selector is a class
        if ( firstChar === '.' ) {
            if ( elem.classList.contains( selector.substr(1) ) ) {
                return elem;
            }
        }
        // If selector is an ID
        if ( firstChar === '#' ) {
            if ( elem.id === selector.substr(1) ) {
                return elem;
            }
        } 
        // If selector is a data attribute
        if ( firstChar === '[' ) {
            if ( elem.hasAttribute( selector.substr(1, selector.length - 2) ) ) {
                return elem;
            }
        }
        // If selector is a tag
        if ( elem.tagName.toLowerCase() === selector ) {
            return elem;
        }
    }
    return false;
}

function saveChanges() {
  localStorage["rules"] = getCheckboxesValues('rulesCheckboxes');
}

var results = document.getElementById('results');
var a11yCheckResult;
document.addEventListener('click', function(e) {
  var target = e.target;
  
  if (target.id === 'analyze') {
    saveChanges();
    results.innerHTML = 'Analyzing...';
    results.scrollIntoView();
    var activeRules = getCheckboxesValues('rulesCheckboxes');
    chrome.runtime.sendMessage({
      command: 'a11yCheck',
      rules: activeRules,
      tabId: chrome.devtools.inspectedWindow.tabId
    }, function(result) {
      var err = result.err,
        a11yCheck = result.result;
      if (err) {
        return renderError(err, true);
      }
      var source = document.getElementById('entry-template').innerHTML;
      var template = Handlebars.compile(source);

      document.getElementById('results').innerHTML = template(a11yCheck);

      results.scrollIntoView();
    });
    return;
  }
  if(target.id === "loadRules"){
    loadRules();
  }

  var inspect = target.dataset.inspect;
  if (inspect) {
    e.preventDefault();
    inspect = JSON.parse(inspect);
    chrome.runtime.sendMessage({
      command: 'tool',
      tabId: chrome.devtools.inspectedWindow.tabId,
      tool: 'chrome-get-frame-url',
      selector: inspect
    }, function test(result) {
      var frameURL = result.result;


      // stringify for quoting sake
      var script = '(function (path) {' +
        'var n = document.querySelector(path);' +
        'if (n) {' +
        ' inspect(n);' +
        ' return true;' +
        '}' +
        'return false;' +
        '}(' + JSON.stringify(inspect.pop()) + '));';

      chrome.devtools.inspectedWindow.eval(script, {
        frameURL: frameURL
      }, function(success, err) {
        if (err) {
          console.error(err);
        }
        if (!success) {
          console.log('Could not select element, it may have moved');
        }
      });
    });
    return;
  }

});

function notify(msg) {
  alert(msg);
}

// set is-chrome class so we can linkify nodes
document.body.classList.add('is-chrome');

function countNodes(rules) {
  var result = 0;
  rules.forEach(function(rule) {
    result += rule.nodes.length || 0;
  });
  return result;
}


function toggler(button, target) {
  var newMessage = button.dataset.togglemsg;
  var visible = target.classList.toggle('toggle-hide');
  button.setAttribute('aria-expanded', visible);
  if(newMessage!=null){
    button.dataset.togglemsg = button.innerHTML;
    button.innerHTML = newMessage;
  }
}

document.addEventListener('click', function (e) {
  var toggle = e.target.dataset.toggle;
  if (toggle) {
    debugger;
    var elem = e.target.parentNode.querySelector(toggle);
    if(elem ==null)
      elem = this.querySelector(toggle);
    toggler(e.target, elem);
    e.preventDefault();
    e.stopPropagation();
  }
}, false);

loadRules();