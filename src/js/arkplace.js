import { CanvasHandler } from "/src/js/canvasHandler.js";
import { TransactionHandler } from "/src/js/transactionHandler.js";
import { TransactionParser } from "/src/js/transactionParser.js";
import { CommandParser } from "/src/js/commandParser.js";

export class ArkPlace {
    constructor(name, canvasSize) {
        this.canvasHandler_ = new CanvasHandler(name, canvasSize);

        this.coordinatorAddress_ = "ARXiagGnvCJrc1nJ2fy7xLRLhGBrEXbedL";
        this.txHandlerCoordinator_ = new TransactionHandler(this.coordinatorAddress_, 
                                                            this.txReadyForProcessingCoordinator.bind(this),
                                                            this.shouldContinueSeekingOldTransaction.bind(this));

        var minFee = 1000000; // arktoshi
        var baseFee = 2;
        this.cmdParser_ = new CommandParser(minFee, baseFee);
        this.ready = false;
        this.periodicRefreshTrigger = setInterval(this.periodicRefresh.bind(this), 8000);
    }

    periodicRefresh() {
        if (this.ready) {
            this.txHandlerCoordinator_.syncTransactionHistory()
        }
    }

    txReadyForProcessingCoordinator() {
        while( !this.txHandlerCoordinator_.isEmpty() ) {
            var tx = this.txHandlerCoordinator_.pop();
            this.processCommand(tx);
        }
        this.ready = true;
    }

    shouldContinueSeekingOldTransaction(tx) {
        var senderAddress = TransactionParser.getSenderAddress(tx);
        var vendorField = TransactionParser.getVendorFieldData(tx);
        return this.checkIfCanvasValid(vendorField, senderAddress);
    }

    checkIfCanvasValid(vendorField, senderAddress) {
        var command = this.cmdParser_.getCommandCode(vendorField);
        var hasRights = senderAddress == this.coordinatorAddress_;
        var noNewCanvas = command != this.cmdParser_.AdminCommands.CREATE_CANVAS;
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
        this.updatePixel(x, y, depth, "", false);
    }

    // ----------------------------------------------------------------------
    // Editing
    // Set depth
    setDepth(depth) {
        this.canvasHandler_.setDepth(depth);
    }

    updatePixel(x, y, depth, color, visibleFlag = true) {
        if (!visibleFlag) {
            color = this.bgColorDefault_;
        }
        this.drawOnCanvas(x, y, depth, color, visibleFlag);
        this.updateImage();
    }
    
    openInNewTab(url) {
        var win = window.open(url, '_blank');
        if (win) {
            win.focus();
        }
      }

    launchArkTransaction(arktoshiValue, receiver, vendorFieldText) {
        // Prepare AIP26 compatible call and launch
        var txString = "ark:" + receiver + "?";
        txString += "vendorField=" + vendorFieldText + "&";
        txString += "amount=" + String(arktoshiValue/1e8);
        this.openInNewTab(txString);
    }

    pixelSubmit() {
        let { x, y, depth, color } = this.getFormValues();
        var cmd = this.cmdParser_.createDrawCommand(x, y, depth, color);
        const rewriteCount = this.canvasHandler_.getRewriteCountFor(x, y, depth);
        const arktoshiValue = this.cmdParser_.getFeeEstimate(rewriteCount);
        this.launchArkTransaction(arktoshiValue, this.coordinatorAddress_, cmd);
    }

    // TODO: Make transaction

    // ----------------------------------------------------------------------
    // Protocol
    processCommand(tx) {
        var str = tx.vendorField;
        if (str != null && !this.cmdParser_.isChecksumValid(str))
        {
            return;
        }

        var cc = this.cmdParser_.getCommandCode(str);
        if (!cc) {
            return;
        }

        this.applyCommand(tx, cc);
    }

    applyCommand(tx, cc) {
        var str = tx.vendorField;
        var sender = tx.sender;
        var canvasUpdated = false;
        if (!this.checkIfCanvasValid(str, sender)) {
            this.canvasHandler_.nukeCanvas();
            canvasUpdated = true;
        }
        else if (cc == this.cmdParser_.UserCommands.DRAWPIXEL) {
            this.parseAndCommitPixel(tx);
            canvasUpdated = true;
        }
        // TODO: Add support for new commands
        if (canvasUpdated) {
            this.updateCanvas();
        }
    }

    updateCanvas() {
        this.canvasHandler_.updateImage();
    }

    parseAndCommitPixel(tx) {
        var str = tx.vendorField;
        let { x, y, depth, color } = this.cmdParser_.extractDrawCommandInfo(str);
        var rewriteCount = this.canvasHandler_.getRewriteCountFor(x, y, depth);
        var valid = this.cmdParser_.isFeesEnough(rewriteCount, tx);

        if (valid) {
            this.canvasHandler_.updateDenseTreeItem(x, y, depth, color, true);
        }
    }

    // ----------------------------------------------------------------------
    // Coordinator address functions
    // TODO: Get active canvas

    // ----------------------------------------------------------------------
    // Canvas address functions
    // TODO: Get min fee
    // TODO: Get base fee
    // TODO: Get canvas status
    // TODO: Get topic

    // ----------------------------------------------------------------------
    // User commands
    // Draw on canvas
    drawOnCanvas(x, y, depth, color, visible = true) {
        // Make sure all required values are defined
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
