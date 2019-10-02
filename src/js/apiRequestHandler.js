export class APIRequestHandler {
    static MakeJSONRequest( requestURI, callback, returnObject) {
        var req = new XMLHttpRequest();
        req.overrideMimeType("application/json");
        req.open('GET', requestURI, true);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == "200") {
                if (returnObject) {
                    callback(returnObject);
                }
                else {
                    var dataJSON = JSON.parse(req.responseText);
                    callback(dataJSON);
                }
            }
            else {
                console.log("Access denied by the node " + requestURI + ". Not adding to peer list.");
            }
        };
        req.send();
    }
};