export default class Viewer {
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

      // How much to offset image
      this.offset_x = this.canvasRef.offsetLeft;
      this.offset_y = this.canvasRef.offsetTop;

      // Temp offset to update display while dragging
      this.tempoffset_x = 0;
      this.tempoffset_y = 0;

      // Selected depth for interactive display
      this.cur_depth = 0;
    }

    copyFromImage() {
    		this.imgctx.restore();
    		this.imgctx.scale(this.cumScale, this.cumScale);
    		return this.imgctx.getImageData(0,
  																			0,
  																			this.canvas_size,
  																			this.canvas_size);
    }

    clearCanvas() {
      this.ctx.clearRect(0,
                        0,
                        this.ctx.canvas.width,
                        this.ctx.canvas.height);
    }

    drawLoop() {
      this.clearCanvas();

      // Copy pixels from image holder and display on main canvas
      var imageData = this.copyFromImage();
  		this.ctx.putImageData(imageData, this.offset_x, this.offset_y);

  		var color = "#F00";
  		// Draw UI selected region highlight
  		this.drawQuadTreeElementOutline(this.cur_depth,
  																		this.mouse_x-this.offset_x,
  																		this.mouse_y-this.offset_y,
  																		this.offset_x,
  																		this.offset_y,
  																		color,
  																		false);
    }

		clear() {
			this.imgctx.clearRect(0,
														0,
														this.canvasRef.width,
														this.canvasRef.height);
		}

    outOfBounds(x, y) {
      return (x < 0
          || y < 0
          || x > this.canvas_size
          || y > this.canvas_size);
    }

    getQuadSizeAtDepth(depth) {
      return this.canvas_size/(Math.pow(2, depth));
    }

    getQuadOffsetOfPixel(pixel_val, step) {
      return Math.floor(pixel_val/step)*step;
    }

    commitToImage(item) {
  		this.drawQuadTreeElement(item.depth,
			 												item.x,
															item.y,
															item.color);
  	}

    paintQuadOnCanvas(rect_x, rect_y, size, offset_x, offset_y, color, to_fill) {
      this.ctx.beginPath();
      this.ctx.rect(rect_x + offset_x,
                    rect_y + offset_y,
                    size,
                    size);

      if (to_fill) {
        // Get pixel value from quadtree element
        this.imgctx.fillStyle = color;
        this.imgctx.fillRect(rect_x, rect_y, size, size);
      }
      else {
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
      }

      this.ctx.closePath();
    }

    prepareForDrawing(depth, x, y) {
      var s = this.getQuadSizeAtDepth(depth);
      var cx = this.getQuadOffsetOfPixel(x, s);
      var cy = this.getQuadOffsetOfPixel(y, s);
      return {cx, cy, s};
    }

  	drawQuadTreeElementGeneric(depth, x, y, ox, oy,  pixel_color, to_fill) {
      if (this.outOfBounds(x, y))
        return;

      const {cx, cy, s} = this.prepareForDrawing(depth, x, y);
      this.paintQuadOnCanvas(cx, cy, s, ox, oy,  pixel_color, to_fill);
  	}

    drawQuadTreeElement(depth, x, y, pixel_color) {
      this.drawQuadTreeElementGeneric(depth, x, y, 0, 0, pixel_color, true);
  	}

    drawQuadTreeElementOutline(depth, x, y, offset_x, offset_y, pixel_color) {
      this.drawQuadTreeElementGeneric(depth, x, y, offset_x, offset_y, pixel_color, false);
  	}
};
