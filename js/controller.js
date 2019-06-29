// TODO: Refactor to reduce function lenghts and improve code
// TODO: Separate Drawing (view) functionality from UI (control)
// TODO: Provide interface for Arkplace main class to call

import {canvasBootstrap} from "/js/utils.js";
import DenseQuadTree from "/js/quadtree.js";
import Viewer from "/js/viewer.js";

export default class CanvasHandler {
	constructor(name, canvas_size) {
	  // Setup canvas and context
	  this.canvasRef = document.getElementById(name);
	  this.ctx = this.canvasRef.getContext("2d");

		this.quad = new DenseQuadTree(canvas_size);
		this.viewer = new Viewer(name, canvas_size);
		// initialize
		// Add listeners

    canvasBootstrap(this.viewer);
		this.addListeners();
	}

	commitToImage(item) {
		this.viewer.commitToImage(item);
	}

	// UI related functions
	setCurrentDepthUI(depth) {
		this.cur_depth = depth;
	}

	MouseWheelHandler(e) {
		// cross-browser wheel delta
		var e = window.event || e; // old IE support
		var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

		this.scale = 1 + delta*0.1;
		this.cumScale = this.cumScale*this.scale;

		this.frameScale = 1/this.cumScale;
		this.drawLoop();

		return false;
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

				this.viewer.drawLoop();
		}).bind(this);

		this.canvasRef.onmousewheel = (function(e) {
			// cross-browser wheel delta
			var e = window.event || e; // old IE support
			var delta = Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));

			this.scale = 1 + delta*0.1;
			this.cumScale = this.cumScale*this.scale;
			//this.ctx.scale(this.scale, this.scale);
			this.viewer.drawLoop();
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

		this.canvasRef.onmouseup = (function(e) {
				this.drag = false;
				this.offset_x = this.mouse_x - this.start_x;
				this.offset_y = this.mouse_y - this.start_y;
				this.tempoffset_x = 0;
				this.tempoffset_y = 0;
		}).bind(this);
	}
};
