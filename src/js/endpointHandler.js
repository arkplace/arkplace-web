export class EndpointHandler {
    static getPeersAPIEndpoint() {
        return this.apiPrefix + "peers";
    }

    static getSearchTransactionsAPIEndpoint() {
        return this.apiPrefix + "transactions/search";
    }

    static createSearchRequestPOSTData( recipientId, timestampFrom = null ) {
        var jsonPostObject = {};
        jsonPostObject.recipientId = recipientId;
        if (timestampFrom) {
            jsonPostObject.timestampFrom = timestampFrom;
        }
        var reqPOSTString = JSON.stringify(jsonPostObject);

        return reqPOSTString;
    }
};

EndpointHandler.apiPrefix = "/api/v2/";