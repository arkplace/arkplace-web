export class Point {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
};

export class QixelWithDepth {
    constructor(x, y, depth, color) {
        this.point = new Point(x, y);
        this.depth = depth;
        this.color = color;
    }
};

export class QixelWithSize {
    constructor(x, y, size, color) {
        this.point = new Point(x, y);
        this.size = size;
        this.color = color;
    }
};
