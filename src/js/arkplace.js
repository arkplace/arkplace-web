// TODO: Implements model layer containing business logic
import { CanvasHandler } from "/src/js/canvasHandler.js";
import { TransactionHandler } from "/src/js/transactionHandler.js";
import { TransactionParser } from "/src/js/transactionParser.js";
import { CommandParser } from "/src/js/commandParser.js";

export class ArkPlace {
    constructor(name, canvasSize) {
        this.canvasHandler_ = new CanvasHandler(name, canvasSize);

        this.coordinatorAddress_ = "AeDzxthX3xWMqinkhJivC8jWb9WcrdSkQj";
        this.canvasAddress_ = null;
        this.txHandlerCoordinator_ = new TransactionHandler(this.coordinatorAddress_, 
                                                            this.txReadyForProcessingCoordinator.bind(this),
                                                            this.continueSeekingOldTransaction.bind(this));
        this.txHandlerCanvas_ = null;
    }

    continueSeekingOldTransaction(tx) {
        var senderAddress = TransactionParser.getSenderAddress(tx);
        var vendorField = TransactionParser.getVendorFieldData(tx);
        return this.checkIfCanvasValid(vendorField, senderAddress);
    }

    checkIfCanvasValid(vendorField, senderAddress) {
        var command = CommandParser.getCommandCode(vendorField);
        var hasRights = senderAddress == this.coordinatorAddress_;
        var noNewCanvas = command != CommandParser.AdminCommands.CREATE_CANVAS;
        if (hasRights) {
            return noNewCanvas;
        }
        return true;
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
    processCommand(tx) {
        var str = tx.data.vendorField;
        var sender = tx.sender;
        if (!CommandParser.isChecksumValid(str))
        {
            return;
        }

        var cc = CommandParser.getCommandCode(str);
        if (!cc) {
            return;
        }

        var canvasUpdated = false;
        if (!this.checkIfCanvasValid(str, sender)) {
            this.canvasHandler_.resetCanvas();
            canvasUpdated = true;
        }
        else if (cc == CommandParser.UserCommands.DRAW_PIXEL) {
            // TODO: check if pixel info is valid
            // TODO: check if payment amount is enough
            // TODO: commit to canvas
            // TODO: set update flag
        }
        // TODO: Add support for new commands

        if (canvasUpdated) {
            // TODO: refresh view
        }
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
