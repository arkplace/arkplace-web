// TODO: Implements model layer containing business logic

import {loadJSON} from "/js/utils.js";
import {CanvasHandler} from "/js/canvasHandler.js";

export class ArkPlace {
    constructor(name, canvasSize) { // TODO: Initialize CanvasHandler object
        this.canvasHandler_ = new CanvasHandler(name, canvasSize);
        this.data_;
        var peersJsonFile_ = "/peers.json";
        loadJSON(this.callbackPeersReceived, peersJsonFile_);

        // TODO: Hardcode network parameters and app constants
    }

    callbackPeersReceived(response) {
        var actual_JSON = JSON.parse(response);
        console.log(actual_JSON[1].ip);
    }

    updateImage() {
        this.canvasHandler_.updateImage();
    }

    getFormValues() {
        var depth = document.getElementsByName("formDepth")[0].value;
        var x = document.getElementsByName("formX")[0].value;
        var y = document.getElementsByName("formY")[0].value;
        var color = document.getElementsByName("formColor")[0].value;
        return {x, y, depth, color};
    }

    pixelErase(x, y, depth) {
        this.drawOnCanvas(x, y, depth, "#777777", false);
        this.updateImage();
    }

    // ----------------------------------------------------------------------
    // Editing
    // Set depth
    setDepth(depth) {
        this.canvasHandler_.setDepth(depth);
    }

    // TODO: Set pixel values
    updatePixel(x, y, depth, color) {
        this.drawOnCanvas(x, y, depth, color);
        this.updateImage();
    }

    // Submit pixel
    pixelSubmit() {
        let {x, y, depth, color} = this.getFormValues();
        // TODO: prepare transaction
        // TODO: submit transaction

        // TODO: this is not necessary when using transaction
        this.updatePixel(x, y, depth, color);
        console.log({x, y, depth, color});
    }

    // TODO: Make transaction

    // ----------------------------------------------------------------------
    // Protocol
    // TODO: Get seed peers
    // TODO: Get peers from seed nodes
    // TODO: Check API open
    // TODO: Get random peer (minimize chance of hitting api rate limit)
    // TODO: Get transactions for address
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
