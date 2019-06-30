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
    this.scale = 1.0;
    this.cumScale = 1.0;
    this.frameScale = 1.0;

    // status flag for dragging
    this.drag = false;

    // Start of drag point
    this.start_x = 0;
    this.start_y = 0;

    // Mouse position
    this.mouse_x = 0;
    this.mouse_y = 0;

    // Selected depth for interactive display
    this.current_depth = 0;

    // TODO: is the bootstrap necessary?
    // Bootstrap canvas
    canvasBootstrap(this.viewer);

		// Add listeners
		this.addListeners();
	}

  resetImage() {
    this.viewer.clearImage();
  }

  // Drawing interface functions
	commitToImage(item) {
		this.viewer.commitToImage(item);
	}

	// UI related functions
	setCurrentDepthUI(depth) {
		this.current_depth = depth;
	}

  getWheelRolled(e) {
    return Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  }

  getMousePositionFromEvent(e) {
    return {
      x: e.pageX - this.canvasRef.offsetLeft,
      y: e.pageY - this.canvasRef.offsetTop
    };
  }

  // TODO: Re-do zoom feature
	mouseWheelHandler(e) {
		// cross-browser wheel delta
		var e = window.event || e; // old IE support
		var delta = this.getWheelRolled(e);

		this.scale = 1 + delta*0.1;
		this.cumScale = this.cumScale*this.scale;

		this.frameScale = 1/this.cumScale;
		this.viewer.drawLoop(this.mouse_x, this.mouse_y, this.current_depth);

		return false;
	}

  mouseMoveHandler(e) {
    const {x, y} = this.getMousePositionFromEvent(e);
    this.mouse_x = x*this.frameScale;
    this.mouse_y = y*this.frameScale;
    if(this.drag) {
      this.viewer.setOffsets(this.mouse_x - this.start_x,
                             this.mouse_y - this.start_y);
    }

    this.viewer.drawLoop(this.mouse_x, this.mouse_y, this.current_depth);
  }

  mouseDownHandler(e) {
    if(!this.drag){
      this.drag = true;
      const {ox, oy} = this.viewer.getOffsets();
      this.start_x = this.mouse_x - ox;
      this.start_y = this.mouse_y - oy;
    }
  }

  mouseUpHandler(e) {
		this.drag = false;
  }

	addListeners() {
		this.canvasRef.onmousemove = (this.mouseMoveHandler).bind(this);
    // TODO: Re-do zoom feature
    // this.canvasRef.onmousewheel = (this.mouseWheelHandler).bind(this);
		this.canvasRef.onmousedown = (this.mouseDownHandler).bind(this);
		this.canvasRef.onmouseup = (this.mouseUpHandler).bind(this);
	}
};
