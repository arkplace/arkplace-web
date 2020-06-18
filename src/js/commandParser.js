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

    static isChecksumValid(str) {
        // Last 2 bytes are checksum
        var checksumReceived = str.substring(str.length-2, str.length);
        var message = str.substring(0, str.length-2);
        var checksumCalculated = CommandParser.calculateChecksum(message);

        return checksumCalculated == checksumReceived;
    }
    
    static calculateChecksum(message) {
        var checksumCalculated = 0;
        for (c in message) {
            checksumCalculated ^= c;
        }
        return (checksumCalculated % 256).toString(16);
    }

    static getCommandCode(message) {
        if( isChecksumValid(str) )
        {
            return message.substring(7, 9);
        }
        return null;
    }
}
