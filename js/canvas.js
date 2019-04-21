const CanvasHandler = class {
	constructor(name, canvas_size) {
		// Canvas related variables
		this.canvas_size = canvas_size;
		this.scale = 1.0;
		this.cumScale = 1.0;
		this.frameScale = 1.0;

		// Mouse position
		this.mouse_x = 0;
		this.mouse_y = 0;

		// status flag for dragging
		this.drag = false;

		// Start of drag point
		this.start_x = 0;
		this.start_y = 0;

		// Setup canvas and context
		this.canvasRef = document.getElementById(name);
		this.ctx = this.canvasRef.getContext("2d");

		// Setup image storage
		this.img = document.createElement('canvas');
		this.img.height = canvas_size;
		this.img.width = canvas_size;
		this.imgctx = this.img.getContext('2d');

		this.canvasRef.height = document.body.offsetHeight;
		this.canvasRef.width = document.body.offsetWidth;

		// How much to offset point
		this.offset_x = this.canvasRef.offsetLeft;
		this.offset_y = this.canvasRef.offsetTop;

		// Temp offset to update display while dragging
		this.tempoffset_x = 0;
		this.tempoffset_y = 0;

		// Selected depth for interactive display
		this.cur_depth = 0;

		// initialize
		// Add listeners
		this.addListeners();
		this.update();
	}

	MouseWheelHandler(e) {
    // cross-browser wheel delta
    var e = window.event || e; // old IE support
    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

    this.scale = 1 + delta*0.1;
    this.cumScale = this.cumScale*this.scale;

    console.info(this.cumScale);

		this.frameScale = 1/this.cumScale;
    this.drawLoop();

    return false;
	}

	drawLoop() {
		// Copy pixels from image holder and display on main canvas
		this.ctx.clearRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
		this.imgctx.restore();
		this.imgctx.scale(this.cumScale, this.cumScale);
		var imageData = this.imgctx.getImageData(0,
																			0,
																			this.canvas_size,
																			this.canvas_size);
		this.ctx.putImageData(imageData, this.offset_x, this.offset_y);

		// Draw UI selected region highlight
		this.drawQuadTreeElementOutline(this.cur_depth, this.mouse_x-this.offset_x,
																				this.mouse_y-this.offset_y,
																			this.offset_x,
																		this.offset_y);
	}

	update(commandList) {
		this.imgctx.restore();
		this.imgctx.clearRect(0, 0, this.canvasRef.width,
											this.canvasRef.height);

		for (i in commandList) {
			this.drawQuadTreeElement(commandList[i].depth,
				 												commandList[i].x,
																commandList[i].y,
																commandList[i].color);
		}
		this.imgctx.save();
	}

	addListeners() {
		// Mouse tracking
		this.canvasRef.onmousemove = (function(e) {
		    this.mouse_x = (e.pageX - this.canvasRef.offsetLeft)*this.frameScale;
		    this.mouse_y = (e.pageY - this.canvasRef.offsetTop)*this.frameScale;

		    if(this.drag) {
					this.offset_x = this.mouse_x - this.start_x;
			    this.offset_y = this.mouse_y - this.start_y;
				}

		    this.drawLoop();
		}).bind(this);


		this.canvasRef.onmousewheel = (function(e) {
	    // cross-browser wheel delta
	    var e = window.event || e; // old IE support
	    var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

		  this.scale = 1 + delta*0.1;
    	this.cumScale = this.cumScale*this.scale;

			//this.ctx.scale(this.scale, this.scale);

	    this.drawLoop();

	    return false;
		}).bind(this);

		// Drag and drop for panning canvas
		this.canvasRef.onmousedown = (function(e) {
			if(!this.drag){
				this.drag = true;

				this.start_x = this.mouse_x-this.offset_x;
				this.start_y = this.mouse_y-this.offset_y;
			}
		}).bind(this);

		// Drag and drop for panning canvas
		this.canvasRef.onmouseup = (function(e) {
			this.drag = false;

	    	this.offset_x = this.mouse_x - this.start_x;
	    	this.offset_y = this.mouse_y - this.start_y;

	    	this.tempoffset_x = 0;
			this.tempoffset_y = 0;

		}).bind(this);
	}

	drawQuadTreeElementOutline(depth, x, y, ox, oy) {
		if (x < 0
				|| y < 0
				|| x > this.canvas_size
				|| y > this.canvas_size)
			return;

		this.ctx.beginPath();
		var s = this.canvas_size/(Math.pow(2, depth));
		var cx = Math.floor(x/s)*s;
		var cy = Math.floor(y/s)*s;

		this.ctx.strokeStyle = '#F00';
		this.ctx.rect(cx+ox, cy+oy, s, s);
		this.ctx.stroke();
		this.ctx.closePath();
	}

	drawQuadTreeElement(depth, x, y, pixel_color) {
		this.imgctx.beginPath();
		var s = this.canvas_size/(Math.pow(2, depth));
		var cx = Math.floor(x/s)*s;
		var cy = Math.floor(y/s)*s;

		// Get pixel value from quadtree element
		this.imgctx.fillStyle = pixel_color;
		this.imgctx.fillRect(cx, cy, s, s);
		this.imgctx.closePath();
	}

	// UI related functions
	setCurrentDepthUI(depth) {
		this.cur_depth = depth;
	}

};

function	genRandomIntInsecure(N) {
		return Math.floor(Math.random()*N);
}

function canvasBootstrap() {
	var canvasSize = 1000;
	let cManager = new CanvasHandler("defaultCanvas", canvasSize);

	// TODO: Get data from blockchain
	//
	// Generate test data
	commandList = [];
	for (i = 0; i < 100; i++) {
		tempDat = {
			depth : Math.floor(i/10),
			x : genRandomIntInsecure(canvasSize),
			y : genRandomIntInsecure(canvasSize),
			color : 'rgb(' + genRandomIntInsecure(255) + ',' +
											genRandomIntInsecure(255) + ',' +
											genRandomIntInsecure(255) + ')'
		};
		commandList.push(tempDat);
	}

	// Add data to canvas
	cManager.update(commandList);
	cManager.drawLoop();
	console.info(cManager)
}
