import { APIRequestHandler } from "./apiRequestHandler.js";
import { EndpointHandler } from "/src/js/endpointHandler.js";
import { PeerHandler } from "/src/js/peerHandler.js";

export class TransactionHandler {
    constructor(walletId, getOutgoing = true, getIncoming = false) {
        this.peerHandler_ = new PeerHandler();
        this.walletId = walletId;
        this.shouldStoreIncoming = getIncoming;
        this.shouldStoreOutgoing = getOutgoing;
        this.seedPeersJsonURI_ = "/peers.json";
        this.peerToConnect_;

        var readyStateCallback = (this.initializeReadyState).bind(this);
        this.peerHandler_.registerReadyStateCallback(readyStateCallback);
        this.loadSeedPeers();

        this.readyState = false;
        this.lastSeenTimestamp = null;
    }

    syncTransactionHistory() {
        
        this.getOutgoingTransactions();
    }

    initializeReadyState() {
        this.loadNextPeer();
        this.syncTransactionHistory();
        this.readyState = true;
    }

    loadSeedPeers() {
        this.peerHandler_.loadPeersFromURI(this.seedPeersJsonURI_);
    }

    loadNextPeer() {
        this.peerToConnect_ = this.peerHandler_.getRandomPeer();
    }

    getOutgoingTransactions(cb = null) {
        this.transactionReceivedCallback_ = cb;
        this.getTransactions("outgoing");
    }

    getIncomingTransactions(cb = null) {
        this.transactionReceivedCallback_ = cb;
        this.getTransactions("incoming");
    }

    updateTransactions(mode) {
        var peerURI = this.peerHandler_.convertToURI(this.peerToConnect_)
                    + EndpointHandler.getSearchTransactionsAPIEndpoint();

        if (this.shouldStoreIncoming) {
            APIRequestHandler.sendJSONRequest(peerURI,
                this.transactionSearchJSONReceived,
                EndpointHandler.createSearchRequestPOSTData( null, this.walletId, this.lastSeenTimestamp));
        }
        if (this.shouldStoreOutgoing) {
            APIRequestHandler.sendJSONRequest(peerURI,
                this.transactionSearchJSONReceived,
                EndpointHandler.createSearchRequestPOSTData( this.walletId, null, this.lastSeenTimestamp));
        }
    }

    transactionSearchJSONReceived(data) {
        console.log(data);
        if (this.transactionReceivedCallback_) {
            this.transactionReceivedCallback_(data);
        }
    }
};