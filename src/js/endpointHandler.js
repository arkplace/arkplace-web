export class EndpointHandler {
    static getPeersAPIEndpoint() {
        return this.apiPrefix + "peers";
    }

    static getSearchTransactionsAPIEndpoint() {
        return this.apiPrefix + "transactions/search";
    }
};

EndpointHandler.apiPrefix = "/api/v2/";