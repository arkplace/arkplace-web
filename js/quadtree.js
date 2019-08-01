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
            colorVal: "#777777",
            visible: false
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

  getQuadTreeSize(depth = this.max_depth) {
    if (depth < 0)
      return 0;
    return Math.floor((1-Math.pow(this.bf, depth))/(1-this.bf));
  }

  getXValueFromIndex(index) {
    var depth = this.getDepthFromIndex(index);
    var offset_prev = this.getPrevOffsetFromIndex(index);
    var step = this.canvas_size / Math.pow(2, depth);
    var x = ((index - offset_prev) % Math.pow(2, depth)) * step;
    return x;
  }

  getYValueFromIndex(index) {
    var depth = this.getDepthFromIndex(index);
    var offset_prev = this.getPrevOffsetFromIndex(index);
    var step = this.canvas_size / Math.pow(2, depth);
    var y = (index - offset_prev) * step / Math.pow(2, depth);
    return Math.floor(y);
  }

  getDepthFromIndex(index) {
    return Math.floor(Math.log(1-index*(1-this.bf))/Math.log(this.bf));
  }

  getPosFromIndex(index) {
    var x = this.getXValueFromIndex(index);
    var y = this.getYValueFromIndex(index);
    var depth = this.getDepthFromIndex(index);

    return {x, y, depth};
  }

  getIndexFromPos(x, y, depth) {
    var offset_prev = this.getQuadTreeSize(depth);
    var step = this.canvas_size / Math.pow(2, depth);
    var offset_cur = Math.floor(y/step) * Math.pow(2, depth) + Math.floor(x/step);
    var index = offset_prev + offset_cur;
    return index;
  }

  setDenseQuadTreeItem(x, y, depth, color, visible) {
    var idx = this.getIndexFromPos(x, y, depth);

    // If uninitialized
    if (typeof this.storage[idx] === 'undefined') {
      this.storage[idx] = this.createNewItem();
    }
    this.storage[idx].useCount++;
    this.storage[idx].colorVal = color;
    this.storage[idx].visible = visible;
  }

  getDenseQuadTreeItemByIndex(index) {
    // If uninitialized
    if (typeof this.storage[index] === 'undefined') {
      return this.createNewItem();
    }
    else {
      return this.storage[index];
    }
  }

  getDenseQuadTreeItem(x, y, depth) {
    var idx = this.getIndexFromPos(x, y, depth);
    return this.getDenseQuadTreeItembyIndex(idx);
  }
}
