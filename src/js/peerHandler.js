import {genRandomIntInsecure} from "/src/js/utils.js";
import {APIRequestHandler} from "/src/js/apiRequestHandler.js"

export class PeerHandler {
    constructor() {
        this.peers = [];
        this.allowedPort = "4003";
        this.protocol = "http";
        this.refreshAfter = 100;
        this.accessCounter = 0;
    }

    addAllPeersToList(list) {
        var peerData = list.data;
        for (var idx in peerData) {
            var peer = peerData[idx];
            peer.port = this.allowedPort;
            if (this.isValidPeer(peer)) {
                this.ifReachableMoveToPeerList(peer);
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

    isValidAddress() {
        return true;
    }

    ifReachableMoveToPeerList(peer) {
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
        ++this.accessCounter;
        do {
            if (this.peers.length == 0) {
                console.log("ERROR! peers list empty when not expected.");
                return "";
            }

            var rIdx = genRandomIntInsecure(this.peers.length);
            peer = this.peers[rIdx];

            if (this.shouldRefresh()) {
                this.keepOnlyIfReachable(peer);
                peer.port = this.allowedPort;
                console.log(peer);
                var peerURI = this.getPeersAPIEndPoint(tempPeer);
                console.log(peerURI);
                this.loadPeersFromURI(peerURI);
            }
        }
        while(this.peerNotFound(peer));
        return peer;
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
        var idx = this.peers.indexOf(peer);
        if (idx != -1) {
            this.peers.splice(idx, 1);
            this.ifReachableMoveToPeerList(peer);
        }
    }
};
