// TODO: Implements model layer containing business logic
import { CanvasHandler } from "/src/js/canvasHandler.js";
import { PeerHandler } from "/src/js/peerHandler.js";
import { APIRequestHandler } from "./apiRequestHandler.js";
import { EndpointHandler } from "/src/js/endpointHandler.js"

export class ArkPlace {
    constructor(name, canvasSize) { // TODO: Initialize CanvasHandler object
        this.canvasHandler_ = new CanvasHandler(name, canvasSize);
        this.peerHandler_ = new PeerHandler();

        // TODO: Hardcode network parameters and app constants
        this.protocol_ = "http";
        this.bgColorDefault_ = "#777777";
        this.seedPeersJsonURI_ = "/peers.json";
        this.coordinatorAddress_ = "AeDzxthX3xWMqinkhJivC8jWb9WcrdSkQj";

        var readyStateCallback = (this.initializeReadyState).bind(this);
        this.peerHandler_.registerReadyStateCallback(readyStateCallback);
        this.loadSeedPeers();

        // Variables to use as storage
        this.readyState = false;
        this.peerToConnect_;
        this.numTxCheckpoint = 0;
    }

    initializeReadyState() {
        this.readyState = true;
        this.loadNextPeer();
    }

    updateImage() {
        this.canvasHandler_.updateImage();
    }

    getFormValues() {
        var depth = document.getElementsByName("formDepth")[0].value;
        var x = document.getElementsByName("formX")[0].value;
        var y = document.getElementsByName("formY")[0].value;
        var color = document.getElementsByName("formColor")[0].value;
        return { x, y, depth, color };
    }

    pixelErase(x, y, depth) {
        this.drawOnCanvas(x, y, depth, this.bgColorDefault_, false);
        this.updateImage();
    }

    // ----------------------------------------------------------------------
    // Editing
    // Set depth
    setDepth(depth) {
        this.canvasHandler_.setDepth(depth);
    }

    updatePixel(x, y, depth, color) {
        this.drawOnCanvas(x, y, depth, color);
        this.updateImage();
    }

    pixelSubmit() {
        let { x, y, depth, color } = this.getFormValues();
        // TODO: prepare transaction
        // TODO: submit transaction

        // TODO: this is not necessary when using transaction
        this.updatePixel(x, y, depth, color);
        console.log({ x, y, depth, color });
    }

    // TODO: Make transaction

    // ----------------------------------------------------------------------
    // Protocol
    loadSeedPeers() {
        this.peerHandler_.loadPeersFromURI(this.seedPeersJsonURI_);
    }

    loadNextPeer() {
        this.peerToConnect_ = this.peerHandler_.getRandomPeer();
    }

    getOutgoingTransactions(walletId) {
        var peerURI = this.peerHandler_.convertToURI(this.peerToConnect_) + EndpointHandler.getSearchTransactionsAPIEndpoint();
        APIRequestHandler.sendJSONRequest(peerURI,
            this.transactionSearchJSONReceived,
            EndpointHandler.createSearchRequestPOSTData( walletId ));
    }

    getIncomingTransactions(walletId) {
        var peerURI = this.peerHandler_.convertToURI(this.peerToConnect_) + EndpointHandler.getSearchTransactionsAPIEndpoint();
        APIRequestHandler.sendJSONRequest(peerURI,
            this.transactionSearchJSONReceived,
            EndpointHandler.createSearchRequestPOSTData( null, walletId ));
    }

    transactionSearchJSONReceived(data) {
        console.log(data);
    }

    // TODO: Parse vendorfield (elminate XSS vectors)
    // TODO: Decode command
    // TODO: Validate command

    // ----------------------------------------------------------------------
    // Coordinator address functions
    // TODO: Get active canvas

    // ----------------------------------------------------------------------
    // Canvas address functions
    // TODO: Get base unit
    // TODO: Get multiplier
    // TODO: Get canvas status
    // TODO: Get topic

    // ----------------------------------------------------------------------
    // User commands
    // Draw on canvas
    drawOnCanvas(x, y, depth, color, visible = true) { // Make sure all required values are defined
        if (x && y && depth && color) {
            this.canvasHandler_.updateDenseTreeItem(x, y, depth, color, visible);
            this.canvasHandler_.updateImage();
        }
    }

    // Admin commands
    // TODO: Freeze canvas
    // TODO: Invalidate canvas
    // TODO: Create new canvas
    // TODO: Set canvas base unit
    // TODO: Set canvas fee multiplier
    // TODO: Set canvas topic
    // TODO: Whitelist address
    // TODO: Timeout address

};
