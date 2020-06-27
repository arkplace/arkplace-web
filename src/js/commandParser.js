export class CommandParser {
    constructor(baseFee, feeMultiplier) {
        this.minFee = baseFee;
        this.baseFee = feeMultiplier;
        this.separator = ",";

        this.Info = {
            CLIENT: 'ap',
            VERSION: '0.1'
        };
        
        this.UserCommands = {
            DRAW_PIXEL: 'dp'
        };
        
        this.AdminCommands = {
            CREATE_CANVAS: 'cc',
            BASE_UNIT: 'bu',
            MULTIPLIER: 'mu',
            TOPIC: 'tp'
        };
    }

    isChecksumValid(vendorFieldText) {
        // Last 2 bytes are checksum
        var checksumReceived = vendorFieldText.substring(vendorFieldText.length-2, vendorFieldText.length);
        var vendorFieldText = vendorFieldText.substring(0, vendorFieldText.length-2);
        var checksumCalculated = this.calculateChecksum(vendorFieldText);

        return checksumCalculated == checksumReceived;
    }
    
    calculateChecksum(vendorFieldText) {
        var checksumCalculated = 0;
        for (c in vendorFieldText) {
            checksumCalculated ^= c;
        }
        return (checksumCalculated % 256).toString(16);
    }

    getCommandCode(str) {
        if( isChecksumValid(str) )
        {
            return str.split(",")[2];
        }
        return null;
    }

    extractDrawCommandInfo(str) {       
        // draw pixel = identifier, version, command code, x, y, depth, color
        var chunks = str.split(",");
        if (chunks.length != 8 || chunks[2] != this.UserCommands.DRAW_PIXEL) {
            return;
        }
        var x = parseInt(chunks[3]);
        var y = parseInt(chunks[4]);
        var depth = parseInt(chunks[5]);
        var color = chunks[6];
        return { x, y, depth, color };
    }

    isFeesEnough(rewriteCount, tx) {
        return tx.data.amount >= this.getFeeEstimate(rewriteCount);
    }

    getFeeEstimate(rewriteCount) {
        return this.minFee + Math.pow(this.baseFee, rewriteCount);
    }

    appendToCommand(str) {
        return string(str) + this.separator;
    }

    createDrawCommand(x, y, depth, color) {
        var cmd = "";
        cmd = this.appendToCommand(this.Info.CLIENT);
        cmd = this.appendToCommand(this.Info.VERSION);
        cmd = this.appendToCommand(this.UserCommands.DAW_PIXEL);
        cmd = this.appendToCommand(x);
        cmd = this.appendToCommand(y);
        cmd = this.appendToCommand(depth);
        cmd = this.appendToCommand(color);
        cmd += this.calculateChecksum(cmd);

        return cmd;
    }
}
