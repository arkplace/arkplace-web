export class CommandParser {
    static Info = {
        CLIENT: 'ap',
        VERSION: '0.1'
    };
    
    static UserCommands = {
        DRAW_PIXEL: 'dp'
    };
    
    static AdminCommands = {
        CREATE_CANVAS: 'cc',
        BASE_UNIT: 'bu',
        MULTIPLIER: 'mu',
        TOPIC: 'tp'
    };

    static isChecksumValid(vendorFieldText) {
        // Last 2 bytes are checksum
        var checksumReceived = vendorFieldText.substring(vendorFieldText.length-2, vendorFieldText.length);
        var vendorFieldText = vendorFieldText.substring(0, vendorFieldText.length-2);
        var checksumCalculated = CommandParser.calculateChecksum(vendorFieldText);

        return checksumCalculated == checksumReceived;
    }
    
    static calculateChecksum(vendorFieldText) {
        var checksumCalculated = 0;
        for (c in vendorFieldText) {
            checksumCalculated ^= c;
        }
        return (checksumCalculated % 256).toString(16);
    }

    static getCommandCode(vendorFieldText) {
        if( isChecksumValid(str) )
        {
            return vendorFieldText.substring(7, 9);
        }
        return null;
    }
}
