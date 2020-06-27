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
            DRAWPIXEL: 'dp'
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
        for (const c of vendorFieldText) {
            checksumCalculated ^= c;
        }
        const checksumHex = (checksumCalculated % 256).toString(16);
        return ("0" + checksumHex).slice(-2);
    }

    getCommandCode(str) {
        if( str != null && this.isChecksumValid(str) )
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

    createDrawCommand(x, y, depth, color) {
        var cmd = "";
        cmd += this.Info.CLIENT + this.separator;
        cmd += this.Info.VERSION + this.separator;
        cmd += this.UserCommands.DRAWPIXEL + this.separator;
        cmd += x + this.separator;
        cmd += y + this.separator;
        cmd += depth + this.separator;
        cmd += color + this.separator;
        cmd += this.calculateChecksum(cmd);

        return cmd;
    }
}
