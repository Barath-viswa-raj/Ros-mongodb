class Position {
  constructor(x, y, z) {
    this.x = Position.toFloat64(x);
    this.y = Position.toFloat64(y);
    this.z = Position.toFloat64(z);
  }
  static toFloat64(value) {
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      throw new TypeError(`Invalid float64 number: ${value}`);
    }
    return num;
  }

}

class Orientation {
  constructor(x, y, z, w) {
    this.x = Orientation.toFloat64(x);
    this.y = Orientation.toFloat64(y);
    this.z = Orientation.toFloat64(z);
    this.w = Orientation.toFloat64(w);
  }
  static toFloat64(value) {
    const num = Number(value);
    if (Number.isNaN(num) || !Number.isFinite(num)) {
      throw new TypeError(`Invalid float64 number: ${value}`);
    }
    return num;
  }
}

class Pose {
  constructor(position, orientation) {
    this.position = position;
    this.orientation = orientation;
  }

  toDocument() {
    return {
      position: this.position,
      orientation: this.orientation
    };
  }
}

module.exports = { Pose, Position, Orientation };
