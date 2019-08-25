// TODO: Refactor to reduce function lenghts and improve code
// TODO: Separate Drawing (view) functionality from UI (control)
// TODO: Provide interface for Arkplace main class to call

import {canvasBootstrap, genRandomIntInsecure, updateXYValuesUI, updateDepthValuesUI} from "/js/utils.js";
import DenseQuadTree from "/js/quadtree.js";
import Viewer from "/js/viewer.js";

export default class Controller {
	constructor(name, canvas_size, canvas_offset) {
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

    // Last selected pixels
    this.mouse_selected_x = 0;
    this.mouse_selected_y = 0;

    // Selected depth for interactive display
    this.current_depth = 0;
    this.max_depth = 10;
    // TODO: is the bootstrap necessary?
    // Bootstrap canvas
    //canvasBootstrap(this, canvas_size);

		// Add listeners
		this.addListeners();

    // Prepare for rendering
    this.updateImage();
	}

  resetImage() {
    this.viewer.clearImage();
  }

  // Set depth value to be used for rendering
  setDepth(depth) {
    this.current_depth = depth;
  }

  // Update gui value of depth to reflect current
  updateDepth() {
    updateDepthValuesUI(this.current_depth);
  }

  // Drawing interface functions
  updateDenseTreeItem(x, y, depth, color, visible) {
    this.quad.setDenseQuadTreeItem(x, y, depth, color, visible);
  }

  updateImage() {
    this.resetImage();
    var max_items = this.quad.getQuadTreeSize()
    for (var i = 0; i < max_items; i++) {
      var tempItem = this.quad.getDenseQuadTreeItemByIndex(i);
      if (tempItem.visible) {

        this.commitToImage(i, tempItem);
        var x = this.quad.getXValueFromIndex(i);
        var y = this.quad.getYValueFromIndex(i);
        var depth = this.quad.getDepthFromIndex(i);
        console.log(x, y, depth, tempItem.colorVal);
      }
    }
    // Render
  	this.viewer.drawLoop(0, 0, 0);
  }

  commitToImage(index, item) {
    let {x, y, depth} = this.quad.getPosFromIndex(index);
		this.viewer.commitToImage(x, y, depth, item);
	}

	// UI related functions
	setCurrentDepthForCanvas(delta) {
  	var d = this.current_depth + delta;
    if (d < 0) {
      d = 0;
    }
    else if(d > this.max_depth) {
      d = this.max_depth;
    }
    console.log(d);
    updateDepthValuesUI(d);
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

		this.setCurrentDepthForCanvas(delta);
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
    this.recordXYValues(this.mouse_x, this.mouse_y);
  }

  recordXYValues(x, y) {
    this.mouse_selected_x = x;
    this.mouse_selected_y = y;
    console.log(x, y);
    updateXYValuesUI(x, y);
  }

	addListeners() {
		this.canvasRef.onmousemove = (this.mouseMoveHandler).bind(this);
    this.canvasRef.onmousewheel = (this.mouseWheelHandler).bind(this);
		this.canvasRef.onmousedown = (this.mouseDownHandler).bind(this);
		this.canvasRef.onmouseup = (this.mouseUpHandler).bind(this);
	}
};
