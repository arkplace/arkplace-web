import { APIRequestHandler } from "./apiRequestHandler.js";
import { EndpointHandler } from "/src/js/endpointHandler.js";
import { PeerHandler } from "/src/js/peerHandler.js";

export class TransactionHandler {
    constructor(walletId, executeAfterReadyCallback = null, isCanvasValidCallback = null, getIncoming = true, getOutgoing = true) {
        this.peerHandler_ = new PeerHandler();
        this.walletId_ = walletId;
        this.shouldStoreIncoming_ = getIncoming;
        this.shouldStoreOutgoing_ = getOutgoing;
        this.seedPeersJsonURI_ = "/peers.json";
        this.expectedTxCount_ = 100;
        this.peerToConnect_;

        var readyStateCallback_ = (this.initializeReadyState).bind(this);
        this.peerHandler_.registerReadyStateCallback(readyStateCallback_);
        this.loadSeedPeers();

        this.readyState_ = false;
        this.lastSeenTimestamp_ = null;
        this.lastSeenCount_ = 0;
        this.pageNumber_ = 1;
        this.txMap_ = new Map();
        this.readyStateCallback_ = executeAfterReadyCallback;
        if (isCanvasValidCallback) {
            this.isCanvasValid = isCanvasValidCallback;
        }
        else {
            this.isCanvasValid = (tx)=>{return true};
        }
    }

    syncTransactionHistory() {
        this.peerToConnect_ = this.peerHandler_.getRandomPeer();
        this.updateTransactions(this.appendTransactionsToHistory);
    }

    isValidNewData(JsonTxData) {
        if ( !JsonTxData )
        {
            return false;
        }
        if ( JsonTxData.meta.totalCount == this.lastSeenCount_ ) {
            return false;
        }
        return true;
    }

    isUnseenTransaction(tx) {
        return tx.timestamp.epoch > this.lastSeenTimestamp_;
    }

    isIncomingTx(tx) {
        return this.walletId_ == tx.recipient;
    }

    isOutgoingTx(tx) {
        return this.walletId_ == tx.sender;
    }

    appendTransactionsToHistory(JsonTxData) {
        if (!this.isValidNewData(JsonTxData)) {
            return;
        }

        var reachedOldTransactions = false;
        var tx = {};
        for (var idx in JsonTxData.data) {
            tx = JsonTxData.data[idx];
            if (this.isUnseenTransaction(tx) && this.isCanvasValid(tx)) {
                this.storeTransactionToQueue(tx);
            }
            else {
                reachedOldTransactions = true;
            }
        }

        var lastPage = JsonTxData.meta.pageCount == this.pageNumber_;
        if (lastPage || reachedOldTransactions) {
            this.lastSeenTimestamp_ = tx.timestamp.epoch;
            this.lastSeenCount_ = JsonTxData.meta.totalCount;

            if (this.readyStateCallback_){
                this.readyStateCallback_();
            }
        }
        else {
            this.pageNumber_++;
            this.syncTransactionHistory();
        }
    }

    storeTransactionToQueue(tx) {
        var shouldStore = (this.shouldStoreIncoming_ && this.isIncomingTx(tx))
                        || (this.shouldStoreOutgoing_ && this.isOutgoingTx(tx));
        if (shouldStore) {
            this.txMap_.set(tx.id, tx);
        }
    }

    initializeReadyState() {
        this.readyState_ = true;
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
                    + EndpointHandler.getPageIndexFormatted(this.pageNumber_);
        
        if (this.shouldStoreIncoming_) {
            APIRequestHandler.sendJSONRequest(peerURI,
                this.appendTransactionsToHistory.bind(this),
                EndpointHandler.createSearchRequestPOSTData( null, this.walletId_, this.lastSeenTimestamp_));
        }
        if (this.shouldStoreOutgoing_) {
            APIRequestHandler.sendJSONRequest(peerURI,
                this.appendTransactionsToHistory.bind(this),
                EndpointHandler.createSearchRequestPOSTData( this.walletId_, null, this.lastSeenTimestamp_));
        }
    }

    pop() {
        var retVal = Array.from(this.txMap_)[this.txMap_.size-1];
        this.txMap_.delete(retVal[0]);
        return retVal[1];
    }

    isEmpty() {
        return this.txMap_.size == 0;
    }
};