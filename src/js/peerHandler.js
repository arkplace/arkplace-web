import {genRandomIntInsecure} from "/src/js/utils.js";

export class PeerHandler {
    constructor() {
        this.peers = [];
        this.unresolved = [];
        this.protocol = "http";
        this.refreshAfter = 100;
        this.accessCounter = 0;
    }

    addPeersToList(list) {
        for (var idx in list) {
            const peer = list[idx];
            if (this.isValidPeer(peer)) {
                this.unresolved.push(peer);
            }

            this.ifReachableMoveToPeerList(peer);
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
        var req = new XMLHttpRequest();
        var peerURI =  this.convertToURI(peer);
        req.open('GET', peerURI, true);
        var callback = (this.movePeerToList).bind(this);
        req.onreadystatechange = function () {
            if (req.readyState == 4 && req.status == "200") {
                callback(peer);
            }
        };
        req.send();
    }

    convertToURI(peer) {
        return this.protocol + "://" + peer.ip + ":" + peer.port;
    }

    movePeerToList(peer) {
        var idx = this.unresolved.indexOf(peer);
        if (idx != -1) {
            this.unresolved.splice(idx, 1);
            this.peers.push(peer);
        }
    }

    getRandomPeer() {
        var peer;
        ++this.accessCounter;
        do {
            var rIdx = genRandomIntInsecure(this.peers.length);
            peer = this.peers[rIdx];

            if (this.shouldRefresh())
            {
                this.keepOnlyIfReachable(peer);
            }
        }
        while(this.peerNotFound(peer));
        return peer;
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
            ifReachableMoveToPeerList(peer);
        }
    }
};
