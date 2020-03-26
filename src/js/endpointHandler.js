export class EndpointHandler {
    static getPeersAPIEndpoint() {
        return this.apiPrefix + "peers";
    }

    static getSearchTransactionsAPIEndpoint() {
        return this.apiPrefix + "transactions/search";
    }

    static createSearchRequestPOSTData( senderId = null, recipientId = null, timestampFrom = null ) {
        var jsonPostObject = {};
        if (senderId) {
            jsonPostObject.senderId = senderId;
        }
        if (recipientId) {
            jsonPostObject.recipientId = recipientId;
        }
        if (timestampFrom) {
            jsonPostObject.timestampFrom = timestampFrom;
        }
        var reqPOSTString = JSON.stringify(jsonPostObject);

        return reqPOSTString;
    }
};

EndpointHandler.apiPrefix = "/api/v2/";