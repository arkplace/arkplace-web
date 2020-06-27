
export class TransactionParser {
    static hasVendorFieldData(tx) {
        return tx.vendorField != null;
    }

    static getVendorFieldData(tx) {
        return tx.vendorField;
    }

    static getSenderAddress(tx) {
        return tx.sender;
    }
};