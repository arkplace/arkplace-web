
export class TransactionHandler {
    static hasVendorFieldData(tx) {
        return tx.data.vendorField != null;
    }

    static getVendorFieldData(tx) {
        return tx.data.vendorField;
    }

    static getSenderAddress(tx) {
        return tx.data.sender;
    }
};