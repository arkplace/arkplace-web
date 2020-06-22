export class DenseQuadTree {
    constructor(canvasSize) {
        this.canvasSize_ = canvasSize;
        this.maxDepth_ = this.log2(canvasSize);
        this.bf_ = 4;
        this.qtitems_ = this.getQuadTreeSize(this.maxDepth_);
        this.storage_ = Array(this.qtitems_);
    }

    createNewItem() {
        var item = {
            useCount: 0,
            colorVal: "#777777",
            visible: false
        };
        return item;
    }

    log2(n) {
        return Math.ceil(Math.log(n) / Math.log(2));
    }

    getPrevOffsetFromIndex(index) {
        var depth = this.getDepthFromIndex(index);
        var offsetPrev = this.getQuadTreeSize(depth);
        return offsetPrev;
    }

    getQuadTreeSize(depth = this.maxDepth_) {
        if (depth < 0) 
            return 0;
        return Math.floor((1 - Math.pow(this.bf_, depth)) / (1 - this.bf_));
    }

    getXValueFromIndex(index) {
        var depth = this.getDepthFromIndex(index);
        var offsetPrev = this.getPrevOffsetFromIndex(index);
        var step = this.canvasSize_ / Math.pow(2, depth);
        var x = ((index - offsetPrev) % Math.pow(2, depth)) * step;
        return x;
    }

    getYValueFromIndex(index) {
        var depth = this.getDepthFromIndex(index);
        var offsetPrev = this.getPrevOffsetFromIndex(index);
        var step = this.canvasSize_ / Math.pow(2, depth);
        var y = (index - offsetPrev) * step / Math.pow(2, depth);
        return Math.floor(y);
    }

    getDepthFromIndex(index) {
        return Math.floor(Math.log(1 - index * (1 - this.bf_)) / Math.log(this.bf_));
    }

    getPosFromIndex(index) {
        var x = this.getXValueFromIndex(index);
        var y = this.getYValueFromIndex(index);
        var depth = this.getDepthFromIndex(index);

        return {x, y, depth};
    }

    getIndexFromPos(x, y, depth) {
        var offsetPrev = this.getQuadTreeSize(depth);
        var step = this.canvasSize_ / Math.pow(2, depth);
        var offsetCur = Math.floor(y / step) * Math.pow(2, depth) + Math.floor(x / step);
        var index = offsetPrev + offsetCur;
        return index;
    }

    setDenseQuadTreeItem(x, y, depth, color, visible) {
        var idx = this.getIndexFromPos(x, y, depth);

        // If uninitialized
        if (typeof this.storage_[idx] === 'undefined') {
            this.storage_[idx] = this.createNewItem();
        }
        this.storage_[idx].useCount ++;
        this.storage_[idx].colorVal = color;
        this.storage_[idx].visible = visible;
    }

    getDenseQuadTreeItemByIndex(index) { // If uninitialized
        if (typeof this.storage_[index] === 'undefined') {
            return this.createNewItem();
        } else {
            return this.storage_[index];
        }
    }

    getDenseQuadTreeItem(x, y, depth) {
        var idx = this.getIndexFromPos(x, y, depth);
        return this.getDenseQuadTreeItembyIndex(idx);
    }

    getRewriteCountFor(x, y, depth) {
        var idx = this.getIndexFromPos(x, y, depth);
        if (this.storage_[idx]) {
            return this.storage[idx].useCount;
        }
        return 0;
    }
}
