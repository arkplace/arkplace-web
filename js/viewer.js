export default class Viewer {
    constructor(name, canvas_size) {
      // Canvas related variables
      this.canvas_size = canvas_size;

      // Setup canvas and context
      this.setupCanvas(name);
      this.setupImageStorage(canvas_size);

      // How much to offset image
      this.offset_x = this.canvasRef.offsetLeft;
      this.offset_y = this.canvasRef.offsetTop;
    }

    setupCanvas(name) {
      this.canvasRef = document.getElementById(name);
      this.ctx = this.canvasRef.getContext("2d");
      this.canvasRef.height = document.body.offsetHeight;
      this.canvasRef.width = document.body.offsetWidth;
    }

    setupImageStorage(canvas_size) {
      this.img = document.createElement('canvas');
      this.img.height = canvas_size;
      this.img.width = canvas_size;
      this.imgctx = this.img.getContext('2d');
    }

    setOffsets(x, y) {
      this.offset_x = x;
      this.offset_y = y;
    }

    getOffsets() {
      return {ox: this.offset_x, oy: this.offset_y};
    }

    copyFromImage() {
  		return this.imgctx.getImageData(0,
																			0,
																			this.canvas_size,
																			this.canvas_size);
    }

    clearImage() {
      this.imgctx.clearRect(0,
                            0,
                            this.canvasRef.width,
                            this.canvasRef.height);
    }

    clearCanvas() {
      this.ctx.clearRect(0,
                        0,
                        this.ctx.canvas.width,
                        this.ctx.canvas.height);
    }

    drawLoop(mx, my, depth) {
      this.clearCanvas();

      // Copy pixels from image holder and display on main canvas
      var imageData = this.copyFromImage();
  		this.ctx.putImageData(imageData, this.offset_x, this.offset_y);

  		var color = "#F00";
  		// Draw UI selected region highlight
  		this.drawQuadTreeElementOutline(mx - this.offset_x,
  																		my - this.offset_y,
                                      depth,
  																		this.offset_x,
  																		this.offset_y,
  																		color,
  																		false);
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

    commitToImage(x, y, depth, item) {
  		this.drawQuadTreeElement(x,
															y,
                              depth,
															item.colorVal);
  	}

    paintQuadOnCanvas(rect_x, rect_y, size, offset_x, offset_y, color, to_fill) {
      if (to_fill) {
        this.imgctx.beginPath();
        this.imgctx.rect(rect_x + offset_x,
                      rect_y + offset_y,
                      size,
                      size);
        // Get pixel value from quadtree element
        this.imgctx.fillStyle = color;
        this.imgctx.fillRect(rect_x, rect_y, size, size);
        this.imgctx.closePath();
      }
      else {
        this.ctx.beginPath();
        this.ctx.rect(rect_x + offset_x,
                      rect_y + offset_y,
                      size,
                      size);
        this.ctx.strokeStyle = color;
        this.ctx.stroke();
        this.ctx.closePath();
      }
    }

    prepareForDrawing(x, y, depth) {
      var s = this.getQuadSizeAtDepth(depth);
      var cx = this.getQuadOffsetOfPixel(x, s);
      var cy = this.getQuadOffsetOfPixel(y, s);
      return {cx, cy, s};
    }

  	drawQuadTreeElementGeneric(x, y, depth, ox, oy,  pixel_color, to_fill) {
      if (this.outOfBounds(x, y))
        return;

      const {cx, cy, s} = this.prepareForDrawing(x, y, depth);
      this.paintQuadOnCanvas(cx, cy, s, ox, oy,  pixel_color, to_fill);
  	}

    drawQuadTreeElement(x, y, depth, pixel_color) {
      this.drawQuadTreeElementGeneric(x, y, depth, 0, 0, pixel_color, true);
  	}

    drawQuadTreeElementOutline(x, y, depth, offset_x, offset_y, pixel_color) {
      this.drawQuadTreeElementGeneric(x, y, depth, offset_x, offset_y, pixel_color, false);
  	}
};
