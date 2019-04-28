import CanvasHandler from "/js/canvas.js";

export function genRandomIntInsecure(N) {
		return Math.floor(Math.random()*N);
}

// TODO: Move bootstrap to ArkPlace class constructor
export function canvasBootstrap(cManager) {
	// TODO: Get data from blockchain
	// Generate test data
	for (var i = 0; i < 1000; i++) {
		var tempDat = {
			depth : Math.floor(i/10),
			x : genRandomIntInsecure(cManager.canvas_size),
			y : genRandomIntInsecure(cManager.canvas_size),
			color : 'rgb(' + genRandomIntInsecure(255) + ',' +
											genRandomIntInsecure(255) + ',' +
											genRandomIntInsecure(255) + ')'
		};
		cManager.update(tempDat);
	}

	// Add data to canvas
	cManager.drawLoop();
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
