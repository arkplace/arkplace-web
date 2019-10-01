export class PeerHandler {
    constructor() {
        this.peers = [];
    }

    addPeersToList(list) {
        for (item in list)
        {
            if (this.isValidPeer(item))
            {
                this.peers.push(item);
            }
            console.log(item);
        }
    }
};
