import CanvasHandler from "/js/controller.js";
import Viewer from "/js/viewer.js";

export function genRandomIntInsecure(N) {
  return Math.floor(Math.random() * N);
}

// TODO: Move bootstrap to ArkPlace class constructor
export function canvasBootstrap(controller, canvas_size) {
  // TODO: Get data from blockchain
  // Generate test data
  for (var i = 0; i < 10000; i++) {
    var x = genRandomIntInsecure(canvas_size);
    var y = genRandomIntInsecure(canvas_size);
    var depth = genRandomIntInsecure(10);
    controller.updateDenseTreeItem(x, y, depth,
      'rgb(' + genRandomIntInsecure(255) + ',' +
      genRandomIntInsecure(255) + ',' +
      genRandomIntInsecure(255) + ')',
      true);
  }
  controller.updateImage();

}

export function loadJSON(callback, filename) {
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open('GET', filename, true);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      // Required use of an anonymous callback as .open will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
}

export function updateXYValuesUI(x, y) {
  document.getElementsByName("formX")[0].value = x;
  document.getElementsByName("formY")[0].value = y;
}

export function updateDepthValuesUI(depth) {
  document.getElementsByName("formDepth")[0].value = depth;
  ap.setDepth(depth);
}
