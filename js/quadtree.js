export default class DenseQuadTree {
  constructor(canvas_size) {
    this.canvas_size = canvas_size;
    this.max_depth = Math.ceil(Math.log(canvas_size,2));
    this.bf = 4;
    this.qtitems = this.getIndexFromPos(this.max_depth);
    this.storage = Array(this.qtitems);
  }

  createNewItem() {
    item = {
            useCount: 0,
            depth: 0,
            colorVal: "#000000",
            visible: False
           };
    return item;
  }

  getPrevOffsetFromIndex(index) {
      depth = this.getDepthFromIndex(index);
      offset_prev = this.getQuadTreeSize(depth);
      return offset_prev;
  }

  getQuadTreeSize(depth) {
      return Math.floor((1-Math.pow(this.bf, depth))/(1-this.bf));
  }

  getDepthFromIndex(index) {
    return Math.ceil(Math.log(1-index*(1-this.bf))/Math.log(this.bf));
  }

  getYValueFromIndex(index) {
    depth = this.getDepthFromIndex(index);
    offset_prev = this.getPrevOffsetFromIndex(index);
    step = this.canvas_size / Math.pow(2, depth);
    y = (index - offset_prev) * step / this.canvas_size;
    return Math.floor(y);
  }

  getXValueFromIndex(index) {
    offset_prev = this.getPrevOffsetFromIndex(index);
    x = (index - offset_prev) % this.canvas_size;
    return x;
  }

  getIndexFromPos(depth, x, y) {
    offset_prev = this.getQuadTreeSize(depth);
    step = this.canvas_size / Math.pow(2, depth);
    offset_cur = Math.floor(y/step) * this.canvas_size + Math.floor(x/step);
    index = offset_prev + offset_cur;
    return index;
  }

  setDenseQuadTreeValue(color, visibility, depth, x, y) {
    idx = this.getIndexFromPos(depth, x, y);

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
    idx = this.getIndexFromPos(depth, x, y);

    // If uninitialized
    if (typeof this.storage[idx] === 'undefined') {
      return this.createNewItem();
    }
    else {
      return this.storage[idx];
    }
  }
}
