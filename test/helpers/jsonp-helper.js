function getParam(url, key){
  key = key.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+key+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec(url);
  if( results == null )
    return null;
  else
    return results[1];
}

function respondToJsonpRequest(response) {
  var head = document.getElementsByTagName('head')[0];
  spyOn(head, 'appendChild').and.callFake(function (script) {
    script.parentNode = head;
    script.readyState = "loaded";
    script.onload();

    var callbackName = getParam(script.src, 'callback');
    window[callbackName](response);
  });
}

function inspectJsonpRequest(callback) {
  var head = document.getElementsByTagName('head')[0];
  spyOn(head, 'appendChild').and.callFake(function (script) {
    callback(script);
  });
}