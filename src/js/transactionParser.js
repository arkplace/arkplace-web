
export class TransactionHandler {
    static hasVendorFieldData(tx) {

    }

    static getVendorFieldData(tx) {
        return tx.data.vendorField;
    }

    static getSenderAddress(tx) {
        return tx.data.sender;
    }
};