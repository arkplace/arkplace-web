export default class DenseQuadTree {
  constructor(canvas_size) {
    this.canvas_size = canvas_size;
    this.max_depth = this.log2(canvas_size);
    this.bf = 4;
    this.qtitems = this.getQuadTreeSize(this.max_depth);
    this.storage = Array(this.qtitems);
  }

  createNewItem() {
    var item = {
            useCount: 0,
            depth: 0,
            colorVal: "#000000",
            visible: False
           };
    return item;
  }

  log2(n){
    return Math.ceil(Math.log(n)/Math.log(2));
  }

  getPrevOffsetFromIndex(index) {
    var depth = this.getDepthFromIndex(index);
    var offset_prev = this.getQuadTreeSize(depth);
    return offset_prev;
  }

  getQuadTreeSize(depth) {
    return Math.floor((1-Math.pow(this.bf, depth))/(1-this.bf));
  }

  getDepthFromIndex(index) {
    return Math.ceil(Math.log(1-index*(1-this.bf))/Math.log(this.bf));
  }

  getYValueFromIndex(index) {
    var depth = this.getDepthFromIndex(index);
    var offset_prev = this.getPrevOffsetFromIndex(index);
    var step = this.canvas_size / Math.pow(2, depth);
    var y = (index - offset_prev) * step / this.canvas_size;
    return Math.floor(y);
  }

  getXValueFromIndex(index) {
    var offset_prev = this.getPrevOffsetFromIndex(index);
    var x = (index - offset_prev) % this.canvas_size;
    return x;
  }

  getIndexFromPos(depth, x, y) {
    var offset_prev = this.getQuadTreeSize(depth);
    var step = this.canvas_size / Math.pow(2, depth);
    var offset_cur = Math.floor(y/step) * this.canvas_size + Math.floor(x/step);
    var index = offset_prev + offset_cur;
    return index;
  }

  setDenseQuadTreeValue(color, visibility, depth, x, y) {
    var idx = this.getIndexFromPos(depth, x, y);

    // If uninitialized
    if (typeof this.storage[idx] === 'undefined') {
      this.storage[idx] = this.createNewItem();
    }
    else {
      this.storage[idx].useCount++;
      this.storage[idx].colorVal = color;
      this.storage[idx].visible = visibility;
    }
  }

  getDenseQuadTreeValue(depth, x, y) {
    var idx = this.getIndexFromPos(depth, x, y);

    // If uninitialized
    if (typeof this.storage[idx] === 'undefined') {
      return this.createNewItem();
    }
    else {
      return this.storage[idx];
    }
  }
}
