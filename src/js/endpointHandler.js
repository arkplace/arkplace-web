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

    static getArgSpecifier() {
        return "?";
    }

    static getPageIndexFormatted( pageIdx ) {
        return "page=" + String(pageIdx);
    }
};

EndpointHandler.apiPrefix = "/api/v2/";