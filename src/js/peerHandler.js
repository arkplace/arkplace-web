import { genRandomIntInsecure } from "/src/js/utils.js";
import { APIRequestHandler } from "/src/js/apiRequestHandler.js"

export class PeerHandler {
    constructor() {
        this.peers_ = [];
        this.protocol_ = "http";
        this.refreshAfter_ = 100;
        this.retryLimit_ = 100;
        this.accessCounter_ = 0;
        this.apiKeyNameBase_ = "@arkecosystem/core-api";
        this.apiListPeers_ = "/api/peers";

        this.localAliases = [
            "localhost",
            "127.0.0.1",
            "0000:0000:0000:0000:0000:0000:0000:0001",
            "::1",
            "127.0.0.1/8",
            "0000:0000:0000:0000:0000:0000:0000:0001/128",
            "::1/128"
        ];
        this.callbackWhenReady = [];
        this.firstIteration = true;
    }

    addAllPeersToList(list) {
        var peerData = list.data;
        for (var idx in peerData) {
            var peer = peerData[idx];
            if (this.hasAPI(peer) && this.isValidPeer(peer)) {
                peer = this.stripDownPeer(peer);
                if (this.peerNotFound(peer)) {
                    this.keepOnlyIfReachable(peer);
                }
            }
        }
    }

    hasAPI(peer) {
        return this.isAPIPortDefined(peer) && this.hasAPIOpen(peer);
    }

    stripDownPeer(peer) {
        peer.port = this.getAPIPortFromPeer(peer);
        delete peer.ports;
        delete peer.latency;
        delete peer.height;
        return peer;
    }

    isValidPeer(peer) {
        if (this.isLocalHost(peer)) {
            return false;
        }
        if (!this.isValidAddress(peer)) {
            return false;
        }

        return true;
    }

    isLocalHost(peer) {
        return this.localAliases.includes(peer.ip);
    }

    isValidAddress(peer) {
        return true;
    }

    isAPIPortDefined(peer) {
        return peer.ports[this.apiKeyNameBase_] != undefined;
    }

    hasAPIOpen(peer) {
        return peer.ports[this.apiKeyNameBase_] != -1;
    }

    getAPIPortFromPeer(peer) {
        return peer.ports[this.apiKeyNameBase_];
    }

    ifReachableAddToPeerList(peer) {
        var peerURI = this.convertToURI(peer);
        var callback = (this.addNewPeerToList).bind(this);
        APIRequestHandler.sendJSONRequest(peerURI, callback, peer);
    }

    registerReadyStateCallback(callback) {
        this.callbackWhenReady = callback;
    }

    loadPeersFromURI(requestURI) {
        var callback = (this.addAllPeersToList).bind(this);
        APIRequestHandler.sendJSONRequest(requestURI, callback);
    }

    convertToURI(peer) {
        return this.protocol_ + "://" + peer.ip + ":" + peer.port;
    }

    addNewPeerToList(peer) {
        if (peer == null) {
            console.log("Peer is null. Not adding to peer list.");
        }

        var exists = this.peers_.includes(peer);
        if (!exists) {
            this.peers_.push(peer);

            if (this.firstIteration) {
                this.callbackWhenReady();
                this.firstIteration = false;
            }
        }
    }

    getRandomPeer() {
        var peer;
        do {
            if (this.accessCounter_ > this.retryLimit_) {
                console.error("Error! retry limit reached without successful peer connection. Please check if seed peers are up to date and network is connected.");
            }

            if (this.peers_.length == 0) {
                console.error("Error! peers list empty when not expected.");
                return "";
            }

            var rIdx = genRandomIntInsecure(this.peers_.length);
            peer = this.peers_[rIdx];

            if (this.shouldRefresh()) {
                this.checkLivenessAndRefreshPeer(peer);
            }
        }
        while (this.peerNotFound(peer));
        ++this.accessCounter_;
        return peer;
    }

    checkLivenessAndRefreshPeer(peer) {
        this.keepOnlyIfReachable(peer);
        var peerURI = this.getPeersAPIEndPoint(peer);
        this.loadPeersFromURI(peerURI);
    }

    getPeersAPIEndPoint(peer) {
        var baseURI = this.convertToURI(peer);
        return baseURI + String(this.apiListPeers_);
    }

    shouldRefresh() {
        return this.accessCounter_ % this.refreshAfter_ == 0;
    }

    peerNotFound(peer) {
        return this.peers_.indexOf(peer) == -1;
    }

    keepOnlyIfReachable(peer) {
        this.removeFromPeerListIfExists(peer);
        this.ifReachableAddToPeerList(peer);
    }

    removeFromPeerListIfExists(peer) {
        var idx = this.peers_.indexOf(peer);
        if (idx != -1) {
            this.peers_ = this.peers_.splice(idx, 1);
        }
    }
};
