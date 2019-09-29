// TODO: Refactor to reduce function lenghts and improve code
// TODO: Separate Drawing (view) functionality from UI (control)
// TODO: Provide interface for Arkplace main class to call

import {updateXYValuesUI, updateDepthValuesUI} from "/js/utils.js";
import {QixelWithDepth} from "/js/commonTypes.js";
import DenseQuadTree from "/js/quadtree.js";
import Viewer from "/js/viewer.js";

export default class Controller {
	constructor(name, canvasSize, canvas_offset) {
	  // Setup canvas and context
	  this.canvasRef_ = document.getElementById(name);
	  this.ctx_ = this.canvasRef_.getContext("2d");

		this.quad_ = new DenseQuadTree(canvasSize);
		this.viewer_ = new Viewer(name, canvasSize);

		// initialize
    this.scale_ = 1.0;
    this.cumScale_ = 1.0;
    this.frameScale_ = 1.0;

    // status flag for dragging
    this.drag_ = false;

    // Start of drag point
    this.startX_ = 0;
    this.startY_ = 0;

    // Mouse position
    this.mouseX_ = 0;
    this.mouseY_ = 0;

    // Last selected pixels
    this.mouseSelectedX_ = 0;
    this.mouseSelectedY_ = 0;

    // Selected depth for interactive display
    this.currentDepth_ = 0;
    this.maxDepth_ = 10;
    // TODO: is the bootstrap necessary?
    // Bootstrap canvas
    //canvasBootstrap(this, canvasSize);

		// Add listeners
		this.addListeners();

    // Prepare for rendering
    this.updateImage();
	}

  resetImage() {
    this.viewer_.clearImage();
  }

  // Set depth value to be used for rendering
  setDepth(depth) {
    this.currentDepth_ = depth;
  }

  // Update gui value of depth to reflect current
  updateDepth() {
    updateDepthValuesUI(this.currentDepth_);
  }

  // Drawing interface functions
  updateDenseTreeItem(x, y, depth, color, visible) {
    this.quad_.setDenseQuadTreeItem(x, y, depth, color, visible);
  }

  updateImage() {
    this.resetImage();
    var max_items = this.quad_.getQuadTreeSize()
    for (var i = 0; i < max_items; i++) {
      var tempItem = this.quad_.getDenseQuadTreeItemByIndex(i);
      if (tempItem.visible) {

        this.commitToImage(i, tempItem);
        var x = this.quad_.getXValueFromIndex(i);
        var y = this.quad_.getYValueFromIndex(i);
        var depth = this.quad_.getDepthFromIndex(i);
      }
    }
    var qixel = new QixelWithDepth(0, 0, 0, "");
    // Render
  	this.viewer_.drawLoop(qixel);
  }

  commitToImage(index, item) {
    let {x, y, depth} = this.quad_.getPosFromIndex(index);
		this.viewer_.commitToImage(x, y, depth, item);
	}

	// UI related functions
	setCurrentDepthForCanvas(delta) {
  	var d = this.currentDepth_ + delta;
    if (d < 0) {
      d = 0;
    }
    else if(d > this.maxDepth_) {
      d = this.maxDepth_;
    }
    console.log(d);
    updateDepthValuesUI(d);
	}

  getWheelRolled(e) {
    return Math.max(-1, Math.min(1, (e.wheelDelta || -e.detail)));
  }

  getMousePositionFromEvent(e) {
    return {
      x: e.pageX - this.canvasRef_.offsetLeft,
      y: e.pageY - this.canvasRef_.offsetTop
    };
  }

  // TODO: Re-do zoom feature

	mouseWheelHandler(e) {
		// cross-browser wheel delta
		var e = window.event || e; // old IE support
		var delta = this.getWheelRolled(e);

    this.setCurrentDepthForCanvas(delta);
    var qixel = new QixelWithDepth(this.mouseX_, this.mouseY_, this.currentDepth_, "");
		this.viewer_.drawLoop(qixel);

		return false;
	}

  mouseMoveHandler(e) {
    const {x, y} = this.getMousePositionFromEvent(e);
    this.mouseX_ = x*this.frameScale_;
    this.mouseY_ = y*this.frameScale_;
    if(this.drag_) {
      this.viewer_.setOffsets(this.mouseX_ - this.startX_,
                             this.mouseY_ - this.startY_);
    }

    var qixel = new QixelWithDepth(this.mouseX_, this.mouseY_, this.currentDepth_, "");
		this.viewer_.drawLoop(qixel);
  }

  mouseDownHandler(e) {
    if(!this.drag_){
      this.drag_ = true;
      const {ox, oy} = this.viewer_.getOffsets();
      this.startX_ = this.mouseX_ - ox;
      this.startY_ = this.mouseY_ - oy;
    }
  }

  mouseUpHandler(e) {
    this.drag_ = false;
    this.recordXYValues(this.mouseX_, this.mouseY_);
  }

  recordXYValues(x, y) {
    this.mouseSelectedX_ = x;
    this.mouseSelectedY_ = y;
    console.log(x, y);
    updateXYValuesUI(x, y);
  }

	addListeners() {
		this.canvasRef_.onmousemove = (this.mouseMoveHandler).bind(this);
    this.canvasRef_.onmousewheel = (this.mouseWheelHandler).bind(this);
		this.canvasRef_.onmousedown = (this.mouseDownHandler).bind(this);
		this.canvasRef_.onmouseup = (this.mouseUpHandler).bind(this);
	}
};
