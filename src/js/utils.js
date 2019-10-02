export function genRandomIntInsecure(N) {
    return Math.floor(Math.random() * N);
}

// TODO: Move bootstrap to ArkPlace class constructor
export function canvasBootstrap(canvasHandler, canvasSize) {
    // TODO: Get data from blockchain
    // Generate test data
    for (var i = 0; i < 10000; i++) {
        var x = genRandomIntInsecure(canvasSize);
        var y = genRandomIntInsecure(canvasSize);
        var depth = genRandomIntInsecure(10);
        var color = 'rgb(' + genRandomIntInsecure(255) + ',' + genRandomIntInsecure(255) + ',' + genRandomIntInsecure(255) + ')';
        canvasHandler.updateDenseTreeItem(x, y, depth, color, true);
    }
    canvasHandler.updateImage();

}

export function updateXYValuesUI(x, y) {
    document.getElementsByName("formX")[0].value = x;
    document.getElementsByName("formY")[0].value = y;
}

export function updateDepthValuesUI(depth) {
    document.getElementsByName("formDepth")[0].value = depth;
    ap.setDepth(depth);
}
