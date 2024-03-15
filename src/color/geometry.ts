export type Point = { x: number; y: number };

export class PointSet {
  private _points: Point[];

  constructor(values?: readonly Point[] | null) {
    if (values) {
      this._points = values.slice();
    } else {
      this._points = [];
    }
  }

  add(point: Point): void {
    const match = this._points.find(p => p.x === point.x && p.y === point.y);
    if (!match) {
      this._points.push(point);
    }
  }

  pop(): Point | undefined {
    return this._points.pop();
  }

  get size(): number {
    return this._points.length;
  }
}

export type Size = { width: number; height: number };

export class Geometry {
  static midpoint(touches: React.TouchList) {
    var totalX = 0,
      totalY = 0;
    for (let i = 0; i < touches.length; i++) {
      const touch = touches[i];
      totalX += touch.screenX;
      totalY += touch.screenY;
    }
    return {
      x: totalX / touches.length,
      y: totalY / touches.length,
    };
  }

  static distance(touches: React.TouchList) {
    if (touches.length < 2) {
      return 0;
    }
    // we'll assume 2 touches
    let t1 = touches[0];
    let t2 = touches[1];
    let x = Math.abs(t1.screenX - t2.screenX);
    let y = Math.abs(t1.screenY - t2.screenY);
    return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
  }

  static panAndSpread(initial: React.TouchList, last: React.TouchList) {
    // pan
    const startMove = Geometry.midpoint(initial);
    const endMove = Geometry.midpoint(last);
    const pan = {
      x: endMove.x - startMove.x,
      y: endMove.y - startMove.y,
    };

    // spread
    const startSpread = Geometry.distance(initial);
    const endSpread = Geometry.distance(last);
    const goalSpread = endSpread - startSpread;
    const spread = goalSpread / 100 + 1;

    return { pan, spread };
  }
}
