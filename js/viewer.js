import {Point, QixelWithDepth, QixelWithSize} from "/js/commonTypes.js";

export default class Viewer {
    constructor(name, canvasSize) { // Canvas related variables
        this.canvasSize_ = canvasSize;

        // Setup canvas and context
        this.setupCanvas(name);
        this.setupImageStorage(canvasSize);

        // How much to offset image
        this.offsetX_ = 0;
        this.offsetY_ = 0;
    }

    setupCanvas(name) {
        this.canvasRef_ = document.getElementById(name);
        this.ctx_ = this.canvasRef_.getContext("2d");
        this.canvasRef_.height = document.body.offsetHeight;
        this.canvasRef_.width = document.body.offsetWidth;
    }

    setupImageStorage(canvasSize_) {
        this.img_ = document.createElement('canvas');
        this.img_.height = canvasSize_;
        this.img_.width = canvasSize_;
        this.imgctx_ = this.img_.getContext('2d');
    }

    setOffsets(x, y) {
        this.offsetX_ = x;
        this.offsetY_ = y;
    }

    getOffsets() {
        return {ox: this.offsetX_, oy: this.offsetY_};
    }

    copyFromImage() {
        return this.imgctx_.getImageData(0, 0, this.canvasSize_, this.canvasSize_);
    }

    clearImage() {
        this.imgctx_.clearRect(0, 0, this.canvasRef_.width, this.canvasRef_.height);
    }

    clearCanvas() {
        this.ctx_.clearRect(0, 0, this.ctx_.canvas.width, this.ctx_.canvas.height);
    }

    drawLoop(qixel) {
        this.clearCanvas();

        // Copy pixels from image holder and display on main canvas
        var imageData = this.copyFromImage();
        this.ctx_.putImageData(imageData, this.offsetX_, this.offsetY_);
        this.drawOverLayIndicator(qixel);
    }

    drawOverLayIndicator(qixel) { // Draw UI selected region highlight
        var color = "#F00";
        var offsetPt = new Point(this.offsetX_, this.offsetY_);
        var newQixel = new QixelWithDepth(qixel.point.x - offsetPt.x, qixel.point.y - offsetPt.y, qixel.depth, color);
        this.drawQuadTreeElementOutline(newQixel, offsetPt, false);
    }

    outOfBounds(point) {
        return(point.x < 0 || point.y < 0 || point.x > this.canvasSize_ || point.y > this.canvasSize_);
    }

    getQuadSizeAtDepth(depth) {
        return this.canvasSize_ / (Math.pow(2, depth));
    }

    getQuadOffsetOfPixel(pixel_val, step) {
        return Math.floor(pixel_val / step) * step;
    }

    commitToImage(x, y, depth, item) {
        var qixel = new QixelWithDepth(x, y, depth, item.colorVal);
        this.drawQuadTreeElement(qixel);
    }

    paintQuadOnCanvas(qixel, offset_pt, to_fill) {
        var ctx = this.selectCanvasCtx(to_fill, ctx, qixel);
        this.ctxMakeDrawable(ctx, qixel, offset_pt);
        this.ctxCreateRect(ctx, qixel, offset_pt);
        this.ctxFillOrStroke(to_fill, ctx, qixel);
        this.ctxMakeUndrawable(ctx);
    }

    ctxFillOrStroke(to_fill, ctx, qixel) {
        if (to_fill) {
            this.fillRectOnCtx(ctx, qixel);
        }
        else {
            this.strokeRectOnCtx(ctx, qixel);
        }
    }

    selectCanvasCtx(to_fill, ctx, qixel) {
        if (to_fill) {
            ctx = this.imgctx_;
        }
        else {
            qixel.color = "#F00";
            ctx = this.ctx_;
        }
        return ctx;
    }

    strokeRectOnCtx(ctx, qixel) {
        ctx.strokeStyle = qixel.color;
        ctx.stroke();
    }

    fillRectOnCtx(ctx, qixel) {
        ctx.fillStyle = qixel.color;
        ctx.fillRect(qixel.point.x, qixel.point.y, qixel.size, qixel.size);
    }

    ctxCreateRect(ctx, qixel, offsetPt) {
        ctx.rect(qixel.point.x + offsetPt.x, qixel.point.y + offsetPt.y, qixel.size, qixel.size);
    }

    ctxMakeUndrawable(ctx) {
        ctx.closePath();
    }

    ctxMakeDrawable(ctx) {
        ctx.beginPath();
    }

    prepareForDrawing(qixel) {
        var s = this.getQuadSizeAtDepth(qixel.depth);
        var cx = this.getQuadOffsetOfPixel(qixel.point.x, s);
        var cy = this.getQuadOffsetOfPixel(qixel.point.y, s);
        return {cx, cy, s};
    }

    drawQuadTreeElementGeneric(qixel, offset_pt, to_fill) {
        if (this.outOfBounds(qixel.point)) 
            return;

        const {cx, cy, s} = this.prepareForDrawing(qixel);
        var newQixel = new QixelWithSize(cx, cy, s, qixel.color);
        this.paintQuadOnCanvas(newQixel, offset_pt, to_fill);
    }

    drawQuadTreeElement(qixel) {
        var zeroPt = new Point(0, 0);
        this.drawQuadTreeElementGeneric(qixel, zeroPt, true);
    }

    drawQuadTreeElementOutline(qixel, offsetPt) {
        this.drawQuadTreeElementGeneric(qixel, offsetPt, false);
    }
};
