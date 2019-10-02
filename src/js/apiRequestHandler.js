export class APIRequestHandler {
    static sendJSONRequest( requestURI, callback) {
        var req = APIRequestHandler.makeRequest();
        var cb = function () {
            if (req.readyState == 4 && req.status == "200") {
                var dataJSON = JSON.parse(req.responseText);
                callback(dataJSON);
            }
            else {
                console.log("Access denied by the node " + requestURI + ".");
            }
        };
        APIRequestHandler.triggerRequest(req, requestURI, cb);
    }

    static sendLivenessCheckRequest(requestURI, callback, returnObject) {
        var req = APIRequestHandler.makeRequest();
        var cb = function () {
            if (req.readyState == 4 && req.status == "200") {
                callback(returnObject);
            }
            else {
                console.log("Access denied by the node " + requestURI + ". Not adding to peer list.");
            }
        };
        APIRequestHandler.triggerRequest(requestURI, cb);
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