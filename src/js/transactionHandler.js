import { APIRequestHandler } from "./apiRequestHandler.js";
import { EndpointHandler } from "/src/js/endpointHandler.js";
import { PeerHandler } from "/src/js/peerHandler.js";

const isEmpty = (obj) => {
    return Object.keys(obj).length === 0 && obj.constructor === Object;
}

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
        this.lastSeenCount = 0;
        this.pageNumber = 1;
        this.txQueue = [];
        this.lastTx = {};
    }
    
    syncTransactionHistory() {
        this.updateTransactions(this.appendTransactionsToHistory);
    }

    isValidNewData(JsonTxData) {
        if ( !JsonTxData )
        {
            return false;
        }
        if ( JsonTxData.meta.totalCount == this.lastSeenCount ) {
            return false;
        }
        return true;
    }

    isUnseenTransaction(tx) {
        return tx.timestamp.epoch > this.lastSeenTimestamp;
    }

    isIncomingTx(tx) {
        return this.walletId == tx.recipient;
    }

    isOutgoingTx(tx) {
        return this.walletId == tx.sender;
    }

    appendTransactionsToHistory(JsonTxData) {
        if (!this.isValidNewData(JsonTxData)) {
            return;
        }

        var wasAnythingAdded = false;
        for (var idx in JsonTxData.data) {
            var tx = JsonTxData.data[idx];
            if (this.isUnseenTransaction(tx)) {
                if (this.shouldStoreIncoming && this.isIncomingTx(tx)) {
                    this.txQueue.push(tx);
                    wasAnythingAdded = true;
                }
                else if (this.shouldStoreOutgoing && this.isOutgoingTx(tx)) {
                    this.txQueue.push(tx);
                    wasAnythingAdded = true;
                }
                if (!isEmpty(tx)) {
                    this.lastTx = tx;
                }
            }
        }

        if (wasAnythingAdded) {
            this.syncTransactionHistory();
        }
        else {
            this.lastSeenTimestamp = this.lastTx.timestamp.epoch;
            this.lastSeenCount = JsonTxData.meta.totalCount;
        }
    }

    initializeReadyState() {
        this.readyState = true;
        this.loadNextPeer();
        this.syncTransactionHistory();
    }

    loadSeedPeers() {
        this.peerHandler_.loadPeersFromURI(this.seedPeersJsonURI_);
    }

    loadNextPeer() {
        this.peerToConnect_ = this.peerHandler_.getRandomPeer();
    }

    updateTransactions() {
        var peerURI = this.peerHandler_.convertToURI(this.peerToConnect_)
                    + EndpointHandler.getSearchTransactionsAPIEndpoint()
                    + EndpointHandler.getArgSpecifier()
                    + EndpointHandler.getPageIndexFormatted(this.pageNumber);
        
        if (this.shouldStoreIncoming) {
            APIRequestHandler.sendJSONRequest(peerURI,
                this.appendTransactionsToHistory.bind(this),
                EndpointHandler.createSearchRequestPOSTData( null, this.walletId, this.lastSeenTimestamp));
        }
        if (this.shouldStoreOutgoing) {
            APIRequestHandler.sendJSONRequest(peerURI,
                this.appendTransactionsToHistory.bind(this),
                EndpointHandler.createSearchRequestPOSTData( this.walletId, null, this.lastSeenTimestamp));
        }
        this.pageNumber++;
    }

};