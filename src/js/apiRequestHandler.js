export class APIRequestHandler {
    static sendJSONRequest(requestURI, callback, returnObject = null) {
        var req = APIRequestHandler.makeRequest();
        var cb = function () {
            // Only process finished requests
            if (req.readyState == 4) {
                if (req.status == "200") {
                    if (returnObject) {
                        callback(returnObject);
                    }
                    else {
                        var dataJSON = JSON.parse(req.responseText);
                        callback(dataJSON);
                    }
                }
                else {
                    console.log("Access denied by the node " + requestURI + ".");
                }
            }
        };
        APIRequestHandler.triggerRequest(req, requestURI, cb);
    }

    static makeRequest() {
        return new XMLHttpRequest();
    }

    static triggerRequest(req, requestURI, cb) {
        req.overrideMimeType("application/json");
        req.open('GET', requestURI, true);
        req.onreadystatechange = cb;
        req.send();
    }
};