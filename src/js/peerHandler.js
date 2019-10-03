import {genRandomIntInsecure} from "/src/js/utils.js";
import {APIRequestHandler} from "/src/js/apiRequestHandler.js"

export class PeerHandler {
    constructor() {
        this.peers = [];
        this.protocol = "http";
        this.refreshAfter = 100;
        this.accessCounter = 0;
        this.apiKey = "@arkecosystem/core-api";
    }

    addAllPeersToList(list) {
        var peerData = list.data;
        for (var idx in peerData) {
            var peer = peerData[idx];
            if (this.isValidPeer(peer)) {
                peer.port = this.getAPIPortFromPeer(peer);
                delete peer.ports;
                delete peer.latency;
                delete peer.height;
                this.keepOnlyIfReachable(peer);
            }
        }
    }

    isValidPeer(peer) {
        if (this.isLocalHost(peer)) {
            return false;
        }
        if (!this.isValidAddress(peer)) {
            return false;
        }
        if (!this.isAPIPortDefined(peer)) {
            return false;
        }
        if (!this.hasAPIOpen(peer)) {
            return false;
        }

        return true;
    }

    isLocalHost(peer) {
        const localAliases = [
            "localhost",
            "127.0.0.1",
            "0000:0000:0000:0000:0000:0000:0000:0001",
            "::1",
            "127.0.0.1/8",
            "0000:0000:0000:0000:0000:0000:0000:0001/128",
            "::1/128"
        ];
        return localAliases.includes(peer.ip);
    }

    isValidAddress(peer) {
        return true;
    }

    isAPIPortDefined(peer) {
        return peer.ports[this.apiKey] != undefined;
    }

    hasAPIOpen(peer) {
        return peer.ports[this.apiKey] != -1;
    }

    getAPIPortFromPeer(peer) {
        return peer.ports[this.apiKey];
    }

    ifReachableAddToPeerList(peer) {
        var peerURI = this.convertToURI(peer);
        var callback = (this.addSinglePeerToList).bind(this);
        APIRequestHandler.sendLivenessCheckRequest(peerURI, callback, peer);
    }

    loadPeersFromURI(requestURI) {
        var callback = (this.addAllPeersToList).bind(this);
        APIRequestHandler.sendJSONRequest(requestURI, callback);
    }

    convertToURI(peer) {
        return this.protocol + "://" + peer.ip + ":" + peer.port;
    }

    addSinglePeerToList(peer) {
        var exists = this.peers.includes(peer);
        if (!exists) {
            this.peers.push(peer);
        }
    }

    getRandomPeer() {
        var peer;
        do {
            if (this.peers.length == 0) {
                console.log("ERROR! peers list empty when not expected.");
                return "";
            }

            var rIdx = genRandomIntInsecure(this.peers.length);
            peer = this.peers[rIdx];

            if (this.shouldRefresh()) {
                this.checkLivenessAndRefreshPeer(peer);
            }
        }
        while(this.peerNotFound(peer));
        ++this.accessCounter;
        return peer;
    }

    checkLivenessAndRefreshPeer(peer) {
        this.keepOnlyIfReachable(peer);
        var peerURI = this.getPeersAPIEndPoint(peer);
        this.loadPeersFromURI(peerURI);
    }

    getPeersAPIEndPoint(peer) {
        var baseURI = this.convertToURI(peer);
        return baseURI + String("/api/peers");
    }

    shouldRefresh() {
        return this.accessCounter % this.refreshAfter == 0;
    }

    peerNotFound(peer) {
        return this.peers.indexOf(peer) == -1;
    }

    keepOnlyIfReachable(peer) {
        this.removeFromPeerListIfExists(peer);
        this.ifReachableAddToPeerList(peer);
    }

    removeFromPeerListIfExists(peer) {
        var idx = this.peers.indexOf(peer);
        if (idx != -1) {
            this.peers = this.peers.splice(idx, 1);
        }
    }
};
