export class APIRequestHandler {
    static sendJSONRequest(requestURI, callback, postData = null, returnObject = null) {
        var req = APIRequestHandler.makeRequest();
        var cb = function () {
            // Only process finished requests
            if (req.readyState == XMLHttpRequest.DONE) {
                if (req.status == "200" || req.status == "201") {
                    if (returnObject) {
                        callback(returnObject);
                    }
                    else {
                        var dataJSON = JSON.parse(req.responseText);
                        callback(dataJSON);
                    }
                }
                else {
                    console.log("Error processing request response. Host: " + requestURI + ".");
                }
            }
        };
        APIRequestHandler.triggerRequest(req, requestURI, cb, postData);
    }

    static makeRequest() {
        return new XMLHttpRequest();
    }

    static triggerRequest(req, requestURI, cb, postData) {
        var mode = "GET";
        if (postData) {
            mode = "POST";
        }
        req.overrideMimeType("application/json");
        req.open(mode, requestURI, true);
        req.setRequestHeader("Content-Type", "application/json; charset=utf-8");
        req.onreadystatechange = cb;
        req.send(postData);
    }
};