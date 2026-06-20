const ut = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"], yr = Math.PI / 180, ts = 180 / Math.PI;
function sn() {
  const n = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, i = Math.random() * 4294967295 | 0;
  return (ut[n & 255] + ut[n >> 8 & 255] + ut[n >> 16 & 255] + ut[n >> 24 & 255] + "-" + ut[e & 255] + ut[e >> 8 & 255] + "-" + ut[e >> 16 & 15 | 64] + ut[e >> 24 & 255] + "-" + ut[t & 63 | 128] + ut[t >> 8 & 255] + "-" + ut[t >> 16 & 255] + ut[t >> 24 & 255] + ut[i & 255] + ut[i >> 8 & 255] + ut[i >> 16 & 255] + ut[i >> 24 & 255]).toLowerCase();
}
function dt(n, e, t) {
  return Math.max(e, Math.min(t, n));
}
function al(n, e) {
  return (n % e + e) % e;
}
function Er(n, e, t) {
  return (1 - t) * n + t * e;
}
function ln(n, e) {
  switch (e.constructor) {
    case Float32Array:
      return n;
    case Uint32Array:
      return n / 4294967295;
    case Uint16Array:
      return n / 65535;
    case Uint8Array:
      return n / 255;
    case Int32Array:
      return Math.max(n / 2147483647, -1);
    case Int16Array:
      return Math.max(n / 32767, -1);
    case Int8Array:
      return Math.max(n / 127, -1);
    default:
      throw new Error("Invalid component type.");
  }
}
function gt(n, e) {
  switch (e.constructor) {
    case Float32Array:
      return n;
    case Uint32Array:
      return Math.round(n * 4294967295);
    case Uint16Array:
      return Math.round(n * 65535);
    case Uint8Array:
      return Math.round(n * 255);
    case Int32Array:
      return Math.round(n * 2147483647);
    case Int16Array:
      return Math.round(n * 32767);
    case Int8Array:
      return Math.round(n * 127);
    default:
      throw new Error("Invalid component type.");
  }
}
class Sn {
  constructor(e = 0, t = 0, i = 0, r = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = i, this._w = r;
  }
  static slerpFlat(e, t, i, r, s, a, o) {
    let l = i[r + 0], c = i[r + 1], h = i[r + 2], d = i[r + 3];
    const f = s[a + 0], m = s[a + 1], g = s[a + 2], v = s[a + 3];
    if (o === 0) {
      e[t + 0] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
      return;
    }
    if (o === 1) {
      e[t + 0] = f, e[t + 1] = m, e[t + 2] = g, e[t + 3] = v;
      return;
    }
    if (d !== v || l !== f || c !== m || h !== g) {
      let p = 1 - o;
      const u = l * f + c * m + h * g + d * v, b = u >= 0 ? 1 : -1, M = 1 - u * u;
      if (M > Number.EPSILON) {
        const O = Math.sqrt(M), w = Math.atan2(O, u * b);
        p = Math.sin(p * w) / O, o = Math.sin(o * w) / O;
      }
      const T = o * b;
      if (l = l * p + f * T, c = c * p + m * T, h = h * p + g * T, d = d * p + v * T, p === 1 - o) {
        const O = 1 / Math.sqrt(l * l + c * c + h * h + d * d);
        l *= O, c *= O, h *= O, d *= O;
      }
    }
    e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = d;
  }
  static multiplyQuaternionsFlat(e, t, i, r, s, a) {
    const o = i[r], l = i[r + 1], c = i[r + 2], h = i[r + 3], d = s[a], f = s[a + 1], m = s[a + 2], g = s[a + 3];
    return e[t] = o * g + h * d + l * m - c * f, e[t + 1] = l * g + h * f + c * d - o * m, e[t + 2] = c * g + h * m + o * f - l * d, e[t + 3] = h * g - o * d - l * f - c * m, e;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get w() {
    return this._w;
  }
  set w(e) {
    this._w = e, this._onChangeCallback();
  }
  set(e, t, i, r) {
    return this._x = e, this._y = t, this._z = i, this._w = r, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._w);
  }
  copy(e) {
    return this._x = e.x, this._y = e.y, this._z = e.z, this._w = e.w, this._onChangeCallback(), this;
  }
  setFromEuler(e, t = !0) {
    const i = e._x, r = e._y, s = e._z, a = e._order, o = Math.cos, l = Math.sin, c = o(i / 2), h = o(r / 2), d = o(s / 2), f = l(i / 2), m = l(r / 2), g = l(s / 2);
    switch (a) {
      case "XYZ":
        this._x = f * h * d + c * m * g, this._y = c * m * d - f * h * g, this._z = c * h * g + f * m * d, this._w = c * h * d - f * m * g;
        break;
      case "YXZ":
        this._x = f * h * d + c * m * g, this._y = c * m * d - f * h * g, this._z = c * h * g - f * m * d, this._w = c * h * d + f * m * g;
        break;
      case "ZXY":
        this._x = f * h * d - c * m * g, this._y = c * m * d + f * h * g, this._z = c * h * g + f * m * d, this._w = c * h * d - f * m * g;
        break;
      case "ZYX":
        this._x = f * h * d - c * m * g, this._y = c * m * d + f * h * g, this._z = c * h * g - f * m * d, this._w = c * h * d + f * m * g;
        break;
      case "YZX":
        this._x = f * h * d + c * m * g, this._y = c * m * d + f * h * g, this._z = c * h * g - f * m * d, this._w = c * h * d - f * m * g;
        break;
      case "XZY":
        this._x = f * h * d - c * m * g, this._y = c * m * d - f * h * g, this._z = c * h * g + f * m * d, this._w = c * h * d + f * m * g;
        break;
      default:
        console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: " + a);
    }
    return t === !0 && this._onChangeCallback(), this;
  }
  setFromAxisAngle(e, t) {
    const i = t / 2, r = Math.sin(i);
    return this._x = e.x * r, this._y = e.y * r, this._z = e.z * r, this._w = Math.cos(i), this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e) {
    const t = e.elements, i = t[0], r = t[4], s = t[8], a = t[1], o = t[5], l = t[9], c = t[2], h = t[6], d = t[10], f = i + o + d;
    if (f > 0) {
      const m = 0.5 / Math.sqrt(f + 1);
      this._w = 0.25 / m, this._x = (h - l) * m, this._y = (s - c) * m, this._z = (a - r) * m;
    } else if (i > o && i > d) {
      const m = 2 * Math.sqrt(1 + i - o - d);
      this._w = (h - l) / m, this._x = 0.25 * m, this._y = (r + a) / m, this._z = (s + c) / m;
    } else if (o > d) {
      const m = 2 * Math.sqrt(1 + o - i - d);
      this._w = (s - c) / m, this._x = (r + a) / m, this._y = 0.25 * m, this._z = (l + h) / m;
    } else {
      const m = 2 * Math.sqrt(1 + d - i - o);
      this._w = (a - r) / m, this._x = (s + c) / m, this._y = (l + h) / m, this._z = 0.25 * m;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let i = e.dot(t) + 1;
    return i < Number.EPSILON ? (i = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = i) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = i)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = i), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(dt(this.dot(e), -1, 1)));
  }
  rotateTowards(e, t) {
    const i = this.angleTo(e);
    if (i === 0) return this;
    const r = Math.min(1, t / i);
    return this.slerp(e, r), this;
  }
  identity() {
    return this.set(0, 0, 0, 1);
  }
  invert() {
    return this.conjugate();
  }
  conjugate() {
    return this._x *= -1, this._y *= -1, this._z *= -1, this._onChangeCallback(), this;
  }
  dot(e) {
    return this._x * e._x + this._y * e._y + this._z * e._z + this._w * e._w;
  }
  lengthSq() {
    return this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w;
  }
  length() {
    return Math.sqrt(this._x * this._x + this._y * this._y + this._z * this._z + this._w * this._w);
  }
  normalize() {
    let e = this.length();
    return e === 0 ? (this._x = 0, this._y = 0, this._z = 0, this._w = 1) : (e = 1 / e, this._x = this._x * e, this._y = this._y * e, this._z = this._z * e, this._w = this._w * e), this._onChangeCallback(), this;
  }
  multiply(e) {
    return this.multiplyQuaternions(this, e);
  }
  premultiply(e) {
    return this.multiplyQuaternions(e, this);
  }
  multiplyQuaternions(e, t) {
    const i = e._x, r = e._y, s = e._z, a = e._w, o = t._x, l = t._y, c = t._z, h = t._w;
    return this._x = i * h + a * o + r * c - s * l, this._y = r * h + a * l + s * o - i * c, this._z = s * h + a * c + i * l - r * o, this._w = a * h - i * o - r * l - s * c, this._onChangeCallback(), this;
  }
  slerp(e, t) {
    if (t === 0) return this;
    if (t === 1) return this.copy(e);
    const i = this._x, r = this._y, s = this._z, a = this._w;
    let o = a * e._w + i * e._x + r * e._y + s * e._z;
    if (o < 0 ? (this._w = -e._w, this._x = -e._x, this._y = -e._y, this._z = -e._z, o = -o) : this.copy(e), o >= 1)
      return this._w = a, this._x = i, this._y = r, this._z = s, this;
    const l = 1 - o * o;
    if (l <= Number.EPSILON) {
      const m = 1 - t;
      return this._w = m * a + t * this._w, this._x = m * i + t * this._x, this._y = m * r + t * this._y, this._z = m * s + t * this._z, this.normalize(), this;
    }
    const c = Math.sqrt(l), h = Math.atan2(c, o), d = Math.sin((1 - t) * h) / c, f = Math.sin(t * h) / c;
    return this._w = a * d + this._w * f, this._x = i * d + this._x * f, this._y = r * d + this._y * f, this._z = s * d + this._z * f, this._onChangeCallback(), this;
  }
  slerpQuaternions(e, t, i) {
    return this.copy(e).slerp(t, i);
  }
  random() {
    const e = 2 * Math.PI * Math.random(), t = 2 * Math.PI * Math.random(), i = Math.random(), r = Math.sqrt(1 - i), s = Math.sqrt(i);
    return this.set(
      r * Math.sin(e),
      r * Math.cos(e),
      s * Math.sin(t),
      s * Math.cos(t)
    );
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._w === this._w;
  }
  fromArray(e, t = 0) {
    return this._x = e[t], this._y = e[t + 1], this._z = e[t + 2], this._w = e[t + 3], this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._w, e;
  }
  fromBufferAttribute(e, t) {
    return this._x = e.getX(t), this._y = e.getY(t), this._z = e.getZ(t), this._w = e.getW(t), this._onChangeCallback(), this;
  }
  toJSON() {
    return this.toArray();
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._w;
  }
}
class L {
  constructor(e = 0, t = 0, i = 0) {
    L.prototype.isVector3 = !0, this.x = e, this.y = t, this.z = i;
  }
  set(e, t, i) {
    return i === void 0 && (i = this.z), this.x = e, this.y = t, this.z = i, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this;
  }
  multiplyVectors(e, t) {
    return this.x = e.x * t.x, this.y = e.y * t.y, this.z = e.z * t.z, this;
  }
  applyEuler(e) {
    return this.applyQuaternion(la.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(la.setFromAxisAngle(e, t));
  }
  applyMatrix3(e) {
    const t = this.x, i = this.y, r = this.z, s = e.elements;
    return this.x = s[0] * t + s[3] * i + s[6] * r, this.y = s[1] * t + s[4] * i + s[7] * r, this.z = s[2] * t + s[5] * i + s[8] * r, this;
  }
  applyNormalMatrix(e) {
    return this.applyMatrix3(e).normalize();
  }
  applyMatrix4(e) {
    const t = this.x, i = this.y, r = this.z, s = e.elements, a = 1 / (s[3] * t + s[7] * i + s[11] * r + s[15]);
    return this.x = (s[0] * t + s[4] * i + s[8] * r + s[12]) * a, this.y = (s[1] * t + s[5] * i + s[9] * r + s[13]) * a, this.z = (s[2] * t + s[6] * i + s[10] * r + s[14]) * a, this;
  }
  applyQuaternion(e) {
    const t = this.x, i = this.y, r = this.z, s = e.x, a = e.y, o = e.z, l = e.w, c = 2 * (a * r - o * i), h = 2 * (o * t - s * r), d = 2 * (s * i - a * t);
    return this.x = t + l * c + a * d - o * h, this.y = i + l * h + o * c - s * d, this.z = r + l * d + s * h - a * c, this;
  }
  project(e) {
    return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix);
  }
  unproject(e) {
    return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld);
  }
  transformDirection(e) {
    const t = this.x, i = this.y, r = this.z, s = e.elements;
    return this.x = s[0] * t + s[4] * i + s[8] * r, this.y = s[1] * t + s[5] * i + s[9] * r, this.z = s[2] * t + s[6] * i + s[10] * r, this.normalize();
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this.z /= e.z, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this;
  }
  clampLength(e, t) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Math.max(e, Math.min(t, i)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z;
  }
  // TODO lengthSquared?
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this;
  }
  lerpVectors(e, t, i) {
    return this.x = e.x + (t.x - e.x) * i, this.y = e.y + (t.y - e.y) * i, this.z = e.z + (t.z - e.z) * i, this;
  }
  cross(e) {
    return this.crossVectors(this, e);
  }
  crossVectors(e, t) {
    const i = e.x, r = e.y, s = e.z, a = t.x, o = t.y, l = t.z;
    return this.x = r * l - s * o, this.y = s * a - i * l, this.z = i * o - r * a, this;
  }
  projectOnVector(e) {
    const t = e.lengthSq();
    if (t === 0) return this.set(0, 0, 0);
    const i = e.dot(this) / t;
    return this.copy(e).multiplyScalar(i);
  }
  projectOnPlane(e) {
    return Tr.copy(this).projectOnVector(e), this.sub(Tr);
  }
  reflect(e) {
    return this.sub(Tr.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const i = this.dot(e) / t;
    return Math.acos(dt(i, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, i = this.y - e.y, r = this.z - e.z;
    return t * t + i * i + r * r;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y) + Math.abs(this.z - e.z);
  }
  setFromSpherical(e) {
    return this.setFromSphericalCoords(e.radius, e.phi, e.theta);
  }
  setFromSphericalCoords(e, t, i) {
    const r = Math.sin(t) * e;
    return this.x = r * Math.sin(i), this.y = Math.cos(t) * e, this.z = r * Math.cos(i), this;
  }
  setFromCylindrical(e) {
    return this.setFromCylindricalCoords(e.radius, e.theta, e.y);
  }
  setFromCylindricalCoords(e, t, i) {
    return this.x = e * Math.sin(t), this.y = i, this.z = e * Math.cos(t), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this;
  }
  setFromMatrixScale(e) {
    const t = this.setFromMatrixColumn(e, 0).length(), i = this.setFromMatrixColumn(e, 1).length(), r = this.setFromMatrixColumn(e, 2).length();
    return this.x = t, this.y = i, this.z = r, this;
  }
  setFromMatrixColumn(e, t) {
    return this.fromArray(e.elements, t * 4);
  }
  setFromMatrix3Column(e, t) {
    return this.fromArray(e.elements, t * 3);
  }
  setFromEuler(e) {
    return this.x = e._x, this.y = e._y, this.z = e._z, this;
  }
  setFromColor(e) {
    return this.x = e.r, this.y = e.g, this.z = e.b, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this;
  }
  randomDirection() {
    const e = Math.random() * Math.PI * 2, t = Math.random() * 2 - 1, i = Math.sqrt(1 - t * t);
    return this.x = i * Math.cos(e), this.y = t, this.z = i * Math.sin(e), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z;
  }
}
const Tr = /* @__PURE__ */ new L(), la = /* @__PURE__ */ new Sn(), ol = "166", ll = 0, ca = 1, cl = 2, po = 1, hl = 2, qt = 3, ci = 0, _t = 1, Yt = 2, oi = 0, Zi = 1, ha = 2, ua = 3, fa = 4, ul = 5, yi = 100, fl = 101, dl = 102, pl = 103, ml = 104, gl = 200, _l = 201, vl = 202, xl = 203, is = 204, ns = 205, Ml = 206, Sl = 207, yl = 208, El = 209, Tl = 210, Al = 211, bl = 212, wl = 213, Rl = 214, Cl = 0, Pl = 1, Ll = 2, or = 3, Dl = 4, Ul = 5, Il = 6, Nl = 7, mo = 0, Fl = 1, Ol = 2, li = 0, Bl = 1, zl = 2, Hl = 3, Gl = 4, Vl = 5, kl = 6, Wl = 7, go = 300, Qi = 301, en = 302, rs = 303, ss = 304, dr = 306, as = 1e3, Ti = 1001, os = 1002, bt = 1003, Xl = 1004, Rn = 1005, Lt = 1006, Ar = 1007, Ai = 1008, jt = 1009, _o = 1010, vo = 1011, _n = 1012, Hs = 1013, bi = 1014, Kt = 1015, yn = 1016, Gs = 1017, Vs = 1018, tn = 1020, xo = 35902, Mo = 1021, So = 1022, Dt = 1023, yo = 1024, Eo = 1025, Ji = 1026, nn = 1027, To = 1028, ks = 1029, Ao = 1030, Ws = 1031, Xs = 1033, er = 33776, tr = 33777, ir = 33778, nr = 33779, ls = 35840, cs = 35841, hs = 35842, us = 35843, fs = 36196, ds = 37492, ps = 37496, ms = 37808, gs = 37809, _s = 37810, vs = 37811, xs = 37812, Ms = 37813, Ss = 37814, ys = 37815, Es = 37816, Ts = 37817, As = 37818, bs = 37819, ws = 37820, Rs = 37821, rr = 36492, Cs = 36494, Ps = 36495, bo = 36283, Ls = 36284, Ds = 36285, Us = 36286, ql = 3200, Yl = 3201, wo = 0, Kl = 1, ai = "", It = "srgb", ui = "srgb-linear", qs = "display-p3", pr = "display-p3-linear", lr = "linear", Je = "srgb", cr = "rec709", hr = "p3", Pi = 7680, da = 519, Zl = 512, Jl = 513, $l = 514, Ro = 515, jl = 516, Ql = 517, ec = 518, tc = 519, pa = 35044, ma = "300 es", Zt = 2e3, ur = 2001;
class je {
  constructor(e, t, i, r, s, a, o, l, c, h, d, f, m, g, v, p) {
    je.prototype.isMatrix4 = !0, this.elements = [
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, i, r, s, a, o, l, c, h, d, f, m, g, v, p);
  }
  set(e, t, i, r, s, a, o, l, c, h, d, f, m, g, v, p) {
    const u = this.elements;
    return u[0] = e, u[4] = t, u[8] = i, u[12] = r, u[1] = s, u[5] = a, u[9] = o, u[13] = l, u[2] = c, u[6] = h, u[10] = d, u[14] = f, u[3] = m, u[7] = g, u[11] = v, u[15] = p, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  clone() {
    return new je().fromArray(this.elements);
  }
  copy(e) {
    const t = this.elements, i = e.elements;
    return t[0] = i[0], t[1] = i[1], t[2] = i[2], t[3] = i[3], t[4] = i[4], t[5] = i[5], t[6] = i[6], t[7] = i[7], t[8] = i[8], t[9] = i[9], t[10] = i[10], t[11] = i[11], t[12] = i[12], t[13] = i[13], t[14] = i[14], t[15] = i[15], this;
  }
  copyPosition(e) {
    const t = this.elements, i = e.elements;
    return t[12] = i[12], t[13] = i[13], t[14] = i[14], this;
  }
  setFromMatrix3(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[3],
      t[6],
      0,
      t[1],
      t[4],
      t[7],
      0,
      t[2],
      t[5],
      t[8],
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractBasis(e, t, i) {
    return e.setFromMatrixColumn(this, 0), t.setFromMatrixColumn(this, 1), i.setFromMatrixColumn(this, 2), this;
  }
  makeBasis(e, t, i) {
    return this.set(
      e.x,
      t.x,
      i.x,
      0,
      e.y,
      t.y,
      i.y,
      0,
      e.z,
      t.z,
      i.z,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  extractRotation(e) {
    const t = this.elements, i = e.elements, r = 1 / Li.setFromMatrixColumn(e, 0).length(), s = 1 / Li.setFromMatrixColumn(e, 1).length(), a = 1 / Li.setFromMatrixColumn(e, 2).length();
    return t[0] = i[0] * r, t[1] = i[1] * r, t[2] = i[2] * r, t[3] = 0, t[4] = i[4] * s, t[5] = i[5] * s, t[6] = i[6] * s, t[7] = 0, t[8] = i[8] * a, t[9] = i[9] * a, t[10] = i[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const t = this.elements, i = e.x, r = e.y, s = e.z, a = Math.cos(i), o = Math.sin(i), l = Math.cos(r), c = Math.sin(r), h = Math.cos(s), d = Math.sin(s);
    if (e.order === "XYZ") {
      const f = a * h, m = a * d, g = o * h, v = o * d;
      t[0] = l * h, t[4] = -l * d, t[8] = c, t[1] = m + g * c, t[5] = f - v * c, t[9] = -o * l, t[2] = v - f * c, t[6] = g + m * c, t[10] = a * l;
    } else if (e.order === "YXZ") {
      const f = l * h, m = l * d, g = c * h, v = c * d;
      t[0] = f + v * o, t[4] = g * o - m, t[8] = a * c, t[1] = a * d, t[5] = a * h, t[9] = -o, t[2] = m * o - g, t[6] = v + f * o, t[10] = a * l;
    } else if (e.order === "ZXY") {
      const f = l * h, m = l * d, g = c * h, v = c * d;
      t[0] = f - v * o, t[4] = -a * d, t[8] = g + m * o, t[1] = m + g * o, t[5] = a * h, t[9] = v - f * o, t[2] = -a * c, t[6] = o, t[10] = a * l;
    } else if (e.order === "ZYX") {
      const f = a * h, m = a * d, g = o * h, v = o * d;
      t[0] = l * h, t[4] = g * c - m, t[8] = f * c + v, t[1] = l * d, t[5] = v * c + f, t[9] = m * c - g, t[2] = -c, t[6] = o * l, t[10] = a * l;
    } else if (e.order === "YZX") {
      const f = a * l, m = a * c, g = o * l, v = o * c;
      t[0] = l * h, t[4] = v - f * d, t[8] = g * d + m, t[1] = d, t[5] = a * h, t[9] = -o * h, t[2] = -c * h, t[6] = m * d + g, t[10] = f - v * d;
    } else if (e.order === "XZY") {
      const f = a * l, m = a * c, g = o * l, v = o * c;
      t[0] = l * h, t[4] = -d, t[8] = c * h, t[1] = f * d + v, t[5] = a * h, t[9] = m * d - g, t[2] = g * d - m, t[6] = o * h, t[10] = v * d + f;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(ic, e, nc);
  }
  lookAt(e, t, i) {
    const r = this.elements;
    return St.subVectors(e, t), St.lengthSq() === 0 && (St.z = 1), St.normalize(), ei.crossVectors(i, St), ei.lengthSq() === 0 && (Math.abs(i.z) === 1 ? St.x += 1e-4 : St.z += 1e-4, St.normalize(), ei.crossVectors(i, St)), ei.normalize(), Cn.crossVectors(St, ei), r[0] = ei.x, r[4] = Cn.x, r[8] = St.x, r[1] = ei.y, r[5] = Cn.y, r[9] = St.y, r[2] = ei.z, r[6] = Cn.z, r[10] = St.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const i = e.elements, r = t.elements, s = this.elements, a = i[0], o = i[4], l = i[8], c = i[12], h = i[1], d = i[5], f = i[9], m = i[13], g = i[2], v = i[6], p = i[10], u = i[14], b = i[3], M = i[7], T = i[11], O = i[15], w = r[0], R = r[4], I = r[8], E = r[12], x = r[1], C = r[5], W = r[9], z = r[13], G = r[2], K = r[6], H = r[10], Q = r[14], V = r[3], de = r[7], xe = r[11], me = r[15];
    return s[0] = a * w + o * x + l * G + c * V, s[4] = a * R + o * C + l * K + c * de, s[8] = a * I + o * W + l * H + c * xe, s[12] = a * E + o * z + l * Q + c * me, s[1] = h * w + d * x + f * G + m * V, s[5] = h * R + d * C + f * K + m * de, s[9] = h * I + d * W + f * H + m * xe, s[13] = h * E + d * z + f * Q + m * me, s[2] = g * w + v * x + p * G + u * V, s[6] = g * R + v * C + p * K + u * de, s[10] = g * I + v * W + p * H + u * xe, s[14] = g * E + v * z + p * Q + u * me, s[3] = b * w + M * x + T * G + O * V, s[7] = b * R + M * C + T * K + O * de, s[11] = b * I + M * W + T * H + O * xe, s[15] = b * E + M * z + T * Q + O * me, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], i = e[4], r = e[8], s = e[12], a = e[1], o = e[5], l = e[9], c = e[13], h = e[2], d = e[6], f = e[10], m = e[14], g = e[3], v = e[7], p = e[11], u = e[15];
    return g * (+s * l * d - r * c * d - s * o * f + i * c * f + r * o * m - i * l * m) + v * (+t * l * m - t * c * f + s * a * f - r * a * m + r * c * h - s * l * h) + p * (+t * c * d - t * o * m - s * a * d + i * a * m + s * o * h - i * c * h) + u * (-r * o * h - t * l * d + t * o * f + r * a * d - i * a * f + i * l * h);
  }
  transpose() {
    const e = this.elements;
    let t;
    return t = e[1], e[1] = e[4], e[4] = t, t = e[2], e[2] = e[8], e[8] = t, t = e[6], e[6] = e[9], e[9] = t, t = e[3], e[3] = e[12], e[12] = t, t = e[7], e[7] = e[13], e[13] = t, t = e[11], e[11] = e[14], e[14] = t, this;
  }
  setPosition(e, t, i) {
    const r = this.elements;
    return e.isVector3 ? (r[12] = e.x, r[13] = e.y, r[14] = e.z) : (r[12] = e, r[13] = t, r[14] = i), this;
  }
  invert() {
    const e = this.elements, t = e[0], i = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], d = e[9], f = e[10], m = e[11], g = e[12], v = e[13], p = e[14], u = e[15], b = d * p * c - v * f * c + v * l * m - o * p * m - d * l * u + o * f * u, M = g * f * c - h * p * c - g * l * m + a * p * m + h * l * u - a * f * u, T = h * v * c - g * d * c + g * o * m - a * v * m - h * o * u + a * d * u, O = g * d * l - h * v * l - g * o * f + a * v * f + h * o * p - a * d * p, w = t * b + i * M + r * T + s * O;
    if (w === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const R = 1 / w;
    return e[0] = b * R, e[1] = (v * f * s - d * p * s - v * r * m + i * p * m + d * r * u - i * f * u) * R, e[2] = (o * p * s - v * l * s + v * r * c - i * p * c - o * r * u + i * l * u) * R, e[3] = (d * l * s - o * f * s - d * r * c + i * f * c + o * r * m - i * l * m) * R, e[4] = M * R, e[5] = (h * p * s - g * f * s + g * r * m - t * p * m - h * r * u + t * f * u) * R, e[6] = (g * l * s - a * p * s - g * r * c + t * p * c + a * r * u - t * l * u) * R, e[7] = (a * f * s - h * l * s + h * r * c - t * f * c - a * r * m + t * l * m) * R, e[8] = T * R, e[9] = (g * d * s - h * v * s - g * i * m + t * v * m + h * i * u - t * d * u) * R, e[10] = (a * v * s - g * o * s + g * i * c - t * v * c - a * i * u + t * o * u) * R, e[11] = (h * o * s - a * d * s - h * i * c + t * d * c + a * i * m - t * o * m) * R, e[12] = O * R, e[13] = (h * v * r - g * d * r + g * i * f - t * v * f - h * i * p + t * d * p) * R, e[14] = (g * o * r - a * v * r - g * i * l + t * v * l + a * i * p - t * o * p) * R, e[15] = (a * d * r - h * o * r + h * i * l - t * d * l - a * i * f + t * o * f) * R, this;
  }
  scale(e) {
    const t = this.elements, i = e.x, r = e.y, s = e.z;
    return t[0] *= i, t[4] *= r, t[8] *= s, t[1] *= i, t[5] *= r, t[9] *= s, t[2] *= i, t[6] *= r, t[10] *= s, t[3] *= i, t[7] *= r, t[11] *= s, this;
  }
  getMaxScaleOnAxis() {
    const e = this.elements, t = e[0] * e[0] + e[1] * e[1] + e[2] * e[2], i = e[4] * e[4] + e[5] * e[5] + e[6] * e[6], r = e[8] * e[8] + e[9] * e[9] + e[10] * e[10];
    return Math.sqrt(Math.max(t, i, r));
  }
  makeTranslation(e, t, i) {
    return e.isVector3 ? this.set(
      1,
      0,
      0,
      e.x,
      0,
      1,
      0,
      e.y,
      0,
      0,
      1,
      e.z,
      0,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      0,
      e,
      0,
      1,
      0,
      t,
      0,
      0,
      1,
      i,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationX(e) {
    const t = Math.cos(e), i = Math.sin(e);
    return this.set(
      1,
      0,
      0,
      0,
      0,
      t,
      -i,
      0,
      0,
      i,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationY(e) {
    const t = Math.cos(e), i = Math.sin(e);
    return this.set(
      t,
      0,
      i,
      0,
      0,
      1,
      0,
      0,
      -i,
      0,
      t,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationZ(e) {
    const t = Math.cos(e), i = Math.sin(e);
    return this.set(
      t,
      -i,
      0,
      0,
      i,
      t,
      0,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeRotationAxis(e, t) {
    const i = Math.cos(t), r = Math.sin(t), s = 1 - i, a = e.x, o = e.y, l = e.z, c = s * a, h = s * o;
    return this.set(
      c * a + i,
      c * o - r * l,
      c * l + r * o,
      0,
      c * o + r * l,
      h * o + i,
      h * l - r * a,
      0,
      c * l - r * o,
      h * l + r * a,
      s * l * l + i,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t, i) {
    return this.set(
      e,
      0,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      0,
      i,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  makeShear(e, t, i, r, s, a) {
    return this.set(
      1,
      i,
      s,
      0,
      e,
      1,
      a,
      0,
      t,
      r,
      1,
      0,
      0,
      0,
      0,
      1
    ), this;
  }
  compose(e, t, i) {
    const r = this.elements, s = t._x, a = t._y, o = t._z, l = t._w, c = s + s, h = a + a, d = o + o, f = s * c, m = s * h, g = s * d, v = a * h, p = a * d, u = o * d, b = l * c, M = l * h, T = l * d, O = i.x, w = i.y, R = i.z;
    return r[0] = (1 - (v + u)) * O, r[1] = (m + T) * O, r[2] = (g - M) * O, r[3] = 0, r[4] = (m - T) * w, r[5] = (1 - (f + u)) * w, r[6] = (p + b) * w, r[7] = 0, r[8] = (g + M) * R, r[9] = (p - b) * R, r[10] = (1 - (f + v)) * R, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
  }
  decompose(e, t, i) {
    const r = this.elements;
    let s = Li.set(r[0], r[1], r[2]).length();
    const a = Li.set(r[4], r[5], r[6]).length(), o = Li.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), e.x = r[12], e.y = r[13], e.z = r[14], Rt.copy(this);
    const c = 1 / s, h = 1 / a, d = 1 / o;
    return Rt.elements[0] *= c, Rt.elements[1] *= c, Rt.elements[2] *= c, Rt.elements[4] *= h, Rt.elements[5] *= h, Rt.elements[6] *= h, Rt.elements[8] *= d, Rt.elements[9] *= d, Rt.elements[10] *= d, t.setFromRotationMatrix(Rt), i.x = s, i.y = a, i.z = o, this;
  }
  makePerspective(e, t, i, r, s, a, o = Zt) {
    const l = this.elements, c = 2 * s / (t - e), h = 2 * s / (i - r), d = (t + e) / (t - e), f = (i + r) / (i - r);
    let m, g;
    if (o === Zt)
      m = -(a + s) / (a - s), g = -2 * a * s / (a - s);
    else if (o === ur)
      m = -a / (a - s), g = -a * s / (a - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return l[0] = c, l[4] = 0, l[8] = d, l[12] = 0, l[1] = 0, l[5] = h, l[9] = f, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = m, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(e, t, i, r, s, a, o = Zt) {
    const l = this.elements, c = 1 / (t - e), h = 1 / (i - r), d = 1 / (a - s), f = (t + e) * c, m = (i + r) * h;
    let g, v;
    if (o === Zt)
      g = (a + s) * d, v = -2 * d;
    else if (o === ur)
      g = s * d, v = -1 * d;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -f, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -m, l[2] = 0, l[6] = 0, l[10] = v, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
  }
  equals(e) {
    const t = this.elements, i = e.elements;
    for (let r = 0; r < 16; r++)
      if (t[r] !== i[r]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let i = 0; i < 16; i++)
      this.elements[i] = e[i + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const i = this.elements;
    return e[t] = i[0], e[t + 1] = i[1], e[t + 2] = i[2], e[t + 3] = i[3], e[t + 4] = i[4], e[t + 5] = i[5], e[t + 6] = i[6], e[t + 7] = i[7], e[t + 8] = i[8], e[t + 9] = i[9], e[t + 10] = i[10], e[t + 11] = i[11], e[t + 12] = i[12], e[t + 13] = i[13], e[t + 14] = i[14], e[t + 15] = i[15], e;
  }
}
const Li = /* @__PURE__ */ new L(), Rt = /* @__PURE__ */ new je(), ic = /* @__PURE__ */ new L(0, 0, 0), nc = /* @__PURE__ */ new L(1, 1, 1), ei = /* @__PURE__ */ new L(), Cn = /* @__PURE__ */ new L(), St = /* @__PURE__ */ new L();
class an {
  addEventListener(e, t) {
    this._listeners === void 0 && (this._listeners = {});
    const i = this._listeners;
    i[e] === void 0 && (i[e] = []), i[e].indexOf(t) === -1 && i[e].push(t);
  }
  hasEventListener(e, t) {
    if (this._listeners === void 0) return !1;
    const i = this._listeners;
    return i[e] !== void 0 && i[e].indexOf(t) !== -1;
  }
  removeEventListener(e, t) {
    if (this._listeners === void 0) return;
    const r = this._listeners[e];
    if (r !== void 0) {
      const s = r.indexOf(t);
      s !== -1 && r.splice(s, 1);
    }
  }
  dispatchEvent(e) {
    if (this._listeners === void 0) return;
    const i = this._listeners[e.type];
    if (i !== void 0) {
      e.target = this;
      const r = i.slice(0);
      for (let s = 0, a = r.length; s < a; s++)
        r[s].call(this, e);
      e.target = null;
    }
  }
}
const ga = /* @__PURE__ */ new je(), _a = /* @__PURE__ */ new Sn();
class Bt {
  constructor(e = 0, t = 0, i = 0, r = Bt.DEFAULT_ORDER) {
    this.isEuler = !0, this._x = e, this._y = t, this._z = i, this._order = r;
  }
  get x() {
    return this._x;
  }
  set x(e) {
    this._x = e, this._onChangeCallback();
  }
  get y() {
    return this._y;
  }
  set y(e) {
    this._y = e, this._onChangeCallback();
  }
  get z() {
    return this._z;
  }
  set z(e) {
    this._z = e, this._onChangeCallback();
  }
  get order() {
    return this._order;
  }
  set order(e) {
    this._order = e, this._onChangeCallback();
  }
  set(e, t, i, r = this._order) {
    return this._x = e, this._y = t, this._z = i, this._order = r, this._onChangeCallback(), this;
  }
  clone() {
    return new this.constructor(this._x, this._y, this._z, this._order);
  }
  copy(e) {
    return this._x = e._x, this._y = e._y, this._z = e._z, this._order = e._order, this._onChangeCallback(), this;
  }
  setFromRotationMatrix(e, t = this._order, i = !0) {
    const r = e.elements, s = r[0], a = r[4], o = r[8], l = r[1], c = r[5], h = r[9], d = r[2], f = r[6], m = r[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(dt(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, m), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(f, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-dt(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, m), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-d, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(dt(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._y = Math.atan2(-d, m), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-dt(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._x = Math.atan2(f, m), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(dt(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-d, s)) : (this._x = 0, this._y = Math.atan2(o, m));
        break;
      case "XZY":
        this._z = Math.asin(-dt(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(f, c), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-h, m), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, i === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, i) {
    return ga.makeRotationFromQuaternion(e), this.setFromRotationMatrix(ga, t, i);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return _a.setFromEuler(this), this.setFromQuaternion(_a, e);
  }
  equals(e) {
    return e._x === this._x && e._y === this._y && e._z === this._z && e._order === this._order;
  }
  fromArray(e) {
    return this._x = e[0], this._y = e[1], this._z = e[2], e[3] !== void 0 && (this._order = e[3]), this._onChangeCallback(), this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this._x, e[t + 1] = this._y, e[t + 2] = this._z, e[t + 3] = this._order, e;
  }
  _onChange(e) {
    return this._onChangeCallback = e, this;
  }
  _onChangeCallback() {
  }
  *[Symbol.iterator]() {
    yield this._x, yield this._y, yield this._z, yield this._order;
  }
}
Bt.DEFAULT_ORDER = "XYZ";
class Ys {
  constructor() {
    this.mask = 1;
  }
  set(e) {
    this.mask = (1 << e | 0) >>> 0;
  }
  enable(e) {
    this.mask |= 1 << e | 0;
  }
  enableAll() {
    this.mask = -1;
  }
  toggle(e) {
    this.mask ^= 1 << e | 0;
  }
  disable(e) {
    this.mask &= ~(1 << e | 0);
  }
  disableAll() {
    this.mask = 0;
  }
  test(e) {
    return (this.mask & e.mask) !== 0;
  }
  isEnabled(e) {
    return (this.mask & (1 << e | 0)) !== 0;
  }
}
class Oe {
  constructor(e, t, i, r, s, a, o, l, c) {
    Oe.prototype.isMatrix3 = !0, this.elements = [
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ], e !== void 0 && this.set(e, t, i, r, s, a, o, l, c);
  }
  set(e, t, i, r, s, a, o, l, c) {
    const h = this.elements;
    return h[0] = e, h[1] = r, h[2] = o, h[3] = t, h[4] = s, h[5] = l, h[6] = i, h[7] = a, h[8] = c, this;
  }
  identity() {
    return this.set(
      1,
      0,
      0,
      0,
      1,
      0,
      0,
      0,
      1
    ), this;
  }
  copy(e) {
    const t = this.elements, i = e.elements;
    return t[0] = i[0], t[1] = i[1], t[2] = i[2], t[3] = i[3], t[4] = i[4], t[5] = i[5], t[6] = i[6], t[7] = i[7], t[8] = i[8], this;
  }
  extractBasis(e, t, i) {
    return e.setFromMatrix3Column(this, 0), t.setFromMatrix3Column(this, 1), i.setFromMatrix3Column(this, 2), this;
  }
  setFromMatrix4(e) {
    const t = e.elements;
    return this.set(
      t[0],
      t[4],
      t[8],
      t[1],
      t[5],
      t[9],
      t[2],
      t[6],
      t[10]
    ), this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const i = e.elements, r = t.elements, s = this.elements, a = i[0], o = i[3], l = i[6], c = i[1], h = i[4], d = i[7], f = i[2], m = i[5], g = i[8], v = r[0], p = r[3], u = r[6], b = r[1], M = r[4], T = r[7], O = r[2], w = r[5], R = r[8];
    return s[0] = a * v + o * b + l * O, s[3] = a * p + o * M + l * w, s[6] = a * u + o * T + l * R, s[1] = c * v + h * b + d * O, s[4] = c * p + h * M + d * w, s[7] = c * u + h * T + d * R, s[2] = f * v + m * b + g * O, s[5] = f * p + m * M + g * w, s[8] = f * u + m * T + g * R, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[3] *= e, t[6] *= e, t[1] *= e, t[4] *= e, t[7] *= e, t[2] *= e, t[5] *= e, t[8] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], i = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8];
    return t * a * h - t * o * c - i * s * h + i * o * l + r * s * c - r * a * l;
  }
  invert() {
    const e = this.elements, t = e[0], i = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], d = h * a - o * c, f = o * l - h * s, m = c * s - a * l, g = t * d + i * f + r * m;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const v = 1 / g;
    return e[0] = d * v, e[1] = (r * c - h * i) * v, e[2] = (o * i - r * a) * v, e[3] = f * v, e[4] = (h * t - r * l) * v, e[5] = (r * s - o * t) * v, e[6] = m * v, e[7] = (i * l - c * t) * v, e[8] = (a * t - i * s) * v, this;
  }
  transpose() {
    let e;
    const t = this.elements;
    return e = t[1], t[1] = t[3], t[3] = e, e = t[2], t[2] = t[6], t[6] = e, e = t[5], t[5] = t[7], t[7] = e, this;
  }
  getNormalMatrix(e) {
    return this.setFromMatrix4(e).invert().transpose();
  }
  transposeIntoArray(e) {
    const t = this.elements;
    return e[0] = t[0], e[1] = t[3], e[2] = t[6], e[3] = t[1], e[4] = t[4], e[5] = t[7], e[6] = t[2], e[7] = t[5], e[8] = t[8], this;
  }
  setUvTransform(e, t, i, r, s, a, o) {
    const l = Math.cos(s), c = Math.sin(s);
    return this.set(
      i * l,
      i * c,
      -i * (l * a + c * o) + a + e,
      -r * c,
      r * l,
      -r * (-c * a + l * o) + o + t,
      0,
      0,
      1
    ), this;
  }
  //
  scale(e, t) {
    return this.premultiply(br.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(br.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(br.makeTranslation(e, t)), this;
  }
  // for 2D Transforms
  makeTranslation(e, t) {
    return e.isVector2 ? this.set(
      1,
      0,
      e.x,
      0,
      1,
      e.y,
      0,
      0,
      1
    ) : this.set(
      1,
      0,
      e,
      0,
      1,
      t,
      0,
      0,
      1
    ), this;
  }
  makeRotation(e) {
    const t = Math.cos(e), i = Math.sin(e);
    return this.set(
      t,
      -i,
      0,
      i,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  makeScale(e, t) {
    return this.set(
      e,
      0,
      0,
      0,
      t,
      0,
      0,
      0,
      1
    ), this;
  }
  //
  equals(e) {
    const t = this.elements, i = e.elements;
    for (let r = 0; r < 9; r++)
      if (t[r] !== i[r]) return !1;
    return !0;
  }
  fromArray(e, t = 0) {
    for (let i = 0; i < 9; i++)
      this.elements[i] = e[i + t];
    return this;
  }
  toArray(e = [], t = 0) {
    const i = this.elements;
    return e[t] = i[0], e[t + 1] = i[1], e[t + 2] = i[2], e[t + 3] = i[3], e[t + 4] = i[4], e[t + 5] = i[5], e[t + 6] = i[6], e[t + 7] = i[7], e[t + 8] = i[8], e;
  }
  clone() {
    return new this.constructor().fromArray(this.elements);
  }
}
const br = /* @__PURE__ */ new Oe();
let rc = 0;
const va = /* @__PURE__ */ new L(), Di = /* @__PURE__ */ new Sn(), Gt = /* @__PURE__ */ new je(), Pn = /* @__PURE__ */ new L(), cn = /* @__PURE__ */ new L(), sc = /* @__PURE__ */ new L(), ac = /* @__PURE__ */ new Sn(), xa = /* @__PURE__ */ new L(1, 0, 0), Ma = /* @__PURE__ */ new L(0, 1, 0), Sa = /* @__PURE__ */ new L(0, 0, 1), ya = { type: "added" }, oc = { type: "removed" }, Ui = { type: "childadded", child: null }, wr = { type: "childremoved", child: null };
class pt extends an {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: rc++ }), this.uuid = sn(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = pt.DEFAULT_UP.clone();
    const e = new L(), t = new Bt(), i = new Sn(), r = new L(1, 1, 1);
    function s() {
      i.setFromEuler(t, !1);
    }
    function a() {
      t.setFromQuaternion(i, void 0, !1);
    }
    t._onChange(s), i._onChange(a), Object.defineProperties(this, {
      position: {
        configurable: !0,
        enumerable: !0,
        value: e
      },
      rotation: {
        configurable: !0,
        enumerable: !0,
        value: t
      },
      quaternion: {
        configurable: !0,
        enumerable: !0,
        value: i
      },
      scale: {
        configurable: !0,
        enumerable: !0,
        value: r
      },
      modelViewMatrix: {
        value: new je()
      },
      normalMatrix: {
        value: new Oe()
      }
    }), this.matrix = new je(), this.matrixWorld = new je(), this.matrixAutoUpdate = pt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new Ys(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
  }
  onBeforeShadow() {
  }
  onAfterShadow() {
  }
  onBeforeRender() {
  }
  onAfterRender() {
  }
  applyMatrix4(e) {
    this.matrixAutoUpdate && this.updateMatrix(), this.matrix.premultiply(e), this.matrix.decompose(this.position, this.quaternion, this.scale);
  }
  applyQuaternion(e) {
    return this.quaternion.premultiply(e), this;
  }
  setRotationFromAxisAngle(e, t) {
    this.quaternion.setFromAxisAngle(e, t);
  }
  setRotationFromEuler(e) {
    this.quaternion.setFromEuler(e, !0);
  }
  setRotationFromMatrix(e) {
    this.quaternion.setFromRotationMatrix(e);
  }
  setRotationFromQuaternion(e) {
    this.quaternion.copy(e);
  }
  rotateOnAxis(e, t) {
    return Di.setFromAxisAngle(e, t), this.quaternion.multiply(Di), this;
  }
  rotateOnWorldAxis(e, t) {
    return Di.setFromAxisAngle(e, t), this.quaternion.premultiply(Di), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(xa, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(Ma, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(Sa, e);
  }
  translateOnAxis(e, t) {
    return va.copy(e).applyQuaternion(this.quaternion), this.position.add(va.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(xa, e);
  }
  translateY(e) {
    return this.translateOnAxis(Ma, e);
  }
  translateZ(e) {
    return this.translateOnAxis(Sa, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Gt.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, i) {
    e.isVector3 ? Pn.copy(e) : Pn.set(e, t, i);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), cn.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Gt.lookAt(cn, Pn, this.up) : Gt.lookAt(Pn, cn, this.up), this.quaternion.setFromRotationMatrix(Gt), r && (Gt.extractRotation(r.matrixWorld), Di.setFromRotationMatrix(Gt), this.quaternion.premultiply(Di.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent(ya), Ui.child = e, this.dispatchEvent(Ui), Ui.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++)
        this.remove(arguments[i]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(oc), wr.child = e, this.dispatchEvent(wr), wr.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), Gt.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Gt.multiply(e.parent.matrixWorld)), e.applyMatrix4(Gt), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent(ya), Ui.child = e, this.dispatchEvent(Ui), Ui.child = null, this;
  }
  getObjectById(e) {
    return this.getObjectByProperty("id", e);
  }
  getObjectByName(e) {
    return this.getObjectByProperty("name", e);
  }
  getObjectByProperty(e, t) {
    if (this[e] === t) return this;
    for (let i = 0, r = this.children.length; i < r; i++) {
      const a = this.children[i].getObjectByProperty(e, t);
      if (a !== void 0)
        return a;
    }
  }
  getObjectsByProperty(e, t, i = []) {
    this[e] === t && i.push(this);
    const r = this.children;
    for (let s = 0, a = r.length; s < a; s++)
      r[s].getObjectsByProperty(e, t, i);
    return i;
  }
  getWorldPosition(e) {
    return this.updateWorldMatrix(!0, !1), e.setFromMatrixPosition(this.matrixWorld);
  }
  getWorldQuaternion(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(cn, e, sc), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(cn, ac, e), e;
  }
  getWorldDirection(e) {
    this.updateWorldMatrix(!0, !1);
    const t = this.matrixWorld.elements;
    return e.set(t[8], t[9], t[10]).normalize();
  }
  raycast() {
  }
  traverse(e) {
    e(this);
    const t = this.children;
    for (let i = 0, r = t.length; i < r; i++)
      t[i].traverse(e);
  }
  traverseVisible(e) {
    if (this.visible === !1) return;
    e(this);
    const t = this.children;
    for (let i = 0, r = t.length; i < r; i++)
      t[i].traverseVisible(e);
  }
  traverseAncestors(e) {
    const t = this.parent;
    t !== null && (e(t), t.traverseAncestors(e));
  }
  updateMatrix() {
    this.matrix.compose(this.position, this.quaternion, this.scale), this.matrixWorldNeedsUpdate = !0;
  }
  updateMatrixWorld(e) {
    this.matrixAutoUpdate && this.updateMatrix(), (this.matrixWorldNeedsUpdate || e) && (this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), this.matrixWorldNeedsUpdate = !1, e = !0);
    const t = this.children;
    for (let i = 0, r = t.length; i < r; i++)
      t[i].updateMatrixWorld(e);
  }
  updateWorldMatrix(e, t) {
    const i = this.parent;
    if (e === !0 && i !== null && i.updateWorldMatrix(!0, !1), this.matrixAutoUpdate && this.updateMatrix(), this.matrixWorldAutoUpdate === !0 && (this.parent === null ? this.matrixWorld.copy(this.matrix) : this.matrixWorld.multiplyMatrices(this.parent.matrixWorld, this.matrix)), t === !0) {
      const r = this.children;
      for (let s = 0, a = r.length; s < a; s++)
        r[s].updateWorldMatrix(!1, !0);
    }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string", i = {};
    t && (e = {
      geometries: {},
      materials: {},
      textures: {},
      images: {},
      shapes: {},
      skeletons: {},
      animations: {},
      nodes: {}
    }, i.metadata = {
      version: 4.6,
      type: "Object",
      generator: "Object3D.toJSON"
    });
    const r = {};
    r.uuid = this.uuid, r.type = this.type, this.name !== "" && (r.name = this.name), this.castShadow === !0 && (r.castShadow = !0), this.receiveShadow === !0 && (r.receiveShadow = !0), this.visible === !1 && (r.visible = !1), this.frustumCulled === !1 && (r.frustumCulled = !1), this.renderOrder !== 0 && (r.renderOrder = this.renderOrder), Object.keys(this.userData).length > 0 && (r.userData = this.userData), r.layers = this.layers.mask, r.matrix = this.matrix.toArray(), r.up = this.up.toArray(), this.matrixAutoUpdate === !1 && (r.matrixAutoUpdate = !1), this.isInstancedMesh && (r.type = "InstancedMesh", r.count = this.count, r.instanceMatrix = this.instanceMatrix.toJSON(), this.instanceColor !== null && (r.instanceColor = this.instanceColor.toJSON())), this.isBatchedMesh && (r.type = "BatchedMesh", r.perObjectFrustumCulled = this.perObjectFrustumCulled, r.sortObjects = this.sortObjects, r.drawRanges = this._drawRanges, r.reservedRanges = this._reservedRanges, r.visibility = this._visibility, r.active = this._active, r.bounds = this._bounds.map((o) => ({
      boxInitialized: o.boxInitialized,
      boxMin: o.box.min.toArray(),
      boxMax: o.box.max.toArray(),
      sphereInitialized: o.sphereInitialized,
      sphereRadius: o.sphere.radius,
      sphereCenter: o.sphere.center.toArray()
    })), r.maxInstanceCount = this._maxInstanceCount, r.maxVertexCount = this._maxVertexCount, r.maxIndexCount = this._maxIndexCount, r.geometryInitialized = this._geometryInitialized, r.geometryCount = this._geometryCount, r.matricesTexture = this._matricesTexture.toJSON(e), this._colorsTexture !== null && (r.colorsTexture = this._colorsTexture.toJSON(e)), this.boundingSphere !== null && (r.boundingSphere = {
      center: r.boundingSphere.center.toArray(),
      radius: r.boundingSphere.radius
    }), this.boundingBox !== null && (r.boundingBox = {
      min: r.boundingBox.min.toArray(),
      max: r.boundingBox.max.toArray()
    }));
    function s(o, l) {
      return o[l.uuid] === void 0 && (o[l.uuid] = l.toJSON(e)), l.uuid;
    }
    if (this.isScene)
      this.background && (this.background.isColor ? r.background = this.background.toJSON() : this.background.isTexture && (r.background = this.background.toJSON(e).uuid)), this.environment && this.environment.isTexture && this.environment.isRenderTargetTexture !== !0 && (r.environment = this.environment.toJSON(e).uuid);
    else if (this.isMesh || this.isLine || this.isPoints) {
      r.geometry = s(e.geometries, this.geometry);
      const o = this.geometry.parameters;
      if (o !== void 0 && o.shapes !== void 0) {
        const l = o.shapes;
        if (Array.isArray(l))
          for (let c = 0, h = l.length; c < h; c++) {
            const d = l[c];
            s(e.shapes, d);
          }
        else
          s(e.shapes, l);
      }
    }
    if (this.isSkinnedMesh && (r.bindMode = this.bindMode, r.bindMatrix = this.bindMatrix.toArray(), this.skeleton !== void 0 && (s(e.skeletons, this.skeleton), r.skeleton = this.skeleton.uuid)), this.material !== void 0)
      if (Array.isArray(this.material)) {
        const o = [];
        for (let l = 0, c = this.material.length; l < c; l++)
          o.push(s(e.materials, this.material[l]));
        r.material = o;
      } else
        r.material = s(e.materials, this.material);
    if (this.children.length > 0) {
      r.children = [];
      for (let o = 0; o < this.children.length; o++)
        r.children.push(this.children[o].toJSON(e).object);
    }
    if (this.animations.length > 0) {
      r.animations = [];
      for (let o = 0; o < this.animations.length; o++) {
        const l = this.animations[o];
        r.animations.push(s(e.animations, l));
      }
    }
    if (t) {
      const o = a(e.geometries), l = a(e.materials), c = a(e.textures), h = a(e.images), d = a(e.shapes), f = a(e.skeletons), m = a(e.animations), g = a(e.nodes);
      o.length > 0 && (i.geometries = o), l.length > 0 && (i.materials = l), c.length > 0 && (i.textures = c), h.length > 0 && (i.images = h), d.length > 0 && (i.shapes = d), f.length > 0 && (i.skeletons = f), m.length > 0 && (i.animations = m), g.length > 0 && (i.nodes = g);
    }
    return i.object = r, i;
    function a(o) {
      const l = [];
      for (const c in o) {
        const h = o[c];
        delete h.metadata, l.push(h);
      }
      return l;
    }
  }
  clone(e) {
    return new this.constructor().copy(this, e);
  }
  copy(e, t = !0) {
    if (this.name = e.name, this.up.copy(e.up), this.position.copy(e.position), this.rotation.order = e.rotation.order, this.quaternion.copy(e.quaternion), this.scale.copy(e.scale), this.matrix.copy(e.matrix), this.matrixWorld.copy(e.matrixWorld), this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrixWorldAutoUpdate = e.matrixWorldAutoUpdate, this.matrixWorldNeedsUpdate = e.matrixWorldNeedsUpdate, this.layers.mask = e.layers.mask, this.visible = e.visible, this.castShadow = e.castShadow, this.receiveShadow = e.receiveShadow, this.frustumCulled = e.frustumCulled, this.renderOrder = e.renderOrder, this.animations = e.animations.slice(), this.userData = JSON.parse(JSON.stringify(e.userData)), t === !0)
      for (let i = 0; i < e.children.length; i++) {
        const r = e.children[i];
        this.add(r.clone());
      }
    return this;
  }
}
pt.DEFAULT_UP = /* @__PURE__ */ new L(0, 1, 0);
pt.DEFAULT_MATRIX_AUTO_UPDATE = !0;
pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE = !0;
const Ea = /* @__PURE__ */ new Oe().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), Ta = /* @__PURE__ */ new Oe().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), Ln = {
  [ui]: {
    transfer: lr,
    primaries: cr,
    toReference: (n) => n,
    fromReference: (n) => n
  },
  [It]: {
    transfer: Je,
    primaries: cr,
    toReference: (n) => n.convertSRGBToLinear(),
    fromReference: (n) => n.convertLinearToSRGB()
  },
  [pr]: {
    transfer: lr,
    primaries: hr,
    toReference: (n) => n.applyMatrix3(Ta),
    fromReference: (n) => n.applyMatrix3(Ea)
  },
  [qs]: {
    transfer: Je,
    primaries: hr,
    toReference: (n) => n.convertSRGBToLinear().applyMatrix3(Ta),
    fromReference: (n) => n.applyMatrix3(Ea).convertLinearToSRGB()
  }
}, lc = /* @__PURE__ */ new Set([ui, pr]), Ze = {
  enabled: !0,
  _workingColorSpace: ui,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(n) {
    if (!lc.has(n))
      throw new Error(`Unsupported working color space, "${n}".`);
    this._workingColorSpace = n;
  },
  convert: function(n, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return n;
    const i = Ln[e].toReference, r = Ln[t].fromReference;
    return r(i(n));
  },
  fromWorkingColorSpace: function(n, e) {
    return this.convert(n, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(n, e) {
    return this.convert(n, e, this._workingColorSpace);
  },
  getPrimaries: function(n) {
    return Ln[n].primaries;
  },
  getTransfer: function(n) {
    return n === ai ? lr : Ln[n].transfer;
  }
};
function $i(n) {
  return n < 0.04045 ? n * 0.0773993808 : Math.pow(n * 0.9478672986 + 0.0521327014, 2.4);
}
function Rr(n) {
  return n < 31308e-7 ? n * 12.92 : 1.055 * Math.pow(n, 0.41666) - 0.055;
}
const Co = {
  aliceblue: 15792383,
  antiquewhite: 16444375,
  aqua: 65535,
  aquamarine: 8388564,
  azure: 15794175,
  beige: 16119260,
  bisque: 16770244,
  black: 0,
  blanchedalmond: 16772045,
  blue: 255,
  blueviolet: 9055202,
  brown: 10824234,
  burlywood: 14596231,
  cadetblue: 6266528,
  chartreuse: 8388352,
  chocolate: 13789470,
  coral: 16744272,
  cornflowerblue: 6591981,
  cornsilk: 16775388,
  crimson: 14423100,
  cyan: 65535,
  darkblue: 139,
  darkcyan: 35723,
  darkgoldenrod: 12092939,
  darkgray: 11119017,
  darkgreen: 25600,
  darkgrey: 11119017,
  darkkhaki: 12433259,
  darkmagenta: 9109643,
  darkolivegreen: 5597999,
  darkorange: 16747520,
  darkorchid: 10040012,
  darkred: 9109504,
  darksalmon: 15308410,
  darkseagreen: 9419919,
  darkslateblue: 4734347,
  darkslategray: 3100495,
  darkslategrey: 3100495,
  darkturquoise: 52945,
  darkviolet: 9699539,
  deeppink: 16716947,
  deepskyblue: 49151,
  dimgray: 6908265,
  dimgrey: 6908265,
  dodgerblue: 2003199,
  firebrick: 11674146,
  floralwhite: 16775920,
  forestgreen: 2263842,
  fuchsia: 16711935,
  gainsboro: 14474460,
  ghostwhite: 16316671,
  gold: 16766720,
  goldenrod: 14329120,
  gray: 8421504,
  green: 32768,
  greenyellow: 11403055,
  grey: 8421504,
  honeydew: 15794160,
  hotpink: 16738740,
  indianred: 13458524,
  indigo: 4915330,
  ivory: 16777200,
  khaki: 15787660,
  lavender: 15132410,
  lavenderblush: 16773365,
  lawngreen: 8190976,
  lemonchiffon: 16775885,
  lightblue: 11393254,
  lightcoral: 15761536,
  lightcyan: 14745599,
  lightgoldenrodyellow: 16448210,
  lightgray: 13882323,
  lightgreen: 9498256,
  lightgrey: 13882323,
  lightpink: 16758465,
  lightsalmon: 16752762,
  lightseagreen: 2142890,
  lightskyblue: 8900346,
  lightslategray: 7833753,
  lightslategrey: 7833753,
  lightsteelblue: 11584734,
  lightyellow: 16777184,
  lime: 65280,
  limegreen: 3329330,
  linen: 16445670,
  magenta: 16711935,
  maroon: 8388608,
  mediumaquamarine: 6737322,
  mediumblue: 205,
  mediumorchid: 12211667,
  mediumpurple: 9662683,
  mediumseagreen: 3978097,
  mediumslateblue: 8087790,
  mediumspringgreen: 64154,
  mediumturquoise: 4772300,
  mediumvioletred: 13047173,
  midnightblue: 1644912,
  mintcream: 16121850,
  mistyrose: 16770273,
  moccasin: 16770229,
  navajowhite: 16768685,
  navy: 128,
  oldlace: 16643558,
  olive: 8421376,
  olivedrab: 7048739,
  orange: 16753920,
  orangered: 16729344,
  orchid: 14315734,
  palegoldenrod: 15657130,
  palegreen: 10025880,
  paleturquoise: 11529966,
  palevioletred: 14381203,
  papayawhip: 16773077,
  peachpuff: 16767673,
  peru: 13468991,
  pink: 16761035,
  plum: 14524637,
  powderblue: 11591910,
  purple: 8388736,
  rebeccapurple: 6697881,
  red: 16711680,
  rosybrown: 12357519,
  royalblue: 4286945,
  saddlebrown: 9127187,
  salmon: 16416882,
  sandybrown: 16032864,
  seagreen: 3050327,
  seashell: 16774638,
  sienna: 10506797,
  silver: 12632256,
  skyblue: 8900331,
  slateblue: 6970061,
  slategray: 7372944,
  slategrey: 7372944,
  snow: 16775930,
  springgreen: 65407,
  steelblue: 4620980,
  tan: 13808780,
  teal: 32896,
  thistle: 14204888,
  tomato: 16737095,
  turquoise: 4251856,
  violet: 15631086,
  wheat: 16113331,
  white: 16777215,
  whitesmoke: 16119285,
  yellow: 16776960,
  yellowgreen: 10145074
}, ti = { h: 0, s: 0, l: 0 }, Dn = { h: 0, s: 0, l: 0 };
function Cr(n, e, t) {
  return t < 0 && (t += 1), t > 1 && (t -= 1), t < 1 / 6 ? n + (e - n) * 6 * t : t < 1 / 2 ? e : t < 2 / 3 ? n + (e - n) * 6 * (2 / 3 - t) : n;
}
class ke {
  constructor(e, t, i) {
    return this.isColor = !0, this.r = 1, this.g = 1, this.b = 1, this.set(e, t, i);
  }
  set(e, t, i) {
    if (t === void 0 && i === void 0) {
      const r = e;
      r && r.isColor ? this.copy(r) : typeof r == "number" ? this.setHex(r) : typeof r == "string" && this.setStyle(r);
    } else
      this.setRGB(e, t, i);
    return this;
  }
  setScalar(e) {
    return this.r = e, this.g = e, this.b = e, this;
  }
  setHex(e, t = It) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Ze.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, i, r = Ze.workingColorSpace) {
    return this.r = e, this.g = t, this.b = i, Ze.toWorkingColorSpace(this, r), this;
  }
  setHSL(e, t, i, r = Ze.workingColorSpace) {
    if (e = al(e, 1), t = dt(t, 0, 1), i = dt(i, 0, 1), t === 0)
      this.r = this.g = this.b = i;
    else {
      const s = i <= 0.5 ? i * (1 + t) : i + t - i * t, a = 2 * i - s;
      this.r = Cr(a, s, e + 1 / 3), this.g = Cr(a, s, e), this.b = Cr(a, s, e - 1 / 3);
    }
    return Ze.toWorkingColorSpace(this, r), this;
  }
  setStyle(e, t = It) {
    function i(s) {
      s !== void 0 && parseFloat(s) < 1 && console.warn("THREE.Color: Alpha component of " + e + " will be ignored.");
    }
    let r;
    if (r = /^(\w+)\(([^\)]*)\)/.exec(e)) {
      let s;
      const a = r[1], o = r[2];
      switch (a) {
        case "rgb":
        case "rgba":
          if (s = /^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return i(s[4]), this.setRGB(
              Math.min(255, parseInt(s[1], 10)) / 255,
              Math.min(255, parseInt(s[2], 10)) / 255,
              Math.min(255, parseInt(s[3], 10)) / 255,
              t
            );
          if (s = /^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return i(s[4]), this.setRGB(
              Math.min(100, parseInt(s[1], 10)) / 100,
              Math.min(100, parseInt(s[2], 10)) / 100,
              Math.min(100, parseInt(s[3], 10)) / 100,
              t
            );
          break;
        case "hsl":
        case "hsla":
          if (s = /^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))
            return i(s[4]), this.setHSL(
              parseFloat(s[1]) / 360,
              parseFloat(s[2]) / 100,
              parseFloat(s[3]) / 100,
              t
            );
          break;
        default:
          console.warn("THREE.Color: Unknown color model " + e);
      }
    } else if (r = /^\#([A-Fa-f\d]+)$/.exec(e)) {
      const s = r[1], a = s.length;
      if (a === 3)
        return this.setRGB(
          parseInt(s.charAt(0), 16) / 15,
          parseInt(s.charAt(1), 16) / 15,
          parseInt(s.charAt(2), 16) / 15,
          t
        );
      if (a === 6)
        return this.setHex(parseInt(s, 16), t);
      console.warn("THREE.Color: Invalid hex color " + e);
    } else if (e && e.length > 0)
      return this.setColorName(e, t);
    return this;
  }
  setColorName(e, t = It) {
    const i = Co[e.toLowerCase()];
    return i !== void 0 ? this.setHex(i, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = $i(e.r), this.g = $i(e.g), this.b = $i(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = Rr(e.r), this.g = Rr(e.g), this.b = Rr(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = It) {
    return Ze.fromWorkingColorSpace(ft.copy(this), e), Math.round(dt(ft.r * 255, 0, 255)) * 65536 + Math.round(dt(ft.g * 255, 0, 255)) * 256 + Math.round(dt(ft.b * 255, 0, 255));
  }
  getHexString(e = It) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = Ze.workingColorSpace) {
    Ze.fromWorkingColorSpace(ft.copy(this), t);
    const i = ft.r, r = ft.g, s = ft.b, a = Math.max(i, r, s), o = Math.min(i, r, s);
    let l, c;
    const h = (o + a) / 2;
    if (o === a)
      l = 0, c = 0;
    else {
      const d = a - o;
      switch (c = h <= 0.5 ? d / (a + o) : d / (2 - a - o), a) {
        case i:
          l = (r - s) / d + (r < s ? 6 : 0);
          break;
        case r:
          l = (s - i) / d + 2;
          break;
        case s:
          l = (i - r) / d + 4;
          break;
      }
      l /= 6;
    }
    return e.h = l, e.s = c, e.l = h, e;
  }
  getRGB(e, t = Ze.workingColorSpace) {
    return Ze.fromWorkingColorSpace(ft.copy(this), t), e.r = ft.r, e.g = ft.g, e.b = ft.b, e;
  }
  getStyle(e = It) {
    Ze.fromWorkingColorSpace(ft.copy(this), e);
    const t = ft.r, i = ft.g, r = ft.b;
    return e !== It ? `color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(i * 255)},${Math.round(r * 255)})`;
  }
  offsetHSL(e, t, i) {
    return this.getHSL(ti), this.setHSL(ti.h + e, ti.s + t, ti.l + i);
  }
  add(e) {
    return this.r += e.r, this.g += e.g, this.b += e.b, this;
  }
  addColors(e, t) {
    return this.r = e.r + t.r, this.g = e.g + t.g, this.b = e.b + t.b, this;
  }
  addScalar(e) {
    return this.r += e, this.g += e, this.b += e, this;
  }
  sub(e) {
    return this.r = Math.max(0, this.r - e.r), this.g = Math.max(0, this.g - e.g), this.b = Math.max(0, this.b - e.b), this;
  }
  multiply(e) {
    return this.r *= e.r, this.g *= e.g, this.b *= e.b, this;
  }
  multiplyScalar(e) {
    return this.r *= e, this.g *= e, this.b *= e, this;
  }
  lerp(e, t) {
    return this.r += (e.r - this.r) * t, this.g += (e.g - this.g) * t, this.b += (e.b - this.b) * t, this;
  }
  lerpColors(e, t, i) {
    return this.r = e.r + (t.r - e.r) * i, this.g = e.g + (t.g - e.g) * i, this.b = e.b + (t.b - e.b) * i, this;
  }
  lerpHSL(e, t) {
    this.getHSL(ti), e.getHSL(Dn);
    const i = Er(ti.h, Dn.h, t), r = Er(ti.s, Dn.s, t), s = Er(ti.l, Dn.l, t);
    return this.setHSL(i, r, s), this;
  }
  setFromVector3(e) {
    return this.r = e.x, this.g = e.y, this.b = e.z, this;
  }
  applyMatrix3(e) {
    const t = this.r, i = this.g, r = this.b, s = e.elements;
    return this.r = s[0] * t + s[3] * i + s[6] * r, this.g = s[1] * t + s[4] * i + s[7] * r, this.b = s[2] * t + s[5] * i + s[8] * r, this;
  }
  equals(e) {
    return e.r === this.r && e.g === this.g && e.b === this.b;
  }
  fromArray(e, t = 0) {
    return this.r = e[t], this.g = e[t + 1], this.b = e[t + 2], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.r, e[t + 1] = this.g, e[t + 2] = this.b, e;
  }
  fromBufferAttribute(e, t) {
    return this.r = e.getX(t), this.g = e.getY(t), this.b = e.getZ(t), this;
  }
  toJSON() {
    return this.getHex();
  }
  *[Symbol.iterator]() {
    yield this.r, yield this.g, yield this.b;
  }
}
const ft = /* @__PURE__ */ new ke();
ke.NAMES = Co;
class Ks extends pt {
  constructor(e, t = 1) {
    super(), this.isLight = !0, this.type = "Light", this.color = new ke(e), this.intensity = t;
  }
  dispose() {
  }
  copy(e, t) {
    return super.copy(e, t), this.color.copy(e.color), this.intensity = e.intensity, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.color = this.color.getHex(), t.object.intensity = this.intensity, this.groundColor !== void 0 && (t.object.groundColor = this.groundColor.getHex()), this.distance !== void 0 && (t.object.distance = this.distance), this.angle !== void 0 && (t.object.angle = this.angle), this.decay !== void 0 && (t.object.decay = this.decay), this.penumbra !== void 0 && (t.object.penumbra = this.penumbra), this.shadow !== void 0 && (t.object.shadow = this.shadow.toJSON()), this.target !== void 0 && (t.object.target = this.target.uuid), t;
  }
}
class Zp extends Ks {
  constructor(e, t) {
    super(e, t), this.isAmbientLight = !0, this.type = "AmbientLight";
  }
}
class En {
  constructor(e = new L(1 / 0, 1 / 0, 1 / 0), t = new L(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, i = e.length; t < i; t += 3)
      this.expandByPoint(Ct.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, i = e.count; t < i; t++)
      this.expandByPoint(Ct.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, i = e.length; t < i; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const i = Ct.copy(t).multiplyScalar(0.5);
    return this.min.copy(e).sub(i), this.max.copy(e).add(i), this;
  }
  setFromObject(e, t = !1) {
    return this.makeEmpty(), this.expandByObject(e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.min.copy(e.min), this.max.copy(e.max), this;
  }
  makeEmpty() {
    return this.min.x = this.min.y = this.min.z = 1 / 0, this.max.x = this.max.y = this.max.z = -1 / 0, this;
  }
  isEmpty() {
    return this.max.x < this.min.x || this.max.y < this.min.y || this.max.z < this.min.z;
  }
  getCenter(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.addVectors(this.min, this.max).multiplyScalar(0.5);
  }
  getSize(e) {
    return this.isEmpty() ? e.set(0, 0, 0) : e.subVectors(this.max, this.min);
  }
  expandByPoint(e) {
    return this.min.min(e), this.max.max(e), this;
  }
  expandByVector(e) {
    return this.min.sub(e), this.max.add(e), this;
  }
  expandByScalar(e) {
    return this.min.addScalar(-e), this.max.addScalar(e), this;
  }
  expandByObject(e, t = !1) {
    e.updateWorldMatrix(!1, !1);
    const i = e.geometry;
    if (i !== void 0) {
      const s = i.getAttribute("position");
      if (t === !0 && s !== void 0 && e.isInstancedMesh !== !0)
        for (let a = 0, o = s.count; a < o; a++)
          e.isMesh === !0 ? e.getVertexPosition(a, Ct) : Ct.fromBufferAttribute(s, a), Ct.applyMatrix4(e.matrixWorld), this.expandByPoint(Ct);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), Un.copy(e.boundingBox)) : (i.boundingBox === null && i.computeBoundingBox(), Un.copy(i.boundingBox)), Un.applyMatrix4(e.matrixWorld), this.union(Un);
    }
    const r = e.children;
    for (let s = 0, a = r.length; s < a; s++)
      this.expandByObject(r[s], t);
    return this;
  }
  containsPoint(e) {
    return !(e.x < this.min.x || e.x > this.max.x || e.y < this.min.y || e.y > this.max.y || e.z < this.min.z || e.z > this.max.z);
  }
  containsBox(e) {
    return this.min.x <= e.min.x && e.max.x <= this.max.x && this.min.y <= e.min.y && e.max.y <= this.max.y && this.min.z <= e.min.z && e.max.z <= this.max.z;
  }
  getParameter(e, t) {
    return t.set(
      (e.x - this.min.x) / (this.max.x - this.min.x),
      (e.y - this.min.y) / (this.max.y - this.min.y),
      (e.z - this.min.z) / (this.max.z - this.min.z)
    );
  }
  intersectsBox(e) {
    return !(e.max.x < this.min.x || e.min.x > this.max.x || e.max.y < this.min.y || e.min.y > this.max.y || e.max.z < this.min.z || e.min.z > this.max.z);
  }
  intersectsSphere(e) {
    return this.clampPoint(e.center, Ct), Ct.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, i;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, i = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, i = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, i += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, i += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, i += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, i += e.normal.z * this.min.z), t <= -e.constant && i >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(hn), In.subVectors(this.max, hn), Ii.subVectors(e.a, hn), Ni.subVectors(e.b, hn), Fi.subVectors(e.c, hn), ii.subVectors(Ni, Ii), ni.subVectors(Fi, Ni), pi.subVectors(Ii, Fi);
    let t = [
      0,
      -ii.z,
      ii.y,
      0,
      -ni.z,
      ni.y,
      0,
      -pi.z,
      pi.y,
      ii.z,
      0,
      -ii.x,
      ni.z,
      0,
      -ni.x,
      pi.z,
      0,
      -pi.x,
      -ii.y,
      ii.x,
      0,
      -ni.y,
      ni.x,
      0,
      -pi.y,
      pi.x,
      0
    ];
    return !Pr(t, Ii, Ni, Fi, In) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Pr(t, Ii, Ni, Fi, In)) ? !1 : (Nn.crossVectors(ii, ni), t = [Nn.x, Nn.y, Nn.z], Pr(t, Ii, Ni, Fi, In));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, Ct).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Ct).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Vt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Vt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Vt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Vt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Vt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Vt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Vt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Vt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Vt), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const Vt = [
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L()
], Ct = /* @__PURE__ */ new L(), Un = /* @__PURE__ */ new En(), Ii = /* @__PURE__ */ new L(), Ni = /* @__PURE__ */ new L(), Fi = /* @__PURE__ */ new L(), ii = /* @__PURE__ */ new L(), ni = /* @__PURE__ */ new L(), pi = /* @__PURE__ */ new L(), hn = /* @__PURE__ */ new L(), In = /* @__PURE__ */ new L(), Nn = /* @__PURE__ */ new L(), mi = /* @__PURE__ */ new L();
function Pr(n, e, t, i, r) {
  for (let s = 0, a = n.length - 3; s <= a; s += 3) {
    mi.fromArray(n, s);
    const o = r.x * Math.abs(mi.x) + r.y * Math.abs(mi.y) + r.z * Math.abs(mi.z), l = e.dot(mi), c = t.dot(mi), h = i.dot(mi);
    if (Math.max(-Math.max(l, c, h), Math.min(l, c, h)) > o)
      return !1;
  }
  return !0;
}
class le {
  constructor(e = 0, t = 0) {
    le.prototype.isVector2 = !0, this.x = e, this.y = t;
  }
  get width() {
    return this.x;
  }
  set width(e) {
    this.x = e;
  }
  get height() {
    return this.y;
  }
  set height(e) {
    this.y = e;
  }
  set(e, t) {
    return this.x = e, this.y = t, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this;
  }
  divide(e) {
    return this.x /= e.x, this.y /= e.y, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  applyMatrix3(e) {
    const t = this.x, i = this.y, r = e.elements;
    return this.x = r[0] * t + r[3] * i + r[6], this.y = r[1] * t + r[4] * i + r[7], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this;
  }
  clampLength(e, t) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Math.max(e, Math.min(t, i)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y;
  }
  cross(e) {
    return this.x * e.y - this.y * e.x;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  angle() {
    return Math.atan2(-this.y, -this.x) + Math.PI;
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const i = this.dot(e) / t;
    return Math.acos(dt(i, -1, 1));
  }
  distanceTo(e) {
    return Math.sqrt(this.distanceToSquared(e));
  }
  distanceToSquared(e) {
    const t = this.x - e.x, i = this.y - e.y;
    return t * t + i * i;
  }
  manhattanDistanceTo(e) {
    return Math.abs(this.x - e.x) + Math.abs(this.y - e.y);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this;
  }
  lerpVectors(e, t, i) {
    return this.x = e.x + (t.x - e.x) * i, this.y = e.y + (t.y - e.y) * i, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this;
  }
  rotateAround(e, t) {
    const i = Math.cos(t), r = Math.sin(t), s = this.x - e.x, a = this.y - e.y;
    return this.x = s * i - a * r + e.x, this.y = s * r + a * i + e.y, this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y;
  }
}
function Po(n) {
  for (let e = n.length - 1; e >= 0; --e)
    if (n[e] >= 65535) return !0;
  return !1;
}
function fr(n) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", n);
}
function cc() {
  const n = fr("canvas");
  return n.style.display = "block", n;
}
const Aa = {};
function Lo(n) {
  n in Aa || (Aa[n] = !0, console.warn(n));
}
function hc(n, e, t) {
  return new Promise(function(i, r) {
    function s() {
      switch (n.clientWaitSync(e, n.SYNC_FLUSH_COMMANDS_BIT, 0)) {
        case n.WAIT_FAILED:
          r();
          break;
        case n.TIMEOUT_EXPIRED:
          setTimeout(s, t);
          break;
        default:
          i();
      }
    }
    setTimeout(s, t);
  });
}
const st = /* @__PURE__ */ new L(), Fn = /* @__PURE__ */ new le();
class Ot {
  constructor(e, t, i = !1) {
    if (Array.isArray(e))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = i, this.usage = pa, this._updateRange = { offset: 0, count: -1 }, this.updateRanges = [], this.gpuType = Kt, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  get updateRange() {
    return Lo("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."), this._updateRange;
  }
  setUsage(e) {
    return this.usage = e, this;
  }
  addUpdateRange(e, t) {
    this.updateRanges.push({ start: e, count: t });
  }
  clearUpdateRanges() {
    this.updateRanges.length = 0;
  }
  copy(e) {
    return this.name = e.name, this.array = new e.array.constructor(e.array), this.itemSize = e.itemSize, this.count = e.count, this.normalized = e.normalized, this.usage = e.usage, this.gpuType = e.gpuType, this;
  }
  copyAt(e, t, i) {
    e *= this.itemSize, i *= t.itemSize;
    for (let r = 0, s = this.itemSize; r < s; r++)
      this.array[e + r] = t.array[i + r];
    return this;
  }
  copyArray(e) {
    return this.array.set(e), this;
  }
  applyMatrix3(e) {
    if (this.itemSize === 2)
      for (let t = 0, i = this.count; t < i; t++)
        Fn.fromBufferAttribute(this, t), Fn.applyMatrix3(e), this.setXY(t, Fn.x, Fn.y);
    else if (this.itemSize === 3)
      for (let t = 0, i = this.count; t < i; t++)
        st.fromBufferAttribute(this, t), st.applyMatrix3(e), this.setXYZ(t, st.x, st.y, st.z);
    return this;
  }
  applyMatrix4(e) {
    for (let t = 0, i = this.count; t < i; t++)
      st.fromBufferAttribute(this, t), st.applyMatrix4(e), this.setXYZ(t, st.x, st.y, st.z);
    return this;
  }
  applyNormalMatrix(e) {
    for (let t = 0, i = this.count; t < i; t++)
      st.fromBufferAttribute(this, t), st.applyNormalMatrix(e), this.setXYZ(t, st.x, st.y, st.z);
    return this;
  }
  transformDirection(e) {
    for (let t = 0, i = this.count; t < i; t++)
      st.fromBufferAttribute(this, t), st.transformDirection(e), this.setXYZ(t, st.x, st.y, st.z);
    return this;
  }
  set(e, t = 0) {
    return this.array.set(e, t), this;
  }
  getComponent(e, t) {
    let i = this.array[e * this.itemSize + t];
    return this.normalized && (i = ln(i, this.array)), i;
  }
  setComponent(e, t, i) {
    return this.normalized && (i = gt(i, this.array)), this.array[e * this.itemSize + t] = i, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = ln(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = ln(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = ln(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = ln(t, this.array)), t;
  }
  setW(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 3] = t, this;
  }
  setXY(e, t, i) {
    return e *= this.itemSize, this.normalized && (t = gt(t, this.array), i = gt(i, this.array)), this.array[e + 0] = t, this.array[e + 1] = i, this;
  }
  setXYZ(e, t, i, r) {
    return e *= this.itemSize, this.normalized && (t = gt(t, this.array), i = gt(i, this.array), r = gt(r, this.array)), this.array[e + 0] = t, this.array[e + 1] = i, this.array[e + 2] = r, this;
  }
  setXYZW(e, t, i, r, s) {
    return e *= this.itemSize, this.normalized && (t = gt(t, this.array), i = gt(i, this.array), r = gt(r, this.array), s = gt(s, this.array)), this.array[e + 0] = t, this.array[e + 1] = i, this.array[e + 2] = r, this.array[e + 3] = s, this;
  }
  onUpload(e) {
    return this.onUploadCallback = e, this;
  }
  clone() {
    return new this.constructor(this.array, this.itemSize).copy(this);
  }
  toJSON() {
    const e = {
      itemSize: this.itemSize,
      type: this.array.constructor.name,
      array: Array.from(this.array),
      normalized: this.normalized
    };
    return this.name !== "" && (e.name = this.name), this.usage !== pa && (e.usage = this.usage), e;
  }
}
class Do extends Ot {
  constructor(e, t, i) {
    super(new Uint16Array(e), t, i);
  }
}
class Uo extends Ot {
  constructor(e, t, i) {
    super(new Uint32Array(e), t, i);
  }
}
class $t extends Ot {
  constructor(e, t, i) {
    super(new Float32Array(e), t, i);
  }
}
const uc = /* @__PURE__ */ new En(), un = /* @__PURE__ */ new L(), Lr = /* @__PURE__ */ new L();
class Zs {
  constructor(e = new L(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const i = this.center;
    t !== void 0 ? i.copy(t) : uc.setFromPoints(e).getCenter(i);
    let r = 0;
    for (let s = 0, a = e.length; s < a; s++)
      r = Math.max(r, i.distanceToSquared(e[s]));
    return this.radius = Math.sqrt(r), this;
  }
  copy(e) {
    return this.center.copy(e.center), this.radius = e.radius, this;
  }
  isEmpty() {
    return this.radius < 0;
  }
  makeEmpty() {
    return this.center.set(0, 0, 0), this.radius = -1, this;
  }
  containsPoint(e) {
    return e.distanceToSquared(this.center) <= this.radius * this.radius;
  }
  distanceToPoint(e) {
    return e.distanceTo(this.center) - this.radius;
  }
  intersectsSphere(e) {
    const t = this.radius + e.radius;
    return e.center.distanceToSquared(this.center) <= t * t;
  }
  intersectsBox(e) {
    return e.intersectsSphere(this);
  }
  intersectsPlane(e) {
    return Math.abs(e.distanceToPoint(this.center)) <= this.radius;
  }
  clampPoint(e, t) {
    const i = this.center.distanceToSquared(e);
    return t.copy(e), i > this.radius * this.radius && (t.sub(this.center).normalize(), t.multiplyScalar(this.radius).add(this.center)), t;
  }
  getBoundingBox(e) {
    return this.isEmpty() ? (e.makeEmpty(), e) : (e.set(this.center, this.center), e.expandByScalar(this.radius), e);
  }
  applyMatrix4(e) {
    return this.center.applyMatrix4(e), this.radius = this.radius * e.getMaxScaleOnAxis(), this;
  }
  translate(e) {
    return this.center.add(e), this;
  }
  expandByPoint(e) {
    if (this.isEmpty())
      return this.center.copy(e), this.radius = 0, this;
    un.subVectors(e, this.center);
    const t = un.lengthSq();
    if (t > this.radius * this.radius) {
      const i = Math.sqrt(t), r = (i - this.radius) * 0.5;
      this.center.addScaledVector(un, r / i), this.radius += r;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Lr.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(un.copy(e.center).add(Lr)), this.expandByPoint(un.copy(e.center).sub(Lr))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
let fc = 0;
const Tt = /* @__PURE__ */ new je(), Dr = /* @__PURE__ */ new pt(), Oi = /* @__PURE__ */ new L(), yt = /* @__PURE__ */ new En(), fn = /* @__PURE__ */ new En(), lt = /* @__PURE__ */ new L();
class fi extends an {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: fc++ }), this.uuid = sn(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (Po(e) ? Uo : Do)(e, 1) : this.index = e, this;
  }
  getAttribute(e) {
    return this.attributes[e];
  }
  setAttribute(e, t) {
    return this.attributes[e] = t, this;
  }
  deleteAttribute(e) {
    return delete this.attributes[e], this;
  }
  hasAttribute(e) {
    return this.attributes[e] !== void 0;
  }
  addGroup(e, t, i = 0) {
    this.groups.push({
      start: e,
      count: t,
      materialIndex: i
    });
  }
  clearGroups() {
    this.groups = [];
  }
  setDrawRange(e, t) {
    this.drawRange.start = e, this.drawRange.count = t;
  }
  applyMatrix4(e) {
    const t = this.attributes.position;
    t !== void 0 && (t.applyMatrix4(e), t.needsUpdate = !0);
    const i = this.attributes.normal;
    if (i !== void 0) {
      const s = new Oe().getNormalMatrix(e);
      i.applyNormalMatrix(s), i.needsUpdate = !0;
    }
    const r = this.attributes.tangent;
    return r !== void 0 && (r.transformDirection(e), r.needsUpdate = !0), this.boundingBox !== null && this.computeBoundingBox(), this.boundingSphere !== null && this.computeBoundingSphere(), this;
  }
  applyQuaternion(e) {
    return Tt.makeRotationFromQuaternion(e), this.applyMatrix4(Tt), this;
  }
  rotateX(e) {
    return Tt.makeRotationX(e), this.applyMatrix4(Tt), this;
  }
  rotateY(e) {
    return Tt.makeRotationY(e), this.applyMatrix4(Tt), this;
  }
  rotateZ(e) {
    return Tt.makeRotationZ(e), this.applyMatrix4(Tt), this;
  }
  translate(e, t, i) {
    return Tt.makeTranslation(e, t, i), this.applyMatrix4(Tt), this;
  }
  scale(e, t, i) {
    return Tt.makeScale(e, t, i), this.applyMatrix4(Tt), this;
  }
  lookAt(e) {
    return Dr.lookAt(e), Dr.updateMatrix(), this.applyMatrix4(Dr.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Oi).negate(), this.translate(Oi.x, Oi.y, Oi.z), this;
  }
  setFromPoints(e) {
    const t = [];
    for (let i = 0, r = e.length; i < r; i++) {
      const s = e[i];
      t.push(s.x, s.y, s.z || 0);
    }
    return this.setAttribute("position", new $t(t, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new En());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.", this), this.boundingBox.set(
        new L(-1 / 0, -1 / 0, -1 / 0),
        new L(1 / 0, 1 / 0, 1 / 0)
      );
      return;
    }
    if (e !== void 0) {
      if (this.boundingBox.setFromBufferAttribute(e), t)
        for (let i = 0, r = t.length; i < r; i++) {
          const s = t[i];
          yt.setFromBufferAttribute(s), this.morphTargetsRelative ? (lt.addVectors(this.boundingBox.min, yt.min), this.boundingBox.expandByPoint(lt), lt.addVectors(this.boundingBox.max, yt.max), this.boundingBox.expandByPoint(lt)) : (this.boundingBox.expandByPoint(yt.min), this.boundingBox.expandByPoint(yt.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Zs());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new L(), 1 / 0);
      return;
    }
    if (e) {
      const i = this.boundingSphere.center;
      if (yt.setFromBufferAttribute(e), t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s];
          fn.setFromBufferAttribute(o), this.morphTargetsRelative ? (lt.addVectors(yt.min, fn.min), yt.expandByPoint(lt), lt.addVectors(yt.max, fn.max), yt.expandByPoint(lt)) : (yt.expandByPoint(fn.min), yt.expandByPoint(fn.max));
        }
      yt.getCenter(i);
      let r = 0;
      for (let s = 0, a = e.count; s < a; s++)
        lt.fromBufferAttribute(e, s), r = Math.max(r, i.distanceToSquared(lt));
      if (t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s], l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++)
            lt.fromBufferAttribute(o, c), l && (Oi.fromBufferAttribute(e, c), lt.add(Oi)), r = Math.max(r, i.distanceToSquared(lt));
        }
      this.boundingSphere.radius = Math.sqrt(r), isNaN(this.boundingSphere.radius) && console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.', this);
    }
  }
  computeTangents() {
    const e = this.index, t = this.attributes;
    if (e === null || t.position === void 0 || t.normal === void 0 || t.uv === void 0) {
      console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");
      return;
    }
    const i = t.position, r = t.normal, s = t.uv;
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Ot(new Float32Array(4 * i.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let I = 0; I < i.count; I++)
      o[I] = new L(), l[I] = new L();
    const c = new L(), h = new L(), d = new L(), f = new le(), m = new le(), g = new le(), v = new L(), p = new L();
    function u(I, E, x) {
      c.fromBufferAttribute(i, I), h.fromBufferAttribute(i, E), d.fromBufferAttribute(i, x), f.fromBufferAttribute(s, I), m.fromBufferAttribute(s, E), g.fromBufferAttribute(s, x), h.sub(c), d.sub(c), m.sub(f), g.sub(f);
      const C = 1 / (m.x * g.y - g.x * m.y);
      isFinite(C) && (v.copy(h).multiplyScalar(g.y).addScaledVector(d, -m.y).multiplyScalar(C), p.copy(d).multiplyScalar(m.x).addScaledVector(h, -g.x).multiplyScalar(C), o[I].add(v), o[E].add(v), o[x].add(v), l[I].add(p), l[E].add(p), l[x].add(p));
    }
    let b = this.groups;
    b.length === 0 && (b = [{
      start: 0,
      count: e.count
    }]);
    for (let I = 0, E = b.length; I < E; ++I) {
      const x = b[I], C = x.start, W = x.count;
      for (let z = C, G = C + W; z < G; z += 3)
        u(
          e.getX(z + 0),
          e.getX(z + 1),
          e.getX(z + 2)
        );
    }
    const M = new L(), T = new L(), O = new L(), w = new L();
    function R(I) {
      O.fromBufferAttribute(r, I), w.copy(O);
      const E = o[I];
      M.copy(E), M.sub(O.multiplyScalar(O.dot(E))).normalize(), T.crossVectors(w, E);
      const C = T.dot(l[I]) < 0 ? -1 : 1;
      a.setXYZW(I, M.x, M.y, M.z, C);
    }
    for (let I = 0, E = b.length; I < E; ++I) {
      const x = b[I], C = x.start, W = x.count;
      for (let z = C, G = C + W; z < G; z += 3)
        R(e.getX(z + 0)), R(e.getX(z + 1)), R(e.getX(z + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let i = this.getAttribute("normal");
      if (i === void 0)
        i = new Ot(new Float32Array(t.count * 3), 3), this.setAttribute("normal", i);
      else
        for (let f = 0, m = i.count; f < m; f++)
          i.setXYZ(f, 0, 0, 0);
      const r = new L(), s = new L(), a = new L(), o = new L(), l = new L(), c = new L(), h = new L(), d = new L();
      if (e)
        for (let f = 0, m = e.count; f < m; f += 3) {
          const g = e.getX(f + 0), v = e.getX(f + 1), p = e.getX(f + 2);
          r.fromBufferAttribute(t, g), s.fromBufferAttribute(t, v), a.fromBufferAttribute(t, p), h.subVectors(a, s), d.subVectors(r, s), h.cross(d), o.fromBufferAttribute(i, g), l.fromBufferAttribute(i, v), c.fromBufferAttribute(i, p), o.add(h), l.add(h), c.add(h), i.setXYZ(g, o.x, o.y, o.z), i.setXYZ(v, l.x, l.y, l.z), i.setXYZ(p, c.x, c.y, c.z);
        }
      else
        for (let f = 0, m = t.count; f < m; f += 3)
          r.fromBufferAttribute(t, f + 0), s.fromBufferAttribute(t, f + 1), a.fromBufferAttribute(t, f + 2), h.subVectors(a, s), d.subVectors(r, s), h.cross(d), i.setXYZ(f + 0, h.x, h.y, h.z), i.setXYZ(f + 1, h.x, h.y, h.z), i.setXYZ(f + 2, h.x, h.y, h.z);
      this.normalizeNormals(), i.needsUpdate = !0;
    }
  }
  normalizeNormals() {
    const e = this.attributes.normal;
    for (let t = 0, i = e.count; t < i; t++)
      lt.fromBufferAttribute(e, t), lt.normalize(), e.setXYZ(t, lt.x, lt.y, lt.z);
  }
  toNonIndexed() {
    function e(o, l) {
      const c = o.array, h = o.itemSize, d = o.normalized, f = new c.constructor(l.length * h);
      let m = 0, g = 0;
      for (let v = 0, p = l.length; v < p; v++) {
        o.isInterleavedBufferAttribute ? m = l[v] * o.data.stride + o.offset : m = l[v] * h;
        for (let u = 0; u < h; u++)
          f[g++] = c[m++];
      }
      return new Ot(f, h, d);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new fi(), i = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], c = e(l, i);
      t.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], c = s[o];
      for (let h = 0, d = c.length; h < d; h++) {
        const f = c[h], m = e(f, i);
        l.push(m);
      }
      t.morphAttributes[o] = l;
    }
    t.morphTargetsRelative = this.morphTargetsRelative;
    const a = this.groups;
    for (let o = 0, l = a.length; o < l; o++) {
      const c = a[o];
      t.addGroup(c.start, c.count, c.materialIndex);
    }
    return t;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.6,
        type: "BufferGeometry",
        generator: "BufferGeometry.toJSON"
      }
    };
    if (e.uuid = this.uuid, e.type = this.type, this.name !== "" && (e.name = this.name), Object.keys(this.userData).length > 0 && (e.userData = this.userData), this.parameters !== void 0) {
      const l = this.parameters;
      for (const c in l)
        l[c] !== void 0 && (e[c] = l[c]);
      return e;
    }
    e.data = { attributes: {} };
    const t = this.index;
    t !== null && (e.data.index = {
      type: t.array.constructor.name,
      array: Array.prototype.slice.call(t.array)
    });
    const i = this.attributes;
    for (const l in i) {
      const c = i[l];
      e.data.attributes[l] = c.toJSON(e.data);
    }
    const r = {};
    let s = !1;
    for (const l in this.morphAttributes) {
      const c = this.morphAttributes[l], h = [];
      for (let d = 0, f = c.length; d < f; d++) {
        const m = c[d];
        h.push(m.toJSON(e.data));
      }
      h.length > 0 && (r[l] = h, s = !0);
    }
    s && (e.data.morphAttributes = r, e.data.morphTargetsRelative = this.morphTargetsRelative);
    const a = this.groups;
    a.length > 0 && (e.data.groups = JSON.parse(JSON.stringify(a)));
    const o = this.boundingSphere;
    return o !== null && (e.data.boundingSphere = {
      center: o.center.toArray(),
      radius: o.radius
    }), e;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.index = null, this.attributes = {}, this.morphAttributes = {}, this.groups = [], this.boundingBox = null, this.boundingSphere = null;
    const t = {};
    this.name = e.name;
    const i = e.index;
    i !== null && this.setIndex(i.clone(t));
    const r = e.attributes;
    for (const c in r) {
      const h = r[c];
      this.setAttribute(c, h.clone(t));
    }
    const s = e.morphAttributes;
    for (const c in s) {
      const h = [], d = s[c];
      for (let f = 0, m = d.length; f < m; f++)
        h.push(d[f].clone(t));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const d = a[c];
      this.addGroup(d.start, d.count, d.materialIndex);
    }
    const o = e.boundingBox;
    o !== null && (this.boundingBox = o.clone());
    const l = e.boundingSphere;
    return l !== null && (this.boundingSphere = l.clone()), this.drawRange.start = e.drawRange.start, this.drawRange.count = e.drawRange.count, this.userData = e.userData, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Tn extends fi {
  constructor(e = 1, t = 1, i = 1, r = 1, s = 1, a = 1) {
    super(), this.type = "BoxGeometry", this.parameters = {
      width: e,
      height: t,
      depth: i,
      widthSegments: r,
      heightSegments: s,
      depthSegments: a
    };
    const o = this;
    r = Math.floor(r), s = Math.floor(s), a = Math.floor(a);
    const l = [], c = [], h = [], d = [];
    let f = 0, m = 0;
    g("z", "y", "x", -1, -1, i, t, e, a, s, 0), g("z", "y", "x", 1, -1, i, t, -e, a, s, 1), g("x", "z", "y", 1, 1, e, i, t, r, a, 2), g("x", "z", "y", 1, -1, e, i, -t, r, a, 3), g("x", "y", "z", 1, -1, e, t, i, r, s, 4), g("x", "y", "z", -1, -1, e, t, -i, r, s, 5), this.setIndex(l), this.setAttribute("position", new $t(c, 3)), this.setAttribute("normal", new $t(h, 3)), this.setAttribute("uv", new $t(d, 2));
    function g(v, p, u, b, M, T, O, w, R, I, E) {
      const x = T / R, C = O / I, W = T / 2, z = O / 2, G = w / 2, K = R + 1, H = I + 1;
      let Q = 0, V = 0;
      const de = new L();
      for (let xe = 0; xe < H; xe++) {
        const me = xe * C - z;
        for (let Be = 0; Be < K; Be++) {
          const We = Be * x - W;
          de[v] = We * b, de[p] = me * M, de[u] = G, c.push(de.x, de.y, de.z), de[v] = 0, de[p] = 0, de[u] = w > 0 ? 1 : -1, h.push(de.x, de.y, de.z), d.push(Be / R), d.push(1 - xe / I), Q += 1;
        }
      }
      for (let xe = 0; xe < I; xe++)
        for (let me = 0; me < R; me++) {
          const Be = f + me + K * xe, We = f + me + K * (xe + 1), k = f + (me + 1) + K * (xe + 1), ee = f + (me + 1) + K * xe;
          l.push(Be, We, ee), l.push(We, k, ee), V += 6;
        }
      o.addGroup(m, V, E), m += V, f += Q;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Tn(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
  }
}
class $e {
  constructor(e = 0, t = 0, i = 0, r = 1) {
    $e.prototype.isVector4 = !0, this.x = e, this.y = t, this.z = i, this.w = r;
  }
  get width() {
    return this.z;
  }
  set width(e) {
    this.z = e;
  }
  get height() {
    return this.w;
  }
  set height(e) {
    this.w = e;
  }
  set(e, t, i, r) {
    return this.x = e, this.y = t, this.z = i, this.w = r, this;
  }
  setScalar(e) {
    return this.x = e, this.y = e, this.z = e, this.w = e, this;
  }
  setX(e) {
    return this.x = e, this;
  }
  setY(e) {
    return this.y = e, this;
  }
  setZ(e) {
    return this.z = e, this;
  }
  setW(e) {
    return this.w = e, this;
  }
  setComponent(e, t) {
    switch (e) {
      case 0:
        this.x = t;
        break;
      case 1:
        this.y = t;
        break;
      case 2:
        this.z = t;
        break;
      case 3:
        this.w = t;
        break;
      default:
        throw new Error("index is out of range: " + e);
    }
    return this;
  }
  getComponent(e) {
    switch (e) {
      case 0:
        return this.x;
      case 1:
        return this.y;
      case 2:
        return this.z;
      case 3:
        return this.w;
      default:
        throw new Error("index is out of range: " + e);
    }
  }
  clone() {
    return new this.constructor(this.x, this.y, this.z, this.w);
  }
  copy(e) {
    return this.x = e.x, this.y = e.y, this.z = e.z, this.w = e.w !== void 0 ? e.w : 1, this;
  }
  add(e) {
    return this.x += e.x, this.y += e.y, this.z += e.z, this.w += e.w, this;
  }
  addScalar(e) {
    return this.x += e, this.y += e, this.z += e, this.w += e, this;
  }
  addVectors(e, t) {
    return this.x = e.x + t.x, this.y = e.y + t.y, this.z = e.z + t.z, this.w = e.w + t.w, this;
  }
  addScaledVector(e, t) {
    return this.x += e.x * t, this.y += e.y * t, this.z += e.z * t, this.w += e.w * t, this;
  }
  sub(e) {
    return this.x -= e.x, this.y -= e.y, this.z -= e.z, this.w -= e.w, this;
  }
  subScalar(e) {
    return this.x -= e, this.y -= e, this.z -= e, this.w -= e, this;
  }
  subVectors(e, t) {
    return this.x = e.x - t.x, this.y = e.y - t.y, this.z = e.z - t.z, this.w = e.w - t.w, this;
  }
  multiply(e) {
    return this.x *= e.x, this.y *= e.y, this.z *= e.z, this.w *= e.w, this;
  }
  multiplyScalar(e) {
    return this.x *= e, this.y *= e, this.z *= e, this.w *= e, this;
  }
  applyMatrix4(e) {
    const t = this.x, i = this.y, r = this.z, s = this.w, a = e.elements;
    return this.x = a[0] * t + a[4] * i + a[8] * r + a[12] * s, this.y = a[1] * t + a[5] * i + a[9] * r + a[13] * s, this.z = a[2] * t + a[6] * i + a[10] * r + a[14] * s, this.w = a[3] * t + a[7] * i + a[11] * r + a[15] * s, this;
  }
  divideScalar(e) {
    return this.multiplyScalar(1 / e);
  }
  setAxisAngleFromQuaternion(e) {
    this.w = 2 * Math.acos(e.w);
    const t = Math.sqrt(1 - e.w * e.w);
    return t < 1e-4 ? (this.x = 1, this.y = 0, this.z = 0) : (this.x = e.x / t, this.y = e.y / t, this.z = e.z / t), this;
  }
  setAxisAngleFromRotationMatrix(e) {
    let t, i, r, s;
    const l = e.elements, c = l[0], h = l[4], d = l[8], f = l[1], m = l[5], g = l[9], v = l[2], p = l[6], u = l[10];
    if (Math.abs(h - f) < 0.01 && Math.abs(d - v) < 0.01 && Math.abs(g - p) < 0.01) {
      if (Math.abs(h + f) < 0.1 && Math.abs(d + v) < 0.1 && Math.abs(g + p) < 0.1 && Math.abs(c + m + u - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const M = (c + 1) / 2, T = (m + 1) / 2, O = (u + 1) / 2, w = (h + f) / 4, R = (d + v) / 4, I = (g + p) / 4;
      return M > T && M > O ? M < 0.01 ? (i = 0, r = 0.707106781, s = 0.707106781) : (i = Math.sqrt(M), r = w / i, s = R / i) : T > O ? T < 0.01 ? (i = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(T), i = w / r, s = I / r) : O < 0.01 ? (i = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(O), i = R / s, r = I / s), this.set(i, r, s, t), this;
    }
    let b = Math.sqrt((p - g) * (p - g) + (d - v) * (d - v) + (f - h) * (f - h));
    return Math.abs(b) < 1e-3 && (b = 1), this.x = (p - g) / b, this.y = (d - v) / b, this.z = (f - h) / b, this.w = Math.acos((c + m + u - 1) / 2), this;
  }
  setFromMatrixPosition(e) {
    const t = e.elements;
    return this.x = t[12], this.y = t[13], this.z = t[14], this.w = t[15], this;
  }
  min(e) {
    return this.x = Math.min(this.x, e.x), this.y = Math.min(this.y, e.y), this.z = Math.min(this.z, e.z), this.w = Math.min(this.w, e.w), this;
  }
  max(e) {
    return this.x = Math.max(this.x, e.x), this.y = Math.max(this.y, e.y), this.z = Math.max(this.z, e.z), this.w = Math.max(this.w, e.w), this;
  }
  clamp(e, t) {
    return this.x = Math.max(e.x, Math.min(t.x, this.x)), this.y = Math.max(e.y, Math.min(t.y, this.y)), this.z = Math.max(e.z, Math.min(t.z, this.z)), this.w = Math.max(e.w, Math.min(t.w, this.w)), this;
  }
  clampScalar(e, t) {
    return this.x = Math.max(e, Math.min(t, this.x)), this.y = Math.max(e, Math.min(t, this.y)), this.z = Math.max(e, Math.min(t, this.z)), this.w = Math.max(e, Math.min(t, this.w)), this;
  }
  clampLength(e, t) {
    const i = this.length();
    return this.divideScalar(i || 1).multiplyScalar(Math.max(e, Math.min(t, i)));
  }
  floor() {
    return this.x = Math.floor(this.x), this.y = Math.floor(this.y), this.z = Math.floor(this.z), this.w = Math.floor(this.w), this;
  }
  ceil() {
    return this.x = Math.ceil(this.x), this.y = Math.ceil(this.y), this.z = Math.ceil(this.z), this.w = Math.ceil(this.w), this;
  }
  round() {
    return this.x = Math.round(this.x), this.y = Math.round(this.y), this.z = Math.round(this.z), this.w = Math.round(this.w), this;
  }
  roundToZero() {
    return this.x = Math.trunc(this.x), this.y = Math.trunc(this.y), this.z = Math.trunc(this.z), this.w = Math.trunc(this.w), this;
  }
  negate() {
    return this.x = -this.x, this.y = -this.y, this.z = -this.z, this.w = -this.w, this;
  }
  dot(e) {
    return this.x * e.x + this.y * e.y + this.z * e.z + this.w * e.w;
  }
  lengthSq() {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }
  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }
  manhattanLength() {
    return Math.abs(this.x) + Math.abs(this.y) + Math.abs(this.z) + Math.abs(this.w);
  }
  normalize() {
    return this.divideScalar(this.length() || 1);
  }
  setLength(e) {
    return this.normalize().multiplyScalar(e);
  }
  lerp(e, t) {
    return this.x += (e.x - this.x) * t, this.y += (e.y - this.y) * t, this.z += (e.z - this.z) * t, this.w += (e.w - this.w) * t, this;
  }
  lerpVectors(e, t, i) {
    return this.x = e.x + (t.x - e.x) * i, this.y = e.y + (t.y - e.y) * i, this.z = e.z + (t.z - e.z) * i, this.w = e.w + (t.w - e.w) * i, this;
  }
  equals(e) {
    return e.x === this.x && e.y === this.y && e.z === this.z && e.w === this.w;
  }
  fromArray(e, t = 0) {
    return this.x = e[t], this.y = e[t + 1], this.z = e[t + 2], this.w = e[t + 3], this;
  }
  toArray(e = [], t = 0) {
    return e[t] = this.x, e[t + 1] = this.y, e[t + 2] = this.z, e[t + 3] = this.w, e;
  }
  fromBufferAttribute(e, t) {
    return this.x = e.getX(t), this.y = e.getY(t), this.z = e.getZ(t), this.w = e.getW(t), this;
  }
  random() {
    return this.x = Math.random(), this.y = Math.random(), this.z = Math.random(), this.w = Math.random(), this;
  }
  *[Symbol.iterator]() {
    yield this.x, yield this.y, yield this.z, yield this.w;
  }
}
const Ur = /* @__PURE__ */ new L(), dc = /* @__PURE__ */ new L(), pc = /* @__PURE__ */ new Oe();
class Mi {
  constructor(e = new L(1, 0, 0), t = 0) {
    this.isPlane = !0, this.normal = e, this.constant = t;
  }
  set(e, t) {
    return this.normal.copy(e), this.constant = t, this;
  }
  setComponents(e, t, i, r) {
    return this.normal.set(e, t, i), this.constant = r, this;
  }
  setFromNormalAndCoplanarPoint(e, t) {
    return this.normal.copy(e), this.constant = -t.dot(this.normal), this;
  }
  setFromCoplanarPoints(e, t, i) {
    const r = Ur.subVectors(i, t).cross(dc.subVectors(e, t)).normalize();
    return this.setFromNormalAndCoplanarPoint(r, e), this;
  }
  copy(e) {
    return this.normal.copy(e.normal), this.constant = e.constant, this;
  }
  normalize() {
    const e = 1 / this.normal.length();
    return this.normal.multiplyScalar(e), this.constant *= e, this;
  }
  negate() {
    return this.constant *= -1, this.normal.negate(), this;
  }
  distanceToPoint(e) {
    return this.normal.dot(e) + this.constant;
  }
  distanceToSphere(e) {
    return this.distanceToPoint(e.center) - e.radius;
  }
  projectPoint(e, t) {
    return t.copy(e).addScaledVector(this.normal, -this.distanceToPoint(e));
  }
  intersectLine(e, t) {
    const i = e.delta(Ur), r = this.normal.dot(i);
    if (r === 0)
      return this.distanceToPoint(e.start) === 0 ? t.copy(e.start) : null;
    const s = -(e.start.dot(this.normal) + this.constant) / r;
    return s < 0 || s > 1 ? null : t.copy(e.start).addScaledVector(i, s);
  }
  intersectsLine(e) {
    const t = this.distanceToPoint(e.start), i = this.distanceToPoint(e.end);
    return t < 0 && i > 0 || i < 0 && t > 0;
  }
  intersectsBox(e) {
    return e.intersectsPlane(this);
  }
  intersectsSphere(e) {
    return e.intersectsPlane(this);
  }
  coplanarPoint(e) {
    return e.copy(this.normal).multiplyScalar(-this.constant);
  }
  applyMatrix4(e, t) {
    const i = t || pc.getNormalMatrix(e), r = this.coplanarPoint(Ur).applyMatrix4(e), s = this.normal.applyMatrix3(i).normalize();
    return this.constant = -r.dot(s), this;
  }
  translate(e) {
    return this.constant -= e.dot(this.normal), this;
  }
  equals(e) {
    return e.normal.equals(this.normal) && e.constant === this.constant;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const gi = /* @__PURE__ */ new Zs(), On = /* @__PURE__ */ new L();
class Js {
  constructor(e = new Mi(), t = new Mi(), i = new Mi(), r = new Mi(), s = new Mi(), a = new Mi()) {
    this.planes = [e, t, i, r, s, a];
  }
  set(e, t, i, r, s, a) {
    const o = this.planes;
    return o[0].copy(e), o[1].copy(t), o[2].copy(i), o[3].copy(r), o[4].copy(s), o[5].copy(a), this;
  }
  copy(e) {
    const t = this.planes;
    for (let i = 0; i < 6; i++)
      t[i].copy(e.planes[i]);
    return this;
  }
  setFromProjectionMatrix(e, t = Zt) {
    const i = this.planes, r = e.elements, s = r[0], a = r[1], o = r[2], l = r[3], c = r[4], h = r[5], d = r[6], f = r[7], m = r[8], g = r[9], v = r[10], p = r[11], u = r[12], b = r[13], M = r[14], T = r[15];
    if (i[0].setComponents(l - s, f - c, p - m, T - u).normalize(), i[1].setComponents(l + s, f + c, p + m, T + u).normalize(), i[2].setComponents(l + a, f + h, p + g, T + b).normalize(), i[3].setComponents(l - a, f - h, p - g, T - b).normalize(), i[4].setComponents(l - o, f - d, p - v, T - M).normalize(), t === Zt)
      i[5].setComponents(l + o, f + d, p + v, T + M).normalize();
    else if (t === ur)
      i[5].setComponents(o, d, v, M).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), gi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), gi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(gi);
  }
  intersectsSprite(e) {
    return gi.center.set(0, 0, 0), gi.radius = 0.7071067811865476, gi.applyMatrix4(e.matrixWorld), this.intersectsSphere(gi);
  }
  intersectsSphere(e) {
    const t = this.planes, i = e.center, r = -e.radius;
    for (let s = 0; s < 6; s++)
      if (t[s].distanceToPoint(i) < r)
        return !1;
    return !0;
  }
  intersectsBox(e) {
    const t = this.planes;
    for (let i = 0; i < 6; i++) {
      const r = t[i];
      if (On.x = r.normal.x > 0 ? e.max.x : e.min.x, On.y = r.normal.y > 0 ? e.max.y : e.min.y, On.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(On) < 0)
        return !1;
    }
    return !0;
  }
  containsPoint(e) {
    const t = this.planes;
    for (let i = 0; i < 6; i++)
      if (t[i].distanceToPoint(e) < 0)
        return !1;
    return !0;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Ir = /* @__PURE__ */ new je(), ba = /* @__PURE__ */ new L(), wa = /* @__PURE__ */ new L();
class Io {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new le(512, 512), this.map = null, this.mapPass = null, this.matrix = new je(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Js(), this._frameExtents = new le(1, 1), this._viewportCount = 1, this._viewports = [
      new $e(0, 0, 1, 1)
    ];
  }
  getViewportCount() {
    return this._viewportCount;
  }
  getFrustum() {
    return this._frustum;
  }
  updateMatrices(e) {
    const t = this.camera, i = this.matrix;
    ba.setFromMatrixPosition(e.matrixWorld), t.position.copy(ba), wa.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(wa), t.updateMatrixWorld(), Ir.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Ir), i.set(
      0.5,
      0,
      0,
      0.5,
      0,
      0.5,
      0,
      0.5,
      0,
      0,
      0.5,
      0.5,
      0,
      0,
      0,
      1
    ), i.multiply(Ir);
  }
  getViewport(e) {
    return this._viewports[e];
  }
  getFrameExtents() {
    return this._frameExtents;
  }
  dispose() {
    this.map && this.map.dispose(), this.mapPass && this.mapPass.dispose();
  }
  copy(e) {
    return this.camera = e.camera.clone(), this.intensity = e.intensity, this.bias = e.bias, this.radius = e.radius, this.mapSize.copy(e.mapSize), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  toJSON() {
    const e = {};
    return this.intensity !== 1 && (e.intensity = this.intensity), this.bias !== 0 && (e.bias = this.bias), this.normalBias !== 0 && (e.normalBias = this.normalBias), this.radius !== 1 && (e.radius = this.radius), (this.mapSize.x !== 512 || this.mapSize.y !== 512) && (e.mapSize = this.mapSize.toArray()), e.camera = this.camera.toJSON(!1).object, delete e.camera.matrix, e;
  }
}
class No extends pt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new je(), this.projectionMatrix = new je(), this.projectionMatrixInverse = new je(), this.coordinateSystem = Zt;
  }
  copy(e, t) {
    return super.copy(e, t), this.matrixWorldInverse.copy(e.matrixWorldInverse), this.projectionMatrix.copy(e.projectionMatrix), this.projectionMatrixInverse.copy(e.projectionMatrixInverse), this.coordinateSystem = e.coordinateSystem, this;
  }
  getWorldDirection(e) {
    return super.getWorldDirection(e).negate();
  }
  updateMatrixWorld(e) {
    super.updateMatrixWorld(e), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  updateWorldMatrix(e, t) {
    super.updateWorldMatrix(e, t), this.matrixWorldInverse.copy(this.matrixWorld).invert();
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
class Fo extends No {
  constructor(e = -1, t = 1, i = 1, r = -1, s = 0.1, a = 2e3) {
    super(), this.isOrthographicCamera = !0, this.type = "OrthographicCamera", this.zoom = 1, this.view = null, this.left = e, this.right = t, this.top = i, this.bottom = r, this.near = s, this.far = a, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.left = e.left, this.right = e.right, this.top = e.top, this.bottom = e.bottom, this.near = e.near, this.far = e.far, this.zoom = e.zoom, this.view = e.view === null ? null : Object.assign({}, e.view), this;
  }
  setViewOffset(e, t, i, r, s, a) {
    this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = i, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = (this.right - this.left) / (2 * this.zoom), t = (this.top - this.bottom) / (2 * this.zoom), i = (this.right + this.left) / 2, r = (this.top + this.bottom) / 2;
    let s = i - e, a = i + e, o = r + t, l = r - t;
    if (this.view !== null && this.view.enabled) {
      const c = (this.right - this.left) / this.view.fullWidth / this.zoom, h = (this.top - this.bottom) / this.view.fullHeight / this.zoom;
      s += c * this.view.offsetX, a = s + c * this.view.width, o -= h * this.view.offsetY, l = o - h * this.view.height;
    }
    this.projectionMatrix.makeOrthographic(s, a, o, l, this.near, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.zoom = this.zoom, t.object.left = this.left, t.object.right = this.right, t.object.top = this.top, t.object.bottom = this.bottom, t.object.near = this.near, t.object.far = this.far, this.view !== null && (t.object.view = Object.assign({}, this.view)), t;
  }
}
class mc extends Io {
  constructor() {
    super(new Fo(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class Jp extends Ks {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(pt.DEFAULT_UP), this.updateMatrix(), this.target = new pt(), this.shadow = new mc();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class zt {
  constructor() {
    this.type = "Curve", this.arcLengthDivisions = 200;
  }
  // Virtual base class method to overwrite and implement in subclasses
  //	- t [0 .. 1]
  getPoint() {
    return console.warn("THREE.Curve: .getPoint() not implemented."), null;
  }
  // Get point at relative position in curve according to arc length
  // - u [0 .. 1]
  getPointAt(e, t) {
    const i = this.getUtoTmapping(e);
    return this.getPoint(i, t);
  }
  // Get sequence of points using getPoint( t )
  getPoints(e = 5) {
    const t = [];
    for (let i = 0; i <= e; i++)
      t.push(this.getPoint(i / e));
    return t;
  }
  // Get sequence of points using getPointAt( u )
  getSpacedPoints(e = 5) {
    const t = [];
    for (let i = 0; i <= e; i++)
      t.push(this.getPointAt(i / e));
    return t;
  }
  // Get total curve arc length
  getLength() {
    const e = this.getLengths();
    return e[e.length - 1];
  }
  // Get list of cumulative segment lengths
  getLengths(e = this.arcLengthDivisions) {
    if (this.cacheArcLengths && this.cacheArcLengths.length === e + 1 && !this.needsUpdate)
      return this.cacheArcLengths;
    this.needsUpdate = !1;
    const t = [];
    let i, r = this.getPoint(0), s = 0;
    t.push(0);
    for (let a = 1; a <= e; a++)
      i = this.getPoint(a / e), s += i.distanceTo(r), t.push(s), r = i;
    return this.cacheArcLengths = t, t;
  }
  updateArcLengths() {
    this.needsUpdate = !0, this.getLengths();
  }
  // Given u ( 0 .. 1 ), get a t to find p. This gives you points which are equidistant
  getUtoTmapping(e, t) {
    const i = this.getLengths();
    let r = 0;
    const s = i.length;
    let a;
    t ? a = t : a = e * i[s - 1];
    let o = 0, l = s - 1, c;
    for (; o <= l; )
      if (r = Math.floor(o + (l - o) / 2), c = i[r] - a, c < 0)
        o = r + 1;
      else if (c > 0)
        l = r - 1;
      else {
        l = r;
        break;
      }
    if (r = l, i[r] === a)
      return r / (s - 1);
    const h = i[r], f = i[r + 1] - h, m = (a - h) / f;
    return (r + m) / (s - 1);
  }
  // Returns a unit vector tangent at t
  // In case any sub curve does not implement its tangent derivation,
  // 2 points a small delta apart will be used to find its gradient
  // which seems to give a reasonable approximation
  getTangent(e, t) {
    let r = e - 1e-4, s = e + 1e-4;
    r < 0 && (r = 0), s > 1 && (s = 1);
    const a = this.getPoint(r), o = this.getPoint(s), l = t || (a.isVector2 ? new le() : new L());
    return l.copy(o).sub(a).normalize(), l;
  }
  getTangentAt(e, t) {
    const i = this.getUtoTmapping(e);
    return this.getTangent(i, t);
  }
  computeFrenetFrames(e, t) {
    const i = new L(), r = [], s = [], a = [], o = new L(), l = new je();
    for (let m = 0; m <= e; m++) {
      const g = m / e;
      r[m] = this.getTangentAt(g, new L());
    }
    s[0] = new L(), a[0] = new L();
    let c = Number.MAX_VALUE;
    const h = Math.abs(r[0].x), d = Math.abs(r[0].y), f = Math.abs(r[0].z);
    h <= c && (c = h, i.set(1, 0, 0)), d <= c && (c = d, i.set(0, 1, 0)), f <= c && i.set(0, 0, 1), o.crossVectors(r[0], i).normalize(), s[0].crossVectors(r[0], o), a[0].crossVectors(r[0], s[0]);
    for (let m = 1; m <= e; m++) {
      if (s[m] = s[m - 1].clone(), a[m] = a[m - 1].clone(), o.crossVectors(r[m - 1], r[m]), o.length() > Number.EPSILON) {
        o.normalize();
        const g = Math.acos(dt(r[m - 1].dot(r[m]), -1, 1));
        s[m].applyMatrix4(l.makeRotationAxis(o, g));
      }
      a[m].crossVectors(r[m], s[m]);
    }
    if (t === !0) {
      let m = Math.acos(dt(s[0].dot(s[e]), -1, 1));
      m /= e, r[0].dot(o.crossVectors(s[0], s[e])) > 0 && (m = -m);
      for (let g = 1; g <= e; g++)
        s[g].applyMatrix4(l.makeRotationAxis(r[g], m * g)), a[g].crossVectors(r[g], s[g]);
    }
    return {
      tangents: r,
      normals: s,
      binormals: a
    };
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
  toJSON() {
    const e = {
      metadata: {
        version: 4.6,
        type: "Curve",
        generator: "Curve.toJSON"
      }
    };
    return e.arcLengthDivisions = this.arcLengthDivisions, e.type = this.type, e;
  }
  fromJSON(e) {
    return this.arcLengthDivisions = e.arcLengthDivisions, this;
  }
}
class $s extends zt {
  constructor(e = 0, t = 0, i = 1, r = 1, s = 0, a = Math.PI * 2, o = !1, l = 0) {
    super(), this.isEllipseCurve = !0, this.type = "EllipseCurve", this.aX = e, this.aY = t, this.xRadius = i, this.yRadius = r, this.aStartAngle = s, this.aEndAngle = a, this.aClockwise = o, this.aRotation = l;
  }
  getPoint(e, t = new le()) {
    const i = t, r = Math.PI * 2;
    let s = this.aEndAngle - this.aStartAngle;
    const a = Math.abs(s) < Number.EPSILON;
    for (; s < 0; ) s += r;
    for (; s > r; ) s -= r;
    s < Number.EPSILON && (a ? s = 0 : s = r), this.aClockwise === !0 && !a && (s === r ? s = -r : s = s - r);
    const o = this.aStartAngle + e * s;
    let l = this.aX + this.xRadius * Math.cos(o), c = this.aY + this.yRadius * Math.sin(o);
    if (this.aRotation !== 0) {
      const h = Math.cos(this.aRotation), d = Math.sin(this.aRotation), f = l - this.aX, m = c - this.aY;
      l = f * h - m * d + this.aX, c = f * d + m * h + this.aY;
    }
    return i.set(l, c);
  }
  copy(e) {
    return super.copy(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.aX = this.aX, e.aY = this.aY, e.xRadius = this.xRadius, e.yRadius = this.yRadius, e.aStartAngle = this.aStartAngle, e.aEndAngle = this.aEndAngle, e.aClockwise = this.aClockwise, e.aRotation = this.aRotation, e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.aX = e.aX, this.aY = e.aY, this.xRadius = e.xRadius, this.yRadius = e.yRadius, this.aStartAngle = e.aStartAngle, this.aEndAngle = e.aEndAngle, this.aClockwise = e.aClockwise, this.aRotation = e.aRotation, this;
  }
}
class gc extends $s {
  constructor(e, t, i, r, s, a) {
    super(e, t, i, i, r, s, a), this.isArcCurve = !0, this.type = "ArcCurve";
  }
}
function js() {
  let n = 0, e = 0, t = 0, i = 0;
  function r(s, a, o, l) {
    n = s, e = o, t = -3 * s + 3 * a - 2 * o - l, i = 2 * s - 2 * a + o + l;
  }
  return {
    initCatmullRom: function(s, a, o, l, c) {
      r(a, o, c * (o - s), c * (l - a));
    },
    initNonuniformCatmullRom: function(s, a, o, l, c, h, d) {
      let f = (a - s) / c - (o - s) / (c + h) + (o - a) / h, m = (o - a) / h - (l - a) / (h + d) + (l - o) / d;
      f *= h, m *= h, r(a, o, f, m);
    },
    calc: function(s) {
      const a = s * s, o = a * s;
      return n + e * s + t * a + i * o;
    }
  };
}
const Bn = /* @__PURE__ */ new L(), Nr = /* @__PURE__ */ new js(), Fr = /* @__PURE__ */ new js(), Or = /* @__PURE__ */ new js();
class _c extends zt {
  constructor(e = [], t = !1, i = "centripetal", r = 0.5) {
    super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = i, this.tension = r;
  }
  getPoint(e, t = new L()) {
    const i = t, r = this.points, s = r.length, a = (s - (this.closed ? 0 : 1)) * e;
    let o = Math.floor(a), l = a - o;
    this.closed ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / s) + 1) * s : l === 0 && o === s - 1 && (o = s - 2, l = 1);
    let c, h;
    this.closed || o > 0 ? c = r[(o - 1) % s] : (Bn.subVectors(r[0], r[1]).add(r[0]), c = Bn);
    const d = r[o % s], f = r[(o + 1) % s];
    if (this.closed || o + 2 < s ? h = r[(o + 2) % s] : (Bn.subVectors(r[s - 1], r[s - 2]).add(r[s - 1]), h = Bn), this.curveType === "centripetal" || this.curveType === "chordal") {
      const m = this.curveType === "chordal" ? 0.5 : 0.25;
      let g = Math.pow(c.distanceToSquared(d), m), v = Math.pow(d.distanceToSquared(f), m), p = Math.pow(f.distanceToSquared(h), m);
      v < 1e-4 && (v = 1), g < 1e-4 && (g = v), p < 1e-4 && (p = v), Nr.initNonuniformCatmullRom(c.x, d.x, f.x, h.x, g, v, p), Fr.initNonuniformCatmullRom(c.y, d.y, f.y, h.y, g, v, p), Or.initNonuniformCatmullRom(c.z, d.z, f.z, h.z, g, v, p);
    } else this.curveType === "catmullrom" && (Nr.initCatmullRom(c.x, d.x, f.x, h.x, this.tension), Fr.initCatmullRom(c.y, d.y, f.y, h.y, this.tension), Or.initCatmullRom(c.z, d.z, f.z, h.z, this.tension));
    return i.set(
      Nr.calc(l),
      Fr.calc(l),
      Or.calc(l)
    ), i;
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let t = 0, i = e.points.length; t < i; t++) {
      const r = e.points[t];
      this.points.push(r.clone());
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let t = 0, i = this.points.length; t < i; t++) {
      const r = this.points[t];
      e.points.push(r.toArray());
    }
    return e.closed = this.closed, e.curveType = this.curveType, e.tension = this.tension, e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let t = 0, i = e.points.length; t < i; t++) {
      const r = e.points[t];
      this.points.push(new L().fromArray(r));
    }
    return this.closed = e.closed, this.curveType = e.curveType, this.tension = e.tension, this;
  }
}
function Ra(n, e, t, i, r) {
  const s = (i - e) * 0.5, a = (r - t) * 0.5, o = n * n, l = n * o;
  return (2 * t - 2 * i + s + a) * l + (-3 * t + 3 * i - 2 * s - a) * o + s * n + t;
}
function vc(n, e) {
  const t = 1 - n;
  return t * t * e;
}
function xc(n, e) {
  return 2 * (1 - n) * n * e;
}
function Mc(n, e) {
  return n * n * e;
}
function mn(n, e, t, i) {
  return vc(n, e) + xc(n, t) + Mc(n, i);
}
function Sc(n, e) {
  const t = 1 - n;
  return t * t * t * e;
}
function yc(n, e) {
  const t = 1 - n;
  return 3 * t * t * n * e;
}
function Ec(n, e) {
  return 3 * (1 - n) * n * n * e;
}
function Tc(n, e) {
  return n * n * n * e;
}
function gn(n, e, t, i, r) {
  return Sc(n, e) + yc(n, t) + Ec(n, i) + Tc(n, r);
}
class Oo extends zt {
  constructor(e = new le(), t = new le(), i = new le(), r = new le()) {
    super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = e, this.v1 = t, this.v2 = i, this.v3 = r;
  }
  getPoint(e, t = new le()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2, o = this.v3;
    return i.set(
      gn(e, r.x, s.x, a.x, o.x),
      gn(e, r.y, s.y, a.y, o.y)
    ), i;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
  }
}
class Ac extends zt {
  constructor(e = new L(), t = new L(), i = new L(), r = new L()) {
    super(), this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = i, this.v3 = r;
  }
  getPoint(e, t = new L()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2, o = this.v3;
    return i.set(
      gn(e, r.x, s.x, a.x, o.x),
      gn(e, r.y, s.y, a.y, o.y),
      gn(e, r.z, s.z, a.z, o.z)
    ), i;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this.v3.copy(e.v3), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e.v3 = this.v3.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this.v3.fromArray(e.v3), this;
  }
}
class Bo extends zt {
  constructor(e = new le(), t = new le()) {
    super(), this.isLineCurve = !0, this.type = "LineCurve", this.v1 = e, this.v2 = t;
  }
  getPoint(e, t = new le()) {
    const i = t;
    return e === 1 ? i.copy(this.v2) : (i.copy(this.v2).sub(this.v1), i.multiplyScalar(e).add(this.v1)), i;
  }
  // Line curve is linear, so we can overwrite default getPointAt
  getPointAt(e, t) {
    return this.getPoint(e, t);
  }
  getTangent(e, t = new le()) {
    return t.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(e, t) {
    return this.getTangent(e, t);
  }
  copy(e) {
    return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}
class bc extends zt {
  constructor(e = new L(), t = new L()) {
    super(), this.isLineCurve3 = !0, this.type = "LineCurve3", this.v1 = e, this.v2 = t;
  }
  getPoint(e, t = new L()) {
    const i = t;
    return e === 1 ? i.copy(this.v2) : (i.copy(this.v2).sub(this.v1), i.multiplyScalar(e).add(this.v1)), i;
  }
  // Line curve is linear, so we can overwrite default getPointAt
  getPointAt(e, t) {
    return this.getPoint(e, t);
  }
  getTangent(e, t = new L()) {
    return t.subVectors(this.v2, this.v1).normalize();
  }
  getTangentAt(e, t) {
    return this.getTangent(e, t);
  }
  copy(e) {
    return super.copy(e), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}
class zo extends zt {
  constructor(e = new le(), t = new le(), i = new le()) {
    super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = e, this.v1 = t, this.v2 = i;
  }
  getPoint(e, t = new le()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2;
    return i.set(
      mn(e, r.x, s.x, a.x),
      mn(e, r.y, s.y, a.y)
    ), i;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}
class wc extends zt {
  constructor(e = new L(), t = new L(), i = new L()) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = i;
  }
  getPoint(e, t = new L()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2;
    return i.set(
      mn(e, r.x, s.x, a.x),
      mn(e, r.y, s.y, a.y),
      mn(e, r.z, s.z, a.z)
    ), i;
  }
  copy(e) {
    return super.copy(e), this.v0.copy(e.v0), this.v1.copy(e.v1), this.v2.copy(e.v2), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.v0 = this.v0.toArray(), e.v1 = this.v1.toArray(), e.v2 = this.v2.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.v0.fromArray(e.v0), this.v1.fromArray(e.v1), this.v2.fromArray(e.v2), this;
  }
}
class Ho extends zt {
  constructor(e = []) {
    super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e;
  }
  getPoint(e, t = new le()) {
    const i = t, r = this.points, s = (r.length - 1) * e, a = Math.floor(s), o = s - a, l = r[a === 0 ? a : a - 1], c = r[a], h = r[a > r.length - 2 ? r.length - 1 : a + 1], d = r[a > r.length - 3 ? r.length - 1 : a + 2];
    return i.set(
      Ra(o, l.x, c.x, h.x, d.x),
      Ra(o, l.y, c.y, h.y, d.y)
    ), i;
  }
  copy(e) {
    super.copy(e), this.points = [];
    for (let t = 0, i = e.points.length; t < i; t++) {
      const r = e.points[t];
      this.points.push(r.clone());
    }
    return this;
  }
  toJSON() {
    const e = super.toJSON();
    e.points = [];
    for (let t = 0, i = this.points.length; t < i; t++) {
      const r = this.points[t];
      e.points.push(r.toArray());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.points = [];
    for (let t = 0, i = e.points.length; t < i; t++) {
      const r = e.points[t];
      this.points.push(new le().fromArray(r));
    }
    return this;
  }
}
const Is = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ArcCurve: gc,
  CatmullRomCurve3: _c,
  CubicBezierCurve: Oo,
  CubicBezierCurve3: Ac,
  EllipseCurve: $s,
  LineCurve: Bo,
  LineCurve3: bc,
  QuadraticBezierCurve: zo,
  QuadraticBezierCurve3: wc,
  SplineCurve: Ho
}, Symbol.toStringTag, { value: "Module" }));
class Rc extends zt {
  constructor() {
    super(), this.type = "CurvePath", this.curves = [], this.autoClose = !1;
  }
  add(e) {
    this.curves.push(e);
  }
  closePath() {
    const e = this.curves[0].getPoint(0), t = this.curves[this.curves.length - 1].getPoint(1);
    if (!e.equals(t)) {
      const i = e.isVector2 === !0 ? "LineCurve" : "LineCurve3";
      this.curves.push(new Is[i](t, e));
    }
    return this;
  }
  // To get accurate point with reference to
  // entire path distance at time t,
  // following has to be done:
  // 1. Length of each sub path have to be known
  // 2. Locate and identify type of curve
  // 3. Get t for the curve
  // 4. Return curve.getPointAt(t')
  getPoint(e, t) {
    const i = e * this.getLength(), r = this.getCurveLengths();
    let s = 0;
    for (; s < r.length; ) {
      if (r[s] >= i) {
        const a = r[s] - i, o = this.curves[s], l = o.getLength(), c = l === 0 ? 0 : 1 - a / l;
        return o.getPointAt(c, t);
      }
      s++;
    }
    return null;
  }
  // We cannot use the default THREE.Curve getPoint() with getLength() because in
  // THREE.Curve, getLength() depends on getPoint() but in THREE.CurvePath
  // getPoint() depends on getLength
  getLength() {
    const e = this.getCurveLengths();
    return e[e.length - 1];
  }
  // cacheLengths must be recalculated.
  updateArcLengths() {
    this.needsUpdate = !0, this.cacheLengths = null, this.getCurveLengths();
  }
  // Compute lengths and cache them
  // We cannot overwrite getLengths() because UtoT mapping uses it.
  getCurveLengths() {
    if (this.cacheLengths && this.cacheLengths.length === this.curves.length)
      return this.cacheLengths;
    const e = [];
    let t = 0;
    for (let i = 0, r = this.curves.length; i < r; i++)
      t += this.curves[i].getLength(), e.push(t);
    return this.cacheLengths = e, e;
  }
  getSpacedPoints(e = 40) {
    const t = [];
    for (let i = 0; i <= e; i++)
      t.push(this.getPoint(i / e));
    return this.autoClose && t.push(t[0]), t;
  }
  getPoints(e = 12) {
    const t = [];
    let i;
    for (let r = 0, s = this.curves; r < s.length; r++) {
      const a = s[r], o = a.isEllipseCurve ? e * 2 : a.isLineCurve || a.isLineCurve3 ? 1 : a.isSplineCurve ? e * a.points.length : e, l = a.getPoints(o);
      for (let c = 0; c < l.length; c++) {
        const h = l[c];
        i && i.equals(h) || (t.push(h), i = h);
      }
    }
    return this.autoClose && t.length > 1 && !t[t.length - 1].equals(t[0]) && t.push(t[0]), t;
  }
  copy(e) {
    super.copy(e), this.curves = [];
    for (let t = 0, i = e.curves.length; t < i; t++) {
      const r = e.curves[t];
      this.curves.push(r.clone());
    }
    return this.autoClose = e.autoClose, this;
  }
  toJSON() {
    const e = super.toJSON();
    e.autoClose = this.autoClose, e.curves = [];
    for (let t = 0, i = this.curves.length; t < i; t++) {
      const r = this.curves[t];
      e.curves.push(r.toJSON());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.autoClose = e.autoClose, this.curves = [];
    for (let t = 0, i = e.curves.length; t < i; t++) {
      const r = e.curves[t];
      this.curves.push(new Is[r.type]().fromJSON(r));
    }
    return this;
  }
}
class Ns extends Rc {
  constructor(e) {
    super(), this.type = "Path", this.currentPoint = new le(), e && this.setFromPoints(e);
  }
  setFromPoints(e) {
    this.moveTo(e[0].x, e[0].y);
    for (let t = 1, i = e.length; t < i; t++)
      this.lineTo(e[t].x, e[t].y);
    return this;
  }
  moveTo(e, t) {
    return this.currentPoint.set(e, t), this;
  }
  lineTo(e, t) {
    const i = new Bo(this.currentPoint.clone(), new le(e, t));
    return this.curves.push(i), this.currentPoint.set(e, t), this;
  }
  quadraticCurveTo(e, t, i, r) {
    const s = new zo(
      this.currentPoint.clone(),
      new le(e, t),
      new le(i, r)
    );
    return this.curves.push(s), this.currentPoint.set(i, r), this;
  }
  bezierCurveTo(e, t, i, r, s, a) {
    const o = new Oo(
      this.currentPoint.clone(),
      new le(e, t),
      new le(i, r),
      new le(s, a)
    );
    return this.curves.push(o), this.currentPoint.set(s, a), this;
  }
  splineThru(e) {
    const t = [this.currentPoint.clone()].concat(e), i = new Ho(t);
    return this.curves.push(i), this.currentPoint.copy(e[e.length - 1]), this;
  }
  arc(e, t, i, r, s, a) {
    const o = this.currentPoint.x, l = this.currentPoint.y;
    return this.absarc(
      e + o,
      t + l,
      i,
      r,
      s,
      a
    ), this;
  }
  absarc(e, t, i, r, s, a) {
    return this.absellipse(e, t, i, i, r, s, a), this;
  }
  ellipse(e, t, i, r, s, a, o, l) {
    const c = this.currentPoint.x, h = this.currentPoint.y;
    return this.absellipse(e + c, t + h, i, r, s, a, o, l), this;
  }
  absellipse(e, t, i, r, s, a, o, l) {
    const c = new $s(e, t, i, r, s, a, o, l);
    if (this.curves.length > 0) {
      const d = c.getPoint(0);
      d.equals(this.currentPoint) || this.lineTo(d.x, d.y);
    }
    this.curves.push(c);
    const h = c.getPoint(1);
    return this.currentPoint.copy(h), this;
  }
  copy(e) {
    return super.copy(e), this.currentPoint.copy(e.currentPoint), this;
  }
  toJSON() {
    const e = super.toJSON();
    return e.currentPoint = this.currentPoint.toArray(), e;
  }
  fromJSON(e) {
    return super.fromJSON(e), this.currentPoint.fromArray(e.currentPoint), this;
  }
}
class sr extends Ns {
  constructor(e) {
    super(e), this.uuid = sn(), this.type = "Shape", this.holes = [];
  }
  getPointsHoles(e) {
    const t = [];
    for (let i = 0, r = this.holes.length; i < r; i++)
      t[i] = this.holes[i].getPoints(e);
    return t;
  }
  // get points of shape and holes (keypoints based on segments parameter)
  extractPoints(e) {
    return {
      shape: this.getPoints(e),
      holes: this.getPointsHoles(e)
    };
  }
  copy(e) {
    super.copy(e), this.holes = [];
    for (let t = 0, i = e.holes.length; t < i; t++) {
      const r = e.holes[t];
      this.holes.push(r.clone());
    }
    return this;
  }
  toJSON() {
    const e = super.toJSON();
    e.uuid = this.uuid, e.holes = [];
    for (let t = 0, i = this.holes.length; t < i; t++) {
      const r = this.holes[t];
      e.holes.push(r.toJSON());
    }
    return e;
  }
  fromJSON(e) {
    super.fromJSON(e), this.uuid = e.uuid, this.holes = [];
    for (let t = 0, i = e.holes.length; t < i; t++) {
      const r = e.holes[t];
      this.holes.push(new Ns().fromJSON(r));
    }
    return this;
  }
}
const Cc = {
  triangulate: function(n, e, t = 2) {
    const i = e && e.length, r = i ? e[0] * t : n.length;
    let s = Go(n, 0, r, t, !0);
    const a = [];
    if (!s || s.next === s.prev) return a;
    let o, l, c, h, d, f, m;
    if (i && (s = Ic(n, e, s, t)), n.length > 80 * t) {
      o = c = n[0], l = h = n[1];
      for (let g = t; g < r; g += t)
        d = n[g], f = n[g + 1], d < o && (o = d), f < l && (l = f), d > c && (c = d), f > h && (h = f);
      m = Math.max(c - o, h - l), m = m !== 0 ? 32767 / m : 0;
    }
    return vn(s, a, t, o, l, m, 0), a;
  }
};
function Go(n, e, t, i, r) {
  let s, a;
  if (r === Xc(n, e, t, i) > 0)
    for (s = e; s < t; s += i) a = Ca(s, n[s], n[s + 1], a);
  else
    for (s = t - i; s >= e; s -= i) a = Ca(s, n[s], n[s + 1], a);
  return a && mr(a, a.next) && (Mn(a), a = a.next), a;
}
function wi(n, e) {
  if (!n) return n;
  e || (e = n);
  let t = n, i;
  do
    if (i = !1, !t.steiner && (mr(t, t.next) || et(t.prev, t, t.next) === 0)) {
      if (Mn(t), t = e = t.prev, t === t.next) break;
      i = !0;
    } else
      t = t.next;
  while (i || t !== e);
  return e;
}
function vn(n, e, t, i, r, s, a) {
  if (!n) return;
  !a && s && zc(n, i, r, s);
  let o = n, l, c;
  for (; n.prev !== n.next; ) {
    if (l = n.prev, c = n.next, s ? Lc(n, i, r, s) : Pc(n)) {
      e.push(l.i / t | 0), e.push(n.i / t | 0), e.push(c.i / t | 0), Mn(n), n = c.next, o = c.next;
      continue;
    }
    if (n = c, n === o) {
      a ? a === 1 ? (n = Dc(wi(n), e, t), vn(n, e, t, i, r, s, 2)) : a === 2 && Uc(n, e, t, i, r, s) : vn(wi(n), e, t, i, r, s, 1);
      break;
    }
  }
}
function Pc(n) {
  const e = n.prev, t = n, i = n.next;
  if (et(e, t, i) >= 0) return !1;
  const r = e.x, s = t.x, a = i.x, o = e.y, l = t.y, c = i.y, h = r < s ? r < a ? r : a : s < a ? s : a, d = o < l ? o < c ? o : c : l < c ? l : c, f = r > s ? r > a ? r : a : s > a ? s : a, m = o > l ? o > c ? o : c : l > c ? l : c;
  let g = i.next;
  for (; g !== e; ) {
    if (g.x >= h && g.x <= f && g.y >= d && g.y <= m && Yi(r, o, s, l, a, c, g.x, g.y) && et(g.prev, g, g.next) >= 0) return !1;
    g = g.next;
  }
  return !0;
}
function Lc(n, e, t, i) {
  const r = n.prev, s = n, a = n.next;
  if (et(r, s, a) >= 0) return !1;
  const o = r.x, l = s.x, c = a.x, h = r.y, d = s.y, f = a.y, m = o < l ? o < c ? o : c : l < c ? l : c, g = h < d ? h < f ? h : f : d < f ? d : f, v = o > l ? o > c ? o : c : l > c ? l : c, p = h > d ? h > f ? h : f : d > f ? d : f, u = Fs(m, g, e, t, i), b = Fs(v, p, e, t, i);
  let M = n.prevZ, T = n.nextZ;
  for (; M && M.z >= u && T && T.z <= b; ) {
    if (M.x >= m && M.x <= v && M.y >= g && M.y <= p && M !== r && M !== a && Yi(o, h, l, d, c, f, M.x, M.y) && et(M.prev, M, M.next) >= 0 || (M = M.prevZ, T.x >= m && T.x <= v && T.y >= g && T.y <= p && T !== r && T !== a && Yi(o, h, l, d, c, f, T.x, T.y) && et(T.prev, T, T.next) >= 0)) return !1;
    T = T.nextZ;
  }
  for (; M && M.z >= u; ) {
    if (M.x >= m && M.x <= v && M.y >= g && M.y <= p && M !== r && M !== a && Yi(o, h, l, d, c, f, M.x, M.y) && et(M.prev, M, M.next) >= 0) return !1;
    M = M.prevZ;
  }
  for (; T && T.z <= b; ) {
    if (T.x >= m && T.x <= v && T.y >= g && T.y <= p && T !== r && T !== a && Yi(o, h, l, d, c, f, T.x, T.y) && et(T.prev, T, T.next) >= 0) return !1;
    T = T.nextZ;
  }
  return !0;
}
function Dc(n, e, t) {
  let i = n;
  do {
    const r = i.prev, s = i.next.next;
    !mr(r, s) && Vo(r, i, i.next, s) && xn(r, s) && xn(s, r) && (e.push(r.i / t | 0), e.push(i.i / t | 0), e.push(s.i / t | 0), Mn(i), Mn(i.next), i = n = s), i = i.next;
  } while (i !== n);
  return wi(i);
}
function Uc(n, e, t, i, r, s) {
  let a = n;
  do {
    let o = a.next.next;
    for (; o !== a.prev; ) {
      if (a.i !== o.i && Vc(a, o)) {
        let l = ko(a, o);
        a = wi(a, a.next), l = wi(l, l.next), vn(a, e, t, i, r, s, 0), vn(l, e, t, i, r, s, 0);
        return;
      }
      o = o.next;
    }
    a = a.next;
  } while (a !== n);
}
function Ic(n, e, t, i) {
  const r = [];
  let s, a, o, l, c;
  for (s = 0, a = e.length; s < a; s++)
    o = e[s] * i, l = s < a - 1 ? e[s + 1] * i : n.length, c = Go(n, o, l, i, !1), c === c.next && (c.steiner = !0), r.push(Gc(c));
  for (r.sort(Nc), s = 0; s < r.length; s++)
    t = Fc(r[s], t);
  return t;
}
function Nc(n, e) {
  return n.x - e.x;
}
function Fc(n, e) {
  const t = Oc(n, e);
  if (!t)
    return e;
  const i = ko(t, n);
  return wi(i, i.next), wi(t, t.next);
}
function Oc(n, e) {
  let t = e, i = -1 / 0, r;
  const s = n.x, a = n.y;
  do {
    if (a <= t.y && a >= t.next.y && t.next.y !== t.y) {
      const f = t.x + (a - t.y) * (t.next.x - t.x) / (t.next.y - t.y);
      if (f <= s && f > i && (i = f, r = t.x < t.next.x ? t : t.next, f === s))
        return r;
    }
    t = t.next;
  } while (t !== e);
  if (!r) return null;
  const o = r, l = r.x, c = r.y;
  let h = 1 / 0, d;
  t = r;
  do
    s >= t.x && t.x >= l && s !== t.x && Yi(a < c ? s : i, a, l, c, a < c ? i : s, a, t.x, t.y) && (d = Math.abs(a - t.y) / (s - t.x), xn(t, n) && (d < h || d === h && (t.x > r.x || t.x === r.x && Bc(r, t))) && (r = t, h = d)), t = t.next;
  while (t !== o);
  return r;
}
function Bc(n, e) {
  return et(n.prev, n, e.prev) < 0 && et(e.next, n, n.next) < 0;
}
function zc(n, e, t, i) {
  let r = n;
  do
    r.z === 0 && (r.z = Fs(r.x, r.y, e, t, i)), r.prevZ = r.prev, r.nextZ = r.next, r = r.next;
  while (r !== n);
  r.prevZ.nextZ = null, r.prevZ = null, Hc(r);
}
function Hc(n) {
  let e, t, i, r, s, a, o, l, c = 1;
  do {
    for (t = n, n = null, s = null, a = 0; t; ) {
      for (a++, i = t, o = 0, e = 0; e < c && (o++, i = i.nextZ, !!i); e++)
        ;
      for (l = c; o > 0 || l > 0 && i; )
        o !== 0 && (l === 0 || !i || t.z <= i.z) ? (r = t, t = t.nextZ, o--) : (r = i, i = i.nextZ, l--), s ? s.nextZ = r : n = r, r.prevZ = s, s = r;
      t = i;
    }
    s.nextZ = null, c *= 2;
  } while (a > 1);
  return n;
}
function Fs(n, e, t, i, r) {
  return n = (n - t) * r | 0, e = (e - i) * r | 0, n = (n | n << 8) & 16711935, n = (n | n << 4) & 252645135, n = (n | n << 2) & 858993459, n = (n | n << 1) & 1431655765, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, n | e << 1;
}
function Gc(n) {
  let e = n, t = n;
  do
    (e.x < t.x || e.x === t.x && e.y < t.y) && (t = e), e = e.next;
  while (e !== n);
  return t;
}
function Yi(n, e, t, i, r, s, a, o) {
  return (r - a) * (e - o) >= (n - a) * (s - o) && (n - a) * (i - o) >= (t - a) * (e - o) && (t - a) * (s - o) >= (r - a) * (i - o);
}
function Vc(n, e) {
  return n.next.i !== e.i && n.prev.i !== e.i && !kc(n, e) && // dones't intersect other edges
  (xn(n, e) && xn(e, n) && Wc(n, e) && // locally visible
  (et(n.prev, n, e.prev) || et(n, e.prev, e)) || // does not create opposite-facing sectors
  mr(n, e) && et(n.prev, n, n.next) > 0 && et(e.prev, e, e.next) > 0);
}
function et(n, e, t) {
  return (e.y - n.y) * (t.x - e.x) - (e.x - n.x) * (t.y - e.y);
}
function mr(n, e) {
  return n.x === e.x && n.y === e.y;
}
function Vo(n, e, t, i) {
  const r = Hn(et(n, e, t)), s = Hn(et(n, e, i)), a = Hn(et(t, i, n)), o = Hn(et(t, i, e));
  return !!(r !== s && a !== o || r === 0 && zn(n, t, e) || s === 0 && zn(n, i, e) || a === 0 && zn(t, n, i) || o === 0 && zn(t, e, i));
}
function zn(n, e, t) {
  return e.x <= Math.max(n.x, t.x) && e.x >= Math.min(n.x, t.x) && e.y <= Math.max(n.y, t.y) && e.y >= Math.min(n.y, t.y);
}
function Hn(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}
function kc(n, e) {
  let t = n;
  do {
    if (t.i !== n.i && t.next.i !== n.i && t.i !== e.i && t.next.i !== e.i && Vo(t, t.next, n, e)) return !0;
    t = t.next;
  } while (t !== n);
  return !1;
}
function xn(n, e) {
  return et(n.prev, n, n.next) < 0 ? et(n, e, n.next) >= 0 && et(n, n.prev, e) >= 0 : et(n, e, n.prev) < 0 || et(n, n.next, e) < 0;
}
function Wc(n, e) {
  let t = n, i = !1;
  const r = (n.x + e.x) / 2, s = (n.y + e.y) / 2;
  do
    t.y > s != t.next.y > s && t.next.y !== t.y && r < (t.next.x - t.x) * (s - t.y) / (t.next.y - t.y) + t.x && (i = !i), t = t.next;
  while (t !== n);
  return i;
}
function ko(n, e) {
  const t = new Os(n.i, n.x, n.y), i = new Os(e.i, e.x, e.y), r = n.next, s = e.prev;
  return n.next = e, e.prev = n, t.next = r, r.prev = t, i.next = t, t.prev = i, s.next = i, i.prev = s, i;
}
function Ca(n, e, t, i) {
  const r = new Os(n, e, t);
  return i ? (r.next = i.next, r.prev = i, i.next.prev = r, i.next = r) : (r.prev = r, r.next = r), r;
}
function Mn(n) {
  n.next.prev = n.prev, n.prev.next = n.next, n.prevZ && (n.prevZ.nextZ = n.nextZ), n.nextZ && (n.nextZ.prevZ = n.prevZ);
}
function Os(n, e, t) {
  this.i = n, this.x = e, this.y = t, this.prev = null, this.next = null, this.z = 0, this.prevZ = null, this.nextZ = null, this.steiner = !1;
}
function Xc(n, e, t, i) {
  let r = 0;
  for (let s = e, a = t - i; s < t; s += i)
    r += (n[a] - n[s]) * (n[s + 1] + n[a + 1]), a = s;
  return r;
}
class ji {
  // calculate area of the contour polygon
  static area(e) {
    const t = e.length;
    let i = 0;
    for (let r = t - 1, s = 0; s < t; r = s++)
      i += e[r].x * e[s].y - e[s].x * e[r].y;
    return i * 0.5;
  }
  static isClockWise(e) {
    return ji.area(e) < 0;
  }
  static triangulateShape(e, t) {
    const i = [], r = [], s = [];
    Pa(e), La(i, e);
    let a = e.length;
    t.forEach(Pa);
    for (let l = 0; l < t.length; l++)
      r.push(a), a += t[l].length, La(i, t[l]);
    const o = Cc.triangulate(i, r);
    for (let l = 0; l < o.length; l += 3)
      s.push(o.slice(l, l + 3));
    return s;
  }
}
function Pa(n) {
  const e = n.length;
  e > 2 && n[e - 1].equals(n[0]) && n.pop();
}
function La(n, e) {
  for (let t = 0; t < e.length; t++)
    n.push(e[t].x), n.push(e[t].y);
}
class Qs extends fi {
  constructor(e = new sr([new le(0.5, 0.5), new le(-0.5, 0.5), new le(-0.5, -0.5), new le(0.5, -0.5)]), t = {}) {
    super(), this.type = "ExtrudeGeometry", this.parameters = {
      shapes: e,
      options: t
    }, e = Array.isArray(e) ? e : [e];
    const i = this, r = [], s = [];
    for (let o = 0, l = e.length; o < l; o++) {
      const c = e[o];
      a(c);
    }
    this.setAttribute("position", new $t(r, 3)), this.setAttribute("uv", new $t(s, 2)), this.computeVertexNormals();
    function a(o) {
      const l = [], c = t.curveSegments !== void 0 ? t.curveSegments : 12, h = t.steps !== void 0 ? t.steps : 1, d = t.depth !== void 0 ? t.depth : 1;
      let f = t.bevelEnabled !== void 0 ? t.bevelEnabled : !0, m = t.bevelThickness !== void 0 ? t.bevelThickness : 0.2, g = t.bevelSize !== void 0 ? t.bevelSize : m - 0.1, v = t.bevelOffset !== void 0 ? t.bevelOffset : 0, p = t.bevelSegments !== void 0 ? t.bevelSegments : 3;
      const u = t.extrudePath, b = t.UVGenerator !== void 0 ? t.UVGenerator : qc;
      let M, T = !1, O, w, R, I;
      u && (M = u.getSpacedPoints(h), T = !0, f = !1, O = u.computeFrenetFrames(h, !1), w = new L(), R = new L(), I = new L()), f || (p = 0, m = 0, g = 0, v = 0);
      const E = o.extractPoints(c);
      let x = E.shape;
      const C = E.holes;
      if (!ji.isClockWise(x)) {
        x = x.reverse();
        for (let y = 0, ie = C.length; y < ie; y++) {
          const j = C[y];
          ji.isClockWise(j) && (C[y] = j.reverse());
        }
      }
      const z = ji.triangulateShape(x, C), G = x;
      for (let y = 0, ie = C.length; y < ie; y++) {
        const j = C[y];
        x = x.concat(j);
      }
      function K(y, ie, j) {
        return ie || console.error("THREE.ExtrudeGeometry: vec does not exist"), y.clone().addScaledVector(ie, j);
      }
      const H = x.length, Q = z.length;
      function V(y, ie, j) {
        let he, X, Ae;
        const ue = y.x - ie.x, ve = y.y - ie.y, A = j.x - y.x, _ = j.y - y.y, F = ue * ue + ve * ve, $ = ue * _ - ve * A;
        if (Math.abs($) > Number.EPSILON) {
          const J = Math.sqrt(F), Z = Math.sqrt(A * A + _ * _), Te = ie.x - ve / J, ae = ie.y + ue / J, ge = j.x - _ / Z, Ie = j.y + A / Z, te = ((ge - Te) * _ - (Ie - ae) * A) / (ue * _ - ve * A);
          he = Te + ue * te - y.x, X = ae + ve * te - y.y;
          const pe = he * he + X * X;
          if (pe <= 2)
            return new le(he, X);
          Ae = Math.sqrt(pe / 2);
        } else {
          let J = !1;
          ue > Number.EPSILON ? A > Number.EPSILON && (J = !0) : ue < -Number.EPSILON ? A < -Number.EPSILON && (J = !0) : Math.sign(ve) === Math.sign(_) && (J = !0), J ? (he = -ve, X = ue, Ae = Math.sqrt(F)) : (he = ue, X = ve, Ae = Math.sqrt(F / 2));
        }
        return new le(he / Ae, X / Ae);
      }
      const de = [];
      for (let y = 0, ie = G.length, j = ie - 1, he = y + 1; y < ie; y++, j++, he++)
        j === ie && (j = 0), he === ie && (he = 0), de[y] = V(G[y], G[j], G[he]);
      const xe = [];
      let me, Be = de.concat();
      for (let y = 0, ie = C.length; y < ie; y++) {
        const j = C[y];
        me = [];
        for (let he = 0, X = j.length, Ae = X - 1, ue = he + 1; he < X; he++, Ae++, ue++)
          Ae === X && (Ae = 0), ue === X && (ue = 0), me[he] = V(j[he], j[Ae], j[ue]);
        xe.push(me), Be = Be.concat(me);
      }
      for (let y = 0; y < p; y++) {
        const ie = y / p, j = m * Math.cos(ie * Math.PI / 2), he = g * Math.sin(ie * Math.PI / 2) + v;
        for (let X = 0, Ae = G.length; X < Ae; X++) {
          const ue = K(G[X], de[X], he);
          ce(ue.x, ue.y, -j);
        }
        for (let X = 0, Ae = C.length; X < Ae; X++) {
          const ue = C[X];
          me = xe[X];
          for (let ve = 0, A = ue.length; ve < A; ve++) {
            const _ = K(ue[ve], me[ve], he);
            ce(_.x, _.y, -j);
          }
        }
      }
      const We = g + v;
      for (let y = 0; y < H; y++) {
        const ie = f ? K(x[y], Be[y], We) : x[y];
        T ? (R.copy(O.normals[0]).multiplyScalar(ie.x), w.copy(O.binormals[0]).multiplyScalar(ie.y), I.copy(M[0]).add(R).add(w), ce(I.x, I.y, I.z)) : ce(ie.x, ie.y, 0);
      }
      for (let y = 1; y <= h; y++)
        for (let ie = 0; ie < H; ie++) {
          const j = f ? K(x[ie], Be[ie], We) : x[ie];
          T ? (R.copy(O.normals[y]).multiplyScalar(j.x), w.copy(O.binormals[y]).multiplyScalar(j.y), I.copy(M[y]).add(R).add(w), ce(I.x, I.y, I.z)) : ce(j.x, j.y, d / h * y);
        }
      for (let y = p - 1; y >= 0; y--) {
        const ie = y / p, j = m * Math.cos(ie * Math.PI / 2), he = g * Math.sin(ie * Math.PI / 2) + v;
        for (let X = 0, Ae = G.length; X < Ae; X++) {
          const ue = K(G[X], de[X], he);
          ce(ue.x, ue.y, d + j);
        }
        for (let X = 0, Ae = C.length; X < Ae; X++) {
          const ue = C[X];
          me = xe[X];
          for (let ve = 0, A = ue.length; ve < A; ve++) {
            const _ = K(ue[ve], me[ve], he);
            T ? ce(_.x, _.y + M[h - 1].y, M[h - 1].x + j) : ce(_.x, _.y, d + j);
          }
        }
      }
      k(), ee();
      function k() {
        const y = r.length / 3;
        if (f) {
          let ie = 0, j = H * ie;
          for (let he = 0; he < Q; he++) {
            const X = z[he];
            Ce(X[2] + j, X[1] + j, X[0] + j);
          }
          ie = h + p * 2, j = H * ie;
          for (let he = 0; he < Q; he++) {
            const X = z[he];
            Ce(X[0] + j, X[1] + j, X[2] + j);
          }
        } else {
          for (let ie = 0; ie < Q; ie++) {
            const j = z[ie];
            Ce(j[2], j[1], j[0]);
          }
          for (let ie = 0; ie < Q; ie++) {
            const j = z[ie];
            Ce(j[0] + H * h, j[1] + H * h, j[2] + H * h);
          }
        }
        i.addGroup(y, r.length / 3 - y, 0);
      }
      function ee() {
        const y = r.length / 3;
        let ie = 0;
        _e(G, ie), ie += G.length;
        for (let j = 0, he = C.length; j < he; j++) {
          const X = C[j];
          _e(X, ie), ie += X.length;
        }
        i.addGroup(y, r.length / 3 - y, 1);
      }
      function _e(y, ie) {
        let j = y.length;
        for (; --j >= 0; ) {
          const he = j;
          let X = j - 1;
          X < 0 && (X = y.length - 1);
          for (let Ae = 0, ue = h + p * 2; Ae < ue; Ae++) {
            const ve = H * Ae, A = H * (Ae + 1), _ = ie + he + ve, F = ie + X + ve, $ = ie + X + A, J = ie + he + A;
            Ne(_, F, $, J);
          }
        }
      }
      function ce(y, ie, j) {
        l.push(y), l.push(ie), l.push(j);
      }
      function Ce(y, ie, j) {
        Pe(y), Pe(ie), Pe(j);
        const he = r.length / 3, X = b.generateTopUV(i, r, he - 3, he - 2, he - 1);
        Ve(X[0]), Ve(X[1]), Ve(X[2]);
      }
      function Ne(y, ie, j, he) {
        Pe(y), Pe(ie), Pe(he), Pe(ie), Pe(j), Pe(he);
        const X = r.length / 3, Ae = b.generateSideWallUV(i, r, X - 6, X - 3, X - 2, X - 1);
        Ve(Ae[0]), Ve(Ae[1]), Ve(Ae[3]), Ve(Ae[1]), Ve(Ae[2]), Ve(Ae[3]);
      }
      function Pe(y) {
        r.push(l[y * 3 + 0]), r.push(l[y * 3 + 1]), r.push(l[y * 3 + 2]);
      }
      function Ve(y) {
        s.push(y.x), s.push(y.y);
      }
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  toJSON() {
    const e = super.toJSON(), t = this.parameters.shapes, i = this.parameters.options;
    return Yc(t, i, e);
  }
  static fromJSON(e, t) {
    const i = [];
    for (let s = 0, a = e.shapes.length; s < a; s++) {
      const o = t[e.shapes[s]];
      i.push(o);
    }
    const r = e.options.extrudePath;
    return r !== void 0 && (e.options.extrudePath = new Is[r.type]().fromJSON(r)), new Qs(i, e.options);
  }
}
const qc = {
  generateTopUV: function(n, e, t, i, r) {
    const s = e[t * 3], a = e[t * 3 + 1], o = e[i * 3], l = e[i * 3 + 1], c = e[r * 3], h = e[r * 3 + 1];
    return [
      new le(s, a),
      new le(o, l),
      new le(c, h)
    ];
  },
  generateSideWallUV: function(n, e, t, i, r, s) {
    const a = e[t * 3], o = e[t * 3 + 1], l = e[t * 3 + 2], c = e[i * 3], h = e[i * 3 + 1], d = e[i * 3 + 2], f = e[r * 3], m = e[r * 3 + 1], g = e[r * 3 + 2], v = e[s * 3], p = e[s * 3 + 1], u = e[s * 3 + 2];
    return Math.abs(o - h) < Math.abs(a - c) ? [
      new le(a, 1 - l),
      new le(c, 1 - d),
      new le(f, 1 - g),
      new le(v, 1 - u)
    ] : [
      new le(o, 1 - l),
      new le(h, 1 - d),
      new le(m, 1 - g),
      new le(p, 1 - u)
    ];
  }
};
function Yc(n, e, t) {
  if (t.shapes = [], Array.isArray(n))
    for (let i = 0, r = n.length; i < r; i++) {
      const s = n[i];
      t.shapes.push(s.uuid);
    }
  else
    t.shapes.push(n.uuid);
  return t.options = Object.assign({}, e), e.extrudePath !== void 0 && (t.options.extrudePath = e.extrudePath.toJSON()), t;
}
class Gn extends pt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const kt = /* @__PURE__ */ new L(), Br = /* @__PURE__ */ new L(), Vn = /* @__PURE__ */ new L(), ri = /* @__PURE__ */ new L(), zr = /* @__PURE__ */ new L(), kn = /* @__PURE__ */ new L(), Hr = /* @__PURE__ */ new L();
class Wo {
  constructor(e = new L(), t = new L(0, 0, -1)) {
    this.origin = e, this.direction = t;
  }
  set(e, t) {
    return this.origin.copy(e), this.direction.copy(t), this;
  }
  copy(e) {
    return this.origin.copy(e.origin), this.direction.copy(e.direction), this;
  }
  at(e, t) {
    return t.copy(this.origin).addScaledVector(this.direction, e);
  }
  lookAt(e) {
    return this.direction.copy(e).sub(this.origin).normalize(), this;
  }
  recast(e) {
    return this.origin.copy(this.at(e, kt)), this;
  }
  closestPointToPoint(e, t) {
    t.subVectors(e, this.origin);
    const i = t.dot(this.direction);
    return i < 0 ? t.copy(this.origin) : t.copy(this.origin).addScaledVector(this.direction, i);
  }
  distanceToPoint(e) {
    return Math.sqrt(this.distanceSqToPoint(e));
  }
  distanceSqToPoint(e) {
    const t = kt.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (kt.copy(this.origin).addScaledVector(this.direction, t), kt.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, i, r) {
    Br.copy(e).add(t).multiplyScalar(0.5), Vn.copy(t).sub(e).normalize(), ri.copy(this.origin).sub(Br);
    const s = e.distanceTo(t) * 0.5, a = -this.direction.dot(Vn), o = ri.dot(this.direction), l = -ri.dot(Vn), c = ri.lengthSq(), h = Math.abs(1 - a * a);
    let d, f, m, g;
    if (h > 0)
      if (d = a * l - o, f = a * o - l, g = s * h, d >= 0)
        if (f >= -g)
          if (f <= g) {
            const v = 1 / h;
            d *= v, f *= v, m = d * (d + a * f + 2 * o) + f * (a * d + f + 2 * l) + c;
          } else
            f = s, d = Math.max(0, -(a * f + o)), m = -d * d + f * (f + 2 * l) + c;
        else
          f = -s, d = Math.max(0, -(a * f + o)), m = -d * d + f * (f + 2 * l) + c;
      else
        f <= -g ? (d = Math.max(0, -(-a * s + o)), f = d > 0 ? -s : Math.min(Math.max(-s, -l), s), m = -d * d + f * (f + 2 * l) + c) : f <= g ? (d = 0, f = Math.min(Math.max(-s, -l), s), m = f * (f + 2 * l) + c) : (d = Math.max(0, -(a * s + o)), f = d > 0 ? s : Math.min(Math.max(-s, -l), s), m = -d * d + f * (f + 2 * l) + c);
    else
      f = a > 0 ? -s : s, d = Math.max(0, -(a * f + o)), m = -d * d + f * (f + 2 * l) + c;
    return i && i.copy(this.origin).addScaledVector(this.direction, d), r && r.copy(Br).addScaledVector(Vn, f), m;
  }
  intersectSphere(e, t) {
    kt.subVectors(e.center, this.origin);
    const i = kt.dot(this.direction), r = kt.dot(kt) - i * i, s = e.radius * e.radius;
    if (r > s) return null;
    const a = Math.sqrt(s - r), o = i - a, l = i + a;
    return l < 0 ? null : o < 0 ? this.at(l, t) : this.at(o, t);
  }
  intersectsSphere(e) {
    return this.distanceSqToPoint(e.center) <= e.radius * e.radius;
  }
  distanceToPlane(e) {
    const t = e.normal.dot(this.direction);
    if (t === 0)
      return e.distanceToPoint(this.origin) === 0 ? 0 : null;
    const i = -(this.origin.dot(e.normal) + e.constant) / t;
    return i >= 0 ? i : null;
  }
  intersectPlane(e, t) {
    const i = this.distanceToPlane(e);
    return i === null ? null : this.at(i, t);
  }
  intersectsPlane(e) {
    const t = e.distanceToPoint(this.origin);
    return t === 0 || e.normal.dot(this.direction) * t < 0;
  }
  intersectBox(e, t) {
    let i, r, s, a, o, l;
    const c = 1 / this.direction.x, h = 1 / this.direction.y, d = 1 / this.direction.z, f = this.origin;
    return c >= 0 ? (i = (e.min.x - f.x) * c, r = (e.max.x - f.x) * c) : (i = (e.max.x - f.x) * c, r = (e.min.x - f.x) * c), h >= 0 ? (s = (e.min.y - f.y) * h, a = (e.max.y - f.y) * h) : (s = (e.max.y - f.y) * h, a = (e.min.y - f.y) * h), i > a || s > r || ((s > i || isNaN(i)) && (i = s), (a < r || isNaN(r)) && (r = a), d >= 0 ? (o = (e.min.z - f.z) * d, l = (e.max.z - f.z) * d) : (o = (e.max.z - f.z) * d, l = (e.min.z - f.z) * d), i > l || o > r) || ((o > i || i !== i) && (i = o), (l < r || r !== r) && (r = l), r < 0) ? null : this.at(i >= 0 ? i : r, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, kt) !== null;
  }
  intersectTriangle(e, t, i, r, s) {
    zr.subVectors(t, e), kn.subVectors(i, e), Hr.crossVectors(zr, kn);
    let a = this.direction.dot(Hr), o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    ri.subVectors(this.origin, e);
    const l = o * this.direction.dot(kn.crossVectors(ri, kn));
    if (l < 0)
      return null;
    const c = o * this.direction.dot(zr.cross(ri));
    if (c < 0 || l + c > a)
      return null;
    const h = -o * ri.dot(Hr);
    return h < 0 ? null : this.at(h / a, s);
  }
  applyMatrix4(e) {
    return this.origin.applyMatrix4(e), this.direction.transformDirection(e), this;
  }
  equals(e) {
    return e.origin.equals(this.origin) && e.direction.equals(this.direction);
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
const Pt = /* @__PURE__ */ new L(), Wt = /* @__PURE__ */ new L(), Gr = /* @__PURE__ */ new L(), Xt = /* @__PURE__ */ new L(), Bi = /* @__PURE__ */ new L(), zi = /* @__PURE__ */ new L(), Da = /* @__PURE__ */ new L(), Vr = /* @__PURE__ */ new L(), kr = /* @__PURE__ */ new L(), Wr = /* @__PURE__ */ new L();
class Ft {
  constructor(e = new L(), t = new L(), i = new L()) {
    this.a = e, this.b = t, this.c = i;
  }
  static getNormal(e, t, i, r) {
    r.subVectors(i, t), Pt.subVectors(e, t), r.cross(Pt);
    const s = r.lengthSq();
    return s > 0 ? r.multiplyScalar(1 / Math.sqrt(s)) : r.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(e, t, i, r, s) {
    Pt.subVectors(r, t), Wt.subVectors(i, t), Gr.subVectors(e, t);
    const a = Pt.dot(Pt), o = Pt.dot(Wt), l = Pt.dot(Gr), c = Wt.dot(Wt), h = Wt.dot(Gr), d = a * c - o * o;
    if (d === 0)
      return s.set(0, 0, 0), null;
    const f = 1 / d, m = (c * l - o * h) * f, g = (a * h - o * l) * f;
    return s.set(1 - m - g, g, m);
  }
  static containsPoint(e, t, i, r) {
    return this.getBarycoord(e, t, i, r, Xt) === null ? !1 : Xt.x >= 0 && Xt.y >= 0 && Xt.x + Xt.y <= 1;
  }
  static getInterpolation(e, t, i, r, s, a, o, l) {
    return this.getBarycoord(e, t, i, r, Xt) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, Xt.x), l.addScaledVector(a, Xt.y), l.addScaledVector(o, Xt.z), l);
  }
  static isFrontFacing(e, t, i, r) {
    return Pt.subVectors(i, t), Wt.subVectors(e, t), Pt.cross(Wt).dot(r) < 0;
  }
  set(e, t, i) {
    return this.a.copy(e), this.b.copy(t), this.c.copy(i), this;
  }
  setFromPointsAndIndices(e, t, i, r) {
    return this.a.copy(e[t]), this.b.copy(e[i]), this.c.copy(e[r]), this;
  }
  setFromAttributeAndIndices(e, t, i, r) {
    return this.a.fromBufferAttribute(e, t), this.b.fromBufferAttribute(e, i), this.c.fromBufferAttribute(e, r), this;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.a.copy(e.a), this.b.copy(e.b), this.c.copy(e.c), this;
  }
  getArea() {
    return Pt.subVectors(this.c, this.b), Wt.subVectors(this.a, this.b), Pt.cross(Wt).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return Ft.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return Ft.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, i, r, s) {
    return Ft.getInterpolation(e, this.a, this.b, this.c, t, i, r, s);
  }
  containsPoint(e) {
    return Ft.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return Ft.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const i = this.a, r = this.b, s = this.c;
    let a, o;
    Bi.subVectors(r, i), zi.subVectors(s, i), Vr.subVectors(e, i);
    const l = Bi.dot(Vr), c = zi.dot(Vr);
    if (l <= 0 && c <= 0)
      return t.copy(i);
    kr.subVectors(e, r);
    const h = Bi.dot(kr), d = zi.dot(kr);
    if (h >= 0 && d <= h)
      return t.copy(r);
    const f = l * d - h * c;
    if (f <= 0 && l >= 0 && h <= 0)
      return a = l / (l - h), t.copy(i).addScaledVector(Bi, a);
    Wr.subVectors(e, s);
    const m = Bi.dot(Wr), g = zi.dot(Wr);
    if (g >= 0 && m <= g)
      return t.copy(s);
    const v = m * c - l * g;
    if (v <= 0 && c >= 0 && g <= 0)
      return o = c / (c - g), t.copy(i).addScaledVector(zi, o);
    const p = h * g - m * d;
    if (p <= 0 && d - h >= 0 && m - g >= 0)
      return Da.subVectors(s, r), o = (d - h) / (d - h + (m - g)), t.copy(r).addScaledVector(Da, o);
    const u = 1 / (p + v + f);
    return a = v * u, o = f * u, t.copy(i).addScaledVector(Bi, a).addScaledVector(zi, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
let Kc = 0;
class An extends an {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: Kc++ }), this.uuid = sn(), this.name = "", this.type = "Material", this.blending = Zi, this.side = ci, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = is, this.blendDst = ns, this.blendEquation = yi, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new ke(0, 0, 0), this.blendAlpha = 0, this.depthFunc = or, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = da, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = Pi, this.stencilZFail = Pi, this.stencilZPass = Pi, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
  }
  get alphaTest() {
    return this._alphaTest;
  }
  set alphaTest(e) {
    this._alphaTest > 0 != e > 0 && this.version++, this._alphaTest = e;
  }
  onBeforeCompile() {
  }
  customProgramCacheKey() {
    return this.onBeforeCompile.toString();
  }
  setValues(e) {
    if (e !== void 0)
      for (const t in e) {
        const i = e[t];
        if (i === void 0) {
          console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);
          continue;
        }
        const r = this[t];
        if (r === void 0) {
          console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);
          continue;
        }
        r && r.isColor ? r.set(i) : r && r.isVector3 && i && i.isVector3 ? r.copy(i) : this[t] = i;
      }
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    t && (e = {
      textures: {},
      images: {}
    });
    const i = {
      metadata: {
        version: 4.6,
        type: "Material",
        generator: "Material.toJSON"
      }
    };
    i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.color && this.color.isColor && (i.color = this.color.getHex()), this.roughness !== void 0 && (i.roughness = this.roughness), this.metalness !== void 0 && (i.metalness = this.metalness), this.sheen !== void 0 && (i.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (i.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (i.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (i.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (i.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (i.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (i.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (i.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (i.shininess = this.shininess), this.clearcoat !== void 0 && (i.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (i.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (i.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (i.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (i.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, i.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (i.dispersion = this.dispersion), this.iridescence !== void 0 && (i.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (i.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (i.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (i.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (i.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (i.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (i.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (i.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (i.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (i.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (i.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (i.lightMap = this.lightMap.toJSON(e).uuid, i.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (i.aoMap = this.aoMap.toJSON(e).uuid, i.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (i.bumpMap = this.bumpMap.toJSON(e).uuid, i.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (i.normalMap = this.normalMap.toJSON(e).uuid, i.normalMapType = this.normalMapType, i.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (i.displacementMap = this.displacementMap.toJSON(e).uuid, i.displacementScale = this.displacementScale, i.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (i.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (i.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (i.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (i.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (i.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (i.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (i.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (i.combine = this.combine)), this.envMapRotation !== void 0 && (i.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (i.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (i.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (i.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (i.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (i.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (i.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (i.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (i.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (i.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (i.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (i.size = this.size), this.shadowSide !== null && (i.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (i.sizeAttenuation = this.sizeAttenuation), this.blending !== Zi && (i.blending = this.blending), this.side !== ci && (i.side = this.side), this.vertexColors === !0 && (i.vertexColors = !0), this.opacity < 1 && (i.opacity = this.opacity), this.transparent === !0 && (i.transparent = !0), this.blendSrc !== is && (i.blendSrc = this.blendSrc), this.blendDst !== ns && (i.blendDst = this.blendDst), this.blendEquation !== yi && (i.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (i.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (i.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (i.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (i.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (i.blendAlpha = this.blendAlpha), this.depthFunc !== or && (i.depthFunc = this.depthFunc), this.depthTest === !1 && (i.depthTest = this.depthTest), this.depthWrite === !1 && (i.depthWrite = this.depthWrite), this.colorWrite === !1 && (i.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (i.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== da && (i.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (i.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (i.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== Pi && (i.stencilFail = this.stencilFail), this.stencilZFail !== Pi && (i.stencilZFail = this.stencilZFail), this.stencilZPass !== Pi && (i.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (i.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (i.rotation = this.rotation), this.polygonOffset === !0 && (i.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (i.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (i.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (i.linewidth = this.linewidth), this.dashSize !== void 0 && (i.dashSize = this.dashSize), this.gapSize !== void 0 && (i.gapSize = this.gapSize), this.scale !== void 0 && (i.scale = this.scale), this.dithering === !0 && (i.dithering = !0), this.alphaTest > 0 && (i.alphaTest = this.alphaTest), this.alphaHash === !0 && (i.alphaHash = !0), this.alphaToCoverage === !0 && (i.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (i.premultipliedAlpha = !0), this.forceSinglePass === !0 && (i.forceSinglePass = !0), this.wireframe === !0 && (i.wireframe = !0), this.wireframeLinewidth > 1 && (i.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (i.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (i.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (i.flatShading = !0), this.visible === !1 && (i.visible = !1), this.toneMapped === !1 && (i.toneMapped = !1), this.fog === !1 && (i.fog = !1), Object.keys(this.userData).length > 0 && (i.userData = this.userData);
    function r(s) {
      const a = [];
      for (const o in s) {
        const l = s[o];
        delete l.metadata, a.push(l);
      }
      return a;
    }
    if (t) {
      const s = r(e.textures), a = r(e.images);
      s.length > 0 && (i.textures = s), a.length > 0 && (i.images = a);
    }
    return i;
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.name = e.name, this.blending = e.blending, this.side = e.side, this.vertexColors = e.vertexColors, this.opacity = e.opacity, this.transparent = e.transparent, this.blendSrc = e.blendSrc, this.blendDst = e.blendDst, this.blendEquation = e.blendEquation, this.blendSrcAlpha = e.blendSrcAlpha, this.blendDstAlpha = e.blendDstAlpha, this.blendEquationAlpha = e.blendEquationAlpha, this.blendColor.copy(e.blendColor), this.blendAlpha = e.blendAlpha, this.depthFunc = e.depthFunc, this.depthTest = e.depthTest, this.depthWrite = e.depthWrite, this.stencilWriteMask = e.stencilWriteMask, this.stencilFunc = e.stencilFunc, this.stencilRef = e.stencilRef, this.stencilFuncMask = e.stencilFuncMask, this.stencilFail = e.stencilFail, this.stencilZFail = e.stencilZFail, this.stencilZPass = e.stencilZPass, this.stencilWrite = e.stencilWrite;
    const t = e.clippingPlanes;
    let i = null;
    if (t !== null) {
      const r = t.length;
      i = new Array(r);
      for (let s = 0; s !== r; ++s)
        i[s] = t[s].clone();
    }
    return this.clippingPlanes = i, this.clipIntersection = e.clipIntersection, this.clipShadows = e.clipShadows, this.shadowSide = e.shadowSide, this.colorWrite = e.colorWrite, this.precision = e.precision, this.polygonOffset = e.polygonOffset, this.polygonOffsetFactor = e.polygonOffsetFactor, this.polygonOffsetUnits = e.polygonOffsetUnits, this.dithering = e.dithering, this.alphaTest = e.alphaTest, this.alphaHash = e.alphaHash, this.alphaToCoverage = e.alphaToCoverage, this.premultipliedAlpha = e.premultipliedAlpha, this.forceSinglePass = e.forceSinglePass, this.visible = e.visible, this.toneMapped = e.toneMapped, this.userData = JSON.parse(JSON.stringify(e.userData)), this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  onBuild() {
    console.warn("Material: onBuild() has been removed.");
  }
  onBeforeRender() {
    console.warn("Material: onBeforeRender() has been removed.");
  }
}
class Xo extends An {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new ke(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Bt(), this.combine = mo, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const Ua = /* @__PURE__ */ new je(), _i = /* @__PURE__ */ new Wo(), Wn = /* @__PURE__ */ new Zs(), Ia = /* @__PURE__ */ new L(), Hi = /* @__PURE__ */ new L(), Gi = /* @__PURE__ */ new L(), Vi = /* @__PURE__ */ new L(), Xr = /* @__PURE__ */ new L(), Xn = /* @__PURE__ */ new L(), qn = /* @__PURE__ */ new le(), Yn = /* @__PURE__ */ new le(), Kn = /* @__PURE__ */ new le(), Na = /* @__PURE__ */ new L(), Fa = /* @__PURE__ */ new L(), Oa = /* @__PURE__ */ new L(), Zn = /* @__PURE__ */ new L(), Jn = /* @__PURE__ */ new L();
class Jt extends pt {
  constructor(e = new fi(), t = new Xo()) {
    super(), this.isMesh = !0, this.type = "Mesh", this.geometry = e, this.material = t, this.updateMorphTargets();
  }
  copy(e, t) {
    return super.copy(e, t), e.morphTargetInfluences !== void 0 && (this.morphTargetInfluences = e.morphTargetInfluences.slice()), e.morphTargetDictionary !== void 0 && (this.morphTargetDictionary = Object.assign({}, e.morphTargetDictionary)), this.material = Array.isArray(e.material) ? e.material.slice() : e.material, this.geometry = e.geometry, this;
  }
  updateMorphTargets() {
    const t = this.geometry.morphAttributes, i = Object.keys(t);
    if (i.length > 0) {
      const r = t[i[0]];
      if (r !== void 0) {
        this.morphTargetInfluences = [], this.morphTargetDictionary = {};
        for (let s = 0, a = r.length; s < a; s++) {
          const o = r[s].name || String(s);
          this.morphTargetInfluences.push(0), this.morphTargetDictionary[o] = s;
        }
      }
    }
  }
  getVertexPosition(e, t) {
    const i = this.geometry, r = i.attributes.position, s = i.morphAttributes.position, a = i.morphTargetsRelative;
    t.fromBufferAttribute(r, e);
    const o = this.morphTargetInfluences;
    if (s && o) {
      Xn.set(0, 0, 0);
      for (let l = 0, c = s.length; l < c; l++) {
        const h = o[l], d = s[l];
        h !== 0 && (Xr.fromBufferAttribute(d, e), a ? Xn.addScaledVector(Xr, h) : Xn.addScaledVector(Xr.sub(t), h));
      }
      t.add(Xn);
    }
    return t;
  }
  raycast(e, t) {
    const i = this.geometry, r = this.material, s = this.matrixWorld;
    r !== void 0 && (i.boundingSphere === null && i.computeBoundingSphere(), Wn.copy(i.boundingSphere), Wn.applyMatrix4(s), _i.copy(e.ray).recast(e.near), !(Wn.containsPoint(_i.origin) === !1 && (_i.intersectSphere(Wn, Ia) === null || _i.origin.distanceToSquared(Ia) > (e.far - e.near) ** 2)) && (Ua.copy(s).invert(), _i.copy(e.ray).applyMatrix4(Ua), !(i.boundingBox !== null && _i.intersectsBox(i.boundingBox) === !1) && this._computeIntersections(e, t, _i)));
  }
  _computeIntersections(e, t, i) {
    let r;
    const s = this.geometry, a = this.material, o = s.index, l = s.attributes.position, c = s.attributes.uv, h = s.attributes.uv1, d = s.attributes.normal, f = s.groups, m = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, v = f.length; g < v; g++) {
          const p = f[g], u = a[p.materialIndex], b = Math.max(p.start, m.start), M = Math.min(o.count, Math.min(p.start + p.count, m.start + m.count));
          for (let T = b, O = M; T < O; T += 3) {
            const w = o.getX(T), R = o.getX(T + 1), I = o.getX(T + 2);
            r = $n(this, u, e, i, c, h, d, w, R, I), r && (r.faceIndex = Math.floor(T / 3), r.face.materialIndex = p.materialIndex, t.push(r));
          }
        }
      else {
        const g = Math.max(0, m.start), v = Math.min(o.count, m.start + m.count);
        for (let p = g, u = v; p < u; p += 3) {
          const b = o.getX(p), M = o.getX(p + 1), T = o.getX(p + 2);
          r = $n(this, a, e, i, c, h, d, b, M, T), r && (r.faceIndex = Math.floor(p / 3), t.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let g = 0, v = f.length; g < v; g++) {
          const p = f[g], u = a[p.materialIndex], b = Math.max(p.start, m.start), M = Math.min(l.count, Math.min(p.start + p.count, m.start + m.count));
          for (let T = b, O = M; T < O; T += 3) {
            const w = T, R = T + 1, I = T + 2;
            r = $n(this, u, e, i, c, h, d, w, R, I), r && (r.faceIndex = Math.floor(T / 3), r.face.materialIndex = p.materialIndex, t.push(r));
          }
        }
      else {
        const g = Math.max(0, m.start), v = Math.min(l.count, m.start + m.count);
        for (let p = g, u = v; p < u; p += 3) {
          const b = p, M = p + 1, T = p + 2;
          r = $n(this, a, e, i, c, h, d, b, M, T), r && (r.faceIndex = Math.floor(p / 3), t.push(r));
        }
      }
  }
}
function Zc(n, e, t, i, r, s, a, o) {
  let l;
  if (e.side === _t ? l = i.intersectTriangle(a, s, r, !0, o) : l = i.intersectTriangle(r, s, a, e.side === ci, o), l === null) return null;
  Jn.copy(o), Jn.applyMatrix4(n.matrixWorld);
  const c = t.ray.origin.distanceTo(Jn);
  return c < t.near || c > t.far ? null : {
    distance: c,
    point: Jn.clone(),
    object: n
  };
}
function $n(n, e, t, i, r, s, a, o, l, c) {
  n.getVertexPosition(o, Hi), n.getVertexPosition(l, Gi), n.getVertexPosition(c, Vi);
  const h = Zc(n, e, t, i, Hi, Gi, Vi, Zn);
  if (h) {
    r && (qn.fromBufferAttribute(r, o), Yn.fromBufferAttribute(r, l), Kn.fromBufferAttribute(r, c), h.uv = Ft.getInterpolation(Zn, Hi, Gi, Vi, qn, Yn, Kn, new le())), s && (qn.fromBufferAttribute(s, o), Yn.fromBufferAttribute(s, l), Kn.fromBufferAttribute(s, c), h.uv1 = Ft.getInterpolation(Zn, Hi, Gi, Vi, qn, Yn, Kn, new le())), a && (Na.fromBufferAttribute(a, o), Fa.fromBufferAttribute(a, l), Oa.fromBufferAttribute(a, c), h.normal = Ft.getInterpolation(Zn, Hi, Gi, Vi, Na, Fa, Oa, new L()), h.normal.dot(i.direction) > 0 && h.normal.multiplyScalar(-1));
    const d = {
      a: o,
      b: l,
      c,
      normal: new L(),
      materialIndex: 0
    };
    Ft.getNormal(Hi, Gi, Vi, d.normal), h.face = d;
  }
  return h;
}
class $p extends An {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new ke(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new ke(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = wo, this.normalScale = new le(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new Bt(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
const si = /* @__PURE__ */ new L(), Ba = /* @__PURE__ */ new le(), za = /* @__PURE__ */ new le();
class At extends No {
  constructor(e = 50, t = 1, i = 0.1, r = 2e3) {
    super(), this.isPerspectiveCamera = !0, this.type = "PerspectiveCamera", this.fov = e, this.zoom = 1, this.near = i, this.far = r, this.focus = 10, this.aspect = t, this.view = null, this.filmGauge = 35, this.filmOffset = 0, this.updateProjectionMatrix();
  }
  copy(e, t) {
    return super.copy(e, t), this.fov = e.fov, this.zoom = e.zoom, this.near = e.near, this.far = e.far, this.focus = e.focus, this.aspect = e.aspect, this.view = e.view === null ? null : Object.assign({}, e.view), this.filmGauge = e.filmGauge, this.filmOffset = e.filmOffset, this;
  }
  /**
   * Sets the FOV by focal length in respect to the current .filmGauge.
   *
   * The default film gauge is 35, so that the focal length can be specified for
   * a 35mm (full frame) camera.
   *
   * Values for focal length and film gauge must have the same unit.
   */
  setFocalLength(e) {
    const t = 0.5 * this.getFilmHeight() / e;
    this.fov = ts * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(yr * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return ts * 2 * Math.atan(
      Math.tan(yr * 0.5 * this.fov) / this.zoom
    );
  }
  getFilmWidth() {
    return this.filmGauge * Math.min(this.aspect, 1);
  }
  getFilmHeight() {
    return this.filmGauge / Math.max(this.aspect, 1);
  }
  /**
   * Computes the 2D bounds of the camera's viewable rectangle at a given distance along the viewing direction.
   * Sets minTarget and maxTarget to the coordinates of the lower-left and upper-right corners of the view rectangle.
   */
  getViewBounds(e, t, i) {
    si.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(si.x, si.y).multiplyScalar(-e / si.z), si.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), i.set(si.x, si.y).multiplyScalar(-e / si.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, Ba, za), t.subVectors(za, Ba);
  }
  /**
   * Sets an offset in a larger frustum. This is useful for multi-window or
   * multi-monitor/multi-machine setups.
   *
   * For example, if you have 3x2 monitors and each monitor is 1920x1080 and
   * the monitors are in grid like this
   *
   *   +---+---+---+
   *   | A | B | C |
   *   +---+---+---+
   *   | D | E | F |
   *   +---+---+---+
   *
   * then for each monitor you would call it like this
   *
   *   const w = 1920;
   *   const h = 1080;
   *   const fullWidth = w * 3;
   *   const fullHeight = h * 2;
   *
   *   --A--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 0, w, h );
   *   --B--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 0, w, h );
   *   --C--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 0, w, h );
   *   --D--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 0, h * 1, w, h );
   *   --E--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 1, h * 1, w, h );
   *   --F--
   *   camera.setViewOffset( fullWidth, fullHeight, w * 2, h * 1, w, h );
   *
   *   Note there is no reason monitors have to be the same size or in a grid.
   */
  setViewOffset(e, t, i, r, s, a) {
    this.aspect = e / t, this.view === null && (this.view = {
      enabled: !0,
      fullWidth: 1,
      fullHeight: 1,
      offsetX: 0,
      offsetY: 0,
      width: 1,
      height: 1
    }), this.view.enabled = !0, this.view.fullWidth = e, this.view.fullHeight = t, this.view.offsetX = i, this.view.offsetY = r, this.view.width = s, this.view.height = a, this.updateProjectionMatrix();
  }
  clearViewOffset() {
    this.view !== null && (this.view.enabled = !1), this.updateProjectionMatrix();
  }
  updateProjectionMatrix() {
    const e = this.near;
    let t = e * Math.tan(yr * 0.5 * this.fov) / this.zoom, i = 2 * t, r = this.aspect * i, s = -0.5 * r;
    const a = this.view;
    if (this.view !== null && this.view.enabled) {
      const l = a.fullWidth, c = a.fullHeight;
      s += a.offsetX * r / l, t -= a.offsetY * i / c, r *= a.width / l, i *= a.height / c;
    }
    const o = this.filmOffset;
    o !== 0 && (s += e * o / this.getFilmWidth()), this.projectionMatrix.makePerspective(s, s + r, t, t - i, e, this.far, this.coordinateSystem), this.projectionMatrixInverse.copy(this.projectionMatrix).invert();
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return t.object.fov = this.fov, t.object.zoom = this.zoom, t.object.near = this.near, t.object.far = this.far, t.object.focus = this.focus, t.object.aspect = this.aspect, this.view !== null && (t.object.view = Object.assign({}, this.view)), t.object.filmGauge = this.filmGauge, t.object.filmOffset = this.filmOffset, t;
  }
}
const Ha = /* @__PURE__ */ new je(), dn = /* @__PURE__ */ new L(), qr = /* @__PURE__ */ new L();
class Jc extends Io {
  constructor() {
    super(new At(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new le(4, 2), this._viewportCount = 6, this._viewports = [
      // These viewports map a cube-map onto a 2D texture with the
      // following orientation:
      //
      //  xzXZ
      //   y Y
      //
      // X - Positive x direction
      // x - Negative x direction
      // Y - Positive y direction
      // y - Negative y direction
      // Z - Positive z direction
      // z - Negative z direction
      // positive X
      new $e(2, 1, 1, 1),
      // negative X
      new $e(0, 1, 1, 1),
      // positive Z
      new $e(3, 1, 1, 1),
      // negative Z
      new $e(1, 1, 1, 1),
      // positive Y
      new $e(3, 0, 1, 1),
      // negative Y
      new $e(1, 0, 1, 1)
    ], this._cubeDirections = [
      new L(1, 0, 0),
      new L(-1, 0, 0),
      new L(0, 0, 1),
      new L(0, 0, -1),
      new L(0, 1, 0),
      new L(0, -1, 0)
    ], this._cubeUps = [
      new L(0, 1, 0),
      new L(0, 1, 0),
      new L(0, 1, 0),
      new L(0, 1, 0),
      new L(0, 0, 1),
      new L(0, 0, -1)
    ];
  }
  updateMatrices(e, t = 0) {
    const i = this.camera, r = this.matrix, s = e.distance || i.far;
    s !== i.far && (i.far = s, i.updateProjectionMatrix()), dn.setFromMatrixPosition(e.matrixWorld), i.position.copy(dn), qr.copy(i.position), qr.add(this._cubeDirections[t]), i.up.copy(this._cubeUps[t]), i.lookAt(qr), i.updateMatrixWorld(), r.makeTranslation(-dn.x, -dn.y, -dn.z), Ha.multiplyMatrices(i.projectionMatrix, i.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Ha);
  }
}
class jp extends Ks {
  constructor(e, t, i = 0, r = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = i, this.decay = r, this.shadow = new Jc();
  }
  get power() {
    return this.intensity * 4 * Math.PI;
  }
  set power(e) {
    this.intensity = e / (4 * Math.PI);
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e, t) {
    return super.copy(e, t), this.distance = e.distance, this.decay = e.decay, this.shadow = e.shadow.clone(), this;
  }
}
const Ga = /* @__PURE__ */ new je();
class Qp {
  constructor(e, t, i = 0, r = 1 / 0) {
    this.ray = new Wo(e, t), this.near = i, this.far = r, this.camera = null, this.layers = new Ys(), this.params = {
      Mesh: {},
      Line: { threshold: 1 },
      LOD: {},
      Points: { threshold: 1 },
      Sprite: {}
    };
  }
  set(e, t) {
    this.ray.set(e, t);
  }
  setFromCamera(e, t) {
    t.isPerspectiveCamera ? (this.ray.origin.setFromMatrixPosition(t.matrixWorld), this.ray.direction.set(e.x, e.y, 0.5).unproject(t).sub(this.ray.origin).normalize(), this.camera = t) : t.isOrthographicCamera ? (this.ray.origin.set(e.x, e.y, (t.near + t.far) / (t.near - t.far)).unproject(t), this.ray.direction.set(0, 0, -1).transformDirection(t.matrixWorld), this.camera = t) : console.error("THREE.Raycaster: Unsupported camera type: " + t.type);
  }
  setFromXRController(e) {
    return Ga.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Ga), this;
  }
  intersectObject(e, t = !0, i = []) {
    return Bs(e, this, i, t), i.sort(Va), i;
  }
  intersectObjects(e, t = !0, i = []) {
    for (let r = 0, s = e.length; r < s; r++)
      Bs(e[r], this, i, t);
    return i.sort(Va), i;
  }
}
function Va(n, e) {
  return n.distance - e.distance;
}
function Bs(n, e, t, i) {
  let r = !0;
  if (n.layers.test(e.layers) && n.raycast(e, t) === !1 && (r = !1), r === !0 && i === !0) {
    const s = n.children;
    for (let a = 0, o = s.length; a < o; a++)
      Bs(s[a], e, t, !0);
  }
}
class em extends pt {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new Bt(), this.environmentIntensity = 1, this.environmentRotation = new Bt(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
class $c {
  constructor() {
    this.type = "ShapePath", this.color = new ke(), this.subPaths = [], this.currentPath = null;
  }
  moveTo(e, t) {
    return this.currentPath = new Ns(), this.subPaths.push(this.currentPath), this.currentPath.moveTo(e, t), this;
  }
  lineTo(e, t) {
    return this.currentPath.lineTo(e, t), this;
  }
  quadraticCurveTo(e, t, i, r) {
    return this.currentPath.quadraticCurveTo(e, t, i, r), this;
  }
  bezierCurveTo(e, t, i, r, s, a) {
    return this.currentPath.bezierCurveTo(e, t, i, r, s, a), this;
  }
  splineThru(e) {
    return this.currentPath.splineThru(e), this;
  }
  toShapes(e) {
    function t(u) {
      const b = [];
      for (let M = 0, T = u.length; M < T; M++) {
        const O = u[M], w = new sr();
        w.curves = O.curves, b.push(w);
      }
      return b;
    }
    function i(u, b) {
      const M = b.length;
      let T = !1;
      for (let O = M - 1, w = 0; w < M; O = w++) {
        let R = b[O], I = b[w], E = I.x - R.x, x = I.y - R.y;
        if (Math.abs(x) > Number.EPSILON) {
          if (x < 0 && (R = b[w], E = -E, I = b[O], x = -x), u.y < R.y || u.y > I.y) continue;
          if (u.y === R.y) {
            if (u.x === R.x) return !0;
          } else {
            const C = x * (u.x - R.x) - E * (u.y - R.y);
            if (C === 0) return !0;
            if (C < 0) continue;
            T = !T;
          }
        } else {
          if (u.y !== R.y) continue;
          if (I.x <= u.x && u.x <= R.x || R.x <= u.x && u.x <= I.x) return !0;
        }
      }
      return T;
    }
    const r = ji.isClockWise, s = this.subPaths;
    if (s.length === 0) return [];
    let a, o, l;
    const c = [];
    if (s.length === 1)
      return o = s[0], l = new sr(), l.curves = o.curves, c.push(l), c;
    let h = !r(s[0].getPoints());
    h = e ? !h : h;
    const d = [], f = [];
    let m = [], g = 0, v;
    f[g] = void 0, m[g] = [];
    for (let u = 0, b = s.length; u < b; u++)
      o = s[u], v = o.getPoints(), a = r(v), a = e ? !a : a, a ? (!h && f[g] && g++, f[g] = { s: new sr(), p: v }, f[g].s.curves = o.curves, h && g++, m[g] = []) : m[g].push({ h: o, p: v[0] });
    if (!f[0]) return t(s);
    if (f.length > 1) {
      let u = !1, b = 0;
      for (let M = 0, T = f.length; M < T; M++)
        d[M] = [];
      for (let M = 0, T = f.length; M < T; M++) {
        const O = m[M];
        for (let w = 0; w < O.length; w++) {
          const R = O[w];
          let I = !0;
          for (let E = 0; E < f.length; E++)
            i(R.p, f[E].p) && (M !== E && b++, I ? (I = !1, d[E].push(R)) : u = !0);
          I && d[M].push(R);
        }
      }
      b > 0 && u === !1 && (m = d);
    }
    let p;
    for (let u = 0, b = f.length; u < b; u++) {
      l = f[u].s, c.push(l), p = m[u];
      for (let M = 0, T = p.length; M < T; M++)
        l.holes.push(p[M].h);
    }
    return c;
  }
}
let ki;
class jc {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      ki === void 0 && (ki = fr("canvas")), ki.width = e.width, ki.height = e.height;
      const i = ki.getContext("2d");
      e instanceof ImageData ? i.putImageData(e, 0, 0) : i.drawImage(e, 0, 0, e.width, e.height), t = ki;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = fr("canvas");
      t.width = e.width, t.height = e.height;
      const i = t.getContext("2d");
      i.drawImage(e, 0, 0, e.width, e.height);
      const r = i.getImageData(0, 0, e.width, e.height), s = r.data;
      for (let a = 0; a < s.length; a++)
        s[a] = $i(s[a] / 255) * 255;
      return i.putImageData(r, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let i = 0; i < t.length; i++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[i] = Math.floor($i(t[i] / 255) * 255) : t[i] = $i(t[i]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let Qc = 0;
class qo {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Qc++ }), this.uuid = sn(), this.data = e, this.dataReady = !0, this.version = 0;
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.images[this.uuid] !== void 0)
      return e.images[this.uuid];
    const i = {
      uuid: this.uuid,
      url: ""
    }, r = this.data;
    if (r !== null) {
      let s;
      if (Array.isArray(r)) {
        s = [];
        for (let a = 0, o = r.length; a < o; a++)
          r[a].isDataTexture ? s.push(Yr(r[a].image)) : s.push(Yr(r[a]));
      } else
        s = Yr(r);
      i.url = s;
    }
    return t || (e.images[this.uuid] = i), i;
  }
}
function Yr(n) {
  return typeof HTMLImageElement < "u" && n instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && n instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && n instanceof ImageBitmap ? jc.getDataURL(n) : n.data ? {
    data: Array.from(n.data),
    width: n.width,
    height: n.height,
    type: n.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let eh = 0;
class vt extends an {
  constructor(e = vt.DEFAULT_IMAGE, t = vt.DEFAULT_MAPPING, i = Ti, r = Ti, s = Lt, a = Ai, o = Dt, l = jt, c = vt.DEFAULT_ANISOTROPY, h = ai) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: eh++ }), this.uuid = sn(), this.name = "", this.source = new qo(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = i, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new le(0, 0), this.repeat = new le(1, 1), this.center = new le(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Oe(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
  }
  get image() {
    return this.source.data;
  }
  set image(e = null) {
    this.source.data = e;
  }
  updateMatrix() {
    this.matrix.setUvTransform(this.offset.x, this.offset.y, this.repeat.x, this.repeat.y, this.rotation, this.center.x, this.center.y);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    return this.name = e.name, this.source = e.source, this.mipmaps = e.mipmaps.slice(0), this.mapping = e.mapping, this.channel = e.channel, this.wrapS = e.wrapS, this.wrapT = e.wrapT, this.magFilter = e.magFilter, this.minFilter = e.minFilter, this.anisotropy = e.anisotropy, this.format = e.format, this.internalFormat = e.internalFormat, this.type = e.type, this.offset.copy(e.offset), this.repeat.copy(e.repeat), this.center.copy(e.center), this.rotation = e.rotation, this.matrixAutoUpdate = e.matrixAutoUpdate, this.matrix.copy(e.matrix), this.generateMipmaps = e.generateMipmaps, this.premultiplyAlpha = e.premultiplyAlpha, this.flipY = e.flipY, this.unpackAlignment = e.unpackAlignment, this.colorSpace = e.colorSpace, this.userData = JSON.parse(JSON.stringify(e.userData)), this.needsUpdate = !0, this;
  }
  toJSON(e) {
    const t = e === void 0 || typeof e == "string";
    if (!t && e.textures[this.uuid] !== void 0)
      return e.textures[this.uuid];
    const i = {
      metadata: {
        version: 4.6,
        type: "Texture",
        generator: "Texture.toJSON"
      },
      uuid: this.uuid,
      name: this.name,
      image: this.source.toJSON(e).uuid,
      mapping: this.mapping,
      channel: this.channel,
      repeat: [this.repeat.x, this.repeat.y],
      offset: [this.offset.x, this.offset.y],
      center: [this.center.x, this.center.y],
      rotation: this.rotation,
      wrap: [this.wrapS, this.wrapT],
      format: this.format,
      internalFormat: this.internalFormat,
      type: this.type,
      colorSpace: this.colorSpace,
      minFilter: this.minFilter,
      magFilter: this.magFilter,
      anisotropy: this.anisotropy,
      flipY: this.flipY,
      generateMipmaps: this.generateMipmaps,
      premultiplyAlpha: this.premultiplyAlpha,
      unpackAlignment: this.unpackAlignment
    };
    return Object.keys(this.userData).length > 0 && (i.userData = this.userData), t || (e.textures[this.uuid] = i), i;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
  transformUv(e) {
    if (this.mapping !== go) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
      switch (this.wrapS) {
        case as:
          e.x = e.x - Math.floor(e.x);
          break;
        case Ti:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case os:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case as:
          e.y = e.y - Math.floor(e.y);
          break;
        case Ti:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case os:
          Math.abs(Math.floor(e.y) % 2) === 1 ? e.y = Math.ceil(e.y) - e.y : e.y = e.y - Math.floor(e.y);
          break;
      }
    return this.flipY && (e.y = 1 - e.y), e;
  }
  set needsUpdate(e) {
    e === !0 && (this.version++, this.source.needsUpdate = !0);
  }
  set needsPMREMUpdate(e) {
    e === !0 && this.pmremVersion++;
  }
}
vt.DEFAULT_IMAGE = null;
vt.DEFAULT_MAPPING = go;
vt.DEFAULT_ANISOTROPY = 1;
function Yo() {
  let n = null, e = !1, t = null, i = null;
  function r(s, a) {
    t(s, a), i = n.requestAnimationFrame(r);
  }
  return {
    start: function() {
      e !== !0 && t !== null && (i = n.requestAnimationFrame(r), e = !0);
    },
    stop: function() {
      n.cancelAnimationFrame(i), e = !1;
    },
    setAnimationLoop: function(s) {
      t = s;
    },
    setContext: function(s) {
      n = s;
    }
  };
}
function th(n) {
  const e = /* @__PURE__ */ new WeakMap();
  function t(o, l) {
    const c = o.array, h = o.usage, d = c.byteLength, f = n.createBuffer();
    n.bindBuffer(l, f), n.bufferData(l, c, h), o.onUploadCallback();
    let m;
    if (c instanceof Float32Array)
      m = n.FLOAT;
    else if (c instanceof Uint16Array)
      o.isFloat16BufferAttribute ? m = n.HALF_FLOAT : m = n.UNSIGNED_SHORT;
    else if (c instanceof Int16Array)
      m = n.SHORT;
    else if (c instanceof Uint32Array)
      m = n.UNSIGNED_INT;
    else if (c instanceof Int32Array)
      m = n.INT;
    else if (c instanceof Int8Array)
      m = n.BYTE;
    else if (c instanceof Uint8Array)
      m = n.UNSIGNED_BYTE;
    else if (c instanceof Uint8ClampedArray)
      m = n.UNSIGNED_BYTE;
    else
      throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: " + c);
    return {
      buffer: f,
      type: m,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: d
    };
  }
  function i(o, l, c) {
    const h = l.array, d = l._updateRange, f = l.updateRanges;
    if (n.bindBuffer(c, o), d.count === -1 && f.length === 0 && n.bufferSubData(c, 0, h), f.length !== 0) {
      for (let m = 0, g = f.length; m < g; m++) {
        const v = f[m];
        n.bufferSubData(
          c,
          v.start * h.BYTES_PER_ELEMENT,
          h,
          v.start,
          v.count
        );
      }
      l.clearUpdateRanges();
    }
    d.count !== -1 && (n.bufferSubData(
      c,
      d.offset * h.BYTES_PER_ELEMENT,
      h,
      d.offset,
      d.count
    ), d.count = -1), l.onUploadCallback();
  }
  function r(o) {
    return o.isInterleavedBufferAttribute && (o = o.data), e.get(o);
  }
  function s(o) {
    o.isInterleavedBufferAttribute && (o = o.data);
    const l = e.get(o);
    l && (n.deleteBuffer(l.buffer), e.delete(o));
  }
  function a(o, l) {
    if (o.isGLBufferAttribute) {
      const h = e.get(o);
      (!h || h.version < o.version) && e.set(o, {
        buffer: o.buffer,
        type: o.type,
        bytesPerElement: o.elementSize,
        version: o.version
      });
      return;
    }
    o.isInterleavedBufferAttribute && (o = o.data);
    const c = e.get(o);
    if (c === void 0)
      e.set(o, t(o, l));
    else if (c.version < o.version) {
      if (c.size !== o.array.byteLength)
        throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");
      i(c.buffer, o, l), c.version = o.version;
    }
  }
  return {
    get: r,
    remove: s,
    update: a
  };
}
class gr extends fi {
  constructor(e = 1, t = 1, i = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: i,
      heightSegments: r
    };
    const s = e / 2, a = t / 2, o = Math.floor(i), l = Math.floor(r), c = o + 1, h = l + 1, d = e / o, f = t / l, m = [], g = [], v = [], p = [];
    for (let u = 0; u < h; u++) {
      const b = u * f - a;
      for (let M = 0; M < c; M++) {
        const T = M * d - s;
        g.push(T, -b, 0), v.push(0, 0, 1), p.push(M / o), p.push(1 - u / l);
      }
    }
    for (let u = 0; u < l; u++)
      for (let b = 0; b < o; b++) {
        const M = b + c * u, T = b + c * (u + 1), O = b + 1 + c * (u + 1), w = b + 1 + c * u;
        m.push(M, T, w), m.push(T, O, w);
      }
    this.setIndex(m), this.setAttribute("position", new $t(g, 3)), this.setAttribute("normal", new $t(v, 3)), this.setAttribute("uv", new $t(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new gr(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
function rn(n) {
  const e = {};
  for (const t in n) {
    e[t] = {};
    for (const i in n[t]) {
      const r = n[t][i];
      r && (r.isColor || r.isMatrix3 || r.isMatrix4 || r.isVector2 || r.isVector3 || r.isVector4 || r.isTexture || r.isQuaternion) ? r.isRenderTargetTexture ? (console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."), e[t][i] = null) : e[t][i] = r.clone() : Array.isArray(r) ? e[t][i] = r.slice() : e[t][i] = r;
    }
  }
  return e;
}
function mt(n) {
  const e = {};
  for (let t = 0; t < n.length; t++) {
    const i = rn(n[t]);
    for (const r in i)
      e[r] = i[r];
  }
  return e;
}
function ih(n) {
  const e = [];
  for (let t = 0; t < n.length; t++)
    e.push(n[t].clone());
  return e;
}
function Ko(n) {
  const e = n.getRenderTarget();
  return e === null ? n.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : Ze.workingColorSpace;
}
const nh = { clone: rn, merge: mt }, rh = (
  /* glsl */
  `
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
), sh = (
  /* glsl */
  `
void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
`
);
class hi extends An {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = rh, this.fragmentShader = sh, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
      clipCullDistance: !1,
      // set to use vertex shader clipping
      multiDraw: !1
      // set to use vertex shader multi_draw / enable gl_DrawID
    }, this.defaultAttributeValues = {
      color: [1, 1, 1],
      uv: [0, 0],
      uv1: [0, 0]
    }, this.index0AttributeName = void 0, this.uniformsNeedUpdate = !1, this.glslVersion = null, e !== void 0 && this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = rn(e.uniforms), this.uniformsGroups = ih(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    t.glslVersion = this.glslVersion, t.uniforms = {};
    for (const r in this.uniforms) {
      const a = this.uniforms[r].value;
      a && a.isTexture ? t.uniforms[r] = {
        type: "t",
        value: a.toJSON(e).uuid
      } : a && a.isColor ? t.uniforms[r] = {
        type: "c",
        value: a.getHex()
      } : a && a.isVector2 ? t.uniforms[r] = {
        type: "v2",
        value: a.toArray()
      } : a && a.isVector3 ? t.uniforms[r] = {
        type: "v3",
        value: a.toArray()
      } : a && a.isVector4 ? t.uniforms[r] = {
        type: "v4",
        value: a.toArray()
      } : a && a.isMatrix3 ? t.uniforms[r] = {
        type: "m3",
        value: a.toArray()
      } : a && a.isMatrix4 ? t.uniforms[r] = {
        type: "m4",
        value: a.toArray()
      } : t.uniforms[r] = {
        value: a
      };
    }
    Object.keys(this.defines).length > 0 && (t.defines = this.defines), t.vertexShader = this.vertexShader, t.fragmentShader = this.fragmentShader, t.lights = this.lights, t.clipping = this.clipping;
    const i = {};
    for (const r in this.extensions)
      this.extensions[r] === !0 && (i[r] = !0);
    return Object.keys(i).length > 0 && (t.extensions = i), t;
  }
}
const ah = (
  /* glsl */
  `
#ifdef USE_ALPHAHASH

	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;

#endif
`
), oh = (
  /* glsl */
  `
#ifdef USE_ALPHAHASH

	/**
	 * See: https://casual-effects.com/research/Wyman2017Hashed/index.html
	 */

	const float ALPHA_HASH_SCALE = 0.05; // Derived from trials only, and may be changed.

	float hash2D( vec2 value ) {

		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );

	}

	float hash3D( vec3 value ) {

		return hash2D( vec2( hash2D( value.xy ), value.z ) );

	}

	float getAlphaHashThreshold( vec3 position ) {

		// Find the discretized derivatives of our coordinates
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );

		// Find two nearest log-discretized noise scales
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);

		// Compute alpha thresholds at our two noise scales
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);

		// Factor to interpolate lerp with
		float lerpFactor = fract( log2( pixScale ) );

		// Interpolate alpha threshold from noise at two scales
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;

		// Pass into CDF to compute uniformly distrib threshold
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);

		// Find our final, uniformly distributed alpha threshold (ατ)
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;

		// Avoids ατ == 0. Could also do ατ =1-ατ
		return clamp( threshold , 1.0e-6, 1.0 );

	}

#endif
`
), lh = (
  /* glsl */
  `
#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;

#endif
`
), ch = (
  /* glsl */
  `
#ifdef USE_ALPHAMAP

	uniform sampler2D alphaMap;

#endif
`
), hh = (
  /* glsl */
  `
#ifdef USE_ALPHATEST

	#ifdef ALPHA_TO_COVERAGE

	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;

	#else

	if ( diffuseColor.a < alphaTest ) discard;

	#endif

#endif
`
), uh = (
  /* glsl */
  `
#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif
`
), fh = (
  /* glsl */
  `
#ifdef USE_AOMAP

	// reads channel R, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;

	reflectedLight.indirectDiffuse *= ambientOcclusion;

	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD )

		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );

		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );

	#endif

#endif
`
), dh = (
  /* glsl */
  `
#ifdef USE_AOMAP

	uniform sampler2D aoMap;
	uniform float aoMapIntensity;

#endif
`
), ph = (
  /* glsl */
  `
#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif

	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {

		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );

	}

	float getIndirectIndex( const in int i ) {

		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );

	}

#endif

#ifdef USE_BATCHING_COLOR

	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {

		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;

	}

#endif
`
), mh = (
  /* glsl */
  `
#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif
`
), gh = (
  /* glsl */
  `
vec3 transformed = vec3( position );

#ifdef USE_ALPHAHASH

	vPosition = vec3( position );

#endif
`
), _h = (
  /* glsl */
  `
vec3 objectNormal = vec3( normal );

#ifdef USE_TANGENT

	vec3 objectTangent = vec3( tangent.xyz );

#endif
`
), vh = (
  /* glsl */
  `

float G_BlinnPhong_Implicit( /* const in float dotNL, const in float dotNV */ ) {

	// geometry term is (n dot l)(n dot v) / 4(n dot l)(n dot v)
	return 0.25;

}

float D_BlinnPhong( const in float shininess, const in float dotNH ) {

	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );

}

vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {

	vec3 halfDir = normalize( lightDir + viewDir );

	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );

	vec3 F = F_Schlick( specularColor, 1.0, dotVH );

	float G = G_BlinnPhong_Implicit( /* dotNL, dotNV */ );

	float D = D_BlinnPhong( shininess, dotNH );

	return F * ( G * D );

} // validated

`
), xh = (
  /* glsl */
  `

#ifdef USE_IRIDESCENCE

	// XYZ to linear-sRGB color space
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);

	// Assume air interface for top
	// Note: We don't handle the case fresnel0 == 1
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {

		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );

	}

	// Conversion FO/IOR
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {

		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );

	}

	// ior is a value between 1.0 and 3.0. 1.0 is air interface
	float IorToFresnel0( float transmittedIor, float incidentIor ) {

		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));

	}

	// Fresnel equations for dielectric/dielectric interfaces.
	// Ref: https://belcour.github.io/blog/research/2017/05/01/brdf-thin-film.html
	// Evaluation XYZ sensitivity curves in Fourier space
	vec3 evalSensitivity( float OPD, vec3 shift ) {

		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );

		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;

		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;

	}

	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {

		vec3 I;

		// Force iridescenceIOR -> outsideIOR when thinFilmThickness -> 0.0
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		// Evaluate the cosTheta on the base layer (Snell law)
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );

		// Handle TIR:
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {

			return vec3( 1.0 );

		}

		float cosTheta2 = sqrt( cosTheta2Sq );

		// First interface
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;

		// Second interface
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) ); // guard against 1.0
		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;

		// Phase shift
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;

		// Compound terms
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );

		// Reflectance term for m = 0 (DC term amplitude)
		vec3 C0 = R12 + Rs;
		I = C0;

		// Reflectance term for m > 0 (pairs of diracs)
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {

			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;

		}

		// Since out of gamut colors might be produced, negative color values are clamped to 0.
		return max( I, vec3( 0.0 ) );

	}

#endif

`
), Mh = (
  /* glsl */
  `
#ifdef USE_BUMPMAP

	uniform sampler2D bumpMap;
	uniform float bumpScale;

	// Bump Mapping Unparametrized Surfaces on the GPU by Morten S. Mikkelsen
	// https://mmikk.github.io/papers3d/mm_sfgrad_bump.pdf

	// Evaluate the derivative of the height w.r.t. screen-space using forward differencing (listing 2)

	vec2 dHdxy_fwd() {

		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );

		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;

		return vec2( dBx, dBy );

	}

	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {

		// normalize is done to ensure that the bump map looks the same regardless of the texture's scale
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm; // normalized

		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );

		float fDet = dot( vSigmaX, R1 ) * faceDirection;

		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );

	}

#endif
`
), Sh = (
  /* glsl */
  `
#if NUM_CLIPPING_PLANES > 0

	vec4 plane;

	#ifdef ALPHA_TO_COVERAGE

		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;

		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {

			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

			if ( clipOpacity == 0.0 ) discard;

		}
		#pragma unroll_loop_end

		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES

			float unionClipOpacity = 1.0;

			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {

				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );

			}
			#pragma unroll_loop_end

			clipOpacity *= 1.0 - unionClipOpacity;

		#endif

		diffuseColor.a *= clipOpacity;

		if ( diffuseColor.a == 0.0 ) discard;

	#else

		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {

			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;

		}
		#pragma unroll_loop_end

		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES

			bool clipped = true;

			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {

				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;

			}
			#pragma unroll_loop_end

			if ( clipped ) discard;

		#endif

	#endif

#endif
`
), yh = (
  /* glsl */
  `
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];

#endif
`
), Eh = (
  /* glsl */
  `
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

#endif
`
), Th = (
  /* glsl */
  `
#if NUM_CLIPPING_PLANES > 0

	vClipPosition = - mvPosition.xyz;

#endif
`
), Ah = (
  /* glsl */
  `
#if defined( USE_COLOR_ALPHA )

	diffuseColor *= vColor;

#elif defined( USE_COLOR )

	diffuseColor.rgb *= vColor;

#endif
`
), bh = (
  /* glsl */
  `
#if defined( USE_COLOR_ALPHA )

	varying vec4 vColor;

#elif defined( USE_COLOR )

	varying vec3 vColor;

#endif
`
), wh = (
  /* glsl */
  `
#if defined( USE_COLOR_ALPHA )

	varying vec4 vColor;

#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )

	varying vec3 vColor;

#endif
`
), Rh = (
  /* glsl */
  `
#if defined( USE_COLOR_ALPHA )

	vColor = vec4( 1.0 );

#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )

	vColor = vec3( 1.0 );

#endif

#ifdef USE_COLOR

	vColor *= color;

#endif

#ifdef USE_INSTANCING_COLOR

	vColor.xyz *= instanceColor.xyz;

#endif

#ifdef USE_BATCHING_COLOR

	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );

	vColor.xyz *= batchingColor.xyz;

#endif
`
), Ch = (
  /* glsl */
  `
#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6

#ifndef saturate
// <tonemapping_pars_fragment> may have defined saturate() already
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )

float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }

// expects values in the range of [0,1]x[0,1], returns values in the [0,1] range.
// do not collapse into a single function per: http://byteblacksmith.com/improvements-to-the-canonical-one-liner-glsl-rand-for-opengl-es-2-0/
highp float rand( const in vec2 uv ) {

	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );

	return fract( sin( sn ) * c );

}

#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif

struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};

struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};

#ifdef USE_ALPHAHASH

	varying vec3 vPosition;

#endif

vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

}

vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {

	// dir can be either a direction vector or a normal vector
	// upper-left 3x3 of matrix is assumed to be orthogonal

	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );

}

mat3 transposeMat3( const in mat3 m ) {

	mat3 tmp;

	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );

	return tmp;

}

float luminance( const in vec3 rgb ) {

	// assumes rgb is in linear color space with sRGB primaries and D65 white point

	const vec3 weights = vec3( 0.2126729, 0.7151522, 0.0721750 );

	return dot( weights, rgb );

}

bool isPerspectiveMatrix( mat4 m ) {

	return m[ 2 ][ 3 ] == - 1.0;

}

vec2 equirectUv( in vec3 dir ) {

	// dir is assumed to be unit length

	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;

	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;

	return vec2( u, v );

}

vec3 BRDF_Lambert( const in vec3 diffuseColor ) {

	return RECIPROCAL_PI * diffuseColor;

} // validated

vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );

	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );

} // validated

float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {

	// Original approximation by Christophe Schlick '94
	// float fresnel = pow( 1.0 - dotVH, 5.0 );

	// Optimized variant (presented by Epic at SIGGRAPH '13)
	// https://cdn2.unrealengine.com/Resources/files/2013SiggraphPresentationsNotes-26915738.pdf
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );

	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );

} // validated
`
), Ph = (
  /* glsl */
  `
#ifdef ENVMAP_TYPE_CUBE_UV

	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0

	// These shader functions convert between the UV coordinates of a single face of
	// a cubemap, the 0-5 integer index of a cube face, and the direction vector for
	// sampling a textureCube (not generally normalized ).

	float getFace( vec3 direction ) {

		vec3 absDirection = abs( direction );

		float face = - 1.0;

		if ( absDirection.x > absDirection.z ) {

			if ( absDirection.x > absDirection.y )

				face = direction.x > 0.0 ? 0.0 : 3.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		} else {

			if ( absDirection.z > absDirection.y )

				face = direction.z > 0.0 ? 2.0 : 5.0;

			else

				face = direction.y > 0.0 ? 1.0 : 4.0;

		}

		return face;

	}

	// RH coordinate system; PMREM face-indexing convention
	vec2 getUV( vec3 direction, float face ) {

		vec2 uv;

		if ( face == 0.0 ) {

			uv = vec2( direction.z, direction.y ) / abs( direction.x ); // pos x

		} else if ( face == 1.0 ) {

			uv = vec2( - direction.x, - direction.z ) / abs( direction.y ); // pos y

		} else if ( face == 2.0 ) {

			uv = vec2( - direction.x, direction.y ) / abs( direction.z ); // pos z

		} else if ( face == 3.0 ) {

			uv = vec2( - direction.z, direction.y ) / abs( direction.x ); // neg x

		} else if ( face == 4.0 ) {

			uv = vec2( - direction.x, direction.z ) / abs( direction.y ); // neg y

		} else {

			uv = vec2( direction.x, direction.y ) / abs( direction.z ); // neg z

		}

		return 0.5 * ( uv + 1.0 );

	}

	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {

		float face = getFace( direction );

		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );

		mipInt = max( mipInt, cubeUV_minMipLevel );

		float faceSize = exp2( mipInt );

		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0; // #25071

		if ( face > 2.0 ) {

			uv.y += faceSize;

			face -= 3.0;

		}

		uv.x += face * faceSize;

		uv.x += filterInt * 3.0 * cubeUV_minTileSize;

		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );

		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;

		#ifdef texture2DGradEXT

			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb; // disable anisotropic filtering

		#else

			return texture2D( envMap, uv ).rgb;

		#endif

	}

	// These defines must match with PMREMGenerator

	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0

	float roughnessToMip( float roughness ) {

		float mip = 0.0;

		if ( roughness >= cubeUV_r1 ) {

			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;

		} else if ( roughness >= cubeUV_r4 ) {

			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;

		} else if ( roughness >= cubeUV_r5 ) {

			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;

		} else if ( roughness >= cubeUV_r6 ) {

			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;

		} else {

			mip = - 2.0 * log2( 1.16 * roughness ); // 1.16 = 1.79^0.25
		}

		return mip;

	}

	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {

		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );

		float mipF = fract( mip );

		float mipInt = floor( mip );

		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );

		if ( mipF == 0.0 ) {

			return vec4( color0, 1.0 );

		} else {

			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );

			return vec4( mix( color0, color1, mipF ), 1.0 );

		}

	}

#endif
`
), Lh = (
  /* glsl */
  `

vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT

	vec3 transformedTangent = objectTangent;

#endif

#ifdef USE_BATCHING

	// this is in lieu of a per-instance normal-matrix
	// shear transforms in the instance matrix are not supported

	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;

	#ifdef USE_TANGENT

		transformedTangent = bm * transformedTangent;

	#endif

#endif

#ifdef USE_INSTANCING

	// this is in lieu of a per-instance normal-matrix
	// shear transforms in the instance matrix are not supported

	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;

	#ifdef USE_TANGENT

		transformedTangent = im * transformedTangent;

	#endif

#endif

transformedNormal = normalMatrix * transformedNormal;

#ifdef FLIP_SIDED

	transformedNormal = - transformedNormal;

#endif

#ifdef USE_TANGENT

	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;

	#ifdef FLIP_SIDED

		transformedTangent = - transformedTangent;

	#endif

#endif
`
), Dh = (
  /* glsl */
  `
#ifdef USE_DISPLACEMENTMAP

	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;

#endif
`
), Uh = (
  /* glsl */
  `
#ifdef USE_DISPLACEMENTMAP

	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );

#endif
`
), Ih = (
  /* glsl */
  `
#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );

	totalEmissiveRadiance *= emissiveColor.rgb;

#endif
`
), Nh = (
  /* glsl */
  `
#ifdef USE_EMISSIVEMAP

	uniform sampler2D emissiveMap;

#endif
`
), Fh = (
  /* glsl */
  `
gl_FragColor = linearToOutputTexel( gl_FragColor );
`
), Oh = (
  /* glsl */
  `

// http://www.russellcottrell.com/photo/matrixCalculator.htm

// Linear sRGB => XYZ => Linear Display P3
const mat3 LINEAR_SRGB_TO_LINEAR_DISPLAY_P3 = mat3(
	vec3( 0.8224621, 0.177538, 0.0 ),
	vec3( 0.0331941, 0.9668058, 0.0 ),
	vec3( 0.0170827, 0.0723974, 0.9105199 )
);

// Linear Display P3 => XYZ => Linear sRGB
const mat3 LINEAR_DISPLAY_P3_TO_LINEAR_SRGB = mat3(
	vec3( 1.2249401, - 0.2249404, 0.0 ),
	vec3( - 0.0420569, 1.0420571, 0.0 ),
	vec3( - 0.0196376, - 0.0786361, 1.0982735 )
);

vec4 LinearSRGBToLinearDisplayP3( in vec4 value ) {
	return vec4( value.rgb * LINEAR_SRGB_TO_LINEAR_DISPLAY_P3, value.a );
}

vec4 LinearDisplayP3ToLinearSRGB( in vec4 value ) {
	return vec4( value.rgb * LINEAR_DISPLAY_P3_TO_LINEAR_SRGB, value.a );
}

vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}

vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}

// @deprecated, r156
vec4 LinearToLinear( in vec4 value ) {
	return value;
}

// @deprecated, r156
vec4 LinearTosRGB( in vec4 value ) {
	return sRGBTransferOETF( value );
}
`
), Bh = (
  /* glsl */
  `
#ifdef USE_ENVMAP

	#ifdef ENV_WORLDPOS

		vec3 cameraToFrag;

		if ( isOrthographic ) {

			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );

		} else {

			cameraToFrag = normalize( vWorldPosition - cameraPosition );

		}

		// Transforming Normal Vectors with the Inverse Transformation
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

		#ifdef ENVMAP_MODE_REFLECTION

			vec3 reflectVec = reflect( cameraToFrag, worldNormal );

		#else

			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );

		#endif

	#else

		vec3 reflectVec = vReflect;

	#endif

	#ifdef ENVMAP_TYPE_CUBE

		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );

	#else

		vec4 envColor = vec4( 0.0 );

	#endif

	#ifdef ENVMAP_BLENDING_MULTIPLY

		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );

	#elif defined( ENVMAP_BLENDING_MIX )

		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );

	#elif defined( ENVMAP_BLENDING_ADD )

		outgoingLight += envColor.xyz * specularStrength * reflectivity;

	#endif

#endif
`
), zh = (
  /* glsl */
  `
#ifdef USE_ENVMAP

	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;

	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif
`
), Hh = (
  /* glsl */
  `
#ifdef USE_ENVMAP

	uniform float reflectivity;

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )

		#define ENV_WORLDPOS

	#endif

	#ifdef ENV_WORLDPOS

		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif

#endif
`
), Gh = (
  /* glsl */
  `
#ifdef USE_ENVMAP

	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )

		#define ENV_WORLDPOS

	#endif

	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;

	#else

		varying vec3 vReflect;
		uniform float refractionRatio;

	#endif

#endif
`
), Vh = (
  /* glsl */
  `
#ifdef USE_ENVMAP

	#ifdef ENV_WORLDPOS

		vWorldPosition = worldPosition.xyz;

	#else

		vec3 cameraToVertex;

		if ( isOrthographic ) {

			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );

		} else {

			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );

		}

		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );

		#ifdef ENVMAP_MODE_REFLECTION

			vReflect = reflect( cameraToVertex, worldNormal );

		#else

			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );

		#endif

	#endif

#endif
`
), kh = (
  /* glsl */
  `
#ifdef USE_FOG

	vFogDepth = - mvPosition.z;

#endif
`
), Wh = (
  /* glsl */
  `
#ifdef USE_FOG

	varying float vFogDepth;

#endif
`
), Xh = (
  /* glsl */
  `
#ifdef USE_FOG

	#ifdef FOG_EXP2

		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );

	#else

		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );

	#endif

	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );

#endif
`
), qh = (
  /* glsl */
  `
#ifdef USE_FOG

	uniform vec3 fogColor;
	varying float vFogDepth;

	#ifdef FOG_EXP2

		uniform float fogDensity;

	#else

		uniform float fogNear;
		uniform float fogFar;

	#endif

#endif
`
), Yh = (
  /* glsl */
  `

#ifdef USE_GRADIENTMAP

	uniform sampler2D gradientMap;

#endif

vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {

	// dotNL will be from -1.0 to 1.0
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );

	#ifdef USE_GRADIENTMAP

		return vec3( texture2D( gradientMap, coord ).r );

	#else

		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );

	#endif

}
`
), Kh = (
  /* glsl */
  `
#ifdef USE_LIGHTMAP

	uniform sampler2D lightMap;
	uniform float lightMapIntensity;

#endif
`
), Zh = (
  /* glsl */
  `
LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;
`
), Jh = (
  /* glsl */
  `
varying vec3 vViewPosition;

struct LambertMaterial {

	vec3 diffuseColor;
	float specularStrength;

};

void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert
`
), $h = (
  /* glsl */
  `
uniform bool receiveShadow;
uniform vec3 ambientLightColor;

#if defined( USE_LIGHT_PROBES )

	uniform vec3 lightProbe[ 9 ];

#endif

// get the irradiance (radiance convolved with cosine lobe) at the point 'normal' on the unit sphere
// source: https://graphics.stanford.edu/papers/envmap/envmap.pdf
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {

	// normal is assumed to have unit length

	float x = normal.x, y = normal.y, z = normal.z;

	// band 0
	vec3 result = shCoefficients[ 0 ] * 0.886227;

	// band 1
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;

	// band 2
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );

	return result;

}

vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {

	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );

	return irradiance;

}

vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {

	vec3 irradiance = ambientLightColor;

	return irradiance;

}

float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {

	// based upon Frostbite 3 Moving to Physically-based Rendering
	// page 32, equation 26: E[window1]
	// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );

	if ( cutoffDistance > 0.0 ) {

		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );

	}

	return distanceFalloff;

}

float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {

	return smoothstep( coneCosine, penumbraCosine, angleCosine );

}

#if NUM_DIR_LIGHTS > 0

	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};

	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];

	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {

		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;

	}

#endif


#if NUM_POINT_LIGHTS > 0

	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};

	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];

	// light is an out parameter as having it as a return value caused compiler errors on some devices
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {

		vec3 lVector = pointLight.position - geometryPosition;

		light.direction = normalize( lVector );

		float lightDistance = length( lVector );

		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );

	}

#endif


#if NUM_SPOT_LIGHTS > 0

	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};

	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];

	// light is an out parameter as having it as a return value caused compiler errors on some devices
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {

		vec3 lVector = spotLight.position - geometryPosition;

		light.direction = normalize( lVector );

		float angleCos = dot( light.direction, spotLight.direction );

		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );

		if ( spotAttenuation > 0.0 ) {

			float lightDistance = length( lVector );

			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );

		} else {

			light.color = vec3( 0.0 );
			light.visible = false;

		}

	}

#endif


#if NUM_RECT_AREA_LIGHTS > 0

	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};

	// Pre-computed values of LinearTransformedCosine approximation of BRDF
	// BRDF approximation Texture is 64x64
	uniform sampler2D ltc_1; // RGBA Float
	uniform sampler2D ltc_2; // RGBA Float

	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];

#endif


#if NUM_HEMI_LIGHTS > 0

	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};

	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];

	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {

		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;

		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );

		return irradiance;

	}

#endif
`
), jh = (
  /* glsl */
  `
#ifdef USE_ENVMAP

	vec3 getIBLIrradiance( const in vec3 normal ) {

		#ifdef ENVMAP_TYPE_CUBE_UV

			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );

			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );

			return PI * envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {

		#ifdef ENVMAP_TYPE_CUBE_UV

			vec3 reflectVec = reflect( - viewDir, normal );

			// Mixing the reflection with the normal is more accurate and keeps rough objects from gathering light from behind their tangent plane.
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );

			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );

			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );

			return envMapColor.rgb * envMapIntensity;

		#else

			return vec3( 0.0 );

		#endif

	}

	#ifdef USE_ANISOTROPY

		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {

			#ifdef ENVMAP_TYPE_CUBE_UV

			  // https://google.github.io/filament/Filament.md.html#lighting/imagebasedlights/anisotropy
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );

				return getIBLRadiance( viewDir, bentNormal, roughness );

			#else

				return vec3( 0.0 );

			#endif

		}

	#endif

#endif
`
), Qh = (
  /* glsl */
  `
ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;
`
), eu = (
  /* glsl */
  `
varying vec3 vViewPosition;

struct ToonMaterial {

	vec3 diffuseColor;

};

void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {

	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon
`
), tu = (
  /* glsl */
  `
BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;
`
), iu = (
  /* glsl */
  `
varying vec3 vViewPosition;

struct BlinnPhongMaterial {

	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;

};

void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;

}

void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong
`
), nu = (
  /* glsl */
  `
PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );

vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );

material.roughness = max( roughnessFactor, 0.0525 );// 0.0525 corresponds to the base mip of a 256 cubemap.
material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );

#ifdef IOR

	material.ior = ior;

	#ifdef USE_SPECULAR

		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;

		#ifdef USE_SPECULAR_COLORMAP

			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;

		#endif

		#ifdef USE_SPECULAR_INTENSITYMAP

			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;

		#endif

		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );

	#else

		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;

	#endif

	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );

#else

	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;

#endif

#ifdef USE_CLEARCOAT

	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;

	#ifdef USE_CLEARCOATMAP

		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;

	#endif

	#ifdef USE_CLEARCOAT_ROUGHNESSMAP

		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;

	#endif

	material.clearcoat = saturate( material.clearcoat ); // Burley clearcoat model
	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );

#endif

#ifdef USE_DISPERSION

	material.dispersion = dispersion;

#endif

#ifdef USE_IRIDESCENCE

	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;

	#ifdef USE_IRIDESCENCEMAP

		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;

	#endif

	#ifdef USE_IRIDESCENCE_THICKNESSMAP

		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;

	#else

		material.iridescenceThickness = iridescenceThicknessMaximum;

	#endif

#endif

#ifdef USE_SHEEN

	material.sheenColor = sheenColor;

	#ifdef USE_SHEEN_COLORMAP

		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;

	#endif

	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );

	#ifdef USE_SHEEN_ROUGHNESSMAP

		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;

	#endif

#endif

#ifdef USE_ANISOTROPY

	#ifdef USE_ANISOTROPYMAP

		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;

	#else

		vec2 anisotropyV = anisotropyVector;

	#endif

	material.anisotropy = length( anisotropyV );

	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}

	// Roughness along the anisotropy bitangent is the material roughness, while the tangent roughness increases with anisotropy.
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );

	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;

#endif
`
), ru = (
  /* glsl */
  `

struct PhysicalMaterial {

	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;

	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif

	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif

	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif

	#ifdef IOR
		float ior;
	#endif

	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif

	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif

};

// temporary
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );

vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );

    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}

// Moving Frostbite to Physically Based Rendering 3.0 - page 12, listing 2
// https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {

	float a2 = pow2( alpha );

	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );

	return 0.5 / max( gv + gl, EPSILON );

}

// Microfacet Models for Refraction through Rough Surfaces - equation (33)
// http://graphicrants.blogspot.com/2013/08/specular-brdf-reference.html
// alpha is "roughness squared" in Disney’s reparameterization
float D_GGX( const in float alpha, const in float dotNH ) {

	float a2 = pow2( alpha );

	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0; // avoid alpha = 0 with dotNH = 1

	return RECIPROCAL_PI * a2 / pow2( denom );

}

// https://google.github.io/filament/Filament.md.html#materialsystem/anisotropicmodel/anisotropicspecularbrdf
#ifdef USE_ANISOTROPY

	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {

		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );

		return saturate(v);

	}

	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {

		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;

		return RECIPROCAL_PI * a2 * pow2 ( w2 );

	}

#endif

#ifdef USE_CLEARCOAT

	// GGX Distribution, Schlick Fresnel, GGX_SmithCorrelated Visibility
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {

		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;

		float alpha = pow2( roughness ); // UE4's roughness

		vec3 halfDir = normalize( lightDir + viewDir );

		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );

		vec3 F = F_Schlick( f0, f90, dotVH );

		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );

		float D = D_GGX( alpha, dotNH );

		return F * ( V * D );

	}

#endif

vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {

	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;

	float alpha = pow2( roughness ); // UE4's roughness

	vec3 halfDir = normalize( lightDir + viewDir );

	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );

	vec3 F = F_Schlick( f0, f90, dotVH );

	#ifdef USE_IRIDESCENCE

		F = mix( F, material.iridescenceFresnel, material.iridescence );

	#endif

	#ifdef USE_ANISOTROPY

		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );

		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );

		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );

	#else

		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );

		float D = D_GGX( alpha, dotNH );

	#endif

	return F * ( V * D );

}

// Rect Area Light

// Real-Time Polygonal-Light Shading with Linearly Transformed Cosines
// by Eric Heitz, Jonathan Dupuy, Stephen Hill and David Neubelt
// code: https://github.com/selfshadow/ltc_code/

vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {

	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	float dotNV = saturate( dot( N, V ) );

	// texture parameterized by sqrt( GGX alpha ) and sqrt( 1 - cos( theta ) )
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );

	uv = uv * LUT_SCALE + LUT_BIAS;

	return uv;

}

float LTC_ClippedSphereFormFactor( const in vec3 f ) {

	// Real-Time Area Lighting: a Journey from Research to Production (p.102)
	// An approximation of the form factor of a horizon-clipped rectangle.

	float l = length( f );

	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );

}

vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {

	float x = dot( v1, v2 );

	float y = abs( x );

	// rational polynomial approximation to theta / sin( theta ) / 2PI
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;

	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;

	return cross( v1, v2 ) * theta_sintheta;

}

vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {

	// bail if point is on back side of plane of light
	// assumes ccw winding order of light vertices
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );

	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );

	// construct orthonormal basis around N
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 ); // negated from paper; possibly due to a different handedness of world coordinate system

	// compute transform
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );

	// transform rect
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );

	// project rect onto sphere
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );

	// calculate vector form factor
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );

	// adjust for horizon clipping
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );

/*
	// alternate method of adjusting for horizon clipping (see referece)
	// refactoring required
	float len = length( vectorFormFactor );
	float z = vectorFormFactor.z / len;

	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;

	// tabulated horizon-clipped sphere, apparently...
	vec2 uv = vec2( z * 0.5 + 0.5, len );
	uv = uv * LUT_SCALE + LUT_BIAS;

	float scale = texture2D( ltc_2, uv ).w;

	float result = len * scale;
*/

	return vec3( result );

}

// End Rect Area Light

#if defined( USE_SHEEN )

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
float D_Charlie( float roughness, float dotNH ) {

	float alpha = pow2( roughness );

	// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF"
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 ); // 2^(-14/2), so sin2h^2 > 0 in fp16

	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );

}

// https://github.com/google/filament/blob/master/shaders/src/brdf.fs
float V_Neubelt( float dotNV, float dotNL ) {

	// Neubelt and Pettineo 2013, "Crafting a Next-gen Material Pipeline for The Order: 1886"
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );

}

vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {

	vec3 halfDir = normalize( lightDir + viewDir );

	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );

	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );

	return sheenColor * ( D * V );

}

#endif

// This is a curve-fit approxmation to the "Charlie sheen" BRDF integrated over the hemisphere from 
// Estevez and Kulla 2017, "Production Friendly Microfacet Sheen BRDF". The analysis can be found
// in the Sheen section of https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {

	float dotNV = saturate( dot( normal, viewDir ) );

	float r2 = roughness * roughness;

	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;

	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;

	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );

	return saturate( DG * RECIPROCAL_PI );

}

// Analytical approximation of the DFG LUT, one half of the
// split-sum approximation used in indirect specular lighting.
// via 'environmentBRDF' from "Physically Based Shading on Mobile"
// https://www.unrealengine.com/blog/physically-based-shading-on-mobile
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {

	float dotNV = saturate( dot( normal, viewDir ) );

	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );

	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );

	vec4 r = roughness * c0 + c1;

	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;

	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;

	return fab;

}

vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {

	vec2 fab = DFGApprox( normal, viewDir, roughness );

	return specularColor * fab.x + specularF90 * fab.y;

}

// Fdez-Agüera's "Multiple-Scattering Microfacet Model for Real-Time Image Based Lighting"
// Approximates multiscattering in order to preserve energy.
// http://www.jcgt.org/published/0008/01/03/
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif

	vec2 fab = DFGApprox( normal, viewDir, roughness );

	#ifdef USE_IRIDESCENCE

		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );

	#else

		vec3 Fr = specularColor;

	#endif

	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;

	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;

	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619; // 1/21
	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );

	singleScatter += FssEss;
	multiScatter += Fms * Ems;

}

#if NUM_RECT_AREA_LIGHTS > 0

	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;

		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight; // counterclockwise; light shines in local neg z direction
		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;

		vec2 uv = LTC_Uv( normal, viewDir, roughness );

		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );

		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);

		// LTC Fresnel Approximation by Stephen Hill
		// http://blog.selfshadow.com/publications/s2016-advances/s2016_ltc_fresnel.pdf
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );

		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );

		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );

	}

#endif

void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );

	vec3 irradiance = dotNL * directLight.color;

	#ifdef USE_CLEARCOAT

		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );

		vec3 ccIrradiance = dotNLcc * directLight.color;

		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );

	#endif

	#ifdef USE_SHEEN

		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );

	#endif

	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );

	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}

void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {

	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );

}

void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {

	#ifdef USE_CLEARCOAT

		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );

	#endif

	#ifdef USE_SHEEN

		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );

	#endif

	// Both indirect specular and indirect diffuse light accumulate here

	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;

	#ifdef USE_IRIDESCENCE

		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );

	#else

		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );

	#endif

	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );

	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;

	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;

}

#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical

// ref: https://seblagarde.files.wordpress.com/2015/07/course_notes_moving_frostbite_to_pbr_v32.pdf
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {

	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );

}
`
), su = (
  /* glsl */
  `
/**
 * This is a template that can be used to light a material, it uses pluggable
 * RenderEquations (RE)for specific lighting scenarios.
 *
 * Instructions for use:
 * - Ensure that both RE_Direct, RE_IndirectDiffuse and RE_IndirectSpecular are defined
 * - Create a material parameter that is to be passed as the third parameter to your lighting functions.
 *
 * TODO:
 * - Add area light support.
 * - Add sphere light support.
 * - Add diffuse light probe (irradiance cubemap) support.
 */

vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );

vec3 geometryClearcoatNormal = vec3( 0.0 );

#ifdef USE_CLEARCOAT

	geometryClearcoatNormal = clearcoatNormal;

#endif

#ifdef USE_IRIDESCENCE

	float dotNVi = saturate( dot( normal, geometryViewDir ) );

	if ( material.iridescenceThickness == 0.0 ) {

		material.iridescence = 0.0;

	} else {

		material.iridescence = saturate( material.iridescence );

	}

	if ( material.iridescence > 0.0 ) {

		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );

		// Iridescence F0 approximation
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );

	}

#endif

IncidentLight directLight;

#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )

	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {

		pointLight = pointLights[ i ];

		getPointLightInfo( pointLight, geometryPosition, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )

	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;

	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {

		spotLight = spotLights[ i ];

		getSpotLightInfo( spotLight, geometryPosition, directLight );

		// spot lights are ordered [shadows with maps, shadows without maps, maps without shadows, none]
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif

		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif

		#undef SPOT_LIGHT_MAP_INDEX

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )

	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {

		directionalLight = directionalLights[ i ];

		getDirectionalLightInfo( directionalLight, directLight );

		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif

		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )

	RectAreaLight rectAreaLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {

		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

	}
	#pragma unroll_loop_end

#endif

#if defined( RE_IndirectDiffuse )

	vec3 iblIrradiance = vec3( 0.0 );

	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );

	#if defined( USE_LIGHT_PROBES )

		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );

	#endif

	#if ( NUM_HEMI_LIGHTS > 0 )

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {

			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );

		}
		#pragma unroll_loop_end

	#endif

#endif

#if defined( RE_IndirectSpecular )

	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );

#endif
`
), au = (
  /* glsl */
  `
#if defined( RE_IndirectDiffuse )

	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;

		irradiance += lightMapIrradiance;

	#endif

	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )

		iblIrradiance += getIBLIrradiance( geometryNormal );

	#endif

#endif

#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )

	#ifdef USE_ANISOTROPY

		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );

	#else

		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );

	#endif

	#ifdef USE_CLEARCOAT

		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );

	#endif

#endif
`
), ou = (
  /* glsl */
  `
#if defined( RE_IndirectDiffuse )

	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

#endif

#if defined( RE_IndirectSpecular )

	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

#endif
`
), lu = (
  /* glsl */
  `
#if defined( USE_LOGDEPTHBUF )

	// Doing a strict comparison with == 1.0 can cause noise artifacts
	// on some platforms. See issue #17623.
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;

#endif
`
), cu = (
  /* glsl */
  `
#if defined( USE_LOGDEPTHBUF )

	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;

#endif
`
), hu = (
  /* glsl */
  `
#ifdef USE_LOGDEPTHBUF

	varying float vFragDepth;
	varying float vIsPerspective;

#endif
`
), uu = (
  /* glsl */
  `
#ifdef USE_LOGDEPTHBUF

	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );

#endif
`
), fu = (
  /* glsl */
  `
#ifdef USE_MAP

	vec4 sampledDiffuseColor = texture2D( map, vMapUv );

	#ifdef DECODE_VIDEO_TEXTURE

		// use inline sRGB decode until browsers properly support SRGB8_ALPHA8 with video textures (#26516)

		sampledDiffuseColor = vec4( mix( pow( sampledDiffuseColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), sampledDiffuseColor.rgb * 0.0773993808, vec3( lessThanEqual( sampledDiffuseColor.rgb, vec3( 0.04045 ) ) ) ), sampledDiffuseColor.w );
	
	#endif

	diffuseColor *= sampledDiffuseColor;

#endif
`
), du = (
  /* glsl */
  `
#ifdef USE_MAP

	uniform sampler2D map;

#endif
`
), pu = (
  /* glsl */
  `
#if defined( USE_MAP ) || defined( USE_ALPHAMAP )

	#if defined( USE_POINTS_UV )

		vec2 uv = vUv;

	#else

		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;

	#endif

#endif

#ifdef USE_MAP

	diffuseColor *= texture2D( map, uv );

#endif

#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, uv ).g;

#endif
`
), mu = (
  /* glsl */
  `
#if defined( USE_POINTS_UV )

	varying vec2 vUv;

#else

	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )

		uniform mat3 uvTransform;

	#endif

#endif

#ifdef USE_MAP

	uniform sampler2D map;

#endif

#ifdef USE_ALPHAMAP

	uniform sampler2D alphaMap;

#endif
`
), gu = (
  /* glsl */
  `
float metalnessFactor = metalness;

#ifdef USE_METALNESSMAP

	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );

	// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	metalnessFactor *= texelMetalness.b;

#endif
`
), _u = (
  /* glsl */
  `
#ifdef USE_METALNESSMAP

	uniform sampler2D metalnessMap;

#endif
`
), vu = (
  /* glsl */
  `
#ifdef USE_INSTANCING_MORPH

	float morphTargetInfluences[ MORPHTARGETS_COUNT ];

	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;

	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {

		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;

	}
#endif
`
), xu = (
  /* glsl */
  `
#if defined( USE_MORPHCOLORS )

	// morphTargetBaseInfluence is set based on BufferGeometry.morphTargetsRelative value:
	// When morphTargetsRelative is false, this is set to 1 - sum(influences); this results in normal = sum((target - base) * influence)
	// When morphTargetsRelative is true, this is set to 1; as a result, all morph targets are simply added to the base after weighting
	vColor *= morphTargetBaseInfluence;

	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {

		#if defined( USE_COLOR_ALPHA )

			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];

		#elif defined( USE_COLOR )

			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];

		#endif

	}

#endif
`
), Mu = (
  /* glsl */
  `
#ifdef USE_MORPHNORMALS

	// morphTargetBaseInfluence is set based on BufferGeometry.morphTargetsRelative value:
	// When morphTargetsRelative is false, this is set to 1 - sum(influences); this results in normal = sum((target - base) * influence)
	// When morphTargetsRelative is true, this is set to 1; as a result, all morph targets are simply added to the base after weighting
	objectNormal *= morphTargetBaseInfluence;

	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {

		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];

	}

#endif
`
), Su = (
  /* glsl */
  `
#ifdef USE_MORPHTARGETS

	#ifndef USE_INSTANCING_MORPH

		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];

	#endif

	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;

	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {

		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;

		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );

	}

#endif
`
), yu = (
  /* glsl */
  `
#ifdef USE_MORPHTARGETS

	// morphTargetBaseInfluence is set based on BufferGeometry.morphTargetsRelative value:
	// When morphTargetsRelative is false, this is set to 1 - sum(influences); this results in position = sum((target - base) * influence)
	// When morphTargetsRelative is true, this is set to 1; as a result, all morph targets are simply added to the base after weighting
	transformed *= morphTargetBaseInfluence;

	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {

		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];

	}

#endif
`
), Eu = (
  /* glsl */
  `
float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;

#ifdef FLAT_SHADED

	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );

#else

	vec3 normal = normalize( vNormal );

	#ifdef DOUBLE_SIDED

		normal *= faceDirection;

	#endif

#endif

#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )

	#ifdef USE_TANGENT

		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

	#else

		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);

	#endif

	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;

	#endif

#endif

#ifdef USE_CLEARCOAT_NORMALMAP

	#ifdef USE_TANGENT

		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );

	#else

		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );

	#endif

	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )

		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;

	#endif

#endif

// non perturbed normal for clearcoat among others

vec3 nonPerturbedNormal = normal;

`
), Tu = (
  /* glsl */
  `

#ifdef USE_NORMALMAP_OBJECTSPACE

	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0; // overrides both flatShading and attribute normals

	#ifdef FLIP_SIDED

		normal = - normal;

	#endif

	#ifdef DOUBLE_SIDED

		normal = normal * faceDirection;

	#endif

	normal = normalize( normalMatrix * normal );

#elif defined( USE_NORMALMAP_TANGENTSPACE )

	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;

	normal = normalize( tbn * mapN );

#elif defined( USE_BUMPMAP )

	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );

#endif
`
), Au = (
  /* glsl */
  `
#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif
`
), bu = (
  /* glsl */
  `
#ifndef FLAT_SHADED

	varying vec3 vNormal;

	#ifdef USE_TANGENT

		varying vec3 vTangent;
		varying vec3 vBitangent;

	#endif

#endif
`
), wu = (
  /* glsl */
  `
#ifndef FLAT_SHADED // normal is computed with derivatives when FLAT_SHADED

	vNormal = normalize( transformedNormal );

	#ifdef USE_TANGENT

		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );

	#endif

#endif
`
), Ru = (
  /* glsl */
  `
#ifdef USE_NORMALMAP

	uniform sampler2D normalMap;
	uniform vec2 normalScale;

#endif

#ifdef USE_NORMALMAP_OBJECTSPACE

	uniform mat3 normalMatrix;

#endif

#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )

	// Normal Mapping Without Precomputed Tangents
	// http://www.thetenthplanet.de/archives/1180

	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {

		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );

		vec3 N = surf_norm; // normalized

		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );

		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;

		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );

		return mat3( T * scale, B * scale, N );

	}

#endif
`
), Cu = (
  /* glsl */
  `
#ifdef USE_CLEARCOAT

	vec3 clearcoatNormal = nonPerturbedNormal;

#endif
`
), Pu = (
  /* glsl */
  `
#ifdef USE_CLEARCOAT_NORMALMAP

	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;

	clearcoatNormal = normalize( tbn2 * clearcoatMapN );

#endif
`
), Lu = (
  /* glsl */
  `

#ifdef USE_CLEARCOATMAP

	uniform sampler2D clearcoatMap;

#endif

#ifdef USE_CLEARCOAT_NORMALMAP

	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;

#endif

#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	uniform sampler2D clearcoatRoughnessMap;

#endif
`
), Du = (
  /* glsl */
  `

#ifdef USE_IRIDESCENCEMAP

	uniform sampler2D iridescenceMap;

#endif

#ifdef USE_IRIDESCENCE_THICKNESSMAP

	uniform sampler2D iridescenceThicknessMap;

#endif
`
), Uu = (
  /* glsl */
  `
#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif

#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif

gl_FragColor = vec4( outgoingLight, diffuseColor.a );
`
), Iu = (
  /* glsl */
  `
vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}

vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}

const float PackUpscale = 256. / 255.; // fraction -> 0..1 (including 1)
const float UnpackDownscale = 255. / 256.; // 0..1 -> fraction (excluding 1)

const vec3 PackFactors = vec3( 256. * 256. * 256., 256. * 256., 256. );
const vec4 UnpackFactors = UnpackDownscale / vec4( PackFactors, 1. );

const float ShiftRight8 = 1. / 256.;

vec4 packDepthToRGBA( const in float v ) {
	vec4 r = vec4( fract( v * PackFactors ), v );
	r.yzw -= r.xyz * ShiftRight8; // tidy overflow
	return r * PackUpscale;
}

float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors );
}

vec2 packDepthToRG( in highp float v ) {
	return packDepthToRGBA( v ).yx;
}

float unpackRGToDepth( const in highp vec2 v ) {
	return unpackRGBAToDepth( vec4( v.xy, 0.0, 0.0 ) );
}

vec4 pack2HalfToRGBA( vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}

vec2 unpackRGBATo2Half( vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}

// NOTE: viewZ, the z-coordinate in camera space, is negative for points in front of the camera

float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	// -near maps to 0; -far maps to 1
	return ( viewZ + near ) / ( near - far );
}

float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	// maps orthographic depth in [ 0, 1 ] to viewZ
	return depth * ( near - far ) - near;
}

// NOTE: https://twitter.com/gonnavis/status/1377183786949959682

float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	// -near maps to 0; -far maps to 1
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}

float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	// maps perspective depth in [ 0, 1 ] to viewZ
	return ( near * far ) / ( ( far - near ) * depth - far );
}
`
), Nu = (
  /* glsl */
  `
#ifdef PREMULTIPLIED_ALPHA

	// Get get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
	gl_FragColor.rgb *= gl_FragColor.a;

#endif
`
), Fu = (
  /* glsl */
  `
vec4 mvPosition = vec4( transformed, 1.0 );

#ifdef USE_BATCHING

	mvPosition = batchingMatrix * mvPosition;

#endif

#ifdef USE_INSTANCING

	mvPosition = instanceMatrix * mvPosition;

#endif

mvPosition = modelViewMatrix * mvPosition;

gl_Position = projectionMatrix * mvPosition;
`
), Ou = (
  /* glsl */
  `
#ifdef DITHERING

	gl_FragColor.rgb = dithering( gl_FragColor.rgb );

#endif
`
), Bu = (
  /* glsl */
  `
#ifdef DITHERING

	// based on https://www.shadertoy.com/view/MslGR8
	vec3 dithering( vec3 color ) {
		//Calculate grid position
		float grid_position = rand( gl_FragCoord.xy );

		//Shift the individual colors differently, thus making it even harder to see the dithering pattern
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );

		//modify shift according to grid position.
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );

		//shift the color by dither_shift
		return color + dither_shift_RGB;
	}

#endif
`
), zu = (
  /* glsl */
  `
float roughnessFactor = roughness;

#ifdef USE_ROUGHNESSMAP

	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );

	// reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	roughnessFactor *= texelRoughness.g;

#endif
`
), Hu = (
  /* glsl */
  `
#ifdef USE_ROUGHNESSMAP

	uniform sampler2D roughnessMap;

#endif
`
), Gu = (
  /* glsl */
  `
#if NUM_SPOT_LIGHT_COORDS > 0

	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];

#endif

#if NUM_SPOT_LIGHT_MAPS > 0

	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];

#endif

#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHT_SHADOWS > 0

		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];

		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};

		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];

	#endif

	#if NUM_SPOT_LIGHT_SHADOWS > 0

		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];

		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};

		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];

	#endif

	#if NUM_POINT_LIGHT_SHADOWS > 0

		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];

		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};

		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];

	#endif

	/*
	#if NUM_RECT_AREA_LIGHTS > 0

		// TODO (abelnation): create uniforms for area light shadows

	#endif
	*/

	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {

		return step( compare, unpackRGBAToDepth( texture2D( depths, uv ) ) );

	}

	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {

		return unpackRGBATo2Half( texture2D( shadow, uv ) );

	}

	float VSMShadow (sampler2D shadow, vec2 uv, float compare ){

		float occlusion = 1.0;

		vec2 distribution = texture2DDistribution( shadow, uv );

		float hard_shadow = step( compare , distribution.x ); // Hard Shadow

		if (hard_shadow != 1.0 ) {

			float distance = compare - distribution.x ;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance ); // Chebeyshevs inequality
			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 ); // 0.3 reduces light bleed
			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );

		}
		return occlusion;

	}

	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {

		float shadow = 1.0;

		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;

		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;

		if ( frustumTest ) {

		#if defined( SHADOWMAP_TYPE_PCF )

			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;

			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;

			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );

		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )

			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;

			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;

			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );

		#elif defined( SHADOWMAP_TYPE_VSM )

			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );

		#else // no percentage-closer filtering:

			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );

		#endif

		}

		return mix( 1.0, shadow, shadowIntensity );

	}

	// cubeToUV() maps a 3D direction vector suitable for cube texture mapping to a 2D
	// vector suitable for 2D texture mapping. This code uses the following layout for the
	// 2D texture:
	//
	// xzXZ
	//  y Y
	//
	// Y - Positive y direction
	// y - Negative y direction
	// X - Positive x direction
	// x - Negative x direction
	// Z - Positive z direction
	// z - Negative z direction
	//
	// Source and test bed:
	// https://gist.github.com/tschw/da10c43c467ce8afd0c4

	vec2 cubeToUV( vec3 v, float texelSizeY ) {

		// Number of texels to avoid at the edge of each square

		vec3 absV = abs( v );

		// Intersect unit cube

		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;

		// Apply scale to avoid seams

		// two texels less per square (one texel will do for NEAREST)
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );

		// Unwrap

		// space: -1 ... 1 range for each square
		//
		// #X##		dim    := ( 4 , 2 )
		//  # #		center := ( 1 , 1 )

		vec2 planar = v.xy;

		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;

		if ( absV.z >= almostOne ) {

			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;

		} else if ( absV.x >= almostOne ) {

			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;

		} else if ( absV.y >= almostOne ) {

			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;

		}

		// Transform to UV space

		// scale := 0.5 / dim
		// translate := ( center + 0.5 ) / dim
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );

	}

	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {

		float shadow = 1.0;

		// for point lights, the uniform @vShadowCoord is re-purposed to hold
		// the vector from the light to the world-space position of the fragment.
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );

		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {

			// dp = normalized distance from light to fragment position
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear ); // need to clamp?
			dp += shadowBias;

			// bd3D = base direction 3D
			vec3 bd3D = normalize( lightToPosition );

			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );

			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )

				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;

				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );

			#else // no percentage-closer filtering

				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );

			#endif

		}

		return mix( 1.0, shadow, shadowIntensity );

	}

#endif
`
), Vu = (
  /* glsl */
  `

#if NUM_SPOT_LIGHT_COORDS > 0

	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];

#endif

#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHT_SHADOWS > 0

		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];

		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};

		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];

	#endif

	#if NUM_SPOT_LIGHT_SHADOWS > 0

		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};

		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];

	#endif

	#if NUM_POINT_LIGHT_SHADOWS > 0

		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];

		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};

		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];

	#endif

	/*
	#if NUM_RECT_AREA_LIGHTS > 0

		// TODO (abelnation): uniforms for area light shadows

	#endif
	*/

#endif
`
), ku = (
  /* glsl */
  `

#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )

	// Offsetting the position used for querying occlusion along the world normal can be used to reduce shadow acne.
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;

#endif

#if defined( USE_SHADOWMAP )

	#if NUM_DIR_LIGHT_SHADOWS > 0

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {

			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;

		}
		#pragma unroll_loop_end

	#endif

	#if NUM_POINT_LIGHT_SHADOWS > 0

		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {

			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;

		}
		#pragma unroll_loop_end

	#endif

	/*
	#if NUM_RECT_AREA_LIGHTS > 0

		// TODO (abelnation): update vAreaShadowCoord with area light info

	#endif
	*/

#endif

// spot lights can be evaluated without active shadow mapping (when SpotLight.map is used)

#if NUM_SPOT_LIGHT_COORDS > 0

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {

		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;

	}
	#pragma unroll_loop_end

#endif


`
), Wu = (
  /* glsl */
  `
float getShadowMask() {

	float shadow = 1.0;

	#ifdef USE_SHADOWMAP

	#if NUM_DIR_LIGHT_SHADOWS > 0

	DirectionalLightShadow directionalLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {

		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;

	}
	#pragma unroll_loop_end

	#endif

	#if NUM_SPOT_LIGHT_SHADOWS > 0

	SpotLightShadow spotLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {

		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;

	}
	#pragma unroll_loop_end

	#endif

	#if NUM_POINT_LIGHT_SHADOWS > 0

	PointLightShadow pointLight;

	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {

		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;

	}
	#pragma unroll_loop_end

	#endif

	/*
	#if NUM_RECT_AREA_LIGHTS > 0

		// TODO (abelnation): update shadow for Area light

	#endif
	*/

	#endif

	return shadow;

}
`
), Xu = (
  /* glsl */
  `
#ifdef USE_SKINNING

	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );

#endif
`
), qu = (
  /* glsl */
  `
#ifdef USE_SKINNING

	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;

	uniform highp sampler2D boneTexture;

	mat4 getBoneMatrix( const in float i ) {

		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );

		return mat4( v1, v2, v3, v4 );

	}

#endif
`
), Yu = (
  /* glsl */
  `
#ifdef USE_SKINNING

	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );

	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;

	transformed = ( bindMatrixInverse * skinned ).xyz;

#endif
`
), Ku = (
  /* glsl */
  `
#ifdef USE_SKINNING

	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;

	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;

	#ifdef USE_TANGENT

		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;

	#endif

#endif
`
), Zu = (
  /* glsl */
  `
float specularStrength;

#ifdef USE_SPECULARMAP

	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;

#else

	specularStrength = 1.0;

#endif
`
), Ju = (
  /* glsl */
  `
#ifdef USE_SPECULARMAP

	uniform sampler2D specularMap;

#endif
`
), $u = (
  /* glsl */
  `
#if defined( TONE_MAPPING )

	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );

#endif
`
), ju = (
  /* glsl */
  `
#ifndef saturate
// <common> may have defined saturate() already
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif

uniform float toneMappingExposure;

// exposure only
vec3 LinearToneMapping( vec3 color ) {

	return saturate( toneMappingExposure * color );

}

// source: https://www.cs.utah.edu/docs/techreports/2002/pdf/UUCS-02-001.pdf
vec3 ReinhardToneMapping( vec3 color ) {

	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );

}

// source: http://filmicworlds.com/blog/filmic-tonemapping-operators/
vec3 OptimizedCineonToneMapping( vec3 color ) {

	// optimized filmic operator by Jim Hejl and Richard Burgess-Dawson
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );

}

// source: https://github.com/selfshadow/ltc_code/blob/master/webgl/shaders/ltc/ltc_blit.fs
vec3 RRTAndODTFit( vec3 v ) {

	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;

}

// this implementation of ACES is modified to accommodate a brighter viewing environment.
// the scale factor of 1/0.6 is subjective. see discussion in #19621.

vec3 ACESFilmicToneMapping( vec3 color ) {

	// sRGB => XYZ => D65_2_D60 => AP1 => RRT_SAT
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ), // transposed from source
		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);

	// ODT_SAT => XYZ => D60_2_D65 => sRGB
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ), // transposed from source
		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);

	color *= toneMappingExposure / 0.6;

	color = ACESInputMat * color;

	// Apply RRT and ODT
	color = RRTAndODTFit( color );

	color = ACESOutputMat * color;

	// Clamp to [0, 1]
	return saturate( color );

}

// Matrices for rec 2020 <> rec 709 color space conversion
// matrix provided in row-major order so it has been transposed
// https://www.itu.int/pub/R-REP-BT.2407-2017
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);

const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);

// https://iolite-engine.com/blog_posts/minimal_agx_implementation
// Mean error^2: 3.6705141e-06
vec3 agxDefaultContrastApprox( vec3 x ) {

	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;

	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;

}

// AgX Tone Mapping implementation based on Filament, which in turn is based
// on Blender's implementation using rec 2020 primaries
// https://github.com/google/filament/pull/7236
// Inputs and outputs are encoded as Linear-sRGB.

vec3 AgXToneMapping( vec3 color ) {

	// AgX constants
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);

	// explicit AgXOutsetMatrix generated from Filaments AgXOutsetMatrixInv
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);

	// LOG2_MIN      = -10.0
	// LOG2_MAX      =  +6.5
	// MIDDLE_GRAY   =  0.18
	const float AgxMinEv = - 12.47393;  // log2( pow( 2, LOG2_MIN ) * MIDDLE_GRAY )
	const float AgxMaxEv = 4.026069;    // log2( pow( 2, LOG2_MAX ) * MIDDLE_GRAY )

	color *= toneMappingExposure;

	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;

	color = AgXInsetMatrix * color;

	// Log2 encoding
	color = max( color, 1e-10 ); // avoid 0 or negative numbers for log2
	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );

	color = clamp( color, 0.0, 1.0 );

	// Apply sigmoid
	color = agxDefaultContrastApprox( color );

	// Apply AgX look
	// v = agxLook(v, look);

	color = AgXOutsetMatrix * color;

	// Linearize
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );

	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;

	// Gamut mapping. Simple clamp for now.
	color = clamp( color, 0.0, 1.0 );

	return color;

}

// https://modelviewer.dev/examples/tone-mapping

vec3 NeutralToneMapping( vec3 color ) {

	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;

	color *= toneMappingExposure;

	float x = min( color.r, min( color.g, color.b ) );

	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;

	color -= offset;

	float peak = max( color.r, max( color.g, color.b ) );

	if ( peak < StartCompression ) return color;

	float d = 1. - StartCompression;

	float newPeak = 1. - d * d / ( peak + d - StartCompression );

	color *= newPeak / peak;

	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );

	return mix( color, vec3( newPeak ), g );

}

vec3 CustomToneMapping( vec3 color ) { return color; }
`
), Qu = (
  /* glsl */
  `
#ifdef USE_TRANSMISSION

	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;

	#ifdef USE_TRANSMISSIONMAP

		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;

	#endif

	#ifdef USE_THICKNESSMAP

		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;

	#endif

	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );

	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );

	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );

	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );

#endif
`
), ef = (
  /* glsl */
  `
#ifdef USE_TRANSMISSION

	// Transmission code is based on glTF-Sampler-Viewer
	// https://github.com/KhronosGroup/glTF-Sample-Viewer

	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;

	#ifdef USE_TRANSMISSIONMAP

		uniform sampler2D transmissionMap;

	#endif

	#ifdef USE_THICKNESSMAP

		uniform sampler2D thicknessMap;

	#endif

	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;

	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;

	varying vec3 vWorldPosition;

	// Mipped Bicubic Texture Filtering by N8
	// https://www.shadertoy.com/view/Dl2SDW

	float w0( float a ) {

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );

	}

	float w1( float a ) {

		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );

	}

	float w2( float a ){

		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );

	}

	float w3( float a ) {

		return ( 1.0 / 6.0 ) * ( a * a * a );

	}

	// g0 and g1 are the two amplitude functions
	float g0( float a ) {

		return w0( a ) + w1( a );

	}

	float g1( float a ) {

		return w2( a ) + w3( a );

	}

	// h0 and h1 are the two offset functions
	float h0( float a ) {

		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );

	}

	float h1( float a ) {

		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );

	}

	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {

		uv = uv * texelSize.zw + 0.5;

		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );

		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );

		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;

		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );

	}

	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {

		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );

	}

	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {

		// Direction of refracted light.
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );

		// Compute rotation-independant scaling of the model matrix.
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );

		// The thickness is specified in local space.
		return normalize( refractionVector ) * thickness * modelScale;

	}

	float applyIorToRoughness( const in float roughness, const in float ior ) {

		// Scale roughness with IOR so that an IOR of 1.0 results in no microfacet refraction and
		// an IOR of 1.5 results in the default amount of microfacet refraction.
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );

	}

	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {

		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );

	}

	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {

		if ( isinf( attenuationDistance ) ) {

			// Attenuation distance is +∞, i.e. the transmitted color is not attenuated at all.
			return vec3( 1.0 );

		} else {

			// Compute light attenuation using Beer's law.
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance ); // Beer's law
			return transmittance;

		}

	}

	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {

		vec4 transmittedLight;
		vec3 transmittance;

		#ifdef USE_DISPERSION

			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );

			for ( int i = 0; i < 3; i ++ ) {

				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
		
				// Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
		
				// Sample framebuffer to get pixel the refracted ray hits.
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;

				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];

			}

			transmittedLight.a /= 3.0;
		
		#else
		
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;

			// Project refracted vector on the framebuffer, while mapping to normalized device coordinates.
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;

			// Sample framebuffer to get pixel the refracted ray hits.
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		
		#endif

		vec3 attenuatedColor = transmittance * transmittedLight.rgb;

		// Get the specular component.
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );

		// As less light is transmitted, the opacity should be increased. This simple approximation does a decent job 
		// of modulating a CSS background, and has no effect when the buffer is opaque, due to a solid object or clear color.
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;

		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );

	}
#endif
`
), tf = (
  /* glsl */
  `
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	varying vec2 vUv;

#endif
#ifdef USE_MAP

	varying vec2 vMapUv;

#endif
#ifdef USE_ALPHAMAP

	varying vec2 vAlphaMapUv;

#endif
#ifdef USE_LIGHTMAP

	varying vec2 vLightMapUv;

#endif
#ifdef USE_AOMAP

	varying vec2 vAoMapUv;

#endif
#ifdef USE_BUMPMAP

	varying vec2 vBumpMapUv;

#endif
#ifdef USE_NORMALMAP

	varying vec2 vNormalMapUv;

#endif
#ifdef USE_EMISSIVEMAP

	varying vec2 vEmissiveMapUv;

#endif
#ifdef USE_METALNESSMAP

	varying vec2 vMetalnessMapUv;

#endif
#ifdef USE_ROUGHNESSMAP

	varying vec2 vRoughnessMapUv;

#endif
#ifdef USE_ANISOTROPYMAP

	varying vec2 vAnisotropyMapUv;

#endif
#ifdef USE_CLEARCOATMAP

	varying vec2 vClearcoatMapUv;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

	varying vec2 vClearcoatNormalMapUv;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	varying vec2 vClearcoatRoughnessMapUv;

#endif
#ifdef USE_IRIDESCENCEMAP

	varying vec2 vIridescenceMapUv;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

	varying vec2 vIridescenceThicknessMapUv;

#endif
#ifdef USE_SHEEN_COLORMAP

	varying vec2 vSheenColorMapUv;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

	varying vec2 vSheenRoughnessMapUv;

#endif
#ifdef USE_SPECULARMAP

	varying vec2 vSpecularMapUv;

#endif
#ifdef USE_SPECULAR_COLORMAP

	varying vec2 vSpecularColorMapUv;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

	varying vec2 vSpecularIntensityMapUv;

#endif
#ifdef USE_TRANSMISSIONMAP

	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;

#endif
#ifdef USE_THICKNESSMAP

	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;

#endif
`
), nf = (
  /* glsl */
  `
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	varying vec2 vUv;

#endif
#ifdef USE_MAP

	uniform mat3 mapTransform;
	varying vec2 vMapUv;

#endif
#ifdef USE_ALPHAMAP

	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;

#endif
#ifdef USE_LIGHTMAP

	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;

#endif
#ifdef USE_AOMAP

	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;

#endif
#ifdef USE_BUMPMAP

	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;

#endif
#ifdef USE_NORMALMAP

	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;

#endif
#ifdef USE_DISPLACEMENTMAP

	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;

#endif
#ifdef USE_EMISSIVEMAP

	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;

#endif
#ifdef USE_METALNESSMAP

	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;

#endif
#ifdef USE_ROUGHNESSMAP

	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;

#endif
#ifdef USE_ANISOTROPYMAP

	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;

#endif
#ifdef USE_CLEARCOATMAP

	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;

#endif
#ifdef USE_SHEEN_COLORMAP

	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;

#endif
#ifdef USE_IRIDESCENCEMAP

	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;

#endif
#ifdef USE_SPECULARMAP

	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;

#endif
#ifdef USE_SPECULAR_COLORMAP

	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;

#endif
#ifdef USE_TRANSMISSIONMAP

	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;

#endif
#ifdef USE_THICKNESSMAP

	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;

#endif
`
), rf = (
  /* glsl */
  `
#if defined( USE_UV ) || defined( USE_ANISOTROPY )

	vUv = vec3( uv, 1 ).xy;

#endif
#ifdef USE_MAP

	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;

#endif
#ifdef USE_ALPHAMAP

	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_LIGHTMAP

	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_AOMAP

	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_BUMPMAP

	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_NORMALMAP

	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_DISPLACEMENTMAP

	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_EMISSIVEMAP

	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_METALNESSMAP

	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_ROUGHNESSMAP

	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_ANISOTROPYMAP

	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_CLEARCOATMAP

	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_CLEARCOAT_NORMALMAP

	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP

	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_IRIDESCENCEMAP

	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP

	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SHEEN_COLORMAP

	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SHEEN_ROUGHNESSMAP

	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SPECULARMAP

	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SPECULAR_COLORMAP

	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_SPECULAR_INTENSITYMAP

	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_TRANSMISSIONMAP

	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;

#endif
#ifdef USE_THICKNESSMAP

	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;

#endif
`
), sf = (
  /* glsl */
  `
#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0

	vec4 worldPosition = vec4( transformed, 1.0 );

	#ifdef USE_BATCHING

		worldPosition = batchingMatrix * worldPosition;

	#endif

	#ifdef USE_INSTANCING

		worldPosition = instanceMatrix * worldPosition;

	#endif

	worldPosition = modelMatrix * worldPosition;

#endif
`
), af = (
  /* glsl */
  `
varying vec2 vUv;
uniform mat3 uvTransform;

void main() {

	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	gl_Position = vec4( position.xy, 1.0, 1.0 );

}
`
), of = (
  /* glsl */
  `
uniform sampler2D t2D;
uniform float backgroundIntensity;

varying vec2 vUv;

void main() {

	vec4 texColor = texture2D( t2D, vUv );

	#ifdef DECODE_VIDEO_TEXTURE

		// use inline sRGB decode until browsers properly support SRGB8_APLHA8 with video textures

		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );

	#endif

	texColor.rgb *= backgroundIntensity;

	gl_FragColor = texColor;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`
), lf = (
  /* glsl */
  `
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

	gl_Position.z = gl_Position.w; // set z to camera.far

}
`
), cf = (
  /* glsl */
  `

#ifdef ENVMAP_TYPE_CUBE

	uniform samplerCube envMap;

#elif defined( ENVMAP_TYPE_CUBE_UV )

	uniform sampler2D envMap;

#endif

uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;

varying vec3 vWorldDirection;

#include <cube_uv_reflection_fragment>

void main() {

	#ifdef ENVMAP_TYPE_CUBE

		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );

	#elif defined( ENVMAP_TYPE_CUBE_UV )

		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );

	#else

		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );

	#endif

	texColor.rgb *= backgroundIntensity;

	gl_FragColor = texColor;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`
), hf = (
  /* glsl */
  `
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

	gl_Position.z = gl_Position.w; // set z to camera.far

}
`
), uf = (
  /* glsl */
  `
uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;

varying vec3 vWorldDirection;

void main() {

	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );

	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`
), ff = (
  /* glsl */
  `
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

// This is used for computing an equivalent of gl_FragCoord.z that is as high precision as possible.
// Some platforms compute gl_FragCoord at a lower precision which makes the manually computed value better for
// depth-based postprocessing effects. Reproduced on iPad with A10 processor / iPadOS 13.3.1.
varying vec2 vHighPrecisionZW;

void main() {

	#include <uv_vertex>

	#include <batching_vertex>
	#include <skinbase_vertex>

	#include <morphinstance_vertex>

	#ifdef USE_DISPLACEMENTMAP

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>

	#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vHighPrecisionZW = gl_Position.zw;

}
`
), df = (
  /* glsl */
  `
#if DEPTH_PACKING == 3200

	uniform float opacity;

#endif

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

varying vec2 vHighPrecisionZW;

void main() {

	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>

	#if DEPTH_PACKING == 3200

		diffuseColor.a = opacity;

	#endif

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	#include <logdepthbuf_fragment>

	// Higher precision equivalent of gl_FragCoord.z. This assumes depthRange has been left to its default values.
	float fragCoordZ = 0.5 * vHighPrecisionZW[0] / vHighPrecisionZW[1] + 0.5;

	#if DEPTH_PACKING == 3200

		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );

	#elif DEPTH_PACKING == 3201

		gl_FragColor = packDepthToRGBA( fragCoordZ );

	#endif

}
`
), pf = (
  /* glsl */
  `
#define DISTANCE

varying vec3 vWorldPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>

	#include <batching_vertex>
	#include <skinbase_vertex>

	#include <morphinstance_vertex>

	#ifdef USE_DISPLACEMENTMAP

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>

	#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>

	vWorldPosition = worldPosition.xyz;

}
`
), mf = (
  /* glsl */
  `
#define DISTANCE

uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;

#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>

void main () {

	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>

	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist ); // clamp to [ 0, 1 ]

	gl_FragColor = packDepthToRGBA( dist );

}
`
), gf = (
  /* glsl */
  `
varying vec3 vWorldDirection;

#include <common>

void main() {

	vWorldDirection = transformDirection( position, modelMatrix );

	#include <begin_vertex>
	#include <project_vertex>

}
`
), _f = (
  /* glsl */
  `
uniform sampler2D tEquirect;

varying vec3 vWorldDirection;

#include <common>

void main() {

	vec3 direction = normalize( vWorldDirection );

	vec2 sampleUV = equirectUv( direction );

	gl_FragColor = texture2D( tEquirect, sampleUV );

	#include <tonemapping_fragment>
	#include <colorspace_fragment>

}
`
), vf = (
  /* glsl */
  `
uniform float scale;
attribute float lineDistance;

varying float vLineDistance;

#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	vLineDistance = scale * lineDistance;

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

}
`
), xf = (
  /* glsl */
  `
uniform vec3 diffuse;
uniform float opacity;

uniform float dashSize;
uniform float totalSize;

varying float vLineDistance;

#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	if ( mod( vLineDistance, totalSize ) > dashSize ) {

		discard;

	}

	vec3 outgoingLight = vec3( 0.0 );

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>

	outgoingLight = diffuseColor.rgb; // simple shader

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>

}
`
), Mf = (
  /* glsl */
  `
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )

		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>

	#endif

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>

}
`
), Sf = (
  /* glsl */
  `
uniform vec3 diffuse;
uniform float opacity;

#ifndef FLAT_SHADED

	varying vec3 vNormal;

#endif

#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );

	// accumulation (baked indirect lighting only)
	#ifdef USE_LIGHTMAP

		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;

	#else

		reflectedLight.indirectDiffuse += vec3( 1.0 );

	#endif

	// modulation
	#include <aomap_fragment>

	reflectedLight.indirectDiffuse *= diffuseColor.rgb;

	vec3 outgoingLight = reflectedLight.indirectDiffuse;

	#include <envmap_fragment>

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`
), yf = (
  /* glsl */
  `
#define LAMBERT

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`
), Ef = (
  /* glsl */
  `
#define LAMBERT

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`
), Tf = (
  /* glsl */
  `
#define MATCAP

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>

#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

	vViewPosition = - mvPosition.xyz;

}
`
), Af = (
  /* glsl */
  `
#define MATCAP

uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;

varying vec3 vViewPosition;

#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>

	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5; // 0.495 to remove artifacts caused by undersized matcap disks

	#ifdef USE_MATCAP

		vec4 matcapColor = texture2D( matcap, uv );

	#else

		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 ); // default if matcap is missing

	#endif

	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`
), bf = (
  /* glsl */
  `
#define NORMAL

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )

	varying vec3 vViewPosition;

#endif

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )

	vViewPosition = - mvPosition.xyz;

#endif

}
`
), wf = (
  /* glsl */
  `
#define NORMAL

uniform float opacity;

#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )

	varying vec3 vViewPosition;

#endif

#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );

	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>

	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );

	#ifdef OPAQUE

		gl_FragColor.a = 1.0;

	#endif

}
`
), Rf = (
  /* glsl */
  `
#define PHONG

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`
), Cf = (
  /* glsl */
  `
#define PHONG

uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;

	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`
), Pf = (
  /* glsl */
  `
#define STANDARD

varying vec3 vViewPosition;

#ifdef USE_TRANSMISSION

	varying vec3 vWorldPosition;

#endif

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

#ifdef USE_TRANSMISSION

	vWorldPosition = worldPosition.xyz;

#endif
}
`
), Lf = (
  /* glsl */
  `
#define STANDARD

#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;

#ifdef IOR
	uniform float ior;
#endif

#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;

	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif

	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif

#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif

#ifdef USE_DISPERSION
	uniform float dispersion;
#endif

#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif

#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;

	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif

	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif

#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;

	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif

varying vec3 vViewPosition;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;

	#include <transmission_fragment>

	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;

	#ifdef USE_SHEEN

		// Sheen energy compensation approximation calculation can be found at the end of
		// https://drive.google.com/file/d/1T0D1VSyR4AllqIJTQAraEIzjlb5h4FKH/view?usp=sharing
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );

		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;

	#endif

	#ifdef USE_CLEARCOAT

		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );

		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );

		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;

	#endif

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`
), Df = (
  /* glsl */
  `
#define TOON

varying vec3 vViewPosition;

#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>

	vViewPosition = - mvPosition.xyz;

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`
), Uf = (
  /* glsl */
  `
#define TOON

uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;

#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>

	// accumulation
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>

	// modulation
	#include <aomap_fragment>

	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>

}
`
), If = (
  /* glsl */
  `
uniform float size;
uniform float scale;

#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

#ifdef USE_POINTS_UV

	varying vec2 vUv;
	uniform mat3 uvTransform;

#endif

void main() {

	#ifdef USE_POINTS_UV

		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	#endif

	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>

	gl_PointSize = size;

	#ifdef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );

	#endif

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>

}
`
), Nf = (
  /* glsl */
  `
uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );

	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>

}
`
), Ff = (
  /* glsl */
  `
#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>

void main() {

	#include <batching_vertex>

	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>

	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>

	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

}
`
), Of = (
  /* glsl */
  `
uniform vec3 color;
uniform float opacity;

#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>

void main() {

	#include <logdepthbuf_fragment>

	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );

	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>

}
`
), Bf = (
  /* glsl */
  `
uniform float rotation;
uniform vec2 center;

#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>

void main() {

	#include <uv_vertex>

	vec4 mvPosition = modelViewMatrix * vec4( 0.0, 0.0, 0.0, 1.0 );

	vec2 scale;
	scale.x = length( vec3( modelMatrix[ 0 ].x, modelMatrix[ 0 ].y, modelMatrix[ 0 ].z ) );
	scale.y = length( vec3( modelMatrix[ 1 ].x, modelMatrix[ 1 ].y, modelMatrix[ 1 ].z ) );

	#ifndef USE_SIZEATTENUATION

		bool isPerspective = isPerspectiveMatrix( projectionMatrix );

		if ( isPerspective ) scale *= - mvPosition.z;

	#endif

	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;

	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;

	mvPosition.xy += rotatedPosition;

	gl_Position = projectionMatrix * mvPosition;

	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>

}
`
), zf = (
  /* glsl */
  `
uniform vec3 diffuse;
uniform float opacity;

#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>

void main() {

	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>

	vec3 outgoingLight = vec3( 0.0 );

	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>

	outgoingLight = diffuseColor.rgb;

	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>

}
`
), Fe = {
  alphahash_fragment: ah,
  alphahash_pars_fragment: oh,
  alphamap_fragment: lh,
  alphamap_pars_fragment: ch,
  alphatest_fragment: hh,
  alphatest_pars_fragment: uh,
  aomap_fragment: fh,
  aomap_pars_fragment: dh,
  batching_pars_vertex: ph,
  batching_vertex: mh,
  begin_vertex: gh,
  beginnormal_vertex: _h,
  bsdfs: vh,
  iridescence_fragment: xh,
  bumpmap_pars_fragment: Mh,
  clipping_planes_fragment: Sh,
  clipping_planes_pars_fragment: yh,
  clipping_planes_pars_vertex: Eh,
  clipping_planes_vertex: Th,
  color_fragment: Ah,
  color_pars_fragment: bh,
  color_pars_vertex: wh,
  color_vertex: Rh,
  common: Ch,
  cube_uv_reflection_fragment: Ph,
  defaultnormal_vertex: Lh,
  displacementmap_pars_vertex: Dh,
  displacementmap_vertex: Uh,
  emissivemap_fragment: Ih,
  emissivemap_pars_fragment: Nh,
  colorspace_fragment: Fh,
  colorspace_pars_fragment: Oh,
  envmap_fragment: Bh,
  envmap_common_pars_fragment: zh,
  envmap_pars_fragment: Hh,
  envmap_pars_vertex: Gh,
  envmap_physical_pars_fragment: jh,
  envmap_vertex: Vh,
  fog_vertex: kh,
  fog_pars_vertex: Wh,
  fog_fragment: Xh,
  fog_pars_fragment: qh,
  gradientmap_pars_fragment: Yh,
  lightmap_pars_fragment: Kh,
  lights_lambert_fragment: Zh,
  lights_lambert_pars_fragment: Jh,
  lights_pars_begin: $h,
  lights_toon_fragment: Qh,
  lights_toon_pars_fragment: eu,
  lights_phong_fragment: tu,
  lights_phong_pars_fragment: iu,
  lights_physical_fragment: nu,
  lights_physical_pars_fragment: ru,
  lights_fragment_begin: su,
  lights_fragment_maps: au,
  lights_fragment_end: ou,
  logdepthbuf_fragment: lu,
  logdepthbuf_pars_fragment: cu,
  logdepthbuf_pars_vertex: hu,
  logdepthbuf_vertex: uu,
  map_fragment: fu,
  map_pars_fragment: du,
  map_particle_fragment: pu,
  map_particle_pars_fragment: mu,
  metalnessmap_fragment: gu,
  metalnessmap_pars_fragment: _u,
  morphinstance_vertex: vu,
  morphcolor_vertex: xu,
  morphnormal_vertex: Mu,
  morphtarget_pars_vertex: Su,
  morphtarget_vertex: yu,
  normal_fragment_begin: Eu,
  normal_fragment_maps: Tu,
  normal_pars_fragment: Au,
  normal_pars_vertex: bu,
  normal_vertex: wu,
  normalmap_pars_fragment: Ru,
  clearcoat_normal_fragment_begin: Cu,
  clearcoat_normal_fragment_maps: Pu,
  clearcoat_pars_fragment: Lu,
  iridescence_pars_fragment: Du,
  opaque_fragment: Uu,
  packing: Iu,
  premultiplied_alpha_fragment: Nu,
  project_vertex: Fu,
  dithering_fragment: Ou,
  dithering_pars_fragment: Bu,
  roughnessmap_fragment: zu,
  roughnessmap_pars_fragment: Hu,
  shadowmap_pars_fragment: Gu,
  shadowmap_pars_vertex: Vu,
  shadowmap_vertex: ku,
  shadowmask_pars_fragment: Wu,
  skinbase_vertex: Xu,
  skinning_pars_vertex: qu,
  skinning_vertex: Yu,
  skinnormal_vertex: Ku,
  specularmap_fragment: Zu,
  specularmap_pars_fragment: Ju,
  tonemapping_fragment: $u,
  tonemapping_pars_fragment: ju,
  transmission_fragment: Qu,
  transmission_pars_fragment: ef,
  uv_pars_fragment: tf,
  uv_pars_vertex: nf,
  uv_vertex: rf,
  worldpos_vertex: sf,
  background_vert: af,
  background_frag: of,
  backgroundCube_vert: lf,
  backgroundCube_frag: cf,
  cube_vert: hf,
  cube_frag: uf,
  depth_vert: ff,
  depth_frag: df,
  distanceRGBA_vert: pf,
  distanceRGBA_frag: mf,
  equirect_vert: gf,
  equirect_frag: _f,
  linedashed_vert: vf,
  linedashed_frag: xf,
  meshbasic_vert: Mf,
  meshbasic_frag: Sf,
  meshlambert_vert: yf,
  meshlambert_frag: Ef,
  meshmatcap_vert: Tf,
  meshmatcap_frag: Af,
  meshnormal_vert: bf,
  meshnormal_frag: wf,
  meshphong_vert: Rf,
  meshphong_frag: Cf,
  meshphysical_vert: Pf,
  meshphysical_frag: Lf,
  meshtoon_vert: Df,
  meshtoon_frag: Uf,
  points_vert: If,
  points_frag: Nf,
  shadow_vert: Ff,
  shadow_frag: Of,
  sprite_vert: Bf,
  sprite_frag: zf
}, oe = {
  common: {
    diffuse: { value: /* @__PURE__ */ new ke(16777215) },
    opacity: { value: 1 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Oe() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Oe() },
    alphaTest: { value: 0 }
  },
  specularmap: {
    specularMap: { value: null },
    specularMapTransform: { value: /* @__PURE__ */ new Oe() }
  },
  envmap: {
    envMap: { value: null },
    envMapRotation: { value: /* @__PURE__ */ new Oe() },
    flipEnvMap: { value: -1 },
    reflectivity: { value: 1 },
    // basic, lambert, phong
    ior: { value: 1.5 },
    // physical
    refractionRatio: { value: 0.98 }
    // basic, lambert, phong
  },
  aomap: {
    aoMap: { value: null },
    aoMapIntensity: { value: 1 },
    aoMapTransform: { value: /* @__PURE__ */ new Oe() }
  },
  lightmap: {
    lightMap: { value: null },
    lightMapIntensity: { value: 1 },
    lightMapTransform: { value: /* @__PURE__ */ new Oe() }
  },
  bumpmap: {
    bumpMap: { value: null },
    bumpMapTransform: { value: /* @__PURE__ */ new Oe() },
    bumpScale: { value: 1 }
  },
  normalmap: {
    normalMap: { value: null },
    normalMapTransform: { value: /* @__PURE__ */ new Oe() },
    normalScale: { value: /* @__PURE__ */ new le(1, 1) }
  },
  displacementmap: {
    displacementMap: { value: null },
    displacementMapTransform: { value: /* @__PURE__ */ new Oe() },
    displacementScale: { value: 1 },
    displacementBias: { value: 0 }
  },
  emissivemap: {
    emissiveMap: { value: null },
    emissiveMapTransform: { value: /* @__PURE__ */ new Oe() }
  },
  metalnessmap: {
    metalnessMap: { value: null },
    metalnessMapTransform: { value: /* @__PURE__ */ new Oe() }
  },
  roughnessmap: {
    roughnessMap: { value: null },
    roughnessMapTransform: { value: /* @__PURE__ */ new Oe() }
  },
  gradientmap: {
    gradientMap: { value: null }
  },
  fog: {
    fogDensity: { value: 25e-5 },
    fogNear: { value: 1 },
    fogFar: { value: 2e3 },
    fogColor: { value: /* @__PURE__ */ new ke(16777215) }
  },
  lights: {
    ambientLightColor: { value: [] },
    lightProbe: { value: [] },
    directionalLights: { value: [], properties: {
      direction: {},
      color: {}
    } },
    directionalLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    directionalShadowMap: { value: [] },
    directionalShadowMatrix: { value: [] },
    spotLights: { value: [], properties: {
      color: {},
      position: {},
      direction: {},
      distance: {},
      coneCos: {},
      penumbraCos: {},
      decay: {}
    } },
    spotLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {}
    } },
    spotLightMap: { value: [] },
    spotShadowMap: { value: [] },
    spotLightMatrix: { value: [] },
    pointLights: { value: [], properties: {
      color: {},
      position: {},
      decay: {},
      distance: {}
    } },
    pointLightShadows: { value: [], properties: {
      shadowIntensity: 1,
      shadowBias: {},
      shadowNormalBias: {},
      shadowRadius: {},
      shadowMapSize: {},
      shadowCameraNear: {},
      shadowCameraFar: {}
    } },
    pointShadowMap: { value: [] },
    pointShadowMatrix: { value: [] },
    hemisphereLights: { value: [], properties: {
      direction: {},
      skyColor: {},
      groundColor: {}
    } },
    // TODO (abelnation): RectAreaLight BRDF data needs to be moved from example to main src
    rectAreaLights: { value: [], properties: {
      color: {},
      position: {},
      width: {},
      height: {}
    } },
    ltc_1: { value: null },
    ltc_2: { value: null }
  },
  points: {
    diffuse: { value: /* @__PURE__ */ new ke(16777215) },
    opacity: { value: 1 },
    size: { value: 1 },
    scale: { value: 1 },
    map: { value: null },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Oe() },
    alphaTest: { value: 0 },
    uvTransform: { value: /* @__PURE__ */ new Oe() }
  },
  sprite: {
    diffuse: { value: /* @__PURE__ */ new ke(16777215) },
    opacity: { value: 1 },
    center: { value: /* @__PURE__ */ new le(0.5, 0.5) },
    rotation: { value: 0 },
    map: { value: null },
    mapTransform: { value: /* @__PURE__ */ new Oe() },
    alphaMap: { value: null },
    alphaMapTransform: { value: /* @__PURE__ */ new Oe() },
    alphaTest: { value: 0 }
  }
}, Nt = {
  basic: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.specularmap,
      oe.envmap,
      oe.aomap,
      oe.lightmap,
      oe.fog
    ]),
    vertexShader: Fe.meshbasic_vert,
    fragmentShader: Fe.meshbasic_frag
  },
  lambert: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.specularmap,
      oe.envmap,
      oe.aomap,
      oe.lightmap,
      oe.emissivemap,
      oe.bumpmap,
      oe.normalmap,
      oe.displacementmap,
      oe.fog,
      oe.lights,
      {
        emissive: { value: /* @__PURE__ */ new ke(0) }
      }
    ]),
    vertexShader: Fe.meshlambert_vert,
    fragmentShader: Fe.meshlambert_frag
  },
  phong: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.specularmap,
      oe.envmap,
      oe.aomap,
      oe.lightmap,
      oe.emissivemap,
      oe.bumpmap,
      oe.normalmap,
      oe.displacementmap,
      oe.fog,
      oe.lights,
      {
        emissive: { value: /* @__PURE__ */ new ke(0) },
        specular: { value: /* @__PURE__ */ new ke(1118481) },
        shininess: { value: 30 }
      }
    ]),
    vertexShader: Fe.meshphong_vert,
    fragmentShader: Fe.meshphong_frag
  },
  standard: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.envmap,
      oe.aomap,
      oe.lightmap,
      oe.emissivemap,
      oe.bumpmap,
      oe.normalmap,
      oe.displacementmap,
      oe.roughnessmap,
      oe.metalnessmap,
      oe.fog,
      oe.lights,
      {
        emissive: { value: /* @__PURE__ */ new ke(0) },
        roughness: { value: 1 },
        metalness: { value: 0 },
        envMapIntensity: { value: 1 }
      }
    ]),
    vertexShader: Fe.meshphysical_vert,
    fragmentShader: Fe.meshphysical_frag
  },
  toon: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.aomap,
      oe.lightmap,
      oe.emissivemap,
      oe.bumpmap,
      oe.normalmap,
      oe.displacementmap,
      oe.gradientmap,
      oe.fog,
      oe.lights,
      {
        emissive: { value: /* @__PURE__ */ new ke(0) }
      }
    ]),
    vertexShader: Fe.meshtoon_vert,
    fragmentShader: Fe.meshtoon_frag
  },
  matcap: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.bumpmap,
      oe.normalmap,
      oe.displacementmap,
      oe.fog,
      {
        matcap: { value: null }
      }
    ]),
    vertexShader: Fe.meshmatcap_vert,
    fragmentShader: Fe.meshmatcap_frag
  },
  points: {
    uniforms: /* @__PURE__ */ mt([
      oe.points,
      oe.fog
    ]),
    vertexShader: Fe.points_vert,
    fragmentShader: Fe.points_frag
  },
  dashed: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.fog,
      {
        scale: { value: 1 },
        dashSize: { value: 1 },
        totalSize: { value: 2 }
      }
    ]),
    vertexShader: Fe.linedashed_vert,
    fragmentShader: Fe.linedashed_frag
  },
  depth: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.displacementmap
    ]),
    vertexShader: Fe.depth_vert,
    fragmentShader: Fe.depth_frag
  },
  normal: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.bumpmap,
      oe.normalmap,
      oe.displacementmap,
      {
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Fe.meshnormal_vert,
    fragmentShader: Fe.meshnormal_frag
  },
  sprite: {
    uniforms: /* @__PURE__ */ mt([
      oe.sprite,
      oe.fog
    ]),
    vertexShader: Fe.sprite_vert,
    fragmentShader: Fe.sprite_frag
  },
  background: {
    uniforms: {
      uvTransform: { value: /* @__PURE__ */ new Oe() },
      t2D: { value: null },
      backgroundIntensity: { value: 1 }
    },
    vertexShader: Fe.background_vert,
    fragmentShader: Fe.background_frag
  },
  backgroundCube: {
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 },
      backgroundBlurriness: { value: 0 },
      backgroundIntensity: { value: 1 },
      backgroundRotation: { value: /* @__PURE__ */ new Oe() }
    },
    vertexShader: Fe.backgroundCube_vert,
    fragmentShader: Fe.backgroundCube_frag
  },
  cube: {
    uniforms: {
      tCube: { value: null },
      tFlip: { value: -1 },
      opacity: { value: 1 }
    },
    vertexShader: Fe.cube_vert,
    fragmentShader: Fe.cube_frag
  },
  equirect: {
    uniforms: {
      tEquirect: { value: null }
    },
    vertexShader: Fe.equirect_vert,
    fragmentShader: Fe.equirect_frag
  },
  distanceRGBA: {
    uniforms: /* @__PURE__ */ mt([
      oe.common,
      oe.displacementmap,
      {
        referencePosition: { value: /* @__PURE__ */ new L() },
        nearDistance: { value: 1 },
        farDistance: { value: 1e3 }
      }
    ]),
    vertexShader: Fe.distanceRGBA_vert,
    fragmentShader: Fe.distanceRGBA_frag
  },
  shadow: {
    uniforms: /* @__PURE__ */ mt([
      oe.lights,
      oe.fog,
      {
        color: { value: /* @__PURE__ */ new ke(0) },
        opacity: { value: 1 }
      }
    ]),
    vertexShader: Fe.shadow_vert,
    fragmentShader: Fe.shadow_frag
  }
};
Nt.physical = {
  uniforms: /* @__PURE__ */ mt([
    Nt.standard.uniforms,
    {
      clearcoat: { value: 0 },
      clearcoatMap: { value: null },
      clearcoatMapTransform: { value: /* @__PURE__ */ new Oe() },
      clearcoatNormalMap: { value: null },
      clearcoatNormalMapTransform: { value: /* @__PURE__ */ new Oe() },
      clearcoatNormalScale: { value: /* @__PURE__ */ new le(1, 1) },
      clearcoatRoughness: { value: 0 },
      clearcoatRoughnessMap: { value: null },
      clearcoatRoughnessMapTransform: { value: /* @__PURE__ */ new Oe() },
      dispersion: { value: 0 },
      iridescence: { value: 0 },
      iridescenceMap: { value: null },
      iridescenceMapTransform: { value: /* @__PURE__ */ new Oe() },
      iridescenceIOR: { value: 1.3 },
      iridescenceThicknessMinimum: { value: 100 },
      iridescenceThicknessMaximum: { value: 400 },
      iridescenceThicknessMap: { value: null },
      iridescenceThicknessMapTransform: { value: /* @__PURE__ */ new Oe() },
      sheen: { value: 0 },
      sheenColor: { value: /* @__PURE__ */ new ke(0) },
      sheenColorMap: { value: null },
      sheenColorMapTransform: { value: /* @__PURE__ */ new Oe() },
      sheenRoughness: { value: 1 },
      sheenRoughnessMap: { value: null },
      sheenRoughnessMapTransform: { value: /* @__PURE__ */ new Oe() },
      transmission: { value: 0 },
      transmissionMap: { value: null },
      transmissionMapTransform: { value: /* @__PURE__ */ new Oe() },
      transmissionSamplerSize: { value: /* @__PURE__ */ new le() },
      transmissionSamplerMap: { value: null },
      thickness: { value: 0 },
      thicknessMap: { value: null },
      thicknessMapTransform: { value: /* @__PURE__ */ new Oe() },
      attenuationDistance: { value: 0 },
      attenuationColor: { value: /* @__PURE__ */ new ke(0) },
      specularColor: { value: /* @__PURE__ */ new ke(1, 1, 1) },
      specularColorMap: { value: null },
      specularColorMapTransform: { value: /* @__PURE__ */ new Oe() },
      specularIntensity: { value: 1 },
      specularIntensityMap: { value: null },
      specularIntensityMapTransform: { value: /* @__PURE__ */ new Oe() },
      anisotropyVector: { value: /* @__PURE__ */ new le() },
      anisotropyMap: { value: null },
      anisotropyMapTransform: { value: /* @__PURE__ */ new Oe() }
    }
  ]),
  vertexShader: Fe.meshphysical_vert,
  fragmentShader: Fe.meshphysical_frag
};
const jn = { r: 0, b: 0, g: 0 }, vi = /* @__PURE__ */ new Bt(), Hf = /* @__PURE__ */ new je();
function Gf(n, e, t, i, r, s, a) {
  const o = new ke(0);
  let l = s === !0 ? 0 : 1, c, h, d = null, f = 0, m = null;
  function g(b) {
    let M = b.isScene === !0 ? b.background : null;
    return M && M.isTexture && (M = (b.backgroundBlurriness > 0 ? t : e).get(M)), M;
  }
  function v(b) {
    let M = !1;
    const T = g(b);
    T === null ? u(o, l) : T && T.isColor && (u(T, 1), M = !0);
    const O = n.xr.getEnvironmentBlendMode();
    O === "additive" ? i.buffers.color.setClear(0, 0, 0, 1, a) : O === "alpha-blend" && i.buffers.color.setClear(0, 0, 0, 0, a), (n.autoClear || M) && (i.buffers.depth.setTest(!0), i.buffers.depth.setMask(!0), i.buffers.color.setMask(!0), n.clear(n.autoClearColor, n.autoClearDepth, n.autoClearStencil));
  }
  function p(b, M) {
    const T = g(M);
    T && (T.isCubeTexture || T.mapping === dr) ? (h === void 0 && (h = new Jt(
      new Tn(1, 1, 1),
      new hi({
        name: "BackgroundCubeMaterial",
        uniforms: rn(Nt.backgroundCube.uniforms),
        vertexShader: Nt.backgroundCube.vertexShader,
        fragmentShader: Nt.backgroundCube.fragmentShader,
        side: _t,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(O, w, R) {
      this.matrixWorld.copyPosition(R.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), r.update(h)), vi.copy(M.backgroundRotation), vi.x *= -1, vi.y *= -1, vi.z *= -1, T.isCubeTexture && T.isRenderTargetTexture === !1 && (vi.y *= -1, vi.z *= -1), h.material.uniforms.envMap.value = T, h.material.uniforms.flipEnvMap.value = T.isCubeTexture && T.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = M.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = M.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(Hf.makeRotationFromEuler(vi)), h.material.toneMapped = Ze.getTransfer(T.colorSpace) !== Je, (d !== T || f !== T.version || m !== n.toneMapping) && (h.material.needsUpdate = !0, d = T, f = T.version, m = n.toneMapping), h.layers.enableAll(), b.unshift(h, h.geometry, h.material, 0, 0, null)) : T && T.isTexture && (c === void 0 && (c = new Jt(
      new gr(2, 2),
      new hi({
        name: "BackgroundMaterial",
        uniforms: rn(Nt.background.uniforms),
        vertexShader: Nt.background.vertexShader,
        fragmentShader: Nt.background.fragmentShader,
        side: ci,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), r.update(c)), c.material.uniforms.t2D.value = T, c.material.uniforms.backgroundIntensity.value = M.backgroundIntensity, c.material.toneMapped = Ze.getTransfer(T.colorSpace) !== Je, T.matrixAutoUpdate === !0 && T.updateMatrix(), c.material.uniforms.uvTransform.value.copy(T.matrix), (d !== T || f !== T.version || m !== n.toneMapping) && (c.material.needsUpdate = !0, d = T, f = T.version, m = n.toneMapping), c.layers.enableAll(), b.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function u(b, M) {
    b.getRGB(jn, Ko(n)), i.buffers.color.setClear(jn.r, jn.g, jn.b, M, a);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(b, M = 1) {
      o.set(b), l = M, u(o, l);
    },
    getClearAlpha: function() {
      return l;
    },
    setClearAlpha: function(b) {
      l = b, u(o, l);
    },
    render: v,
    addToRenderList: p
  };
}
function Vf(n, e) {
  const t = n.getParameter(n.MAX_VERTEX_ATTRIBS), i = {}, r = f(null);
  let s = r, a = !1;
  function o(x, C, W, z, G) {
    let K = !1;
    const H = d(z, W, C);
    s !== H && (s = H, c(s.object)), K = m(x, z, W, G), K && g(x, z, W, G), G !== null && e.update(G, n.ELEMENT_ARRAY_BUFFER), (K || a) && (a = !1, T(x, C, W, z), G !== null && n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, e.get(G).buffer));
  }
  function l() {
    return n.createVertexArray();
  }
  function c(x) {
    return n.bindVertexArray(x);
  }
  function h(x) {
    return n.deleteVertexArray(x);
  }
  function d(x, C, W) {
    const z = W.wireframe === !0;
    let G = i[x.id];
    G === void 0 && (G = {}, i[x.id] = G);
    let K = G[C.id];
    K === void 0 && (K = {}, G[C.id] = K);
    let H = K[z];
    return H === void 0 && (H = f(l()), K[z] = H), H;
  }
  function f(x) {
    const C = [], W = [], z = [];
    for (let G = 0; G < t; G++)
      C[G] = 0, W[G] = 0, z[G] = 0;
    return {
      // for backward compatibility on non-VAO support browser
      geometry: null,
      program: null,
      wireframe: !1,
      newAttributes: C,
      enabledAttributes: W,
      attributeDivisors: z,
      object: x,
      attributes: {},
      index: null
    };
  }
  function m(x, C, W, z) {
    const G = s.attributes, K = C.attributes;
    let H = 0;
    const Q = W.getAttributes();
    for (const V in Q)
      if (Q[V].location >= 0) {
        const xe = G[V];
        let me = K[V];
        if (me === void 0 && (V === "instanceMatrix" && x.instanceMatrix && (me = x.instanceMatrix), V === "instanceColor" && x.instanceColor && (me = x.instanceColor)), xe === void 0 || xe.attribute !== me || me && xe.data !== me.data) return !0;
        H++;
      }
    return s.attributesNum !== H || s.index !== z;
  }
  function g(x, C, W, z) {
    const G = {}, K = C.attributes;
    let H = 0;
    const Q = W.getAttributes();
    for (const V in Q)
      if (Q[V].location >= 0) {
        let xe = K[V];
        xe === void 0 && (V === "instanceMatrix" && x.instanceMatrix && (xe = x.instanceMatrix), V === "instanceColor" && x.instanceColor && (xe = x.instanceColor));
        const me = {};
        me.attribute = xe, xe && xe.data && (me.data = xe.data), G[V] = me, H++;
      }
    s.attributes = G, s.attributesNum = H, s.index = z;
  }
  function v() {
    const x = s.newAttributes;
    for (let C = 0, W = x.length; C < W; C++)
      x[C] = 0;
  }
  function p(x) {
    u(x, 0);
  }
  function u(x, C) {
    const W = s.newAttributes, z = s.enabledAttributes, G = s.attributeDivisors;
    W[x] = 1, z[x] === 0 && (n.enableVertexAttribArray(x), z[x] = 1), G[x] !== C && (n.vertexAttribDivisor(x, C), G[x] = C);
  }
  function b() {
    const x = s.newAttributes, C = s.enabledAttributes;
    for (let W = 0, z = C.length; W < z; W++)
      C[W] !== x[W] && (n.disableVertexAttribArray(W), C[W] = 0);
  }
  function M(x, C, W, z, G, K, H) {
    H === !0 ? n.vertexAttribIPointer(x, C, W, G, K) : n.vertexAttribPointer(x, C, W, z, G, K);
  }
  function T(x, C, W, z) {
    v();
    const G = z.attributes, K = W.getAttributes(), H = C.defaultAttributeValues;
    for (const Q in K) {
      const V = K[Q];
      if (V.location >= 0) {
        let de = G[Q];
        if (de === void 0 && (Q === "instanceMatrix" && x.instanceMatrix && (de = x.instanceMatrix), Q === "instanceColor" && x.instanceColor && (de = x.instanceColor)), de !== void 0) {
          const xe = de.normalized, me = de.itemSize, Be = e.get(de);
          if (Be === void 0) continue;
          const We = Be.buffer, k = Be.type, ee = Be.bytesPerElement, _e = k === n.INT || k === n.UNSIGNED_INT || de.gpuType === Hs;
          if (de.isInterleavedBufferAttribute) {
            const ce = de.data, Ce = ce.stride, Ne = de.offset;
            if (ce.isInstancedInterleavedBuffer) {
              for (let Pe = 0; Pe < V.locationSize; Pe++)
                u(V.location + Pe, ce.meshPerAttribute);
              x.isInstancedMesh !== !0 && z._maxInstanceCount === void 0 && (z._maxInstanceCount = ce.meshPerAttribute * ce.count);
            } else
              for (let Pe = 0; Pe < V.locationSize; Pe++)
                p(V.location + Pe);
            n.bindBuffer(n.ARRAY_BUFFER, We);
            for (let Pe = 0; Pe < V.locationSize; Pe++)
              M(
                V.location + Pe,
                me / V.locationSize,
                k,
                xe,
                Ce * ee,
                (Ne + me / V.locationSize * Pe) * ee,
                _e
              );
          } else {
            if (de.isInstancedBufferAttribute) {
              for (let ce = 0; ce < V.locationSize; ce++)
                u(V.location + ce, de.meshPerAttribute);
              x.isInstancedMesh !== !0 && z._maxInstanceCount === void 0 && (z._maxInstanceCount = de.meshPerAttribute * de.count);
            } else
              for (let ce = 0; ce < V.locationSize; ce++)
                p(V.location + ce);
            n.bindBuffer(n.ARRAY_BUFFER, We);
            for (let ce = 0; ce < V.locationSize; ce++)
              M(
                V.location + ce,
                me / V.locationSize,
                k,
                xe,
                me * ee,
                me / V.locationSize * ce * ee,
                _e
              );
          }
        } else if (H !== void 0) {
          const xe = H[Q];
          if (xe !== void 0)
            switch (xe.length) {
              case 2:
                n.vertexAttrib2fv(V.location, xe);
                break;
              case 3:
                n.vertexAttrib3fv(V.location, xe);
                break;
              case 4:
                n.vertexAttrib4fv(V.location, xe);
                break;
              default:
                n.vertexAttrib1fv(V.location, xe);
            }
        }
      }
    }
    b();
  }
  function O() {
    I();
    for (const x in i) {
      const C = i[x];
      for (const W in C) {
        const z = C[W];
        for (const G in z)
          h(z[G].object), delete z[G];
        delete C[W];
      }
      delete i[x];
    }
  }
  function w(x) {
    if (i[x.id] === void 0) return;
    const C = i[x.id];
    for (const W in C) {
      const z = C[W];
      for (const G in z)
        h(z[G].object), delete z[G];
      delete C[W];
    }
    delete i[x.id];
  }
  function R(x) {
    for (const C in i) {
      const W = i[C];
      if (W[x.id] === void 0) continue;
      const z = W[x.id];
      for (const G in z)
        h(z[G].object), delete z[G];
      delete W[x.id];
    }
  }
  function I() {
    E(), a = !0, s !== r && (s = r, c(s.object));
  }
  function E() {
    r.geometry = null, r.program = null, r.wireframe = !1;
  }
  return {
    setup: o,
    reset: I,
    resetDefaultState: E,
    dispose: O,
    releaseStatesOfGeometry: w,
    releaseStatesOfProgram: R,
    initAttributes: v,
    enableAttribute: p,
    disableUnusedAttributes: b
  };
}
function kf(n, e, t) {
  let i;
  function r(c) {
    i = c;
  }
  function s(c, h) {
    n.drawArrays(i, c, h), t.update(h, i, 1);
  }
  function a(c, h, d) {
    d !== 0 && (n.drawArraysInstanced(i, c, h, d), t.update(h, i, d));
  }
  function o(c, h, d) {
    if (d === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i, c, 0, h, 0, d);
    let m = 0;
    for (let g = 0; g < d; g++)
      m += h[g];
    t.update(m, i, 1);
  }
  function l(c, h, d, f) {
    if (d === 0) return;
    const m = e.get("WEBGL_multi_draw");
    if (m === null)
      for (let g = 0; g < c.length; g++)
        a(c[g], h[g], f[g]);
    else {
      m.multiDrawArraysInstancedWEBGL(i, c, 0, h, 0, f, 0, d);
      let g = 0;
      for (let v = 0; v < d; v++)
        g += h[v];
      for (let v = 0; v < f.length; v++)
        t.update(g, i, f[v]);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function Wf(n, e, t, i) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const w = e.get("EXT_texture_filter_anisotropic");
      r = n.getParameter(w.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      r = 0;
    return r;
  }
  function a(w) {
    return !(w !== Dt && i.convert(w) !== n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(w) {
    const R = w === yn && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(w !== jt && i.convert(w) !== n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    w !== Kt && !R);
  }
  function l(w) {
    if (w === "highp") {
      if (n.getShaderPrecisionFormat(n.VERTEX_SHADER, n.HIGH_FLOAT).precision > 0 && n.getShaderPrecisionFormat(n.FRAGMENT_SHADER, n.HIGH_FLOAT).precision > 0)
        return "highp";
      w = "mediump";
    }
    return w === "mediump" && n.getShaderPrecisionFormat(n.VERTEX_SHADER, n.MEDIUM_FLOAT).precision > 0 && n.getShaderPrecisionFormat(n.FRAGMENT_SHADER, n.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = t.precision !== void 0 ? t.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const d = t.logarithmicDepthBuffer === !0, f = n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS), m = n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS), g = n.getParameter(n.MAX_TEXTURE_SIZE), v = n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE), p = n.getParameter(n.MAX_VERTEX_ATTRIBS), u = n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS), b = n.getParameter(n.MAX_VARYING_VECTORS), M = n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS), T = m > 0, O = n.getParameter(n.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: d,
    maxTextures: f,
    maxVertexTextures: m,
    maxTextureSize: g,
    maxCubemapSize: v,
    maxAttributes: p,
    maxVertexUniforms: u,
    maxVaryings: b,
    maxFragmentUniforms: M,
    vertexTextures: T,
    maxSamples: O
  };
}
function Xf(n) {
  const e = this;
  let t = null, i = 0, r = !1, s = !1;
  const a = new Mi(), o = new Oe(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(d, f) {
    const m = d.length !== 0 || f || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    i !== 0 || r;
    return r = f, i = d.length, m;
  }, this.beginShadows = function() {
    s = !0, h(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(d, f) {
    t = h(d, f, 0);
  }, this.setState = function(d, f, m) {
    const g = d.clippingPlanes, v = d.clipIntersection, p = d.clipShadows, u = n.get(d);
    if (!r || g === null || g.length === 0 || s && !p)
      s ? h(null) : c();
    else {
      const b = s ? 0 : i, M = b * 4;
      let T = u.clippingState || null;
      l.value = T, T = h(g, f, M, m);
      for (let O = 0; O !== M; ++O)
        T[O] = t[O];
      u.clippingState = T, this.numIntersection = v ? this.numPlanes : 0, this.numPlanes += b;
    }
  };
  function c() {
    l.value !== t && (l.value = t, l.needsUpdate = i > 0), e.numPlanes = i, e.numIntersection = 0;
  }
  function h(d, f, m, g) {
    const v = d !== null ? d.length : 0;
    let p = null;
    if (v !== 0) {
      if (p = l.value, g !== !0 || p === null) {
        const u = m + v * 4, b = f.matrixWorldInverse;
        o.getNormalMatrix(b), (p === null || p.length < u) && (p = new Float32Array(u));
        for (let M = 0, T = m; M !== v; ++M, T += 4)
          a.copy(d[M]).applyMatrix4(b, o), a.normal.toArray(p, T), p[T + 3] = a.constant;
      }
      l.value = p, l.needsUpdate = !0;
    }
    return e.numPlanes = v, e.numIntersection = 0, p;
  }
}
class qf extends an {
  constructor(e = 1, t = 1, i = {}) {
    super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new $e(0, 0, e, t), this.scissorTest = !1, this.viewport = new $e(0, 0, e, t);
    const r = { width: e, height: t, depth: 1 };
    i = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: Lt,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1
    }, i);
    const s = new vt(r, i.mapping, i.wrapS, i.wrapT, i.magFilter, i.minFilter, i.format, i.type, i.anisotropy, i.colorSpace);
    s.flipY = !1, s.generateMipmaps = i.generateMipmaps, s.internalFormat = i.internalFormat, this.textures = [];
    const a = i.count;
    for (let o = 0; o < a; o++)
      this.textures[o] = s.clone(), this.textures[o].isRenderTargetTexture = !0;
    this.depthBuffer = i.depthBuffer, this.stencilBuffer = i.stencilBuffer, this.resolveDepthBuffer = i.resolveDepthBuffer, this.resolveStencilBuffer = i.resolveStencilBuffer, this.depthTexture = i.depthTexture, this.samples = i.samples;
  }
  get texture() {
    return this.textures[0];
  }
  set texture(e) {
    this.textures[0] = e;
  }
  setSize(e, t, i = 1) {
    if (this.width !== e || this.height !== t || this.depth !== i) {
      this.width = e, this.height = t, this.depth = i;
      for (let r = 0, s = this.textures.length; r < s; r++)
        this.textures[r].image.width = e, this.textures[r].image.height = t, this.textures[r].image.depth = i;
      this.dispose();
    }
    this.viewport.set(0, 0, e, t), this.scissor.set(0, 0, e, t);
  }
  clone() {
    return new this.constructor().copy(this);
  }
  copy(e) {
    this.width = e.width, this.height = e.height, this.depth = e.depth, this.scissor.copy(e.scissor), this.scissorTest = e.scissorTest, this.viewport.copy(e.viewport), this.textures.length = 0;
    for (let i = 0, r = e.textures.length; i < r; i++)
      this.textures[i] = e.textures[i].clone(), this.textures[i].isRenderTargetTexture = !0;
    const t = Object.assign({}, e.texture.image);
    return this.texture.source = new qo(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class Ri extends qf {
  constructor(e = 1, t = 1, i = {}) {
    super(e, t, i), this.isWebGLRenderTarget = !0;
  }
}
const Wi = -90, Xi = 1;
class Yf extends pt {
  constructor(e, t, i) {
    super(), this.type = "CubeCamera", this.renderTarget = i, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const r = new At(Wi, Xi, e, t);
    r.layers = this.layers, this.add(r);
    const s = new At(Wi, Xi, e, t);
    s.layers = this.layers, this.add(s);
    const a = new At(Wi, Xi, e, t);
    a.layers = this.layers, this.add(a);
    const o = new At(Wi, Xi, e, t);
    o.layers = this.layers, this.add(o);
    const l = new At(Wi, Xi, e, t);
    l.layers = this.layers, this.add(l);
    const c = new At(Wi, Xi, e, t);
    c.layers = this.layers, this.add(c);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [i, r, s, a, o, l] = t;
    for (const c of t) this.remove(c);
    if (e === Zt)
      i.up.set(0, 1, 0), i.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (e === ur)
      i.up.set(0, -1, 0), i.lookAt(-1, 0, 0), r.up.set(0, -1, 0), r.lookAt(1, 0, 0), s.up.set(0, 0, 1), s.lookAt(0, 1, 0), a.up.set(0, 0, -1), a.lookAt(0, -1, 0), o.up.set(0, -1, 0), o.lookAt(0, 0, 1), l.up.set(0, -1, 0), l.lookAt(0, 0, -1);
    else
      throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: " + e);
    for (const c of t)
      this.add(c), c.updateMatrixWorld();
  }
  update(e, t) {
    this.parent === null && this.updateMatrixWorld();
    const { renderTarget: i, activeMipmapLevel: r } = this;
    this.coordinateSystem !== e.coordinateSystem && (this.coordinateSystem = e.coordinateSystem, this.updateCoordinateSystem());
    const [s, a, o, l, c, h] = this.children, d = e.getRenderTarget(), f = e.getActiveCubeFace(), m = e.getActiveMipmapLevel(), g = e.xr.enabled;
    e.xr.enabled = !1;
    const v = i.texture.generateMipmaps;
    i.texture.generateMipmaps = !1, e.setRenderTarget(i, 0, r), e.render(t, s), e.setRenderTarget(i, 1, r), e.render(t, a), e.setRenderTarget(i, 2, r), e.render(t, o), e.setRenderTarget(i, 3, r), e.render(t, l), e.setRenderTarget(i, 4, r), e.render(t, c), i.texture.generateMipmaps = v, e.setRenderTarget(i, 5, r), e.render(t, h), e.setRenderTarget(d, f, m), e.xr.enabled = g, i.texture.needsPMREMUpdate = !0;
  }
}
class Zo extends vt {
  constructor(e, t, i, r, s, a, o, l, c, h) {
    e = e !== void 0 ? e : [], t = t !== void 0 ? t : Qi, super(e, t, i, r, s, a, o, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class Kf extends Ri {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const i = { width: e, height: e, depth: 1 }, r = [i, i, i, i, i, i];
    this.texture = new Zo(r, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : Lt;
  }
  fromEquirectangularTexture(e, t) {
    this.texture.type = t.type, this.texture.colorSpace = t.colorSpace, this.texture.generateMipmaps = t.generateMipmaps, this.texture.minFilter = t.minFilter, this.texture.magFilter = t.magFilter;
    const i = {
      uniforms: {
        tEquirect: { value: null }
      },
      vertexShader: (
        /* glsl */
        `

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`
      ),
      fragmentShader: (
        /* glsl */
        `

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`
      )
    }, r = new Tn(5, 5, 5), s = new hi({
      name: "CubemapFromEquirect",
      uniforms: rn(i.uniforms),
      vertexShader: i.vertexShader,
      fragmentShader: i.fragmentShader,
      side: _t,
      blending: oi
    });
    s.uniforms.tEquirect.value = t;
    const a = new Jt(r, s), o = t.minFilter;
    return t.minFilter === Ai && (t.minFilter = Lt), new Yf(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, i, r) {
    const s = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, i, r);
    e.setRenderTarget(s);
  }
}
function Zf(n) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a, o) {
    return o === rs ? a.mapping = Qi : o === ss && (a.mapping = en), a;
  }
  function i(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === rs || o === ss)
        if (e.has(a)) {
          const l = e.get(a).texture;
          return t(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new Kf(l.height);
            return c.fromEquirectangularTexture(n, a), e.set(a, c), a.addEventListener("dispose", r), t(c.texture, a.mapping);
          } else
            return null;
        }
    }
    return a;
  }
  function r(a) {
    const o = a.target;
    o.removeEventListener("dispose", r);
    const l = e.get(o);
    l !== void 0 && (e.delete(o), l.dispose());
  }
  function s() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: i,
    dispose: s
  };
}
const Ki = 4, ka = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], Ei = 20, Kr = /* @__PURE__ */ new Fo(), Wa = /* @__PURE__ */ new ke();
let Zr = null, Jr = 0, $r = 0, jr = !1;
const Si = (1 + Math.sqrt(5)) / 2, qi = 1 / Si, Xa = [
  /* @__PURE__ */ new L(-Si, qi, 0),
  /* @__PURE__ */ new L(Si, qi, 0),
  /* @__PURE__ */ new L(-qi, 0, Si),
  /* @__PURE__ */ new L(qi, 0, Si),
  /* @__PURE__ */ new L(0, Si, -qi),
  /* @__PURE__ */ new L(0, Si, qi),
  /* @__PURE__ */ new L(-1, 1, -1),
  /* @__PURE__ */ new L(1, 1, -1),
  /* @__PURE__ */ new L(-1, 1, 1),
  /* @__PURE__ */ new L(1, 1, 1)
];
class qa {
  constructor(e) {
    this._renderer = e, this._pingPongRenderTarget = null, this._lodMax = 0, this._cubeSize = 0, this._lodPlanes = [], this._sizeLods = [], this._sigmas = [], this._blurMaterial = null, this._cubemapMaterial = null, this._equirectMaterial = null, this._compileMaterial(this._blurMaterial);
  }
  /**
   * Generates a PMREM from a supplied Scene, which can be faster than using an
   * image if networking bandwidth is low. Optional sigma specifies a blur radius
   * in radians to be applied to the scene before PMREM generation. Optional near
   * and far planes ensure the scene is rendered in its entirety (the cubeCamera
   * is placed at the origin).
   */
  fromScene(e, t = 0, i = 0.1, r = 100) {
    Zr = this._renderer.getRenderTarget(), Jr = this._renderer.getActiveCubeFace(), $r = this._renderer.getActiveMipmapLevel(), jr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
    const s = this._allocateTargets();
    return s.depthBuffer = !0, this._sceneToCubeUV(e, i, r, s), t > 0 && this._blur(s, 0, 0, t), this._applyPMREM(s), this._cleanup(s), s;
  }
  /**
   * Generates a PMREM from an equirectangular texture, which can be either LDR
   * or HDR. The ideal input image size is 1k (1024 x 512),
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported equirectangular image size is 64 x 32.
   */
  fromEquirectangular(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Generates a PMREM from an cubemap texture, which can be either LDR
   * or HDR. The ideal input cube size is 256 x 256,
   * as this matches best with the 256 x 256 cubemap output.
   * The smallest supported cube size is 16 x 16.
   */
  fromCubemap(e, t = null) {
    return this._fromTexture(e, t);
  }
  /**
   * Pre-compiles the cubemap shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileCubemapShader() {
    this._cubemapMaterial === null && (this._cubemapMaterial = Za(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Ka(), this._compileMaterial(this._equirectMaterial));
  }
  /**
   * Disposes of the PMREMGenerator's internal memory. Note that PMREMGenerator is a static class,
   * so you should not need more than one PMREMGenerator object. If you do, calling dispose() on
   * one of them will cause any others to also become unusable.
   */
  dispose() {
    this._dispose(), this._cubemapMaterial !== null && this._cubemapMaterial.dispose(), this._equirectMaterial !== null && this._equirectMaterial.dispose();
  }
  // private interface
  _setSize(e) {
    this._lodMax = Math.floor(Math.log2(e)), this._cubeSize = Math.pow(2, this._lodMax);
  }
  _dispose() {
    this._blurMaterial !== null && this._blurMaterial.dispose(), this._pingPongRenderTarget !== null && this._pingPongRenderTarget.dispose();
    for (let e = 0; e < this._lodPlanes.length; e++)
      this._lodPlanes[e].dispose();
  }
  _cleanup(e) {
    this._renderer.setRenderTarget(Zr, Jr, $r), this._renderer.xr.enabled = jr, e.scissorTest = !1, Qn(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === Qi || e.mapping === en ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), Zr = this._renderer.getRenderTarget(), Jr = this._renderer.getActiveCubeFace(), $r = this._renderer.getActiveMipmapLevel(), jr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const i = t || this._allocateTargets();
    return this._textureToCubeUV(e, i), this._applyPMREM(i), this._cleanup(i), i;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, i = {
      magFilter: Lt,
      minFilter: Lt,
      generateMipmaps: !1,
      type: yn,
      format: Dt,
      colorSpace: ui,
      depthBuffer: !1
    }, r = Ya(e, t, i);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = Ya(e, t, i);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = Jf(s)), this._blurMaterial = $f(s, e, t);
    }
    return r;
  }
  _compileMaterial(e) {
    const t = new Jt(this._lodPlanes[0], e);
    this._renderer.compile(t, Kr);
  }
  _sceneToCubeUV(e, t, i, r) {
    const o = new At(90, 1, t, i), l = [1, -1, 1, 1, 1, 1], c = [1, 1, 1, -1, -1, -1], h = this._renderer, d = h.autoClear, f = h.toneMapping;
    h.getClearColor(Wa), h.toneMapping = li, h.autoClear = !1;
    const m = new Xo({
      name: "PMREM.Background",
      side: _t,
      depthWrite: !1,
      depthTest: !1
    }), g = new Jt(new Tn(), m);
    let v = !1;
    const p = e.background;
    p ? p.isColor && (m.color.copy(p), e.background = null, v = !0) : (m.color.copy(Wa), v = !0);
    for (let u = 0; u < 6; u++) {
      const b = u % 3;
      b === 0 ? (o.up.set(0, l[u], 0), o.lookAt(c[u], 0, 0)) : b === 1 ? (o.up.set(0, 0, l[u]), o.lookAt(0, c[u], 0)) : (o.up.set(0, l[u], 0), o.lookAt(0, 0, c[u]));
      const M = this._cubeSize;
      Qn(r, b * M, u > 2 ? M : 0, M, M), h.setRenderTarget(r), v && h.render(g, o), h.render(e, o);
    }
    g.geometry.dispose(), g.material.dispose(), h.toneMapping = f, h.autoClear = d, e.background = p;
  }
  _textureToCubeUV(e, t) {
    const i = this._renderer, r = e.mapping === Qi || e.mapping === en;
    r ? (this._cubemapMaterial === null && (this._cubemapMaterial = Za()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Ka());
    const s = r ? this._cubemapMaterial : this._equirectMaterial, a = new Jt(this._lodPlanes[0], s), o = s.uniforms;
    o.envMap.value = e;
    const l = this._cubeSize;
    Qn(t, 0, 0, 3 * l, 2 * l), i.setRenderTarget(t), i.render(a, Kr);
  }
  _applyPMREM(e) {
    const t = this._renderer, i = t.autoClear;
    t.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), o = Xa[(r - s - 1) % Xa.length];
      this._blur(e, s - 1, s, a, o);
    }
    t.autoClear = i;
  }
  /**
   * This is a two-pass Gaussian blur for a cubemap. Normally this is done
   * vertically and horizontally, but this breaks down on a cube. Here we apply
   * the blur latitudinally (around the poles), and then longitudinally (towards
   * the poles) to approximate the orthogonally-separable blur. It is least
   * accurate at the poles, but still does a decent job.
   */
  _blur(e, t, i, r, s) {
    const a = this._pingPongRenderTarget;
    this._halfBlur(
      e,
      a,
      t,
      i,
      r,
      "latitudinal",
      s
    ), this._halfBlur(
      a,
      e,
      i,
      i,
      r,
      "longitudinal",
      s
    );
  }
  _halfBlur(e, t, i, r, s, a, o) {
    const l = this._renderer, c = this._blurMaterial;
    a !== "latitudinal" && a !== "longitudinal" && console.error(
      "blur direction must be either latitudinal or longitudinal!"
    );
    const h = 3, d = new Jt(this._lodPlanes[r], c), f = c.uniforms, m = this._sizeLods[i] - 1, g = isFinite(s) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * Ei - 1), v = s / g, p = isFinite(s) ? 1 + Math.floor(h * v) : Ei;
    p > Ei && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${Ei}`);
    const u = [];
    let b = 0;
    for (let R = 0; R < Ei; ++R) {
      const I = R / v, E = Math.exp(-I * I / 2);
      u.push(E), R === 0 ? b += E : R < p && (b += 2 * E);
    }
    for (let R = 0; R < u.length; R++)
      u[R] = u[R] / b;
    f.envMap.value = e.texture, f.samples.value = p, f.weights.value = u, f.latitudinal.value = a === "latitudinal", o && (f.poleAxis.value = o);
    const { _lodMax: M } = this;
    f.dTheta.value = g, f.mipInt.value = M - i;
    const T = this._sizeLods[r], O = 3 * T * (r > M - Ki ? r - M + Ki : 0), w = 4 * (this._cubeSize - T);
    Qn(t, O, w, 3 * T, 2 * T), l.setRenderTarget(t), l.render(d, Kr);
  }
}
function Jf(n) {
  const e = [], t = [], i = [];
  let r = n;
  const s = n - Ki + 1 + ka.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    t.push(o);
    let l = 1 / o;
    a > n - Ki ? l = ka[a - n + Ki - 1] : a === 0 && (l = 0), i.push(l);
    const c = 1 / (o - 2), h = -c, d = 1 + c, f = [h, h, d, h, d, d, h, h, d, d, h, d], m = 6, g = 6, v = 3, p = 2, u = 1, b = new Float32Array(v * g * m), M = new Float32Array(p * g * m), T = new Float32Array(u * g * m);
    for (let w = 0; w < m; w++) {
      const R = w % 3 * 2 / 3 - 1, I = w > 2 ? 0 : -1, E = [
        R,
        I,
        0,
        R + 2 / 3,
        I,
        0,
        R + 2 / 3,
        I + 1,
        0,
        R,
        I,
        0,
        R + 2 / 3,
        I + 1,
        0,
        R,
        I + 1,
        0
      ];
      b.set(E, v * g * w), M.set(f, p * g * w);
      const x = [w, w, w, w, w, w];
      T.set(x, u * g * w);
    }
    const O = new fi();
    O.setAttribute("position", new Ot(b, v)), O.setAttribute("uv", new Ot(M, p)), O.setAttribute("faceIndex", new Ot(T, u)), e.push(O), r > Ki && r--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: i };
}
function Ya(n, e, t) {
  const i = new Ri(n, e, t);
  return i.texture.mapping = dr, i.texture.name = "PMREM.cubeUv", i.scissorTest = !0, i;
}
function Qn(n, e, t, i, r) {
  n.viewport.set(e, t, i, r), n.scissor.set(e, t, i, r);
}
function $f(n, e, t) {
  const i = new Float32Array(Ei), r = new L(0, 1, 0);
  return new hi({
    name: "SphericalGaussianBlur",
    defines: {
      n: Ei,
      CUBEUV_TEXEL_WIDTH: 1 / e,
      CUBEUV_TEXEL_HEIGHT: 1 / t,
      CUBEUV_MAX_MIP: `${n}.0`
    },
    uniforms: {
      envMap: { value: null },
      samples: { value: 1 },
      weights: { value: i },
      latitudinal: { value: !1 },
      dTheta: { value: 0 },
      mipInt: { value: 0 },
      poleAxis: { value: r }
    },
    vertexShader: ea(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`
    ),
    blending: oi,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ka() {
  return new hi({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: ea(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`
    ),
    blending: oi,
    depthTest: !1,
    depthWrite: !1
  });
}
function Za() {
  return new hi({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: ea(),
    fragmentShader: (
      /* glsl */
      `

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`
    ),
    blending: oi,
    depthTest: !1,
    depthWrite: !1
  });
}
function ea() {
  return (
    /* glsl */
    `

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`
  );
}
function jf(n) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function i(o) {
    if (o && o.isTexture) {
      const l = o.mapping, c = l === rs || l === ss, h = l === Qi || l === en;
      if (c || h) {
        let d = e.get(o);
        const f = d !== void 0 ? d.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== f)
          return t === null && (t = new qa(n)), d = c ? t.fromEquirectangular(o, d) : t.fromCubemap(o, d), d.texture.pmremVersion = o.pmremVersion, e.set(o, d), d.texture;
        if (d !== void 0)
          return d.texture;
        {
          const m = o.image;
          return c && m && m.height > 0 || h && m && r(m) ? (t === null && (t = new qa(n)), d = c ? t.fromEquirectangular(o) : t.fromCubemap(o), d.texture.pmremVersion = o.pmremVersion, e.set(o, d), o.addEventListener("dispose", s), d.texture) : null;
        }
      }
    }
    return o;
  }
  function r(o) {
    let l = 0;
    const c = 6;
    for (let h = 0; h < c; h++)
      o[h] !== void 0 && l++;
    return l === c;
  }
  function s(o) {
    const l = o.target;
    l.removeEventListener("dispose", s);
    const c = e.get(l);
    c !== void 0 && (e.delete(l), c.dispose());
  }
  function a() {
    e = /* @__PURE__ */ new WeakMap(), t !== null && (t.dispose(), t = null);
  }
  return {
    get: i,
    dispose: a
  };
}
function Qf(n) {
  const e = {};
  function t(i) {
    if (e[i] !== void 0)
      return e[i];
    let r;
    switch (i) {
      case "WEBGL_depth_texture":
        r = n.getExtension("WEBGL_depth_texture") || n.getExtension("MOZ_WEBGL_depth_texture") || n.getExtension("WEBKIT_WEBGL_depth_texture");
        break;
      case "EXT_texture_filter_anisotropic":
        r = n.getExtension("EXT_texture_filter_anisotropic") || n.getExtension("MOZ_EXT_texture_filter_anisotropic") || n.getExtension("WEBKIT_EXT_texture_filter_anisotropic");
        break;
      case "WEBGL_compressed_texture_s3tc":
        r = n.getExtension("WEBGL_compressed_texture_s3tc") || n.getExtension("MOZ_WEBGL_compressed_texture_s3tc") || n.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");
        break;
      case "WEBGL_compressed_texture_pvrtc":
        r = n.getExtension("WEBGL_compressed_texture_pvrtc") || n.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");
        break;
      default:
        r = n.getExtension(i);
    }
    return e[i] = r, r;
  }
  return {
    has: function(i) {
      return t(i) !== null;
    },
    init: function() {
      t("EXT_color_buffer_float"), t("WEBGL_clip_cull_distance"), t("OES_texture_float_linear"), t("EXT_color_buffer_half_float"), t("WEBGL_multisampled_render_to_texture"), t("WEBGL_render_shared_exponent");
    },
    get: function(i) {
      const r = t(i);
      return r === null && Lo("THREE.WebGLRenderer: " + i + " extension not supported."), r;
    }
  };
}
function ed(n, e, t, i) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(d) {
    const f = d.target;
    f.index !== null && e.remove(f.index);
    for (const g in f.attributes)
      e.remove(f.attributes[g]);
    for (const g in f.morphAttributes) {
      const v = f.morphAttributes[g];
      for (let p = 0, u = v.length; p < u; p++)
        e.remove(v[p]);
    }
    f.removeEventListener("dispose", a), delete r[f.id];
    const m = s.get(f);
    m && (e.remove(m), s.delete(f)), i.releaseStatesOfGeometry(f), f.isInstancedBufferGeometry === !0 && delete f._maxInstanceCount, t.memory.geometries--;
  }
  function o(d, f) {
    return r[f.id] === !0 || (f.addEventListener("dispose", a), r[f.id] = !0, t.memory.geometries++), f;
  }
  function l(d) {
    const f = d.attributes;
    for (const g in f)
      e.update(f[g], n.ARRAY_BUFFER);
    const m = d.morphAttributes;
    for (const g in m) {
      const v = m[g];
      for (let p = 0, u = v.length; p < u; p++)
        e.update(v[p], n.ARRAY_BUFFER);
    }
  }
  function c(d) {
    const f = [], m = d.index, g = d.attributes.position;
    let v = 0;
    if (m !== null) {
      const b = m.array;
      v = m.version;
      for (let M = 0, T = b.length; M < T; M += 3) {
        const O = b[M + 0], w = b[M + 1], R = b[M + 2];
        f.push(O, w, w, R, R, O);
      }
    } else if (g !== void 0) {
      const b = g.array;
      v = g.version;
      for (let M = 0, T = b.length / 3 - 1; M < T; M += 3) {
        const O = M + 0, w = M + 1, R = M + 2;
        f.push(O, w, w, R, R, O);
      }
    } else
      return;
    const p = new (Po(f) ? Uo : Do)(f, 1);
    p.version = v;
    const u = s.get(d);
    u && e.remove(u), s.set(d, p);
  }
  function h(d) {
    const f = s.get(d);
    if (f) {
      const m = d.index;
      m !== null && f.version < m.version && c(d);
    } else
      c(d);
    return s.get(d);
  }
  return {
    get: o,
    update: l,
    getWireframeAttribute: h
  };
}
function td(n, e, t) {
  let i;
  function r(f) {
    i = f;
  }
  let s, a;
  function o(f) {
    s = f.type, a = f.bytesPerElement;
  }
  function l(f, m) {
    n.drawElements(i, m, s, f * a), t.update(m, i, 1);
  }
  function c(f, m, g) {
    g !== 0 && (n.drawElementsInstanced(i, m, s, f * a, g), t.update(m, i, g));
  }
  function h(f, m, g) {
    if (g === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i, m, 0, s, f, 0, g);
    let p = 0;
    for (let u = 0; u < g; u++)
      p += m[u];
    t.update(p, i, 1);
  }
  function d(f, m, g, v) {
    if (g === 0) return;
    const p = e.get("WEBGL_multi_draw");
    if (p === null)
      for (let u = 0; u < f.length; u++)
        c(f[u] / a, m[u], v[u]);
    else {
      p.multiDrawElementsInstancedWEBGL(i, m, 0, s, f, 0, v, 0, g);
      let u = 0;
      for (let b = 0; b < g; b++)
        u += m[b];
      for (let b = 0; b < v.length; b++)
        t.update(u, i, v[b]);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = d;
}
function id(n) {
  const e = {
    geometries: 0,
    textures: 0
  }, t = {
    frame: 0,
    calls: 0,
    triangles: 0,
    points: 0,
    lines: 0
  };
  function i(s, a, o) {
    switch (t.calls++, a) {
      case n.TRIANGLES:
        t.triangles += o * (s / 3);
        break;
      case n.LINES:
        t.lines += o * (s / 2);
        break;
      case n.LINE_STRIP:
        t.lines += o * (s - 1);
        break;
      case n.LINE_LOOP:
        t.lines += o * s;
        break;
      case n.POINTS:
        t.points += o * s;
        break;
      default:
        console.error("THREE.WebGLInfo: Unknown draw mode:", a);
        break;
    }
  }
  function r() {
    t.calls = 0, t.triangles = 0, t.points = 0, t.lines = 0;
  }
  return {
    memory: e,
    render: t,
    programs: null,
    autoReset: !0,
    reset: r,
    update: i
  };
}
class Jo extends vt {
  constructor(e = null, t = 1, i = 1, r = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: i, depth: r }, this.magFilter = bt, this.minFilter = bt, this.wrapR = Ti, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
function nd(n, e, t) {
  const i = /* @__PURE__ */ new WeakMap(), r = new $e();
  function s(a, o, l) {
    const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, d = h !== void 0 ? h.length : 0;
    let f = i.get(o);
    if (f === void 0 || f.count !== d) {
      let E = function() {
        R.dispose(), i.delete(o), o.removeEventListener("dispose", E);
      };
      f !== void 0 && f.texture.dispose();
      const m = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, v = o.morphAttributes.color !== void 0, p = o.morphAttributes.position || [], u = o.morphAttributes.normal || [], b = o.morphAttributes.color || [];
      let M = 0;
      m === !0 && (M = 1), g === !0 && (M = 2), v === !0 && (M = 3);
      let T = o.attributes.position.count * M, O = 1;
      T > e.maxTextureSize && (O = Math.ceil(T / e.maxTextureSize), T = e.maxTextureSize);
      const w = new Float32Array(T * O * 4 * d), R = new Jo(w, T, O, d);
      R.type = Kt, R.needsUpdate = !0;
      const I = M * 4;
      for (let x = 0; x < d; x++) {
        const C = p[x], W = u[x], z = b[x], G = T * O * 4 * x;
        for (let K = 0; K < C.count; K++) {
          const H = K * I;
          m === !0 && (r.fromBufferAttribute(C, K), w[G + H + 0] = r.x, w[G + H + 1] = r.y, w[G + H + 2] = r.z, w[G + H + 3] = 0), g === !0 && (r.fromBufferAttribute(W, K), w[G + H + 4] = r.x, w[G + H + 5] = r.y, w[G + H + 6] = r.z, w[G + H + 7] = 0), v === !0 && (r.fromBufferAttribute(z, K), w[G + H + 8] = r.x, w[G + H + 9] = r.y, w[G + H + 10] = r.z, w[G + H + 11] = z.itemSize === 4 ? r.w : 1);
        }
      }
      f = {
        count: d,
        texture: R,
        size: new le(T, O)
      }, i.set(o, f), o.addEventListener("dispose", E);
    }
    if (a.isInstancedMesh === !0 && a.morphTexture !== null)
      l.getUniforms().setValue(n, "morphTexture", a.morphTexture, t);
    else {
      let m = 0;
      for (let v = 0; v < c.length; v++)
        m += c[v];
      const g = o.morphTargetsRelative ? 1 : 1 - m;
      l.getUniforms().setValue(n, "morphTargetBaseInfluence", g), l.getUniforms().setValue(n, "morphTargetInfluences", c);
    }
    l.getUniforms().setValue(n, "morphTargetsTexture", f.texture, t), l.getUniforms().setValue(n, "morphTargetsTextureSize", f.size);
  }
  return {
    update: s
  };
}
function rd(n, e, t, i) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = i.render.frame, h = l.geometry, d = e.get(l, h);
    if (r.get(d) !== c && (e.update(d), r.set(d, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), r.get(l) !== c && (t.update(l.instanceMatrix, n.ARRAY_BUFFER), l.instanceColor !== null && t.update(l.instanceColor, n.ARRAY_BUFFER), r.set(l, c))), l.isSkinnedMesh) {
      const f = l.skeleton;
      r.get(f) !== c && (f.update(), r.set(f, c));
    }
    return d;
  }
  function a() {
    r = /* @__PURE__ */ new WeakMap();
  }
  function o(l) {
    const c = l.target;
    c.removeEventListener("dispose", o), t.remove(c.instanceMatrix), c.instanceColor !== null && t.remove(c.instanceColor);
  }
  return {
    update: s,
    dispose: a
  };
}
class sd extends vt {
  constructor(e = null, t = 1, i = 1, r = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: i, depth: r }, this.magFilter = bt, this.minFilter = bt, this.wrapR = Ti, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class $o extends vt {
  constructor(e, t, i, r, s, a, o, l, c, h = Ji) {
    if (h !== Ji && h !== nn)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    i === void 0 && h === Ji && (i = bi), i === void 0 && h === nn && (i = tn), super(null, r, s, a, o, l, h, i, c), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.magFilter = o !== void 0 ? o : bt, this.minFilter = l !== void 0 ? l : bt, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
const jo = /* @__PURE__ */ new vt(), Ja = /* @__PURE__ */ new $o(1, 1), Qo = /* @__PURE__ */ new Jo(), el = /* @__PURE__ */ new sd(), tl = /* @__PURE__ */ new Zo(), $a = [], ja = [], Qa = new Float32Array(16), eo = new Float32Array(9), to = new Float32Array(4);
function on(n, e, t) {
  const i = n[0];
  if (i <= 0 || i > 0) return n;
  const r = e * t;
  let s = $a[r];
  if (s === void 0 && (s = new Float32Array(r), $a[r] = s), e !== 0) {
    i.toArray(s, 0);
    for (let a = 1, o = 0; a !== e; ++a)
      o += t, n[a].toArray(s, o);
  }
  return s;
}
function at(n, e) {
  if (n.length !== e.length) return !1;
  for (let t = 0, i = n.length; t < i; t++)
    if (n[t] !== e[t]) return !1;
  return !0;
}
function ot(n, e) {
  for (let t = 0, i = e.length; t < i; t++)
    n[t] = e[t];
}
function _r(n, e) {
  let t = ja[e];
  t === void 0 && (t = new Int32Array(e), ja[e] = t);
  for (let i = 0; i !== e; ++i)
    t[i] = n.allocateTextureUnit();
  return t;
}
function ad(n, e) {
  const t = this.cache;
  t[0] !== e && (n.uniform1f(this.addr, e), t[0] = e);
}
function od(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (n.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (at(t, e)) return;
    n.uniform2fv(this.addr, e), ot(t, e);
  }
}
function ld(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (n.uniform3f(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else if (e.r !== void 0)
    (t[0] !== e.r || t[1] !== e.g || t[2] !== e.b) && (n.uniform3f(this.addr, e.r, e.g, e.b), t[0] = e.r, t[1] = e.g, t[2] = e.b);
  else {
    if (at(t, e)) return;
    n.uniform3fv(this.addr, e), ot(t, e);
  }
}
function cd(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (n.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (at(t, e)) return;
    n.uniform4fv(this.addr, e), ot(t, e);
  }
}
function hd(n, e) {
  const t = this.cache, i = e.elements;
  if (i === void 0) {
    if (at(t, e)) return;
    n.uniformMatrix2fv(this.addr, !1, e), ot(t, e);
  } else {
    if (at(t, i)) return;
    to.set(i), n.uniformMatrix2fv(this.addr, !1, to), ot(t, i);
  }
}
function ud(n, e) {
  const t = this.cache, i = e.elements;
  if (i === void 0) {
    if (at(t, e)) return;
    n.uniformMatrix3fv(this.addr, !1, e), ot(t, e);
  } else {
    if (at(t, i)) return;
    eo.set(i), n.uniformMatrix3fv(this.addr, !1, eo), ot(t, i);
  }
}
function fd(n, e) {
  const t = this.cache, i = e.elements;
  if (i === void 0) {
    if (at(t, e)) return;
    n.uniformMatrix4fv(this.addr, !1, e), ot(t, e);
  } else {
    if (at(t, i)) return;
    Qa.set(i), n.uniformMatrix4fv(this.addr, !1, Qa), ot(t, i);
  }
}
function dd(n, e) {
  const t = this.cache;
  t[0] !== e && (n.uniform1i(this.addr, e), t[0] = e);
}
function pd(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (n.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (at(t, e)) return;
    n.uniform2iv(this.addr, e), ot(t, e);
  }
}
function md(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (n.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (at(t, e)) return;
    n.uniform3iv(this.addr, e), ot(t, e);
  }
}
function gd(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (n.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (at(t, e)) return;
    n.uniform4iv(this.addr, e), ot(t, e);
  }
}
function _d(n, e) {
  const t = this.cache;
  t[0] !== e && (n.uniform1ui(this.addr, e), t[0] = e);
}
function vd(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (n.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (at(t, e)) return;
    n.uniform2uiv(this.addr, e), ot(t, e);
  }
}
function xd(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (n.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (at(t, e)) return;
    n.uniform3uiv(this.addr, e), ot(t, e);
  }
}
function Md(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (n.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (at(t, e)) return;
    n.uniform4uiv(this.addr, e), ot(t, e);
  }
}
function Sd(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r);
  let s;
  this.type === n.SAMPLER_2D_SHADOW ? (Ja.compareFunction = Ro, s = Ja) : s = jo, t.setTexture2D(e || s, r);
}
function yd(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r), t.setTexture3D(e || el, r);
}
function Ed(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r), t.setTextureCube(e || tl, r);
}
function Td(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r), t.setTexture2DArray(e || Qo, r);
}
function Ad(n) {
  switch (n) {
    case 5126:
      return ad;
    case 35664:
      return od;
    case 35665:
      return ld;
    case 35666:
      return cd;
    case 35674:
      return hd;
    case 35675:
      return ud;
    case 35676:
      return fd;
    case 5124:
    case 35670:
      return dd;
    case 35667:
    case 35671:
      return pd;
    case 35668:
    case 35672:
      return md;
    case 35669:
    case 35673:
      return gd;
    case 5125:
      return _d;
    case 36294:
      return vd;
    case 36295:
      return xd;
    case 36296:
      return Md;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Sd;
    case 35679:
    case 36299:
    case 36307:
      return yd;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Ed;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Td;
  }
}
function bd(n, e) {
  n.uniform1fv(this.addr, e);
}
function wd(n, e) {
  const t = on(e, this.size, 2);
  n.uniform2fv(this.addr, t);
}
function Rd(n, e) {
  const t = on(e, this.size, 3);
  n.uniform3fv(this.addr, t);
}
function Cd(n, e) {
  const t = on(e, this.size, 4);
  n.uniform4fv(this.addr, t);
}
function Pd(n, e) {
  const t = on(e, this.size, 4);
  n.uniformMatrix2fv(this.addr, !1, t);
}
function Ld(n, e) {
  const t = on(e, this.size, 9);
  n.uniformMatrix3fv(this.addr, !1, t);
}
function Dd(n, e) {
  const t = on(e, this.size, 16);
  n.uniformMatrix4fv(this.addr, !1, t);
}
function Ud(n, e) {
  n.uniform1iv(this.addr, e);
}
function Id(n, e) {
  n.uniform2iv(this.addr, e);
}
function Nd(n, e) {
  n.uniform3iv(this.addr, e);
}
function Fd(n, e) {
  n.uniform4iv(this.addr, e);
}
function Od(n, e) {
  n.uniform1uiv(this.addr, e);
}
function Bd(n, e) {
  n.uniform2uiv(this.addr, e);
}
function zd(n, e) {
  n.uniform3uiv(this.addr, e);
}
function Hd(n, e) {
  n.uniform4uiv(this.addr, e);
}
function Gd(n, e, t) {
  const i = this.cache, r = e.length, s = _r(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2D(e[a] || jo, s[a]);
}
function Vd(n, e, t) {
  const i = this.cache, r = e.length, s = _r(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture3D(e[a] || el, s[a]);
}
function kd(n, e, t) {
  const i = this.cache, r = e.length, s = _r(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTextureCube(e[a] || tl, s[a]);
}
function Wd(n, e, t) {
  const i = this.cache, r = e.length, s = _r(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2DArray(e[a] || Qo, s[a]);
}
function Xd(n) {
  switch (n) {
    case 5126:
      return bd;
    case 35664:
      return wd;
    case 35665:
      return Rd;
    case 35666:
      return Cd;
    case 35674:
      return Pd;
    case 35675:
      return Ld;
    case 35676:
      return Dd;
    case 5124:
    case 35670:
      return Ud;
    case 35667:
    case 35671:
      return Id;
    case 35668:
    case 35672:
      return Nd;
    case 35669:
    case 35673:
      return Fd;
    case 5125:
      return Od;
    case 36294:
      return Bd;
    case 36295:
      return zd;
    case 36296:
      return Hd;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Gd;
    case 35679:
    case 36299:
    case 36307:
      return Vd;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return kd;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return Wd;
  }
}
class qd {
  constructor(e, t, i) {
    this.id = e, this.addr = i, this.cache = [], this.type = t.type, this.setValue = Ad(t.type);
  }
}
class Yd {
  constructor(e, t, i) {
    this.id = e, this.addr = i, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = Xd(t.type);
  }
}
class Kd {
  constructor(e) {
    this.id = e, this.seq = [], this.map = {};
  }
  setValue(e, t, i) {
    const r = this.seq;
    for (let s = 0, a = r.length; s !== a; ++s) {
      const o = r[s];
      o.setValue(e, t[o.id], i);
    }
  }
}
const Qr = /(\w+)(\])?(\[|\.)?/g;
function io(n, e) {
  n.seq.push(e), n.map[e.id] = e;
}
function Zd(n, e, t) {
  const i = n.name, r = i.length;
  for (Qr.lastIndex = 0; ; ) {
    const s = Qr.exec(i), a = Qr.lastIndex;
    let o = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === r) {
      io(t, c === void 0 ? new qd(o, n, e) : new Yd(o, n, e));
      break;
    } else {
      let d = t.map[o];
      d === void 0 && (d = new Kd(o), io(t, d)), t = d;
    }
  }
}
class ar {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const i = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let r = 0; r < i; ++r) {
      const s = e.getActiveUniform(t, r), a = e.getUniformLocation(t, s.name);
      Zd(s, a, this);
    }
  }
  setValue(e, t, i, r) {
    const s = this.map[t];
    s !== void 0 && s.setValue(e, i, r);
  }
  setOptional(e, t, i) {
    const r = t[i];
    r !== void 0 && this.setValue(e, i, r);
  }
  static upload(e, t, i, r) {
    for (let s = 0, a = t.length; s !== a; ++s) {
      const o = t[s], l = i[o.id];
      l.needsUpdate !== !1 && o.setValue(e, l.value, r);
    }
  }
  static seqWithValue(e, t) {
    const i = [];
    for (let r = 0, s = e.length; r !== s; ++r) {
      const a = e[r];
      a.id in t && i.push(a);
    }
    return i;
  }
}
function no(n, e, t) {
  const i = n.createShader(e);
  return n.shaderSource(i, t), n.compileShader(i), i;
}
const Jd = 37297;
let $d = 0;
function jd(n, e) {
  const t = n.split(`
`), i = [], r = Math.max(e - 6, 0), s = Math.min(e + 6, t.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    i.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return i.join(`
`);
}
function Qd(n) {
  const e = Ze.getPrimaries(Ze.workingColorSpace), t = Ze.getPrimaries(n);
  let i;
  switch (e === t ? i = "" : e === hr && t === cr ? i = "LinearDisplayP3ToLinearSRGB" : e === cr && t === hr && (i = "LinearSRGBToLinearDisplayP3"), n) {
    case ui:
    case pr:
      return [i, "LinearTransferOETF"];
    case It:
    case qs:
      return [i, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", n), [i, "LinearTransferOETF"];
  }
}
function ro(n, e, t) {
  const i = n.getShaderParameter(e, n.COMPILE_STATUS), r = n.getShaderInfoLog(e).trim();
  if (i && r === "") return "";
  const s = /ERROR: 0:(\d+)/.exec(r);
  if (s) {
    const a = parseInt(s[1]);
    return t.toUpperCase() + `

` + r + `

` + jd(n.getShaderSource(e), a);
  } else
    return r;
}
function ep(n, e) {
  const t = Qd(e);
  return `vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function tp(n, e) {
  let t;
  switch (e) {
    case Bl:
      t = "Linear";
      break;
    case zl:
      t = "Reinhard";
      break;
    case Hl:
      t = "OptimizedCineon";
      break;
    case Gl:
      t = "ACESFilmic";
      break;
    case kl:
      t = "AgX";
      break;
    case Wl:
      t = "Neutral";
      break;
    case Vl:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + n + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
function ip(n) {
  return [
    n.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    n.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(pn).join(`
`);
}
function np(n) {
  const e = [];
  for (const t in n) {
    const i = n[t];
    i !== !1 && e.push("#define " + t + " " + i);
  }
  return e.join(`
`);
}
function rp(n, e) {
  const t = {}, i = n.getProgramParameter(e, n.ACTIVE_ATTRIBUTES);
  for (let r = 0; r < i; r++) {
    const s = n.getActiveAttrib(e, r), a = s.name;
    let o = 1;
    s.type === n.FLOAT_MAT2 && (o = 2), s.type === n.FLOAT_MAT3 && (o = 3), s.type === n.FLOAT_MAT4 && (o = 4), t[a] = {
      type: s.type,
      location: n.getAttribLocation(e, a),
      locationSize: o
    };
  }
  return t;
}
function pn(n) {
  return n !== "";
}
function so(n, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return n.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function ao(n, e) {
  return n.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const sp = /^[ \t]*#include +<([\w\d./]+)>/gm;
function zs(n) {
  return n.replace(sp, op);
}
const ap = /* @__PURE__ */ new Map();
function op(n, e) {
  let t = Fe[e];
  if (t === void 0) {
    const i = ap.get(e);
    if (i !== void 0)
      t = Fe[i], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, i);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return zs(t);
}
const lp = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function oo(n) {
  return n.replace(lp, cp);
}
function cp(n, e, t, i) {
  let r = "";
  for (let s = parseInt(e); s < parseInt(t); s++)
    r += i.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function lo(n) {
  let e = `precision ${n.precision} float;
	precision ${n.precision} int;
	precision ${n.precision} sampler2D;
	precision ${n.precision} samplerCube;
	precision ${n.precision} sampler3D;
	precision ${n.precision} sampler2DArray;
	precision ${n.precision} sampler2DShadow;
	precision ${n.precision} samplerCubeShadow;
	precision ${n.precision} sampler2DArrayShadow;
	precision ${n.precision} isampler2D;
	precision ${n.precision} isampler3D;
	precision ${n.precision} isamplerCube;
	precision ${n.precision} isampler2DArray;
	precision ${n.precision} usampler2D;
	precision ${n.precision} usampler3D;
	precision ${n.precision} usamplerCube;
	precision ${n.precision} usampler2DArray;
	`;
  return n.precision === "highp" ? e += `
#define HIGH_PRECISION` : n.precision === "mediump" ? e += `
#define MEDIUM_PRECISION` : n.precision === "lowp" && (e += `
#define LOW_PRECISION`), e;
}
function hp(n) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return n.shadowMapType === po ? e = "SHADOWMAP_TYPE_PCF" : n.shadowMapType === hl ? e = "SHADOWMAP_TYPE_PCF_SOFT" : n.shadowMapType === qt && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function up(n) {
  let e = "ENVMAP_TYPE_CUBE";
  if (n.envMap)
    switch (n.envMapMode) {
      case Qi:
      case en:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case dr:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function fp(n) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (n.envMap)
    switch (n.envMapMode) {
      case en:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function dp(n) {
  let e = "ENVMAP_BLENDING_NONE";
  if (n.envMap)
    switch (n.combine) {
      case mo:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case Fl:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case Ol:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function pp(n) {
  const e = n.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, i = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: i, maxMip: t };
}
function mp(n, e, t, i) {
  const r = n.getContext(), s = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const l = hp(t), c = up(t), h = fp(t), d = dp(t), f = pp(t), m = ip(t), g = np(s), v = r.createProgram();
  let p, u, b = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(pn).join(`
`), p.length > 0 && (p += `
`), u = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(pn).join(`
`), u.length > 0 && (u += `
`)) : (p = [
    lo(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.extensionClipCullDistance ? "#define USE_CLIP_DISTANCE" : "",
    t.batching ? "#define USE_BATCHING" : "",
    t.batchingColor ? "#define USE_BATCHING_COLOR" : "",
    t.instancing ? "#define USE_INSTANCING" : "",
    t.instancingColor ? "#define USE_INSTANCING_COLOR" : "",
    t.instancingMorph ? "#define USE_INSTANCING_MORPH" : "",
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.map ? "#define USE_MAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + h : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.displacementMap ? "#define USE_DISPLACEMENTMAP" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    //
    t.mapUv ? "#define MAP_UV " + t.mapUv : "",
    t.alphaMapUv ? "#define ALPHAMAP_UV " + t.alphaMapUv : "",
    t.lightMapUv ? "#define LIGHTMAP_UV " + t.lightMapUv : "",
    t.aoMapUv ? "#define AOMAP_UV " + t.aoMapUv : "",
    t.emissiveMapUv ? "#define EMISSIVEMAP_UV " + t.emissiveMapUv : "",
    t.bumpMapUv ? "#define BUMPMAP_UV " + t.bumpMapUv : "",
    t.normalMapUv ? "#define NORMALMAP_UV " + t.normalMapUv : "",
    t.displacementMapUv ? "#define DISPLACEMENTMAP_UV " + t.displacementMapUv : "",
    t.metalnessMapUv ? "#define METALNESSMAP_UV " + t.metalnessMapUv : "",
    t.roughnessMapUv ? "#define ROUGHNESSMAP_UV " + t.roughnessMapUv : "",
    t.anisotropyMapUv ? "#define ANISOTROPYMAP_UV " + t.anisotropyMapUv : "",
    t.clearcoatMapUv ? "#define CLEARCOATMAP_UV " + t.clearcoatMapUv : "",
    t.clearcoatNormalMapUv ? "#define CLEARCOAT_NORMALMAP_UV " + t.clearcoatNormalMapUv : "",
    t.clearcoatRoughnessMapUv ? "#define CLEARCOAT_ROUGHNESSMAP_UV " + t.clearcoatRoughnessMapUv : "",
    t.iridescenceMapUv ? "#define IRIDESCENCEMAP_UV " + t.iridescenceMapUv : "",
    t.iridescenceThicknessMapUv ? "#define IRIDESCENCE_THICKNESSMAP_UV " + t.iridescenceThicknessMapUv : "",
    t.sheenColorMapUv ? "#define SHEEN_COLORMAP_UV " + t.sheenColorMapUv : "",
    t.sheenRoughnessMapUv ? "#define SHEEN_ROUGHNESSMAP_UV " + t.sheenRoughnessMapUv : "",
    t.specularMapUv ? "#define SPECULARMAP_UV " + t.specularMapUv : "",
    t.specularColorMapUv ? "#define SPECULAR_COLORMAP_UV " + t.specularColorMapUv : "",
    t.specularIntensityMapUv ? "#define SPECULAR_INTENSITYMAP_UV " + t.specularIntensityMapUv : "",
    t.transmissionMapUv ? "#define TRANSMISSIONMAP_UV " + t.transmissionMapUv : "",
    t.thicknessMapUv ? "#define THICKNESSMAP_UV " + t.thicknessMapUv : "",
    //
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.skinning ? "#define USE_SKINNING" : "",
    t.morphTargets ? "#define USE_MORPHTARGETS" : "",
    t.morphNormals && t.flatShading === !1 ? "#define USE_MORPHNORMALS" : "",
    t.morphColors ? "#define USE_MORPHCOLORS" : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_TEXTURE_STRIDE " + t.morphTextureStride : "",
    t.morphTargetsCount > 0 ? "#define MORPHTARGETS_COUNT " + t.morphTargetsCount : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.sizeAttenuation ? "#define USE_SIZEATTENUATION" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    "uniform mat4 modelMatrix;",
    "uniform mat4 modelViewMatrix;",
    "uniform mat4 projectionMatrix;",
    "uniform mat4 viewMatrix;",
    "uniform mat3 normalMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    "#ifdef USE_INSTANCING",
    "	attribute mat4 instanceMatrix;",
    "#endif",
    "#ifdef USE_INSTANCING_COLOR",
    "	attribute vec3 instanceColor;",
    "#endif",
    "#ifdef USE_INSTANCING_MORPH",
    "	uniform sampler2D morphTexture;",
    "#endif",
    "attribute vec3 position;",
    "attribute vec3 normal;",
    "attribute vec2 uv;",
    "#ifdef USE_UV1",
    "	attribute vec2 uv1;",
    "#endif",
    "#ifdef USE_UV2",
    "	attribute vec2 uv2;",
    "#endif",
    "#ifdef USE_UV3",
    "	attribute vec2 uv3;",
    "#endif",
    "#ifdef USE_TANGENT",
    "	attribute vec4 tangent;",
    "#endif",
    "#if defined( USE_COLOR_ALPHA )",
    "	attribute vec4 color;",
    "#elif defined( USE_COLOR )",
    "	attribute vec3 color;",
    "#endif",
    "#ifdef USE_SKINNING",
    "	attribute vec4 skinIndex;",
    "	attribute vec4 skinWeight;",
    "#endif",
    `
`
  ].filter(pn).join(`
`), u = [
    lo(t),
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g,
    t.useFog && t.fog ? "#define USE_FOG" : "",
    t.useFog && t.fogExp2 ? "#define FOG_EXP2" : "",
    t.alphaToCoverage ? "#define ALPHA_TO_COVERAGE" : "",
    t.map ? "#define USE_MAP" : "",
    t.matcap ? "#define USE_MATCAP" : "",
    t.envMap ? "#define USE_ENVMAP" : "",
    t.envMap ? "#define " + c : "",
    t.envMap ? "#define " + h : "",
    t.envMap ? "#define " + d : "",
    f ? "#define CUBEUV_TEXEL_WIDTH " + f.texelWidth : "",
    f ? "#define CUBEUV_TEXEL_HEIGHT " + f.texelHeight : "",
    f ? "#define CUBEUV_MAX_MIP " + f.maxMip + ".0" : "",
    t.lightMap ? "#define USE_LIGHTMAP" : "",
    t.aoMap ? "#define USE_AOMAP" : "",
    t.bumpMap ? "#define USE_BUMPMAP" : "",
    t.normalMap ? "#define USE_NORMALMAP" : "",
    t.normalMapObjectSpace ? "#define USE_NORMALMAP_OBJECTSPACE" : "",
    t.normalMapTangentSpace ? "#define USE_NORMALMAP_TANGENTSPACE" : "",
    t.emissiveMap ? "#define USE_EMISSIVEMAP" : "",
    t.anisotropy ? "#define USE_ANISOTROPY" : "",
    t.anisotropyMap ? "#define USE_ANISOTROPYMAP" : "",
    t.clearcoat ? "#define USE_CLEARCOAT" : "",
    t.clearcoatMap ? "#define USE_CLEARCOATMAP" : "",
    t.clearcoatRoughnessMap ? "#define USE_CLEARCOAT_ROUGHNESSMAP" : "",
    t.clearcoatNormalMap ? "#define USE_CLEARCOAT_NORMALMAP" : "",
    t.dispersion ? "#define USE_DISPERSION" : "",
    t.iridescence ? "#define USE_IRIDESCENCE" : "",
    t.iridescenceMap ? "#define USE_IRIDESCENCEMAP" : "",
    t.iridescenceThicknessMap ? "#define USE_IRIDESCENCE_THICKNESSMAP" : "",
    t.specularMap ? "#define USE_SPECULARMAP" : "",
    t.specularColorMap ? "#define USE_SPECULAR_COLORMAP" : "",
    t.specularIntensityMap ? "#define USE_SPECULAR_INTENSITYMAP" : "",
    t.roughnessMap ? "#define USE_ROUGHNESSMAP" : "",
    t.metalnessMap ? "#define USE_METALNESSMAP" : "",
    t.alphaMap ? "#define USE_ALPHAMAP" : "",
    t.alphaTest ? "#define USE_ALPHATEST" : "",
    t.alphaHash ? "#define USE_ALPHAHASH" : "",
    t.sheen ? "#define USE_SHEEN" : "",
    t.sheenColorMap ? "#define USE_SHEEN_COLORMAP" : "",
    t.sheenRoughnessMap ? "#define USE_SHEEN_ROUGHNESSMAP" : "",
    t.transmission ? "#define USE_TRANSMISSION" : "",
    t.transmissionMap ? "#define USE_TRANSMISSIONMAP" : "",
    t.thicknessMap ? "#define USE_THICKNESSMAP" : "",
    t.vertexTangents && t.flatShading === !1 ? "#define USE_TANGENT" : "",
    t.vertexColors || t.instancingColor || t.batchingColor ? "#define USE_COLOR" : "",
    t.vertexAlphas ? "#define USE_COLOR_ALPHA" : "",
    t.vertexUv1s ? "#define USE_UV1" : "",
    t.vertexUv2s ? "#define USE_UV2" : "",
    t.vertexUv3s ? "#define USE_UV3" : "",
    t.pointsUvs ? "#define USE_POINTS_UV" : "",
    t.gradientMap ? "#define USE_GRADIENTMAP" : "",
    t.flatShading ? "#define FLAT_SHADED" : "",
    t.doubleSided ? "#define DOUBLE_SIDED" : "",
    t.flipSided ? "#define FLIP_SIDED" : "",
    t.shadowMapEnabled ? "#define USE_SHADOWMAP" : "",
    t.shadowMapEnabled ? "#define " + l : "",
    t.premultipliedAlpha ? "#define PREMULTIPLIED_ALPHA" : "",
    t.numLightProbes > 0 ? "#define USE_LIGHT_PROBES" : "",
    t.decodeVideoTexture ? "#define DECODE_VIDEO_TEXTURE" : "",
    t.logarithmicDepthBuffer ? "#define USE_LOGDEPTHBUF" : "",
    "uniform mat4 viewMatrix;",
    "uniform vec3 cameraPosition;",
    "uniform bool isOrthographic;",
    t.toneMapping !== li ? "#define TONE_MAPPING" : "",
    t.toneMapping !== li ? Fe.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== li ? tp("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    Fe.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    ep("linearToOutputTexel", t.outputColorSpace),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(pn).join(`
`)), a = zs(a), a = so(a, t), a = ao(a, t), o = zs(o), o = so(o, t), o = ao(o, t), a = oo(a), o = oo(o), t.isRawShaderMaterial !== !0 && (b = `#version 300 es
`, p = [
    m,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, u = [
    "#define varying in",
    t.glslVersion === ma ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === ma ? "" : "#define gl_FragColor pc_fragColor",
    "#define gl_FragDepthEXT gl_FragDepth",
    "#define texture2D texture",
    "#define textureCube texture",
    "#define texture2DProj textureProj",
    "#define texture2DLodEXT textureLod",
    "#define texture2DProjLodEXT textureProjLod",
    "#define textureCubeLodEXT textureLod",
    "#define texture2DGradEXT textureGrad",
    "#define texture2DProjGradEXT textureProjGrad",
    "#define textureCubeGradEXT textureGrad"
  ].join(`
`) + `
` + u);
  const M = b + p + a, T = b + u + o, O = no(r, r.VERTEX_SHADER, M), w = no(r, r.FRAGMENT_SHADER, T);
  r.attachShader(v, O), r.attachShader(v, w), t.index0AttributeName !== void 0 ? r.bindAttribLocation(v, 0, t.index0AttributeName) : t.morphTargets === !0 && r.bindAttribLocation(v, 0, "position"), r.linkProgram(v);
  function R(C) {
    if (n.debug.checkShaderErrors) {
      const W = r.getProgramInfoLog(v).trim(), z = r.getShaderInfoLog(O).trim(), G = r.getShaderInfoLog(w).trim();
      let K = !0, H = !0;
      if (r.getProgramParameter(v, r.LINK_STATUS) === !1)
        if (K = !1, typeof n.debug.onShaderError == "function")
          n.debug.onShaderError(r, v, O, w);
        else {
          const Q = ro(r, O, "vertex"), V = ro(r, w, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(v, r.VALIDATE_STATUS) + `

Material Name: ` + C.name + `
Material Type: ` + C.type + `

Program Info Log: ` + W + `
` + Q + `
` + V
          );
        }
      else W !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", W) : (z === "" || G === "") && (H = !1);
      H && (C.diagnostics = {
        runnable: K,
        programLog: W,
        vertexShader: {
          log: z,
          prefix: p
        },
        fragmentShader: {
          log: G,
          prefix: u
        }
      });
    }
    r.deleteShader(O), r.deleteShader(w), I = new ar(r, v), E = rp(r, v);
  }
  let I;
  this.getUniforms = function() {
    return I === void 0 && R(this), I;
  };
  let E;
  this.getAttributes = function() {
    return E === void 0 && R(this), E;
  };
  let x = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return x === !1 && (x = r.getProgramParameter(v, Jd)), x;
  }, this.destroy = function() {
    i.releaseStatesOfProgram(this), r.deleteProgram(v), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = $d++, this.cacheKey = e, this.usedTimes = 1, this.program = v, this.vertexShader = O, this.fragmentShader = w, this;
}
let gp = 0;
class _p {
  constructor() {
    this.shaderCache = /* @__PURE__ */ new Map(), this.materialCache = /* @__PURE__ */ new Map();
  }
  update(e) {
    const t = e.vertexShader, i = e.fragmentShader, r = this._getShaderStage(t), s = this._getShaderStage(i), a = this._getShaderCacheForMaterial(e);
    return a.has(r) === !1 && (a.add(r), r.usedTimes++), a.has(s) === !1 && (a.add(s), s.usedTimes++), this;
  }
  remove(e) {
    const t = this.materialCache.get(e);
    for (const i of t)
      i.usedTimes--, i.usedTimes === 0 && this.shaderCache.delete(i.code);
    return this.materialCache.delete(e), this;
  }
  getVertexShaderID(e) {
    return this._getShaderStage(e.vertexShader).id;
  }
  getFragmentShaderID(e) {
    return this._getShaderStage(e.fragmentShader).id;
  }
  dispose() {
    this.shaderCache.clear(), this.materialCache.clear();
  }
  _getShaderCacheForMaterial(e) {
    const t = this.materialCache;
    let i = t.get(e);
    return i === void 0 && (i = /* @__PURE__ */ new Set(), t.set(e, i)), i;
  }
  _getShaderStage(e) {
    const t = this.shaderCache;
    let i = t.get(e);
    return i === void 0 && (i = new vp(e), t.set(e, i)), i;
  }
}
class vp {
  constructor(e) {
    this.id = gp++, this.code = e, this.usedTimes = 0;
  }
}
function xp(n, e, t, i, r, s, a) {
  const o = new Ys(), l = new _p(), c = /* @__PURE__ */ new Set(), h = [], d = r.logarithmicDepthBuffer, f = r.vertexTextures;
  let m = r.precision;
  const g = {
    MeshDepthMaterial: "depth",
    MeshDistanceMaterial: "distanceRGBA",
    MeshNormalMaterial: "normal",
    MeshBasicMaterial: "basic",
    MeshLambertMaterial: "lambert",
    MeshPhongMaterial: "phong",
    MeshToonMaterial: "toon",
    MeshStandardMaterial: "physical",
    MeshPhysicalMaterial: "physical",
    MeshMatcapMaterial: "matcap",
    LineBasicMaterial: "basic",
    LineDashedMaterial: "dashed",
    PointsMaterial: "points",
    ShadowMaterial: "shadow",
    SpriteMaterial: "sprite"
  };
  function v(E) {
    return c.add(E), E === 0 ? "uv" : `uv${E}`;
  }
  function p(E, x, C, W, z) {
    const G = W.fog, K = z.geometry, H = E.isMeshStandardMaterial ? W.environment : null, Q = (E.isMeshStandardMaterial ? t : e).get(E.envMap || H), V = Q && Q.mapping === dr ? Q.image.height : null, de = g[E.type];
    E.precision !== null && (m = r.getMaxPrecision(E.precision), m !== E.precision && console.warn("THREE.WebGLProgram.getParameters:", E.precision, "not supported, using", m, "instead."));
    const xe = K.morphAttributes.position || K.morphAttributes.normal || K.morphAttributes.color, me = xe !== void 0 ? xe.length : 0;
    let Be = 0;
    K.morphAttributes.position !== void 0 && (Be = 1), K.morphAttributes.normal !== void 0 && (Be = 2), K.morphAttributes.color !== void 0 && (Be = 3);
    let We, k, ee, _e;
    if (de) {
      const Xe = Nt[de];
      We = Xe.vertexShader, k = Xe.fragmentShader;
    } else
      We = E.vertexShader, k = E.fragmentShader, l.update(E), ee = l.getVertexShaderID(E), _e = l.getFragmentShaderID(E);
    const ce = n.getRenderTarget(), Ce = z.isInstancedMesh === !0, Ne = z.isBatchedMesh === !0, Pe = !!E.map, Ve = !!E.matcap, y = !!Q, ie = !!E.aoMap, j = !!E.lightMap, he = !!E.bumpMap, X = !!E.normalMap, Ae = !!E.displacementMap, ue = !!E.emissiveMap, ve = !!E.metalnessMap, A = !!E.roughnessMap, _ = E.anisotropy > 0, F = E.clearcoat > 0, $ = E.dispersion > 0, J = E.iridescence > 0, Z = E.sheen > 0, Te = E.transmission > 0, ae = _ && !!E.anisotropyMap, ge = F && !!E.clearcoatMap, Ie = F && !!E.clearcoatNormalMap, te = F && !!E.clearcoatRoughnessMap, pe = J && !!E.iridescenceMap, He = J && !!E.iridescenceThicknessMap, De = Z && !!E.sheenColorMap, Me = Z && !!E.sheenRoughnessMap, Ue = !!E.specularMap, ze = !!E.specularColorMap, Qe = !!E.specularIntensityMap, P = Te && !!E.transmissionMap, ne = Te && !!E.thicknessMap, q = !!E.gradientMap, Y = !!E.alphaMap, se = E.alphaTest > 0, we = !!E.alphaHash, Ge = !!E.extensions;
    let nt = li;
    E.toneMapped && (ce === null || ce.isXRRenderTarget === !0) && (nt = n.toneMapping);
    const ct = {
      shaderID: de,
      shaderType: E.type,
      shaderName: E.name,
      vertexShader: We,
      fragmentShader: k,
      defines: E.defines,
      customVertexShaderID: ee,
      customFragmentShaderID: _e,
      isRawShaderMaterial: E.isRawShaderMaterial === !0,
      glslVersion: E.glslVersion,
      precision: m,
      batching: Ne,
      batchingColor: Ne && z._colorsTexture !== null,
      instancing: Ce,
      instancingColor: Ce && z.instanceColor !== null,
      instancingMorph: Ce && z.morphTexture !== null,
      supportsVertexTextures: f,
      outputColorSpace: ce === null ? n.outputColorSpace : ce.isXRRenderTarget === !0 ? ce.texture.colorSpace : ui,
      alphaToCoverage: !!E.alphaToCoverage,
      map: Pe,
      matcap: Ve,
      envMap: y,
      envMapMode: y && Q.mapping,
      envMapCubeUVHeight: V,
      aoMap: ie,
      lightMap: j,
      bumpMap: he,
      normalMap: X,
      displacementMap: f && Ae,
      emissiveMap: ue,
      normalMapObjectSpace: X && E.normalMapType === Kl,
      normalMapTangentSpace: X && E.normalMapType === wo,
      metalnessMap: ve,
      roughnessMap: A,
      anisotropy: _,
      anisotropyMap: ae,
      clearcoat: F,
      clearcoatMap: ge,
      clearcoatNormalMap: Ie,
      clearcoatRoughnessMap: te,
      dispersion: $,
      iridescence: J,
      iridescenceMap: pe,
      iridescenceThicknessMap: He,
      sheen: Z,
      sheenColorMap: De,
      sheenRoughnessMap: Me,
      specularMap: Ue,
      specularColorMap: ze,
      specularIntensityMap: Qe,
      transmission: Te,
      transmissionMap: P,
      thicknessMap: ne,
      gradientMap: q,
      opaque: E.transparent === !1 && E.blending === Zi && E.alphaToCoverage === !1,
      alphaMap: Y,
      alphaTest: se,
      alphaHash: we,
      combine: E.combine,
      //
      mapUv: Pe && v(E.map.channel),
      aoMapUv: ie && v(E.aoMap.channel),
      lightMapUv: j && v(E.lightMap.channel),
      bumpMapUv: he && v(E.bumpMap.channel),
      normalMapUv: X && v(E.normalMap.channel),
      displacementMapUv: Ae && v(E.displacementMap.channel),
      emissiveMapUv: ue && v(E.emissiveMap.channel),
      metalnessMapUv: ve && v(E.metalnessMap.channel),
      roughnessMapUv: A && v(E.roughnessMap.channel),
      anisotropyMapUv: ae && v(E.anisotropyMap.channel),
      clearcoatMapUv: ge && v(E.clearcoatMap.channel),
      clearcoatNormalMapUv: Ie && v(E.clearcoatNormalMap.channel),
      clearcoatRoughnessMapUv: te && v(E.clearcoatRoughnessMap.channel),
      iridescenceMapUv: pe && v(E.iridescenceMap.channel),
      iridescenceThicknessMapUv: He && v(E.iridescenceThicknessMap.channel),
      sheenColorMapUv: De && v(E.sheenColorMap.channel),
      sheenRoughnessMapUv: Me && v(E.sheenRoughnessMap.channel),
      specularMapUv: Ue && v(E.specularMap.channel),
      specularColorMapUv: ze && v(E.specularColorMap.channel),
      specularIntensityMapUv: Qe && v(E.specularIntensityMap.channel),
      transmissionMapUv: P && v(E.transmissionMap.channel),
      thicknessMapUv: ne && v(E.thicknessMap.channel),
      alphaMapUv: Y && v(E.alphaMap.channel),
      //
      vertexTangents: !!K.attributes.tangent && (X || _),
      vertexColors: E.vertexColors,
      vertexAlphas: E.vertexColors === !0 && !!K.attributes.color && K.attributes.color.itemSize === 4,
      pointsUvs: z.isPoints === !0 && !!K.attributes.uv && (Pe || Y),
      fog: !!G,
      useFog: E.fog === !0,
      fogExp2: !!G && G.isFogExp2,
      flatShading: E.flatShading === !0,
      sizeAttenuation: E.sizeAttenuation === !0,
      logarithmicDepthBuffer: d,
      skinning: z.isSkinnedMesh === !0,
      morphTargets: K.morphAttributes.position !== void 0,
      morphNormals: K.morphAttributes.normal !== void 0,
      morphColors: K.morphAttributes.color !== void 0,
      morphTargetsCount: me,
      morphTextureStride: Be,
      numDirLights: x.directional.length,
      numPointLights: x.point.length,
      numSpotLights: x.spot.length,
      numSpotLightMaps: x.spotLightMap.length,
      numRectAreaLights: x.rectArea.length,
      numHemiLights: x.hemi.length,
      numDirLightShadows: x.directionalShadowMap.length,
      numPointLightShadows: x.pointShadowMap.length,
      numSpotLightShadows: x.spotShadowMap.length,
      numSpotLightShadowsWithMaps: x.numSpotLightShadowsWithMaps,
      numLightProbes: x.numLightProbes,
      numClippingPlanes: a.numPlanes,
      numClipIntersection: a.numIntersection,
      dithering: E.dithering,
      shadowMapEnabled: n.shadowMap.enabled && C.length > 0,
      shadowMapType: n.shadowMap.type,
      toneMapping: nt,
      decodeVideoTexture: Pe && E.map.isVideoTexture === !0 && Ze.getTransfer(E.map.colorSpace) === Je,
      premultipliedAlpha: E.premultipliedAlpha,
      doubleSided: E.side === Yt,
      flipSided: E.side === _t,
      useDepthPacking: E.depthPacking >= 0,
      depthPacking: E.depthPacking || 0,
      index0AttributeName: E.index0AttributeName,
      extensionClipCullDistance: Ge && E.extensions.clipCullDistance === !0 && i.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (Ge && E.extensions.multiDraw === !0 || Ne) && i.has("WEBGL_multi_draw"),
      rendererExtensionParallelShaderCompile: i.has("KHR_parallel_shader_compile"),
      customProgramCacheKey: E.customProgramCacheKey()
    };
    return ct.vertexUv1s = c.has(1), ct.vertexUv2s = c.has(2), ct.vertexUv3s = c.has(3), c.clear(), ct;
  }
  function u(E) {
    const x = [];
    if (E.shaderID ? x.push(E.shaderID) : (x.push(E.customVertexShaderID), x.push(E.customFragmentShaderID)), E.defines !== void 0)
      for (const C in E.defines)
        x.push(C), x.push(E.defines[C]);
    return E.isRawShaderMaterial === !1 && (b(x, E), M(x, E), x.push(n.outputColorSpace)), x.push(E.customProgramCacheKey), x.join();
  }
  function b(E, x) {
    E.push(x.precision), E.push(x.outputColorSpace), E.push(x.envMapMode), E.push(x.envMapCubeUVHeight), E.push(x.mapUv), E.push(x.alphaMapUv), E.push(x.lightMapUv), E.push(x.aoMapUv), E.push(x.bumpMapUv), E.push(x.normalMapUv), E.push(x.displacementMapUv), E.push(x.emissiveMapUv), E.push(x.metalnessMapUv), E.push(x.roughnessMapUv), E.push(x.anisotropyMapUv), E.push(x.clearcoatMapUv), E.push(x.clearcoatNormalMapUv), E.push(x.clearcoatRoughnessMapUv), E.push(x.iridescenceMapUv), E.push(x.iridescenceThicknessMapUv), E.push(x.sheenColorMapUv), E.push(x.sheenRoughnessMapUv), E.push(x.specularMapUv), E.push(x.specularColorMapUv), E.push(x.specularIntensityMapUv), E.push(x.transmissionMapUv), E.push(x.thicknessMapUv), E.push(x.combine), E.push(x.fogExp2), E.push(x.sizeAttenuation), E.push(x.morphTargetsCount), E.push(x.morphAttributeCount), E.push(x.numDirLights), E.push(x.numPointLights), E.push(x.numSpotLights), E.push(x.numSpotLightMaps), E.push(x.numHemiLights), E.push(x.numRectAreaLights), E.push(x.numDirLightShadows), E.push(x.numPointLightShadows), E.push(x.numSpotLightShadows), E.push(x.numSpotLightShadowsWithMaps), E.push(x.numLightProbes), E.push(x.shadowMapType), E.push(x.toneMapping), E.push(x.numClippingPlanes), E.push(x.numClipIntersection), E.push(x.depthPacking);
  }
  function M(E, x) {
    o.disableAll(), x.supportsVertexTextures && o.enable(0), x.instancing && o.enable(1), x.instancingColor && o.enable(2), x.instancingMorph && o.enable(3), x.matcap && o.enable(4), x.envMap && o.enable(5), x.normalMapObjectSpace && o.enable(6), x.normalMapTangentSpace && o.enable(7), x.clearcoat && o.enable(8), x.iridescence && o.enable(9), x.alphaTest && o.enable(10), x.vertexColors && o.enable(11), x.vertexAlphas && o.enable(12), x.vertexUv1s && o.enable(13), x.vertexUv2s && o.enable(14), x.vertexUv3s && o.enable(15), x.vertexTangents && o.enable(16), x.anisotropy && o.enable(17), x.alphaHash && o.enable(18), x.batching && o.enable(19), x.dispersion && o.enable(20), x.batchingColor && o.enable(21), E.push(o.mask), o.disableAll(), x.fog && o.enable(0), x.useFog && o.enable(1), x.flatShading && o.enable(2), x.logarithmicDepthBuffer && o.enable(3), x.skinning && o.enable(4), x.morphTargets && o.enable(5), x.morphNormals && o.enable(6), x.morphColors && o.enable(7), x.premultipliedAlpha && o.enable(8), x.shadowMapEnabled && o.enable(9), x.doubleSided && o.enable(10), x.flipSided && o.enable(11), x.useDepthPacking && o.enable(12), x.dithering && o.enable(13), x.transmission && o.enable(14), x.sheen && o.enable(15), x.opaque && o.enable(16), x.pointsUvs && o.enable(17), x.decodeVideoTexture && o.enable(18), x.alphaToCoverage && o.enable(19), E.push(o.mask);
  }
  function T(E) {
    const x = g[E.type];
    let C;
    if (x) {
      const W = Nt[x];
      C = nh.clone(W.uniforms);
    } else
      C = E.uniforms;
    return C;
  }
  function O(E, x) {
    let C;
    for (let W = 0, z = h.length; W < z; W++) {
      const G = h[W];
      if (G.cacheKey === x) {
        C = G, ++C.usedTimes;
        break;
      }
    }
    return C === void 0 && (C = new mp(n, x, E, s), h.push(C)), C;
  }
  function w(E) {
    if (--E.usedTimes === 0) {
      const x = h.indexOf(E);
      h[x] = h[h.length - 1], h.pop(), E.destroy();
    }
  }
  function R(E) {
    l.remove(E);
  }
  function I() {
    l.dispose();
  }
  return {
    getParameters: p,
    getProgramCacheKey: u,
    getUniforms: T,
    acquireProgram: O,
    releaseProgram: w,
    releaseShaderCache: R,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: I
  };
}
function Mp() {
  let n = /* @__PURE__ */ new WeakMap();
  function e(s) {
    let a = n.get(s);
    return a === void 0 && (a = {}, n.set(s, a)), a;
  }
  function t(s) {
    n.delete(s);
  }
  function i(s, a, o) {
    n.get(s)[a] = o;
  }
  function r() {
    n = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    remove: t,
    update: i,
    dispose: r
  };
}
function Sp(n, e) {
  return n.groupOrder !== e.groupOrder ? n.groupOrder - e.groupOrder : n.renderOrder !== e.renderOrder ? n.renderOrder - e.renderOrder : n.material.id !== e.material.id ? n.material.id - e.material.id : n.z !== e.z ? n.z - e.z : n.id - e.id;
}
function co(n, e) {
  return n.groupOrder !== e.groupOrder ? n.groupOrder - e.groupOrder : n.renderOrder !== e.renderOrder ? n.renderOrder - e.renderOrder : n.z !== e.z ? e.z - n.z : n.id - e.id;
}
function ho() {
  const n = [];
  let e = 0;
  const t = [], i = [], r = [];
  function s() {
    e = 0, t.length = 0, i.length = 0, r.length = 0;
  }
  function a(d, f, m, g, v, p) {
    let u = n[e];
    return u === void 0 ? (u = {
      id: d.id,
      object: d,
      geometry: f,
      material: m,
      groupOrder: g,
      renderOrder: d.renderOrder,
      z: v,
      group: p
    }, n[e] = u) : (u.id = d.id, u.object = d, u.geometry = f, u.material = m, u.groupOrder = g, u.renderOrder = d.renderOrder, u.z = v, u.group = p), e++, u;
  }
  function o(d, f, m, g, v, p) {
    const u = a(d, f, m, g, v, p);
    m.transmission > 0 ? i.push(u) : m.transparent === !0 ? r.push(u) : t.push(u);
  }
  function l(d, f, m, g, v, p) {
    const u = a(d, f, m, g, v, p);
    m.transmission > 0 ? i.unshift(u) : m.transparent === !0 ? r.unshift(u) : t.unshift(u);
  }
  function c(d, f) {
    t.length > 1 && t.sort(d || Sp), i.length > 1 && i.sort(f || co), r.length > 1 && r.sort(f || co);
  }
  function h() {
    for (let d = e, f = n.length; d < f; d++) {
      const m = n[d];
      if (m.id === null) break;
      m.id = null, m.object = null, m.geometry = null, m.material = null, m.group = null;
    }
  }
  return {
    opaque: t,
    transmissive: i,
    transparent: r,
    init: s,
    push: o,
    unshift: l,
    finish: h,
    sort: c
  };
}
function yp() {
  let n = /* @__PURE__ */ new WeakMap();
  function e(i, r) {
    const s = n.get(i);
    let a;
    return s === void 0 ? (a = new ho(), n.set(i, [a])) : r >= s.length ? (a = new ho(), s.push(a)) : a = s[r], a;
  }
  function t() {
    n = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function Ep() {
  const n = {};
  return {
    get: function(e) {
      if (n[e.id] !== void 0)
        return n[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            direction: new L(),
            color: new ke()
          };
          break;
        case "SpotLight":
          t = {
            position: new L(),
            direction: new L(),
            color: new ke(),
            distance: 0,
            coneCos: 0,
            penumbraCos: 0,
            decay: 0
          };
          break;
        case "PointLight":
          t = {
            position: new L(),
            color: new ke(),
            distance: 0,
            decay: 0
          };
          break;
        case "HemisphereLight":
          t = {
            direction: new L(),
            skyColor: new ke(),
            groundColor: new ke()
          };
          break;
        case "RectAreaLight":
          t = {
            color: new ke(),
            position: new L(),
            halfWidth: new L(),
            halfHeight: new L()
          };
          break;
      }
      return n[e.id] = t, t;
    }
  };
}
function Tp() {
  const n = {};
  return {
    get: function(e) {
      if (n[e.id] !== void 0)
        return n[e.id];
      let t;
      switch (e.type) {
        case "DirectionalLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new le()
          };
          break;
        case "SpotLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new le()
          };
          break;
        case "PointLight":
          t = {
            shadowIntensity: 1,
            shadowBias: 0,
            shadowNormalBias: 0,
            shadowRadius: 1,
            shadowMapSize: new le(),
            shadowCameraNear: 1,
            shadowCameraFar: 1e3
          };
          break;
      }
      return n[e.id] = t, t;
    }
  };
}
let Ap = 0;
function bp(n, e) {
  return (e.castShadow ? 2 : 0) - (n.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (n.map ? 1 : 0);
}
function wp(n) {
  const e = new Ep(), t = Tp(), i = {
    version: 0,
    hash: {
      directionalLength: -1,
      pointLength: -1,
      spotLength: -1,
      rectAreaLength: -1,
      hemiLength: -1,
      numDirectionalShadows: -1,
      numPointShadows: -1,
      numSpotShadows: -1,
      numSpotMaps: -1,
      numLightProbes: -1
    },
    ambient: [0, 0, 0],
    probe: [],
    directional: [],
    directionalShadow: [],
    directionalShadowMap: [],
    directionalShadowMatrix: [],
    spot: [],
    spotLightMap: [],
    spotShadow: [],
    spotShadowMap: [],
    spotLightMatrix: [],
    rectArea: [],
    rectAreaLTC1: null,
    rectAreaLTC2: null,
    point: [],
    pointShadow: [],
    pointShadowMap: [],
    pointShadowMatrix: [],
    hemi: [],
    numSpotLightShadowsWithMaps: 0,
    numLightProbes: 0
  };
  for (let c = 0; c < 9; c++) i.probe.push(new L());
  const r = new L(), s = new je(), a = new je();
  function o(c) {
    let h = 0, d = 0, f = 0;
    for (let E = 0; E < 9; E++) i.probe[E].set(0, 0, 0);
    let m = 0, g = 0, v = 0, p = 0, u = 0, b = 0, M = 0, T = 0, O = 0, w = 0, R = 0;
    c.sort(bp);
    for (let E = 0, x = c.length; E < x; E++) {
      const C = c[E], W = C.color, z = C.intensity, G = C.distance, K = C.shadow && C.shadow.map ? C.shadow.map.texture : null;
      if (C.isAmbientLight)
        h += W.r * z, d += W.g * z, f += W.b * z;
      else if (C.isLightProbe) {
        for (let H = 0; H < 9; H++)
          i.probe[H].addScaledVector(C.sh.coefficients[H], z);
        R++;
      } else if (C.isDirectionalLight) {
        const H = e.get(C);
        if (H.color.copy(C.color).multiplyScalar(C.intensity), C.castShadow) {
          const Q = C.shadow, V = t.get(C);
          V.shadowIntensity = Q.intensity, V.shadowBias = Q.bias, V.shadowNormalBias = Q.normalBias, V.shadowRadius = Q.radius, V.shadowMapSize = Q.mapSize, i.directionalShadow[m] = V, i.directionalShadowMap[m] = K, i.directionalShadowMatrix[m] = C.shadow.matrix, b++;
        }
        i.directional[m] = H, m++;
      } else if (C.isSpotLight) {
        const H = e.get(C);
        H.position.setFromMatrixPosition(C.matrixWorld), H.color.copy(W).multiplyScalar(z), H.distance = G, H.coneCos = Math.cos(C.angle), H.penumbraCos = Math.cos(C.angle * (1 - C.penumbra)), H.decay = C.decay, i.spot[v] = H;
        const Q = C.shadow;
        if (C.map && (i.spotLightMap[O] = C.map, O++, Q.updateMatrices(C), C.castShadow && w++), i.spotLightMatrix[v] = Q.matrix, C.castShadow) {
          const V = t.get(C);
          V.shadowIntensity = Q.intensity, V.shadowBias = Q.bias, V.shadowNormalBias = Q.normalBias, V.shadowRadius = Q.radius, V.shadowMapSize = Q.mapSize, i.spotShadow[v] = V, i.spotShadowMap[v] = K, T++;
        }
        v++;
      } else if (C.isRectAreaLight) {
        const H = e.get(C);
        H.color.copy(W).multiplyScalar(z), H.halfWidth.set(C.width * 0.5, 0, 0), H.halfHeight.set(0, C.height * 0.5, 0), i.rectArea[p] = H, p++;
      } else if (C.isPointLight) {
        const H = e.get(C);
        if (H.color.copy(C.color).multiplyScalar(C.intensity), H.distance = C.distance, H.decay = C.decay, C.castShadow) {
          const Q = C.shadow, V = t.get(C);
          V.shadowIntensity = Q.intensity, V.shadowBias = Q.bias, V.shadowNormalBias = Q.normalBias, V.shadowRadius = Q.radius, V.shadowMapSize = Q.mapSize, V.shadowCameraNear = Q.camera.near, V.shadowCameraFar = Q.camera.far, i.pointShadow[g] = V, i.pointShadowMap[g] = K, i.pointShadowMatrix[g] = C.shadow.matrix, M++;
        }
        i.point[g] = H, g++;
      } else if (C.isHemisphereLight) {
        const H = e.get(C);
        H.skyColor.copy(C.color).multiplyScalar(z), H.groundColor.copy(C.groundColor).multiplyScalar(z), i.hemi[u] = H, u++;
      }
    }
    p > 0 && (n.has("OES_texture_float_linear") === !0 ? (i.rectAreaLTC1 = oe.LTC_FLOAT_1, i.rectAreaLTC2 = oe.LTC_FLOAT_2) : (i.rectAreaLTC1 = oe.LTC_HALF_1, i.rectAreaLTC2 = oe.LTC_HALF_2)), i.ambient[0] = h, i.ambient[1] = d, i.ambient[2] = f;
    const I = i.hash;
    (I.directionalLength !== m || I.pointLength !== g || I.spotLength !== v || I.rectAreaLength !== p || I.hemiLength !== u || I.numDirectionalShadows !== b || I.numPointShadows !== M || I.numSpotShadows !== T || I.numSpotMaps !== O || I.numLightProbes !== R) && (i.directional.length = m, i.spot.length = v, i.rectArea.length = p, i.point.length = g, i.hemi.length = u, i.directionalShadow.length = b, i.directionalShadowMap.length = b, i.pointShadow.length = M, i.pointShadowMap.length = M, i.spotShadow.length = T, i.spotShadowMap.length = T, i.directionalShadowMatrix.length = b, i.pointShadowMatrix.length = M, i.spotLightMatrix.length = T + O - w, i.spotLightMap.length = O, i.numSpotLightShadowsWithMaps = w, i.numLightProbes = R, I.directionalLength = m, I.pointLength = g, I.spotLength = v, I.rectAreaLength = p, I.hemiLength = u, I.numDirectionalShadows = b, I.numPointShadows = M, I.numSpotShadows = T, I.numSpotMaps = O, I.numLightProbes = R, i.version = Ap++);
  }
  function l(c, h) {
    let d = 0, f = 0, m = 0, g = 0, v = 0;
    const p = h.matrixWorldInverse;
    for (let u = 0, b = c.length; u < b; u++) {
      const M = c[u];
      if (M.isDirectionalLight) {
        const T = i.directional[d];
        T.direction.setFromMatrixPosition(M.matrixWorld), r.setFromMatrixPosition(M.target.matrixWorld), T.direction.sub(r), T.direction.transformDirection(p), d++;
      } else if (M.isSpotLight) {
        const T = i.spot[m];
        T.position.setFromMatrixPosition(M.matrixWorld), T.position.applyMatrix4(p), T.direction.setFromMatrixPosition(M.matrixWorld), r.setFromMatrixPosition(M.target.matrixWorld), T.direction.sub(r), T.direction.transformDirection(p), m++;
      } else if (M.isRectAreaLight) {
        const T = i.rectArea[g];
        T.position.setFromMatrixPosition(M.matrixWorld), T.position.applyMatrix4(p), a.identity(), s.copy(M.matrixWorld), s.premultiply(p), a.extractRotation(s), T.halfWidth.set(M.width * 0.5, 0, 0), T.halfHeight.set(0, M.height * 0.5, 0), T.halfWidth.applyMatrix4(a), T.halfHeight.applyMatrix4(a), g++;
      } else if (M.isPointLight) {
        const T = i.point[f];
        T.position.setFromMatrixPosition(M.matrixWorld), T.position.applyMatrix4(p), f++;
      } else if (M.isHemisphereLight) {
        const T = i.hemi[v];
        T.direction.setFromMatrixPosition(M.matrixWorld), T.direction.transformDirection(p), v++;
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: i
  };
}
function uo(n) {
  const e = new wp(n), t = [], i = [];
  function r(h) {
    c.camera = h, t.length = 0, i.length = 0;
  }
  function s(h) {
    t.push(h);
  }
  function a(h) {
    i.push(h);
  }
  function o() {
    e.setup(t);
  }
  function l(h) {
    e.setupView(t, h);
  }
  const c = {
    lightsArray: t,
    shadowsArray: i,
    camera: null,
    lights: e,
    transmissionRenderTarget: {}
  };
  return {
    init: r,
    state: c,
    setupLights: o,
    setupLightsView: l,
    pushLight: s,
    pushShadow: a
  };
}
function Rp(n) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(r, s = 0) {
    const a = e.get(r);
    let o;
    return a === void 0 ? (o = new uo(n), e.set(r, [o])) : s >= a.length ? (o = new uo(n), a.push(o)) : o = a[s], o;
  }
  function i() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: i
  };
}
class Cp extends An {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = ql, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class Pp extends An {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const Lp = (
  /* glsl */
  `
void main() {

	gl_Position = vec4( position, 1.0 );

}
`
), Dp = (
  /* glsl */
  `
uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;

#include <packing>

void main() {

	const float samples = float( VSM_SAMPLES );

	float mean = 0.0;
	float squared_mean = 0.0;

	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {

		float uvOffset = uvStart + i * uvStride;

		#ifdef HORIZONTAL_PASS

			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;

		#else

			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;

		#endif

	}

	mean = mean / samples;
	squared_mean = squared_mean / samples;

	float std_dev = sqrt( squared_mean - mean * mean );

	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );

}
`
);
function Up(n, e, t) {
  let i = new Js();
  const r = new le(), s = new le(), a = new $e(), o = new Cp({ depthPacking: Yl }), l = new Pp(), c = {}, h = t.maxTextureSize, d = { [ci]: _t, [_t]: ci, [Yt]: Yt }, f = new hi({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new le() },
      radius: { value: 4 }
    },
    vertexShader: Lp,
    fragmentShader: Dp
  }), m = f.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const g = new fi();
  g.setAttribute(
    "position",
    new Ot(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const v = new Jt(g, f), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = po;
  let u = this.type;
  this.render = function(w, R, I) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || w.length === 0) return;
    const E = n.getRenderTarget(), x = n.getActiveCubeFace(), C = n.getActiveMipmapLevel(), W = n.state;
    W.setBlending(oi), W.buffers.color.setClear(1, 1, 1, 1), W.buffers.depth.setTest(!0), W.setScissorTest(!1);
    const z = u !== qt && this.type === qt, G = u === qt && this.type !== qt;
    for (let K = 0, H = w.length; K < H; K++) {
      const Q = w[K], V = Q.shadow;
      if (V === void 0) {
        console.warn("THREE.WebGLShadowMap:", Q, "has no shadow.");
        continue;
      }
      if (V.autoUpdate === !1 && V.needsUpdate === !1) continue;
      r.copy(V.mapSize);
      const de = V.getFrameExtents();
      if (r.multiply(de), s.copy(V.mapSize), (r.x > h || r.y > h) && (r.x > h && (s.x = Math.floor(h / de.x), r.x = s.x * de.x, V.mapSize.x = s.x), r.y > h && (s.y = Math.floor(h / de.y), r.y = s.y * de.y, V.mapSize.y = s.y)), V.map === null || z === !0 || G === !0) {
        const me = this.type !== qt ? { minFilter: bt, magFilter: bt } : {};
        V.map !== null && V.map.dispose(), V.map = new Ri(r.x, r.y, me), V.map.texture.name = Q.name + ".shadowMap", V.camera.updateProjectionMatrix();
      }
      n.setRenderTarget(V.map), n.clear();
      const xe = V.getViewportCount();
      for (let me = 0; me < xe; me++) {
        const Be = V.getViewport(me);
        a.set(
          s.x * Be.x,
          s.y * Be.y,
          s.x * Be.z,
          s.y * Be.w
        ), W.viewport(a), V.updateMatrices(Q, me), i = V.getFrustum(), T(R, I, V.camera, Q, this.type);
      }
      V.isPointLightShadow !== !0 && this.type === qt && b(V, I), V.needsUpdate = !1;
    }
    u = this.type, p.needsUpdate = !1, n.setRenderTarget(E, x, C);
  };
  function b(w, R) {
    const I = e.update(v);
    f.defines.VSM_SAMPLES !== w.blurSamples && (f.defines.VSM_SAMPLES = w.blurSamples, m.defines.VSM_SAMPLES = w.blurSamples, f.needsUpdate = !0, m.needsUpdate = !0), w.mapPass === null && (w.mapPass = new Ri(r.x, r.y)), f.uniforms.shadow_pass.value = w.map.texture, f.uniforms.resolution.value = w.mapSize, f.uniforms.radius.value = w.radius, n.setRenderTarget(w.mapPass), n.clear(), n.renderBufferDirect(R, null, I, f, v, null), m.uniforms.shadow_pass.value = w.mapPass.texture, m.uniforms.resolution.value = w.mapSize, m.uniforms.radius.value = w.radius, n.setRenderTarget(w.map), n.clear(), n.renderBufferDirect(R, null, I, m, v, null);
  }
  function M(w, R, I, E) {
    let x = null;
    const C = I.isPointLight === !0 ? w.customDistanceMaterial : w.customDepthMaterial;
    if (C !== void 0)
      x = C;
    else if (x = I.isPointLight === !0 ? l : o, n.localClippingEnabled && R.clipShadows === !0 && Array.isArray(R.clippingPlanes) && R.clippingPlanes.length !== 0 || R.displacementMap && R.displacementScale !== 0 || R.alphaMap && R.alphaTest > 0 || R.map && R.alphaTest > 0) {
      const W = x.uuid, z = R.uuid;
      let G = c[W];
      G === void 0 && (G = {}, c[W] = G);
      let K = G[z];
      K === void 0 && (K = x.clone(), G[z] = K, R.addEventListener("dispose", O)), x = K;
    }
    if (x.visible = R.visible, x.wireframe = R.wireframe, E === qt ? x.side = R.shadowSide !== null ? R.shadowSide : R.side : x.side = R.shadowSide !== null ? R.shadowSide : d[R.side], x.alphaMap = R.alphaMap, x.alphaTest = R.alphaTest, x.map = R.map, x.clipShadows = R.clipShadows, x.clippingPlanes = R.clippingPlanes, x.clipIntersection = R.clipIntersection, x.displacementMap = R.displacementMap, x.displacementScale = R.displacementScale, x.displacementBias = R.displacementBias, x.wireframeLinewidth = R.wireframeLinewidth, x.linewidth = R.linewidth, I.isPointLight === !0 && x.isMeshDistanceMaterial === !0) {
      const W = n.properties.get(x);
      W.light = I;
    }
    return x;
  }
  function T(w, R, I, E, x) {
    if (w.visible === !1) return;
    if (w.layers.test(R.layers) && (w.isMesh || w.isLine || w.isPoints) && (w.castShadow || w.receiveShadow && x === qt) && (!w.frustumCulled || i.intersectsObject(w))) {
      w.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse, w.matrixWorld);
      const z = e.update(w), G = w.material;
      if (Array.isArray(G)) {
        const K = z.groups;
        for (let H = 0, Q = K.length; H < Q; H++) {
          const V = K[H], de = G[V.materialIndex];
          if (de && de.visible) {
            const xe = M(w, de, E, x);
            w.onBeforeShadow(n, w, R, I, z, xe, V), n.renderBufferDirect(I, null, z, xe, w, V), w.onAfterShadow(n, w, R, I, z, xe, V);
          }
        }
      } else if (G.visible) {
        const K = M(w, G, E, x);
        w.onBeforeShadow(n, w, R, I, z, K, null), n.renderBufferDirect(I, null, z, K, w, null), w.onAfterShadow(n, w, R, I, z, K, null);
      }
    }
    const W = w.children;
    for (let z = 0, G = W.length; z < G; z++)
      T(W[z], R, I, E, x);
  }
  function O(w) {
    w.target.removeEventListener("dispose", O);
    for (const I in c) {
      const E = c[I], x = w.target.uuid;
      x in E && (E[x].dispose(), delete E[x]);
    }
  }
}
function Ip(n) {
  function e() {
    let P = !1;
    const ne = new $e();
    let q = null;
    const Y = new $e(0, 0, 0, 0);
    return {
      setMask: function(se) {
        q !== se && !P && (n.colorMask(se, se, se, se), q = se);
      },
      setLocked: function(se) {
        P = se;
      },
      setClear: function(se, we, Ge, nt, ct) {
        ct === !0 && (se *= nt, we *= nt, Ge *= nt), ne.set(se, we, Ge, nt), Y.equals(ne) === !1 && (n.clearColor(se, we, Ge, nt), Y.copy(ne));
      },
      reset: function() {
        P = !1, q = null, Y.set(-1, 0, 0, 0);
      }
    };
  }
  function t() {
    let P = !1, ne = null, q = null, Y = null;
    return {
      setTest: function(se) {
        se ? _e(n.DEPTH_TEST) : ce(n.DEPTH_TEST);
      },
      setMask: function(se) {
        ne !== se && !P && (n.depthMask(se), ne = se);
      },
      setFunc: function(se) {
        if (q !== se) {
          switch (se) {
            case Cl:
              n.depthFunc(n.NEVER);
              break;
            case Pl:
              n.depthFunc(n.ALWAYS);
              break;
            case Ll:
              n.depthFunc(n.LESS);
              break;
            case or:
              n.depthFunc(n.LEQUAL);
              break;
            case Dl:
              n.depthFunc(n.EQUAL);
              break;
            case Ul:
              n.depthFunc(n.GEQUAL);
              break;
            case Il:
              n.depthFunc(n.GREATER);
              break;
            case Nl:
              n.depthFunc(n.NOTEQUAL);
              break;
            default:
              n.depthFunc(n.LEQUAL);
          }
          q = se;
        }
      },
      setLocked: function(se) {
        P = se;
      },
      setClear: function(se) {
        Y !== se && (n.clearDepth(se), Y = se);
      },
      reset: function() {
        P = !1, ne = null, q = null, Y = null;
      }
    };
  }
  function i() {
    let P = !1, ne = null, q = null, Y = null, se = null, we = null, Ge = null, nt = null, ct = null;
    return {
      setTest: function(Xe) {
        P || (Xe ? _e(n.STENCIL_TEST) : ce(n.STENCIL_TEST));
      },
      setMask: function(Xe) {
        ne !== Xe && !P && (n.stencilMask(Xe), ne = Xe);
      },
      setFunc: function(Xe, Ht, Ut) {
        (q !== Xe || Y !== Ht || se !== Ut) && (n.stencilFunc(Xe, Ht, Ut), q = Xe, Y = Ht, se = Ut);
      },
      setOp: function(Xe, Ht, Ut) {
        (we !== Xe || Ge !== Ht || nt !== Ut) && (n.stencilOp(Xe, Ht, Ut), we = Xe, Ge = Ht, nt = Ut);
      },
      setLocked: function(Xe) {
        P = Xe;
      },
      setClear: function(Xe) {
        ct !== Xe && (n.clearStencil(Xe), ct = Xe);
      },
      reset: function() {
        P = !1, ne = null, q = null, Y = null, se = null, we = null, Ge = null, nt = null, ct = null;
      }
    };
  }
  const r = new e(), s = new t(), a = new i(), o = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap();
  let c = {}, h = {}, d = /* @__PURE__ */ new WeakMap(), f = [], m = null, g = !1, v = null, p = null, u = null, b = null, M = null, T = null, O = null, w = new ke(0, 0, 0), R = 0, I = !1, E = null, x = null, C = null, W = null, z = null;
  const G = n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let K = !1, H = 0;
  const Q = n.getParameter(n.VERSION);
  Q.indexOf("WebGL") !== -1 ? (H = parseFloat(/^WebGL (\d)/.exec(Q)[1]), K = H >= 1) : Q.indexOf("OpenGL ES") !== -1 && (H = parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]), K = H >= 2);
  let V = null, de = {};
  const xe = n.getParameter(n.SCISSOR_BOX), me = n.getParameter(n.VIEWPORT), Be = new $e().fromArray(xe), We = new $e().fromArray(me);
  function k(P, ne, q, Y) {
    const se = new Uint8Array(4), we = n.createTexture();
    n.bindTexture(P, we), n.texParameteri(P, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(P, n.TEXTURE_MAG_FILTER, n.NEAREST);
    for (let Ge = 0; Ge < q; Ge++)
      P === n.TEXTURE_3D || P === n.TEXTURE_2D_ARRAY ? n.texImage3D(ne, 0, n.RGBA, 1, 1, Y, 0, n.RGBA, n.UNSIGNED_BYTE, se) : n.texImage2D(ne + Ge, 0, n.RGBA, 1, 1, 0, n.RGBA, n.UNSIGNED_BYTE, se);
    return we;
  }
  const ee = {};
  ee[n.TEXTURE_2D] = k(n.TEXTURE_2D, n.TEXTURE_2D, 1), ee[n.TEXTURE_CUBE_MAP] = k(n.TEXTURE_CUBE_MAP, n.TEXTURE_CUBE_MAP_POSITIVE_X, 6), ee[n.TEXTURE_2D_ARRAY] = k(n.TEXTURE_2D_ARRAY, n.TEXTURE_2D_ARRAY, 1, 1), ee[n.TEXTURE_3D] = k(n.TEXTURE_3D, n.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), s.setClear(1), a.setClear(0), _e(n.DEPTH_TEST), s.setFunc(or), he(!1), X(ca), _e(n.CULL_FACE), ie(oi);
  function _e(P) {
    c[P] !== !0 && (n.enable(P), c[P] = !0);
  }
  function ce(P) {
    c[P] !== !1 && (n.disable(P), c[P] = !1);
  }
  function Ce(P, ne) {
    return h[P] !== ne ? (n.bindFramebuffer(P, ne), h[P] = ne, P === n.DRAW_FRAMEBUFFER && (h[n.FRAMEBUFFER] = ne), P === n.FRAMEBUFFER && (h[n.DRAW_FRAMEBUFFER] = ne), !0) : !1;
  }
  function Ne(P, ne) {
    let q = f, Y = !1;
    if (P) {
      q = d.get(ne), q === void 0 && (q = [], d.set(ne, q));
      const se = P.textures;
      if (q.length !== se.length || q[0] !== n.COLOR_ATTACHMENT0) {
        for (let we = 0, Ge = se.length; we < Ge; we++)
          q[we] = n.COLOR_ATTACHMENT0 + we;
        q.length = se.length, Y = !0;
      }
    } else
      q[0] !== n.BACK && (q[0] = n.BACK, Y = !0);
    Y && n.drawBuffers(q);
  }
  function Pe(P) {
    return m !== P ? (n.useProgram(P), m = P, !0) : !1;
  }
  const Ve = {
    [yi]: n.FUNC_ADD,
    [fl]: n.FUNC_SUBTRACT,
    [dl]: n.FUNC_REVERSE_SUBTRACT
  };
  Ve[pl] = n.MIN, Ve[ml] = n.MAX;
  const y = {
    [gl]: n.ZERO,
    [_l]: n.ONE,
    [vl]: n.SRC_COLOR,
    [is]: n.SRC_ALPHA,
    [Tl]: n.SRC_ALPHA_SATURATE,
    [yl]: n.DST_COLOR,
    [Ml]: n.DST_ALPHA,
    [xl]: n.ONE_MINUS_SRC_COLOR,
    [ns]: n.ONE_MINUS_SRC_ALPHA,
    [El]: n.ONE_MINUS_DST_COLOR,
    [Sl]: n.ONE_MINUS_DST_ALPHA,
    [Al]: n.CONSTANT_COLOR,
    [bl]: n.ONE_MINUS_CONSTANT_COLOR,
    [wl]: n.CONSTANT_ALPHA,
    [Rl]: n.ONE_MINUS_CONSTANT_ALPHA
  };
  function ie(P, ne, q, Y, se, we, Ge, nt, ct, Xe) {
    if (P === oi) {
      g === !0 && (ce(n.BLEND), g = !1);
      return;
    }
    if (g === !1 && (_e(n.BLEND), g = !0), P !== ul) {
      if (P !== v || Xe !== I) {
        if ((p !== yi || M !== yi) && (n.blendEquation(n.FUNC_ADD), p = yi, M = yi), Xe)
          switch (P) {
            case Zi:
              n.blendFuncSeparate(n.ONE, n.ONE_MINUS_SRC_ALPHA, n.ONE, n.ONE_MINUS_SRC_ALPHA);
              break;
            case ha:
              n.blendFunc(n.ONE, n.ONE);
              break;
            case ua:
              n.blendFuncSeparate(n.ZERO, n.ONE_MINUS_SRC_COLOR, n.ZERO, n.ONE);
              break;
            case fa:
              n.blendFuncSeparate(n.ZERO, n.SRC_COLOR, n.ZERO, n.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        else
          switch (P) {
            case Zi:
              n.blendFuncSeparate(n.SRC_ALPHA, n.ONE_MINUS_SRC_ALPHA, n.ONE, n.ONE_MINUS_SRC_ALPHA);
              break;
            case ha:
              n.blendFunc(n.SRC_ALPHA, n.ONE);
              break;
            case ua:
              n.blendFuncSeparate(n.ZERO, n.ONE_MINUS_SRC_COLOR, n.ZERO, n.ONE);
              break;
            case fa:
              n.blendFunc(n.ZERO, n.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        u = null, b = null, T = null, O = null, w.set(0, 0, 0), R = 0, v = P, I = Xe;
      }
      return;
    }
    se = se || ne, we = we || q, Ge = Ge || Y, (ne !== p || se !== M) && (n.blendEquationSeparate(Ve[ne], Ve[se]), p = ne, M = se), (q !== u || Y !== b || we !== T || Ge !== O) && (n.blendFuncSeparate(y[q], y[Y], y[we], y[Ge]), u = q, b = Y, T = we, O = Ge), (nt.equals(w) === !1 || ct !== R) && (n.blendColor(nt.r, nt.g, nt.b, ct), w.copy(nt), R = ct), v = P, I = !1;
  }
  function j(P, ne) {
    P.side === Yt ? ce(n.CULL_FACE) : _e(n.CULL_FACE);
    let q = P.side === _t;
    ne && (q = !q), he(q), P.blending === Zi && P.transparent === !1 ? ie(oi) : ie(P.blending, P.blendEquation, P.blendSrc, P.blendDst, P.blendEquationAlpha, P.blendSrcAlpha, P.blendDstAlpha, P.blendColor, P.blendAlpha, P.premultipliedAlpha), s.setFunc(P.depthFunc), s.setTest(P.depthTest), s.setMask(P.depthWrite), r.setMask(P.colorWrite);
    const Y = P.stencilWrite;
    a.setTest(Y), Y && (a.setMask(P.stencilWriteMask), a.setFunc(P.stencilFunc, P.stencilRef, P.stencilFuncMask), a.setOp(P.stencilFail, P.stencilZFail, P.stencilZPass)), ue(P.polygonOffset, P.polygonOffsetFactor, P.polygonOffsetUnits), P.alphaToCoverage === !0 ? _e(n.SAMPLE_ALPHA_TO_COVERAGE) : ce(n.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function he(P) {
    E !== P && (P ? n.frontFace(n.CW) : n.frontFace(n.CCW), E = P);
  }
  function X(P) {
    P !== ll ? (_e(n.CULL_FACE), P !== x && (P === ca ? n.cullFace(n.BACK) : P === cl ? n.cullFace(n.FRONT) : n.cullFace(n.FRONT_AND_BACK))) : ce(n.CULL_FACE), x = P;
  }
  function Ae(P) {
    P !== C && (K && n.lineWidth(P), C = P);
  }
  function ue(P, ne, q) {
    P ? (_e(n.POLYGON_OFFSET_FILL), (W !== ne || z !== q) && (n.polygonOffset(ne, q), W = ne, z = q)) : ce(n.POLYGON_OFFSET_FILL);
  }
  function ve(P) {
    P ? _e(n.SCISSOR_TEST) : ce(n.SCISSOR_TEST);
  }
  function A(P) {
    P === void 0 && (P = n.TEXTURE0 + G - 1), V !== P && (n.activeTexture(P), V = P);
  }
  function _(P, ne, q) {
    q === void 0 && (V === null ? q = n.TEXTURE0 + G - 1 : q = V);
    let Y = de[q];
    Y === void 0 && (Y = { type: void 0, texture: void 0 }, de[q] = Y), (Y.type !== P || Y.texture !== ne) && (V !== q && (n.activeTexture(q), V = q), n.bindTexture(P, ne || ee[P]), Y.type = P, Y.texture = ne);
  }
  function F() {
    const P = de[V];
    P !== void 0 && P.type !== void 0 && (n.bindTexture(P.type, null), P.type = void 0, P.texture = void 0);
  }
  function $() {
    try {
      n.compressedTexImage2D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function J() {
    try {
      n.compressedTexImage3D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function Z() {
    try {
      n.texSubImage2D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function Te() {
    try {
      n.texSubImage3D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function ae() {
    try {
      n.compressedTexSubImage2D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function ge() {
    try {
      n.compressedTexSubImage3D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function Ie() {
    try {
      n.texStorage2D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function te() {
    try {
      n.texStorage3D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function pe() {
    try {
      n.texImage2D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function He() {
    try {
      n.texImage3D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function De(P) {
    Be.equals(P) === !1 && (n.scissor(P.x, P.y, P.z, P.w), Be.copy(P));
  }
  function Me(P) {
    We.equals(P) === !1 && (n.viewport(P.x, P.y, P.z, P.w), We.copy(P));
  }
  function Ue(P, ne) {
    let q = l.get(ne);
    q === void 0 && (q = /* @__PURE__ */ new WeakMap(), l.set(ne, q));
    let Y = q.get(P);
    Y === void 0 && (Y = n.getUniformBlockIndex(ne, P.name), q.set(P, Y));
  }
  function ze(P, ne) {
    const Y = l.get(ne).get(P);
    o.get(ne) !== Y && (n.uniformBlockBinding(ne, Y, P.__bindingPointIndex), o.set(ne, Y));
  }
  function Qe() {
    n.disable(n.BLEND), n.disable(n.CULL_FACE), n.disable(n.DEPTH_TEST), n.disable(n.POLYGON_OFFSET_FILL), n.disable(n.SCISSOR_TEST), n.disable(n.STENCIL_TEST), n.disable(n.SAMPLE_ALPHA_TO_COVERAGE), n.blendEquation(n.FUNC_ADD), n.blendFunc(n.ONE, n.ZERO), n.blendFuncSeparate(n.ONE, n.ZERO, n.ONE, n.ZERO), n.blendColor(0, 0, 0, 0), n.colorMask(!0, !0, !0, !0), n.clearColor(0, 0, 0, 0), n.depthMask(!0), n.depthFunc(n.LESS), n.clearDepth(1), n.stencilMask(4294967295), n.stencilFunc(n.ALWAYS, 0, 4294967295), n.stencilOp(n.KEEP, n.KEEP, n.KEEP), n.clearStencil(0), n.cullFace(n.BACK), n.frontFace(n.CCW), n.polygonOffset(0, 0), n.activeTexture(n.TEXTURE0), n.bindFramebuffer(n.FRAMEBUFFER, null), n.bindFramebuffer(n.DRAW_FRAMEBUFFER, null), n.bindFramebuffer(n.READ_FRAMEBUFFER, null), n.useProgram(null), n.lineWidth(1), n.scissor(0, 0, n.canvas.width, n.canvas.height), n.viewport(0, 0, n.canvas.width, n.canvas.height), c = {}, V = null, de = {}, h = {}, d = /* @__PURE__ */ new WeakMap(), f = [], m = null, g = !1, v = null, p = null, u = null, b = null, M = null, T = null, O = null, w = new ke(0, 0, 0), R = 0, I = !1, E = null, x = null, C = null, W = null, z = null, Be.set(0, 0, n.canvas.width, n.canvas.height), We.set(0, 0, n.canvas.width, n.canvas.height), r.reset(), s.reset(), a.reset();
  }
  return {
    buffers: {
      color: r,
      depth: s,
      stencil: a
    },
    enable: _e,
    disable: ce,
    bindFramebuffer: Ce,
    drawBuffers: Ne,
    useProgram: Pe,
    setBlending: ie,
    setMaterial: j,
    setFlipSided: he,
    setCullFace: X,
    setLineWidth: Ae,
    setPolygonOffset: ue,
    setScissorTest: ve,
    activeTexture: A,
    bindTexture: _,
    unbindTexture: F,
    compressedTexImage2D: $,
    compressedTexImage3D: J,
    texImage2D: pe,
    texImage3D: He,
    updateUBOMapping: Ue,
    uniformBlockBinding: ze,
    texStorage2D: Ie,
    texStorage3D: te,
    texSubImage2D: Z,
    texSubImage3D: Te,
    compressedTexSubImage2D: ae,
    compressedTexSubImage3D: ge,
    scissor: De,
    viewport: Me,
    reset: Qe
  };
}
function fo(n, e, t, i) {
  const r = Np(i);
  switch (t) {
    case Mo:
      return n * e;
    case yo:
      return n * e;
    case Eo:
      return n * e * 2;
    case To:
      return n * e / r.components * r.byteLength;
    case ks:
      return n * e / r.components * r.byteLength;
    case Ao:
      return n * e * 2 / r.components * r.byteLength;
    case Ws:
      return n * e * 2 / r.components * r.byteLength;
    case So:
      return n * e * 3 / r.components * r.byteLength;
    case Dt:
      return n * e * 4 / r.components * r.byteLength;
    case Xs:
      return n * e * 4 / r.components * r.byteLength;
    case er:
    case tr:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case ir:
    case nr:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case cs:
    case us:
      return Math.max(n, 16) * Math.max(e, 8) / 4;
    case ls:
    case hs:
      return Math.max(n, 8) * Math.max(e, 8) / 2;
    case fs:
    case ds:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case ps:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case ms:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case gs:
      return Math.floor((n + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case _s:
      return Math.floor((n + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case vs:
      return Math.floor((n + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case xs:
      return Math.floor((n + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case Ms:
      return Math.floor((n + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case Ss:
      return Math.floor((n + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case ys:
      return Math.floor((n + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case Es:
      return Math.floor((n + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case Ts:
      return Math.floor((n + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case As:
      return Math.floor((n + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case bs:
      return Math.floor((n + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case ws:
      return Math.floor((n + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case Rs:
      return Math.floor((n + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    case rr:
    case Cs:
    case Ps:
      return Math.ceil(n / 4) * Math.ceil(e / 4) * 16;
    case bo:
    case Ls:
      return Math.ceil(n / 4) * Math.ceil(e / 4) * 8;
    case Ds:
    case Us:
      return Math.ceil(n / 4) * Math.ceil(e / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${t} format.`
  );
}
function Np(n) {
  switch (n) {
    case jt:
    case _o:
      return { byteLength: 1, components: 1 };
    case _n:
    case vo:
    case yn:
      return { byteLength: 2, components: 1 };
    case Gs:
    case Vs:
      return { byteLength: 2, components: 4 };
    case bi:
    case Hs:
    case Kt:
      return { byteLength: 4, components: 1 };
    case xo:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${n}.`);
}
function Fp(n, e, t, i, r, s, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new le(), h = /* @__PURE__ */ new WeakMap();
  let d;
  const f = /* @__PURE__ */ new WeakMap();
  let m = !1;
  try {
    m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(A, _) {
    return m ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(A, _)
    ) : fr("canvas");
  }
  function v(A, _, F) {
    let $ = 1;
    const J = ve(A);
    if ((J.width > F || J.height > F) && ($ = F / Math.max(J.width, J.height)), $ < 1)
      if (typeof HTMLImageElement < "u" && A instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && A instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && A instanceof ImageBitmap || typeof VideoFrame < "u" && A instanceof VideoFrame) {
        const Z = Math.floor($ * J.width), Te = Math.floor($ * J.height);
        d === void 0 && (d = g(Z, Te));
        const ae = _ ? g(Z, Te) : d;
        return ae.width = Z, ae.height = Te, ae.getContext("2d").drawImage(A, 0, 0, Z, Te), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + J.width + "x" + J.height + ") to (" + Z + "x" + Te + ")."), ae;
      } else
        return "data" in A && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + J.width + "x" + J.height + ")."), A;
    return A;
  }
  function p(A) {
    return A.generateMipmaps && A.minFilter !== bt && A.minFilter !== Lt;
  }
  function u(A) {
    n.generateMipmap(A);
  }
  function b(A, _, F, $, J = !1) {
    if (A !== null) {
      if (n[A] !== void 0) return n[A];
      console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '" + A + "'");
    }
    let Z = _;
    if (_ === n.RED && (F === n.FLOAT && (Z = n.R32F), F === n.HALF_FLOAT && (Z = n.R16F), F === n.UNSIGNED_BYTE && (Z = n.R8)), _ === n.RED_INTEGER && (F === n.UNSIGNED_BYTE && (Z = n.R8UI), F === n.UNSIGNED_SHORT && (Z = n.R16UI), F === n.UNSIGNED_INT && (Z = n.R32UI), F === n.BYTE && (Z = n.R8I), F === n.SHORT && (Z = n.R16I), F === n.INT && (Z = n.R32I)), _ === n.RG && (F === n.FLOAT && (Z = n.RG32F), F === n.HALF_FLOAT && (Z = n.RG16F), F === n.UNSIGNED_BYTE && (Z = n.RG8)), _ === n.RG_INTEGER && (F === n.UNSIGNED_BYTE && (Z = n.RG8UI), F === n.UNSIGNED_SHORT && (Z = n.RG16UI), F === n.UNSIGNED_INT && (Z = n.RG32UI), F === n.BYTE && (Z = n.RG8I), F === n.SHORT && (Z = n.RG16I), F === n.INT && (Z = n.RG32I)), _ === n.RGB && F === n.UNSIGNED_INT_5_9_9_9_REV && (Z = n.RGB9_E5), _ === n.RGBA) {
      const Te = J ? lr : Ze.getTransfer($);
      F === n.FLOAT && (Z = n.RGBA32F), F === n.HALF_FLOAT && (Z = n.RGBA16F), F === n.UNSIGNED_BYTE && (Z = Te === Je ? n.SRGB8_ALPHA8 : n.RGBA8), F === n.UNSIGNED_SHORT_4_4_4_4 && (Z = n.RGBA4), F === n.UNSIGNED_SHORT_5_5_5_1 && (Z = n.RGB5_A1);
    }
    return (Z === n.R16F || Z === n.R32F || Z === n.RG16F || Z === n.RG32F || Z === n.RGBA16F || Z === n.RGBA32F) && e.get("EXT_color_buffer_float"), Z;
  }
  function M(A, _) {
    let F;
    return A ? _ === null || _ === bi || _ === tn ? F = n.DEPTH24_STENCIL8 : _ === Kt ? F = n.DEPTH32F_STENCIL8 : _ === _n && (F = n.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : _ === null || _ === bi || _ === tn ? F = n.DEPTH_COMPONENT24 : _ === Kt ? F = n.DEPTH_COMPONENT32F : _ === _n && (F = n.DEPTH_COMPONENT16), F;
  }
  function T(A, _) {
    return p(A) === !0 || A.isFramebufferTexture && A.minFilter !== bt && A.minFilter !== Lt ? Math.log2(Math.max(_.width, _.height)) + 1 : A.mipmaps !== void 0 && A.mipmaps.length > 0 ? A.mipmaps.length : A.isCompressedTexture && Array.isArray(A.image) ? _.mipmaps.length : 1;
  }
  function O(A) {
    const _ = A.target;
    _.removeEventListener("dispose", O), R(_), _.isVideoTexture && h.delete(_);
  }
  function w(A) {
    const _ = A.target;
    _.removeEventListener("dispose", w), E(_);
  }
  function R(A) {
    const _ = i.get(A);
    if (_.__webglInit === void 0) return;
    const F = A.source, $ = f.get(F);
    if ($) {
      const J = $[_.__cacheKey];
      J.usedTimes--, J.usedTimes === 0 && I(A), Object.keys($).length === 0 && f.delete(F);
    }
    i.remove(A);
  }
  function I(A) {
    const _ = i.get(A);
    n.deleteTexture(_.__webglTexture);
    const F = A.source, $ = f.get(F);
    delete $[_.__cacheKey], a.memory.textures--;
  }
  function E(A) {
    const _ = i.get(A);
    if (A.depthTexture && A.depthTexture.dispose(), A.isWebGLCubeRenderTarget)
      for (let $ = 0; $ < 6; $++) {
        if (Array.isArray(_.__webglFramebuffer[$]))
          for (let J = 0; J < _.__webglFramebuffer[$].length; J++) n.deleteFramebuffer(_.__webglFramebuffer[$][J]);
        else
          n.deleteFramebuffer(_.__webglFramebuffer[$]);
        _.__webglDepthbuffer && n.deleteRenderbuffer(_.__webglDepthbuffer[$]);
      }
    else {
      if (Array.isArray(_.__webglFramebuffer))
        for (let $ = 0; $ < _.__webglFramebuffer.length; $++) n.deleteFramebuffer(_.__webglFramebuffer[$]);
      else
        n.deleteFramebuffer(_.__webglFramebuffer);
      if (_.__webglDepthbuffer && n.deleteRenderbuffer(_.__webglDepthbuffer), _.__webglMultisampledFramebuffer && n.deleteFramebuffer(_.__webglMultisampledFramebuffer), _.__webglColorRenderbuffer)
        for (let $ = 0; $ < _.__webglColorRenderbuffer.length; $++)
          _.__webglColorRenderbuffer[$] && n.deleteRenderbuffer(_.__webglColorRenderbuffer[$]);
      _.__webglDepthRenderbuffer && n.deleteRenderbuffer(_.__webglDepthRenderbuffer);
    }
    const F = A.textures;
    for (let $ = 0, J = F.length; $ < J; $++) {
      const Z = i.get(F[$]);
      Z.__webglTexture && (n.deleteTexture(Z.__webglTexture), a.memory.textures--), i.remove(F[$]);
    }
    i.remove(A);
  }
  let x = 0;
  function C() {
    x = 0;
  }
  function W() {
    const A = x;
    return A >= r.maxTextures && console.warn("THREE.WebGLTextures: Trying to use " + A + " texture units while this GPU supports only " + r.maxTextures), x += 1, A;
  }
  function z(A) {
    const _ = [];
    return _.push(A.wrapS), _.push(A.wrapT), _.push(A.wrapR || 0), _.push(A.magFilter), _.push(A.minFilter), _.push(A.anisotropy), _.push(A.internalFormat), _.push(A.format), _.push(A.type), _.push(A.generateMipmaps), _.push(A.premultiplyAlpha), _.push(A.flipY), _.push(A.unpackAlignment), _.push(A.colorSpace), _.join();
  }
  function G(A, _) {
    const F = i.get(A);
    if (A.isVideoTexture && Ae(A), A.isRenderTargetTexture === !1 && A.version > 0 && F.__version !== A.version) {
      const $ = A.image;
      if ($ === null)
        console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");
      else if ($.complete === !1)
        console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");
      else {
        We(F, A, _);
        return;
      }
    }
    t.bindTexture(n.TEXTURE_2D, F.__webglTexture, n.TEXTURE0 + _);
  }
  function K(A, _) {
    const F = i.get(A);
    if (A.version > 0 && F.__version !== A.version) {
      We(F, A, _);
      return;
    }
    t.bindTexture(n.TEXTURE_2D_ARRAY, F.__webglTexture, n.TEXTURE0 + _);
  }
  function H(A, _) {
    const F = i.get(A);
    if (A.version > 0 && F.__version !== A.version) {
      We(F, A, _);
      return;
    }
    t.bindTexture(n.TEXTURE_3D, F.__webglTexture, n.TEXTURE0 + _);
  }
  function Q(A, _) {
    const F = i.get(A);
    if (A.version > 0 && F.__version !== A.version) {
      k(F, A, _);
      return;
    }
    t.bindTexture(n.TEXTURE_CUBE_MAP, F.__webglTexture, n.TEXTURE0 + _);
  }
  const V = {
    [as]: n.REPEAT,
    [Ti]: n.CLAMP_TO_EDGE,
    [os]: n.MIRRORED_REPEAT
  }, de = {
    [bt]: n.NEAREST,
    [Xl]: n.NEAREST_MIPMAP_NEAREST,
    [Rn]: n.NEAREST_MIPMAP_LINEAR,
    [Lt]: n.LINEAR,
    [Ar]: n.LINEAR_MIPMAP_NEAREST,
    [Ai]: n.LINEAR_MIPMAP_LINEAR
  }, xe = {
    [Zl]: n.NEVER,
    [tc]: n.ALWAYS,
    [Jl]: n.LESS,
    [Ro]: n.LEQUAL,
    [$l]: n.EQUAL,
    [ec]: n.GEQUAL,
    [jl]: n.GREATER,
    [Ql]: n.NOTEQUAL
  };
  function me(A, _) {
    if (_.type === Kt && e.has("OES_texture_float_linear") === !1 && (_.magFilter === Lt || _.magFilter === Ar || _.magFilter === Rn || _.magFilter === Ai || _.minFilter === Lt || _.minFilter === Ar || _.minFilter === Rn || _.minFilter === Ai) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), n.texParameteri(A, n.TEXTURE_WRAP_S, V[_.wrapS]), n.texParameteri(A, n.TEXTURE_WRAP_T, V[_.wrapT]), (A === n.TEXTURE_3D || A === n.TEXTURE_2D_ARRAY) && n.texParameteri(A, n.TEXTURE_WRAP_R, V[_.wrapR]), n.texParameteri(A, n.TEXTURE_MAG_FILTER, de[_.magFilter]), n.texParameteri(A, n.TEXTURE_MIN_FILTER, de[_.minFilter]), _.compareFunction && (n.texParameteri(A, n.TEXTURE_COMPARE_MODE, n.COMPARE_REF_TO_TEXTURE), n.texParameteri(A, n.TEXTURE_COMPARE_FUNC, xe[_.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (_.magFilter === bt || _.minFilter !== Rn && _.minFilter !== Ai || _.type === Kt && e.has("OES_texture_float_linear") === !1) return;
      if (_.anisotropy > 1 || i.get(_).__currentAnisotropy) {
        const F = e.get("EXT_texture_filter_anisotropic");
        n.texParameterf(A, F.TEXTURE_MAX_ANISOTROPY_EXT, Math.min(_.anisotropy, r.getMaxAnisotropy())), i.get(_).__currentAnisotropy = _.anisotropy;
      }
    }
  }
  function Be(A, _) {
    let F = !1;
    A.__webglInit === void 0 && (A.__webglInit = !0, _.addEventListener("dispose", O));
    const $ = _.source;
    let J = f.get($);
    J === void 0 && (J = {}, f.set($, J));
    const Z = z(_);
    if (Z !== A.__cacheKey) {
      J[Z] === void 0 && (J[Z] = {
        texture: n.createTexture(),
        usedTimes: 0
      }, a.memory.textures++, F = !0), J[Z].usedTimes++;
      const Te = J[A.__cacheKey];
      Te !== void 0 && (J[A.__cacheKey].usedTimes--, Te.usedTimes === 0 && I(_)), A.__cacheKey = Z, A.__webglTexture = J[Z].texture;
    }
    return F;
  }
  function We(A, _, F) {
    let $ = n.TEXTURE_2D;
    (_.isDataArrayTexture || _.isCompressedArrayTexture) && ($ = n.TEXTURE_2D_ARRAY), _.isData3DTexture && ($ = n.TEXTURE_3D);
    const J = Be(A, _), Z = _.source;
    t.bindTexture($, A.__webglTexture, n.TEXTURE0 + F);
    const Te = i.get(Z);
    if (Z.version !== Te.__version || J === !0) {
      t.activeTexture(n.TEXTURE0 + F);
      const ae = Ze.getPrimaries(Ze.workingColorSpace), ge = _.colorSpace === ai ? null : Ze.getPrimaries(_.colorSpace), Ie = _.colorSpace === ai || ae === ge ? n.NONE : n.BROWSER_DEFAULT_WEBGL;
      n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, _.flipY), n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL, _.premultiplyAlpha), n.pixelStorei(n.UNPACK_ALIGNMENT, _.unpackAlignment), n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL, Ie);
      let te = v(_.image, !1, r.maxTextureSize);
      te = ue(_, te);
      const pe = s.convert(_.format, _.colorSpace), He = s.convert(_.type);
      let De = b(_.internalFormat, pe, He, _.colorSpace, _.isVideoTexture);
      me($, _);
      let Me;
      const Ue = _.mipmaps, ze = _.isVideoTexture !== !0, Qe = Te.__version === void 0 || J === !0, P = Z.dataReady, ne = T(_, te);
      if (_.isDepthTexture)
        De = M(_.format === nn, _.type), Qe && (ze ? t.texStorage2D(n.TEXTURE_2D, 1, De, te.width, te.height) : t.texImage2D(n.TEXTURE_2D, 0, De, te.width, te.height, 0, pe, He, null));
      else if (_.isDataTexture)
        if (Ue.length > 0) {
          ze && Qe && t.texStorage2D(n.TEXTURE_2D, ne, De, Ue[0].width, Ue[0].height);
          for (let q = 0, Y = Ue.length; q < Y; q++)
            Me = Ue[q], ze ? P && t.texSubImage2D(n.TEXTURE_2D, q, 0, 0, Me.width, Me.height, pe, He, Me.data) : t.texImage2D(n.TEXTURE_2D, q, De, Me.width, Me.height, 0, pe, He, Me.data);
          _.generateMipmaps = !1;
        } else
          ze ? (Qe && t.texStorage2D(n.TEXTURE_2D, ne, De, te.width, te.height), P && t.texSubImage2D(n.TEXTURE_2D, 0, 0, 0, te.width, te.height, pe, He, te.data)) : t.texImage2D(n.TEXTURE_2D, 0, De, te.width, te.height, 0, pe, He, te.data);
      else if (_.isCompressedTexture)
        if (_.isCompressedArrayTexture) {
          ze && Qe && t.texStorage3D(n.TEXTURE_2D_ARRAY, ne, De, Ue[0].width, Ue[0].height, te.depth);
          for (let q = 0, Y = Ue.length; q < Y; q++)
            if (Me = Ue[q], _.format !== Dt)
              if (pe !== null)
                if (ze) {
                  if (P)
                    if (_.layerUpdates.size > 0) {
                      const se = fo(Me.width, Me.height, _.format, _.type);
                      for (const we of _.layerUpdates) {
                        const Ge = Me.data.subarray(
                          we * se / Me.data.BYTES_PER_ELEMENT,
                          (we + 1) * se / Me.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY, q, 0, 0, we, Me.width, Me.height, 1, pe, Ge, 0, 0);
                      }
                      _.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY, q, 0, 0, 0, Me.width, Me.height, te.depth, pe, Me.data, 0, 0);
                } else
                  t.compressedTexImage3D(n.TEXTURE_2D_ARRAY, q, De, Me.width, Me.height, te.depth, 0, Me.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              ze ? P && t.texSubImage3D(n.TEXTURE_2D_ARRAY, q, 0, 0, 0, Me.width, Me.height, te.depth, pe, He, Me.data) : t.texImage3D(n.TEXTURE_2D_ARRAY, q, De, Me.width, Me.height, te.depth, 0, pe, He, Me.data);
        } else {
          ze && Qe && t.texStorage2D(n.TEXTURE_2D, ne, De, Ue[0].width, Ue[0].height);
          for (let q = 0, Y = Ue.length; q < Y; q++)
            Me = Ue[q], _.format !== Dt ? pe !== null ? ze ? P && t.compressedTexSubImage2D(n.TEXTURE_2D, q, 0, 0, Me.width, Me.height, pe, Me.data) : t.compressedTexImage2D(n.TEXTURE_2D, q, De, Me.width, Me.height, 0, Me.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ze ? P && t.texSubImage2D(n.TEXTURE_2D, q, 0, 0, Me.width, Me.height, pe, He, Me.data) : t.texImage2D(n.TEXTURE_2D, q, De, Me.width, Me.height, 0, pe, He, Me.data);
        }
      else if (_.isDataArrayTexture)
        if (ze) {
          if (Qe && t.texStorage3D(n.TEXTURE_2D_ARRAY, ne, De, te.width, te.height, te.depth), P)
            if (_.layerUpdates.size > 0) {
              const q = fo(te.width, te.height, _.format, _.type);
              for (const Y of _.layerUpdates) {
                const se = te.data.subarray(
                  Y * q / te.data.BYTES_PER_ELEMENT,
                  (Y + 1) * q / te.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(n.TEXTURE_2D_ARRAY, 0, 0, 0, Y, te.width, te.height, 1, pe, He, se);
              }
              _.clearLayerUpdates();
            } else
              t.texSubImage3D(n.TEXTURE_2D_ARRAY, 0, 0, 0, 0, te.width, te.height, te.depth, pe, He, te.data);
        } else
          t.texImage3D(n.TEXTURE_2D_ARRAY, 0, De, te.width, te.height, te.depth, 0, pe, He, te.data);
      else if (_.isData3DTexture)
        ze ? (Qe && t.texStorage3D(n.TEXTURE_3D, ne, De, te.width, te.height, te.depth), P && t.texSubImage3D(n.TEXTURE_3D, 0, 0, 0, 0, te.width, te.height, te.depth, pe, He, te.data)) : t.texImage3D(n.TEXTURE_3D, 0, De, te.width, te.height, te.depth, 0, pe, He, te.data);
      else if (_.isFramebufferTexture) {
        if (Qe)
          if (ze)
            t.texStorage2D(n.TEXTURE_2D, ne, De, te.width, te.height);
          else {
            let q = te.width, Y = te.height;
            for (let se = 0; se < ne; se++)
              t.texImage2D(n.TEXTURE_2D, se, De, q, Y, 0, pe, He, null), q >>= 1, Y >>= 1;
          }
      } else if (Ue.length > 0) {
        if (ze && Qe) {
          const q = ve(Ue[0]);
          t.texStorage2D(n.TEXTURE_2D, ne, De, q.width, q.height);
        }
        for (let q = 0, Y = Ue.length; q < Y; q++)
          Me = Ue[q], ze ? P && t.texSubImage2D(n.TEXTURE_2D, q, 0, 0, pe, He, Me) : t.texImage2D(n.TEXTURE_2D, q, De, pe, He, Me);
        _.generateMipmaps = !1;
      } else if (ze) {
        if (Qe) {
          const q = ve(te);
          t.texStorage2D(n.TEXTURE_2D, ne, De, q.width, q.height);
        }
        P && t.texSubImage2D(n.TEXTURE_2D, 0, 0, 0, pe, He, te);
      } else
        t.texImage2D(n.TEXTURE_2D, 0, De, pe, He, te);
      p(_) && u($), Te.__version = Z.version, _.onUpdate && _.onUpdate(_);
    }
    A.__version = _.version;
  }
  function k(A, _, F) {
    if (_.image.length !== 6) return;
    const $ = Be(A, _), J = _.source;
    t.bindTexture(n.TEXTURE_CUBE_MAP, A.__webglTexture, n.TEXTURE0 + F);
    const Z = i.get(J);
    if (J.version !== Z.__version || $ === !0) {
      t.activeTexture(n.TEXTURE0 + F);
      const Te = Ze.getPrimaries(Ze.workingColorSpace), ae = _.colorSpace === ai ? null : Ze.getPrimaries(_.colorSpace), ge = _.colorSpace === ai || Te === ae ? n.NONE : n.BROWSER_DEFAULT_WEBGL;
      n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, _.flipY), n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL, _.premultiplyAlpha), n.pixelStorei(n.UNPACK_ALIGNMENT, _.unpackAlignment), n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL, ge);
      const Ie = _.isCompressedTexture || _.image[0].isCompressedTexture, te = _.image[0] && _.image[0].isDataTexture, pe = [];
      for (let Y = 0; Y < 6; Y++)
        !Ie && !te ? pe[Y] = v(_.image[Y], !0, r.maxCubemapSize) : pe[Y] = te ? _.image[Y].image : _.image[Y], pe[Y] = ue(_, pe[Y]);
      const He = pe[0], De = s.convert(_.format, _.colorSpace), Me = s.convert(_.type), Ue = b(_.internalFormat, De, Me, _.colorSpace), ze = _.isVideoTexture !== !0, Qe = Z.__version === void 0 || $ === !0, P = J.dataReady;
      let ne = T(_, He);
      me(n.TEXTURE_CUBE_MAP, _);
      let q;
      if (Ie) {
        ze && Qe && t.texStorage2D(n.TEXTURE_CUBE_MAP, ne, Ue, He.width, He.height);
        for (let Y = 0; Y < 6; Y++) {
          q = pe[Y].mipmaps;
          for (let se = 0; se < q.length; se++) {
            const we = q[se];
            _.format !== Dt ? De !== null ? ze ? P && t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, 0, 0, we.width, we.height, De, we.data) : t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, Ue, we.width, we.height, 0, we.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, 0, 0, we.width, we.height, De, Me, we.data) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, Ue, we.width, we.height, 0, De, Me, we.data);
          }
        }
      } else {
        if (q = _.mipmaps, ze && Qe) {
          q.length > 0 && ne++;
          const Y = ve(pe[0]);
          t.texStorage2D(n.TEXTURE_CUBE_MAP, ne, Ue, Y.width, Y.height);
        }
        for (let Y = 0; Y < 6; Y++)
          if (te) {
            ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, 0, 0, pe[Y].width, pe[Y].height, De, Me, pe[Y].data) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, Ue, pe[Y].width, pe[Y].height, 0, De, Me, pe[Y].data);
            for (let se = 0; se < q.length; se++) {
              const Ge = q[se].image[Y].image;
              ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, 0, 0, Ge.width, Ge.height, De, Me, Ge.data) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, Ue, Ge.width, Ge.height, 0, De, Me, Ge.data);
            }
          } else {
            ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, 0, 0, De, Me, pe[Y]) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, Ue, De, Me, pe[Y]);
            for (let se = 0; se < q.length; se++) {
              const we = q[se];
              ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, 0, 0, De, Me, we.image[Y]) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, Ue, De, Me, we.image[Y]);
            }
          }
      }
      p(_) && u(n.TEXTURE_CUBE_MAP), Z.__version = J.version, _.onUpdate && _.onUpdate(_);
    }
    A.__version = _.version;
  }
  function ee(A, _, F, $, J, Z) {
    const Te = s.convert(F.format, F.colorSpace), ae = s.convert(F.type), ge = b(F.internalFormat, Te, ae, F.colorSpace);
    if (!i.get(_).__hasExternalTextures) {
      const te = Math.max(1, _.width >> Z), pe = Math.max(1, _.height >> Z);
      J === n.TEXTURE_3D || J === n.TEXTURE_2D_ARRAY ? t.texImage3D(J, Z, ge, te, pe, _.depth, 0, Te, ae, null) : t.texImage2D(J, Z, ge, te, pe, 0, Te, ae, null);
    }
    t.bindFramebuffer(n.FRAMEBUFFER, A), X(_) ? o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER, $, J, i.get(F).__webglTexture, 0, he(_)) : (J === n.TEXTURE_2D || J >= n.TEXTURE_CUBE_MAP_POSITIVE_X && J <= n.TEXTURE_CUBE_MAP_NEGATIVE_Z) && n.framebufferTexture2D(n.FRAMEBUFFER, $, J, i.get(F).__webglTexture, Z), t.bindFramebuffer(n.FRAMEBUFFER, null);
  }
  function _e(A, _, F) {
    if (n.bindRenderbuffer(n.RENDERBUFFER, A), _.depthBuffer) {
      const $ = _.depthTexture, J = $ && $.isDepthTexture ? $.type : null, Z = M(_.stencilBuffer, J), Te = _.stencilBuffer ? n.DEPTH_STENCIL_ATTACHMENT : n.DEPTH_ATTACHMENT, ae = he(_);
      X(_) ? o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER, ae, Z, _.width, _.height) : F ? n.renderbufferStorageMultisample(n.RENDERBUFFER, ae, Z, _.width, _.height) : n.renderbufferStorage(n.RENDERBUFFER, Z, _.width, _.height), n.framebufferRenderbuffer(n.FRAMEBUFFER, Te, n.RENDERBUFFER, A);
    } else {
      const $ = _.textures;
      for (let J = 0; J < $.length; J++) {
        const Z = $[J], Te = s.convert(Z.format, Z.colorSpace), ae = s.convert(Z.type), ge = b(Z.internalFormat, Te, ae, Z.colorSpace), Ie = he(_);
        F && X(_) === !1 ? n.renderbufferStorageMultisample(n.RENDERBUFFER, Ie, ge, _.width, _.height) : X(_) ? o.renderbufferStorageMultisampleEXT(n.RENDERBUFFER, Ie, ge, _.width, _.height) : n.renderbufferStorage(n.RENDERBUFFER, ge, _.width, _.height);
      }
    }
    n.bindRenderbuffer(n.RENDERBUFFER, null);
  }
  function ce(A, _) {
    if (_ && _.isWebGLCubeRenderTarget) throw new Error("Depth Texture with cube render targets is not supported");
    if (t.bindFramebuffer(n.FRAMEBUFFER, A), !(_.depthTexture && _.depthTexture.isDepthTexture))
      throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");
    (!i.get(_.depthTexture).__webglTexture || _.depthTexture.image.width !== _.width || _.depthTexture.image.height !== _.height) && (_.depthTexture.image.width = _.width, _.depthTexture.image.height = _.height, _.depthTexture.needsUpdate = !0), G(_.depthTexture, 0);
    const $ = i.get(_.depthTexture).__webglTexture, J = he(_);
    if (_.depthTexture.format === Ji)
      X(_) ? o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER, n.DEPTH_ATTACHMENT, n.TEXTURE_2D, $, 0, J) : n.framebufferTexture2D(n.FRAMEBUFFER, n.DEPTH_ATTACHMENT, n.TEXTURE_2D, $, 0);
    else if (_.depthTexture.format === nn)
      X(_) ? o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER, n.DEPTH_STENCIL_ATTACHMENT, n.TEXTURE_2D, $, 0, J) : n.framebufferTexture2D(n.FRAMEBUFFER, n.DEPTH_STENCIL_ATTACHMENT, n.TEXTURE_2D, $, 0);
    else
      throw new Error("Unknown depthTexture format");
  }
  function Ce(A) {
    const _ = i.get(A), F = A.isWebGLCubeRenderTarget === !0;
    if (A.depthTexture && !_.__autoAllocateDepthBuffer) {
      if (F) throw new Error("target.depthTexture not supported in Cube render targets");
      ce(_.__webglFramebuffer, A);
    } else if (F) {
      _.__webglDepthbuffer = [];
      for (let $ = 0; $ < 6; $++)
        t.bindFramebuffer(n.FRAMEBUFFER, _.__webglFramebuffer[$]), _.__webglDepthbuffer[$] = n.createRenderbuffer(), _e(_.__webglDepthbuffer[$], A, !1);
    } else
      t.bindFramebuffer(n.FRAMEBUFFER, _.__webglFramebuffer), _.__webglDepthbuffer = n.createRenderbuffer(), _e(_.__webglDepthbuffer, A, !1);
    t.bindFramebuffer(n.FRAMEBUFFER, null);
  }
  function Ne(A, _, F) {
    const $ = i.get(A);
    _ !== void 0 && ee($.__webglFramebuffer, A, A.texture, n.COLOR_ATTACHMENT0, n.TEXTURE_2D, 0), F !== void 0 && Ce(A);
  }
  function Pe(A) {
    const _ = A.texture, F = i.get(A), $ = i.get(_);
    A.addEventListener("dispose", w);
    const J = A.textures, Z = A.isWebGLCubeRenderTarget === !0, Te = J.length > 1;
    if (Te || ($.__webglTexture === void 0 && ($.__webglTexture = n.createTexture()), $.__version = _.version, a.memory.textures++), Z) {
      F.__webglFramebuffer = [];
      for (let ae = 0; ae < 6; ae++)
        if (_.mipmaps && _.mipmaps.length > 0) {
          F.__webglFramebuffer[ae] = [];
          for (let ge = 0; ge < _.mipmaps.length; ge++)
            F.__webglFramebuffer[ae][ge] = n.createFramebuffer();
        } else
          F.__webglFramebuffer[ae] = n.createFramebuffer();
    } else {
      if (_.mipmaps && _.mipmaps.length > 0) {
        F.__webglFramebuffer = [];
        for (let ae = 0; ae < _.mipmaps.length; ae++)
          F.__webglFramebuffer[ae] = n.createFramebuffer();
      } else
        F.__webglFramebuffer = n.createFramebuffer();
      if (Te)
        for (let ae = 0, ge = J.length; ae < ge; ae++) {
          const Ie = i.get(J[ae]);
          Ie.__webglTexture === void 0 && (Ie.__webglTexture = n.createTexture(), a.memory.textures++);
        }
      if (A.samples > 0 && X(A) === !1) {
        F.__webglMultisampledFramebuffer = n.createFramebuffer(), F.__webglColorRenderbuffer = [], t.bindFramebuffer(n.FRAMEBUFFER, F.__webglMultisampledFramebuffer);
        for (let ae = 0; ae < J.length; ae++) {
          const ge = J[ae];
          F.__webglColorRenderbuffer[ae] = n.createRenderbuffer(), n.bindRenderbuffer(n.RENDERBUFFER, F.__webglColorRenderbuffer[ae]);
          const Ie = s.convert(ge.format, ge.colorSpace), te = s.convert(ge.type), pe = b(ge.internalFormat, Ie, te, ge.colorSpace, A.isXRRenderTarget === !0), He = he(A);
          n.renderbufferStorageMultisample(n.RENDERBUFFER, He, pe, A.width, A.height), n.framebufferRenderbuffer(n.FRAMEBUFFER, n.COLOR_ATTACHMENT0 + ae, n.RENDERBUFFER, F.__webglColorRenderbuffer[ae]);
        }
        n.bindRenderbuffer(n.RENDERBUFFER, null), A.depthBuffer && (F.__webglDepthRenderbuffer = n.createRenderbuffer(), _e(F.__webglDepthRenderbuffer, A, !0)), t.bindFramebuffer(n.FRAMEBUFFER, null);
      }
    }
    if (Z) {
      t.bindTexture(n.TEXTURE_CUBE_MAP, $.__webglTexture), me(n.TEXTURE_CUBE_MAP, _);
      for (let ae = 0; ae < 6; ae++)
        if (_.mipmaps && _.mipmaps.length > 0)
          for (let ge = 0; ge < _.mipmaps.length; ge++)
            ee(F.__webglFramebuffer[ae][ge], A, _, n.COLOR_ATTACHMENT0, n.TEXTURE_CUBE_MAP_POSITIVE_X + ae, ge);
        else
          ee(F.__webglFramebuffer[ae], A, _, n.COLOR_ATTACHMENT0, n.TEXTURE_CUBE_MAP_POSITIVE_X + ae, 0);
      p(_) && u(n.TEXTURE_CUBE_MAP), t.unbindTexture();
    } else if (Te) {
      for (let ae = 0, ge = J.length; ae < ge; ae++) {
        const Ie = J[ae], te = i.get(Ie);
        t.bindTexture(n.TEXTURE_2D, te.__webglTexture), me(n.TEXTURE_2D, Ie), ee(F.__webglFramebuffer, A, Ie, n.COLOR_ATTACHMENT0 + ae, n.TEXTURE_2D, 0), p(Ie) && u(n.TEXTURE_2D);
      }
      t.unbindTexture();
    } else {
      let ae = n.TEXTURE_2D;
      if ((A.isWebGL3DRenderTarget || A.isWebGLArrayRenderTarget) && (ae = A.isWebGL3DRenderTarget ? n.TEXTURE_3D : n.TEXTURE_2D_ARRAY), t.bindTexture(ae, $.__webglTexture), me(ae, _), _.mipmaps && _.mipmaps.length > 0)
        for (let ge = 0; ge < _.mipmaps.length; ge++)
          ee(F.__webglFramebuffer[ge], A, _, n.COLOR_ATTACHMENT0, ae, ge);
      else
        ee(F.__webglFramebuffer, A, _, n.COLOR_ATTACHMENT0, ae, 0);
      p(_) && u(ae), t.unbindTexture();
    }
    A.depthBuffer && Ce(A);
  }
  function Ve(A) {
    const _ = A.textures;
    for (let F = 0, $ = _.length; F < $; F++) {
      const J = _[F];
      if (p(J)) {
        const Z = A.isWebGLCubeRenderTarget ? n.TEXTURE_CUBE_MAP : n.TEXTURE_2D, Te = i.get(J).__webglTexture;
        t.bindTexture(Z, Te), u(Z), t.unbindTexture();
      }
    }
  }
  const y = [], ie = [];
  function j(A) {
    if (A.samples > 0) {
      if (X(A) === !1) {
        const _ = A.textures, F = A.width, $ = A.height;
        let J = n.COLOR_BUFFER_BIT;
        const Z = A.stencilBuffer ? n.DEPTH_STENCIL_ATTACHMENT : n.DEPTH_ATTACHMENT, Te = i.get(A), ae = _.length > 1;
        if (ae)
          for (let ge = 0; ge < _.length; ge++)
            t.bindFramebuffer(n.FRAMEBUFFER, Te.__webglMultisampledFramebuffer), n.framebufferRenderbuffer(n.FRAMEBUFFER, n.COLOR_ATTACHMENT0 + ge, n.RENDERBUFFER, null), t.bindFramebuffer(n.FRAMEBUFFER, Te.__webglFramebuffer), n.framebufferTexture2D(n.DRAW_FRAMEBUFFER, n.COLOR_ATTACHMENT0 + ge, n.TEXTURE_2D, null, 0);
        t.bindFramebuffer(n.READ_FRAMEBUFFER, Te.__webglMultisampledFramebuffer), t.bindFramebuffer(n.DRAW_FRAMEBUFFER, Te.__webglFramebuffer);
        for (let ge = 0; ge < _.length; ge++) {
          if (A.resolveDepthBuffer && (A.depthBuffer && (J |= n.DEPTH_BUFFER_BIT), A.stencilBuffer && A.resolveStencilBuffer && (J |= n.STENCIL_BUFFER_BIT)), ae) {
            n.framebufferRenderbuffer(n.READ_FRAMEBUFFER, n.COLOR_ATTACHMENT0, n.RENDERBUFFER, Te.__webglColorRenderbuffer[ge]);
            const Ie = i.get(_[ge]).__webglTexture;
            n.framebufferTexture2D(n.DRAW_FRAMEBUFFER, n.COLOR_ATTACHMENT0, n.TEXTURE_2D, Ie, 0);
          }
          n.blitFramebuffer(0, 0, F, $, 0, 0, F, $, J, n.NEAREST), l === !0 && (y.length = 0, ie.length = 0, y.push(n.COLOR_ATTACHMENT0 + ge), A.depthBuffer && A.resolveDepthBuffer === !1 && (y.push(Z), ie.push(Z), n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER, ie)), n.invalidateFramebuffer(n.READ_FRAMEBUFFER, y));
        }
        if (t.bindFramebuffer(n.READ_FRAMEBUFFER, null), t.bindFramebuffer(n.DRAW_FRAMEBUFFER, null), ae)
          for (let ge = 0; ge < _.length; ge++) {
            t.bindFramebuffer(n.FRAMEBUFFER, Te.__webglMultisampledFramebuffer), n.framebufferRenderbuffer(n.FRAMEBUFFER, n.COLOR_ATTACHMENT0 + ge, n.RENDERBUFFER, Te.__webglColorRenderbuffer[ge]);
            const Ie = i.get(_[ge]).__webglTexture;
            t.bindFramebuffer(n.FRAMEBUFFER, Te.__webglFramebuffer), n.framebufferTexture2D(n.DRAW_FRAMEBUFFER, n.COLOR_ATTACHMENT0 + ge, n.TEXTURE_2D, Ie, 0);
          }
        t.bindFramebuffer(n.DRAW_FRAMEBUFFER, Te.__webglMultisampledFramebuffer);
      } else if (A.depthBuffer && A.resolveDepthBuffer === !1 && l) {
        const _ = A.stencilBuffer ? n.DEPTH_STENCIL_ATTACHMENT : n.DEPTH_ATTACHMENT;
        n.invalidateFramebuffer(n.DRAW_FRAMEBUFFER, [_]);
      }
    }
  }
  function he(A) {
    return Math.min(r.maxSamples, A.samples);
  }
  function X(A) {
    const _ = i.get(A);
    return A.samples > 0 && e.has("WEBGL_multisampled_render_to_texture") === !0 && _.__useRenderToTexture !== !1;
  }
  function Ae(A) {
    const _ = a.render.frame;
    h.get(A) !== _ && (h.set(A, _), A.update());
  }
  function ue(A, _) {
    const F = A.colorSpace, $ = A.format, J = A.type;
    return A.isCompressedTexture === !0 || A.isVideoTexture === !0 || F !== ui && F !== ai && (Ze.getTransfer(F) === Je ? ($ !== Dt || J !== jt) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), _;
  }
  function ve(A) {
    return typeof HTMLImageElement < "u" && A instanceof HTMLImageElement ? (c.width = A.naturalWidth || A.width, c.height = A.naturalHeight || A.height) : typeof VideoFrame < "u" && A instanceof VideoFrame ? (c.width = A.displayWidth, c.height = A.displayHeight) : (c.width = A.width, c.height = A.height), c;
  }
  this.allocateTextureUnit = W, this.resetTextureUnits = C, this.setTexture2D = G, this.setTexture2DArray = K, this.setTexture3D = H, this.setTextureCube = Q, this.rebindTextures = Ne, this.setupRenderTarget = Pe, this.updateRenderTargetMipmap = Ve, this.updateMultisampleRenderTarget = j, this.setupDepthRenderbuffer = Ce, this.setupFrameBufferTexture = ee, this.useMultisampledRTT = X;
}
function Op(n, e) {
  function t(i, r = ai) {
    let s;
    const a = Ze.getTransfer(r);
    if (i === jt) return n.UNSIGNED_BYTE;
    if (i === Gs) return n.UNSIGNED_SHORT_4_4_4_4;
    if (i === Vs) return n.UNSIGNED_SHORT_5_5_5_1;
    if (i === xo) return n.UNSIGNED_INT_5_9_9_9_REV;
    if (i === _o) return n.BYTE;
    if (i === vo) return n.SHORT;
    if (i === _n) return n.UNSIGNED_SHORT;
    if (i === Hs) return n.INT;
    if (i === bi) return n.UNSIGNED_INT;
    if (i === Kt) return n.FLOAT;
    if (i === yn) return n.HALF_FLOAT;
    if (i === Mo) return n.ALPHA;
    if (i === So) return n.RGB;
    if (i === Dt) return n.RGBA;
    if (i === yo) return n.LUMINANCE;
    if (i === Eo) return n.LUMINANCE_ALPHA;
    if (i === Ji) return n.DEPTH_COMPONENT;
    if (i === nn) return n.DEPTH_STENCIL;
    if (i === To) return n.RED;
    if (i === ks) return n.RED_INTEGER;
    if (i === Ao) return n.RG;
    if (i === Ws) return n.RG_INTEGER;
    if (i === Xs) return n.RGBA_INTEGER;
    if (i === er || i === tr || i === ir || i === nr)
      if (a === Je)
        if (s = e.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (i === er) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (i === tr) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (i === ir) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (i === nr) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = e.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (i === er) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (i === tr) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (i === ir) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (i === nr) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (i === ls || i === cs || i === hs || i === us)
      if (s = e.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (i === ls) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (i === cs) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (i === hs) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (i === us) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (i === fs || i === ds || i === ps)
      if (s = e.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (i === fs || i === ds) return a === Je ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (i === ps) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (i === ms || i === gs || i === _s || i === vs || i === xs || i === Ms || i === Ss || i === ys || i === Es || i === Ts || i === As || i === bs || i === ws || i === Rs)
      if (s = e.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (i === ms) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (i === gs) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (i === _s) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (i === vs) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (i === xs) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (i === Ms) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (i === Ss) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (i === ys) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (i === Es) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (i === Ts) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (i === As) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (i === bs) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (i === ws) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (i === Rs) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (i === rr || i === Cs || i === Ps)
      if (s = e.get("EXT_texture_compression_bptc"), s !== null) {
        if (i === rr) return a === Je ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (i === Cs) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (i === Ps) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (i === bo || i === Ls || i === Ds || i === Us)
      if (s = e.get("EXT_texture_compression_rgtc"), s !== null) {
        if (i === rr) return s.COMPRESSED_RED_RGTC1_EXT;
        if (i === Ls) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (i === Ds) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (i === Us) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return i === tn ? n.UNSIGNED_INT_24_8 : n[i] !== void 0 ? n[i] : null;
  }
  return { convert: t };
}
class Bp extends At {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
const zp = { type: "move" };
class es {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new Gn(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new Gn(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new L(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new L()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new Gn(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new L(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new L()), this._grip;
  }
  dispatchEvent(e) {
    return this._targetRay !== null && this._targetRay.dispatchEvent(e), this._grip !== null && this._grip.dispatchEvent(e), this._hand !== null && this._hand.dispatchEvent(e), this;
  }
  connect(e) {
    if (e && e.hand) {
      const t = this._hand;
      if (t)
        for (const i of e.hand.values())
          this._getHandJoint(t, i);
    }
    return this.dispatchEvent({ type: "connected", data: e }), this;
  }
  disconnect(e) {
    return this.dispatchEvent({ type: "disconnected", data: e }), this._targetRay !== null && (this._targetRay.visible = !1), this._grip !== null && (this._grip.visible = !1), this._hand !== null && (this._hand.visible = !1), this;
  }
  update(e, t, i) {
    let r = null, s = null, a = null;
    const o = this._targetRay, l = this._grip, c = this._hand;
    if (e && t.session.visibilityState !== "visible-blurred") {
      if (c && e.hand) {
        a = !0;
        for (const v of e.hand.values()) {
          const p = t.getJointPose(v, i), u = this._getHandJoint(c, v);
          p !== null && (u.matrix.fromArray(p.transform.matrix), u.matrix.decompose(u.position, u.rotation, u.scale), u.matrixWorldNeedsUpdate = !0, u.jointRadius = p.radius), u.visible = p !== null;
        }
        const h = c.joints["index-finger-tip"], d = c.joints["thumb-tip"], f = h.position.distanceTo(d.position), m = 0.02, g = 5e-3;
        c.inputState.pinching && f > m + g ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !c.inputState.pinching && f <= m - g && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else
        l !== null && e.gripSpace && (s = t.getPose(e.gripSpace, i), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
      o !== null && (r = t.getPose(e.targetRaySpace, i), r === null && s !== null && (r = s), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(zp)));
    }
    return o !== null && (o.visible = r !== null), l !== null && (l.visible = s !== null), c !== null && (c.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const i = new Gn();
      i.matrixAutoUpdate = !1, i.visible = !1, e.joints[t.jointName] = i, e.add(i);
    }
    return e.joints[t.jointName];
  }
}
const Hp = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, Gp = `
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;
class Vp {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, i) {
    if (this.texture === null) {
      const r = new vt(), s = e.properties.get(r);
      s.__webglTexture = t.texture, (t.depthNear != i.depthNear || t.depthFar != i.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = r;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, i = new hi({
        vertexShader: Hp,
        fragmentShader: Gp,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Jt(new gr(20, 20), i);
    }
    return this.mesh;
  }
  reset() {
    this.texture = null, this.mesh = null;
  }
  getDepthTexture() {
    return this.texture;
  }
}
class kp extends an {
  constructor(e, t) {
    super();
    const i = this;
    let r = null, s = 1, a = null, o = "local-floor", l = 1, c = null, h = null, d = null, f = null, m = null, g = null;
    const v = new Vp(), p = t.getContextAttributes();
    let u = null, b = null;
    const M = [], T = [], O = new le();
    let w = null;
    const R = new At();
    R.layers.enable(1), R.viewport = new $e();
    const I = new At();
    I.layers.enable(2), I.viewport = new $e();
    const E = [R, I], x = new Bp();
    x.layers.enable(1), x.layers.enable(2);
    let C = null, W = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(k) {
      let ee = M[k];
      return ee === void 0 && (ee = new es(), M[k] = ee), ee.getTargetRaySpace();
    }, this.getControllerGrip = function(k) {
      let ee = M[k];
      return ee === void 0 && (ee = new es(), M[k] = ee), ee.getGripSpace();
    }, this.getHand = function(k) {
      let ee = M[k];
      return ee === void 0 && (ee = new es(), M[k] = ee), ee.getHandSpace();
    };
    function z(k) {
      const ee = T.indexOf(k.inputSource);
      if (ee === -1)
        return;
      const _e = M[ee];
      _e !== void 0 && (_e.update(k.inputSource, k.frame, c || a), _e.dispatchEvent({ type: k.type, data: k.inputSource }));
    }
    function G() {
      r.removeEventListener("select", z), r.removeEventListener("selectstart", z), r.removeEventListener("selectend", z), r.removeEventListener("squeeze", z), r.removeEventListener("squeezestart", z), r.removeEventListener("squeezeend", z), r.removeEventListener("end", G), r.removeEventListener("inputsourceschange", K);
      for (let k = 0; k < M.length; k++) {
        const ee = T[k];
        ee !== null && (T[k] = null, M[k].disconnect(ee));
      }
      C = null, W = null, v.reset(), e.setRenderTarget(u), m = null, f = null, d = null, r = null, b = null, We.stop(), i.isPresenting = !1, e.setPixelRatio(w), e.setSize(O.width, O.height, !1), i.dispatchEvent({ type: "sessionend" });
    }
    this.setFramebufferScaleFactor = function(k) {
      s = k, i.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.");
    }, this.setReferenceSpaceType = function(k) {
      o = k, i.isPresenting === !0 && console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.");
    }, this.getReferenceSpace = function() {
      return c || a;
    }, this.setReferenceSpace = function(k) {
      c = k;
    }, this.getBaseLayer = function() {
      return f !== null ? f : m;
    }, this.getBinding = function() {
      return d;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return r;
    }, this.setSession = async function(k) {
      if (r = k, r !== null) {
        if (u = e.getRenderTarget(), r.addEventListener("select", z), r.addEventListener("selectstart", z), r.addEventListener("selectend", z), r.addEventListener("squeeze", z), r.addEventListener("squeezestart", z), r.addEventListener("squeezeend", z), r.addEventListener("end", G), r.addEventListener("inputsourceschange", K), p.xrCompatible !== !0 && await t.makeXRCompatible(), w = e.getPixelRatio(), e.getSize(O), r.renderState.layers === void 0) {
          const ee = {
            antialias: p.antialias,
            alpha: !0,
            depth: p.depth,
            stencil: p.stencil,
            framebufferScaleFactor: s
          };
          m = new XRWebGLLayer(r, t, ee), r.updateRenderState({ baseLayer: m }), e.setPixelRatio(1), e.setSize(m.framebufferWidth, m.framebufferHeight, !1), b = new Ri(
            m.framebufferWidth,
            m.framebufferHeight,
            {
              format: Dt,
              type: jt,
              colorSpace: e.outputColorSpace,
              stencilBuffer: p.stencil
            }
          );
        } else {
          let ee = null, _e = null, ce = null;
          p.depth && (ce = p.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, ee = p.stencil ? nn : Ji, _e = p.stencil ? tn : bi);
          const Ce = {
            colorFormat: t.RGBA8,
            depthFormat: ce,
            scaleFactor: s
          };
          d = new XRWebGLBinding(r, t), f = d.createProjectionLayer(Ce), r.updateRenderState({ layers: [f] }), e.setPixelRatio(1), e.setSize(f.textureWidth, f.textureHeight, !1), b = new Ri(
            f.textureWidth,
            f.textureHeight,
            {
              format: Dt,
              type: jt,
              depthTexture: new $o(f.textureWidth, f.textureHeight, _e, void 0, void 0, void 0, void 0, void 0, void 0, ee),
              stencilBuffer: p.stencil,
              colorSpace: e.outputColorSpace,
              samples: p.antialias ? 4 : 0,
              resolveDepthBuffer: f.ignoreDepthValues === !1
            }
          );
        }
        b.isXRRenderTarget = !0, this.setFoveation(l), c = null, a = await r.requestReferenceSpace(o), We.setContext(r), We.start(), i.isPresenting = !0, i.dispatchEvent({ type: "sessionstart" });
      }
    }, this.getEnvironmentBlendMode = function() {
      if (r !== null)
        return r.environmentBlendMode;
    }, this.getDepthTexture = function() {
      return v.getDepthTexture();
    };
    function K(k) {
      for (let ee = 0; ee < k.removed.length; ee++) {
        const _e = k.removed[ee], ce = T.indexOf(_e);
        ce >= 0 && (T[ce] = null, M[ce].disconnect(_e));
      }
      for (let ee = 0; ee < k.added.length; ee++) {
        const _e = k.added[ee];
        let ce = T.indexOf(_e);
        if (ce === -1) {
          for (let Ne = 0; Ne < M.length; Ne++)
            if (Ne >= T.length) {
              T.push(_e), ce = Ne;
              break;
            } else if (T[Ne] === null) {
              T[Ne] = _e, ce = Ne;
              break;
            }
          if (ce === -1) break;
        }
        const Ce = M[ce];
        Ce && Ce.connect(_e);
      }
    }
    const H = new L(), Q = new L();
    function V(k, ee, _e) {
      H.setFromMatrixPosition(ee.matrixWorld), Q.setFromMatrixPosition(_e.matrixWorld);
      const ce = H.distanceTo(Q), Ce = ee.projectionMatrix.elements, Ne = _e.projectionMatrix.elements, Pe = Ce[14] / (Ce[10] - 1), Ve = Ce[14] / (Ce[10] + 1), y = (Ce[9] + 1) / Ce[5], ie = (Ce[9] - 1) / Ce[5], j = (Ce[8] - 1) / Ce[0], he = (Ne[8] + 1) / Ne[0], X = Pe * j, Ae = Pe * he, ue = ce / (-j + he), ve = ue * -j;
      ee.matrixWorld.decompose(k.position, k.quaternion, k.scale), k.translateX(ve), k.translateZ(ue), k.matrixWorld.compose(k.position, k.quaternion, k.scale), k.matrixWorldInverse.copy(k.matrixWorld).invert();
      const A = Pe + ue, _ = Ve + ue, F = X - ve, $ = Ae + (ce - ve), J = y * Ve / _ * A, Z = ie * Ve / _ * A;
      k.projectionMatrix.makePerspective(F, $, J, Z, A, _), k.projectionMatrixInverse.copy(k.projectionMatrix).invert();
    }
    function de(k, ee) {
      ee === null ? k.matrixWorld.copy(k.matrix) : k.matrixWorld.multiplyMatrices(ee.matrixWorld, k.matrix), k.matrixWorldInverse.copy(k.matrixWorld).invert();
    }
    this.updateCamera = function(k) {
      if (r === null) return;
      v.texture !== null && (k.near = v.depthNear, k.far = v.depthFar), x.near = I.near = R.near = k.near, x.far = I.far = R.far = k.far, (C !== x.near || W !== x.far) && (r.updateRenderState({
        depthNear: x.near,
        depthFar: x.far
      }), C = x.near, W = x.far, R.near = C, R.far = W, I.near = C, I.far = W, R.updateProjectionMatrix(), I.updateProjectionMatrix(), k.updateProjectionMatrix());
      const ee = k.parent, _e = x.cameras;
      de(x, ee);
      for (let ce = 0; ce < _e.length; ce++)
        de(_e[ce], ee);
      _e.length === 2 ? V(x, R, I) : x.projectionMatrix.copy(R.projectionMatrix), xe(k, x, ee);
    };
    function xe(k, ee, _e) {
      _e === null ? k.matrix.copy(ee.matrixWorld) : (k.matrix.copy(_e.matrixWorld), k.matrix.invert(), k.matrix.multiply(ee.matrixWorld)), k.matrix.decompose(k.position, k.quaternion, k.scale), k.updateMatrixWorld(!0), k.projectionMatrix.copy(ee.projectionMatrix), k.projectionMatrixInverse.copy(ee.projectionMatrixInverse), k.isPerspectiveCamera && (k.fov = ts * 2 * Math.atan(1 / k.projectionMatrix.elements[5]), k.zoom = 1);
    }
    this.getCamera = function() {
      return x;
    }, this.getFoveation = function() {
      if (!(f === null && m === null))
        return l;
    }, this.setFoveation = function(k) {
      l = k, f !== null && (f.fixedFoveation = k), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = k);
    }, this.hasDepthSensing = function() {
      return v.texture !== null;
    }, this.getDepthSensingMesh = function() {
      return v.getMesh(x);
    };
    let me = null;
    function Be(k, ee) {
      if (h = ee.getViewerPose(c || a), g = ee, h !== null) {
        const _e = h.views;
        m !== null && (e.setRenderTargetFramebuffer(b, m.framebuffer), e.setRenderTarget(b));
        let ce = !1;
        _e.length !== x.cameras.length && (x.cameras.length = 0, ce = !0);
        for (let Ne = 0; Ne < _e.length; Ne++) {
          const Pe = _e[Ne];
          let Ve = null;
          if (m !== null)
            Ve = m.getViewport(Pe);
          else {
            const ie = d.getViewSubImage(f, Pe);
            Ve = ie.viewport, Ne === 0 && (e.setRenderTargetTextures(
              b,
              ie.colorTexture,
              f.ignoreDepthValues ? void 0 : ie.depthStencilTexture
            ), e.setRenderTarget(b));
          }
          let y = E[Ne];
          y === void 0 && (y = new At(), y.layers.enable(Ne), y.viewport = new $e(), E[Ne] = y), y.matrix.fromArray(Pe.transform.matrix), y.matrix.decompose(y.position, y.quaternion, y.scale), y.projectionMatrix.fromArray(Pe.projectionMatrix), y.projectionMatrixInverse.copy(y.projectionMatrix).invert(), y.viewport.set(Ve.x, Ve.y, Ve.width, Ve.height), Ne === 0 && (x.matrix.copy(y.matrix), x.matrix.decompose(x.position, x.quaternion, x.scale)), ce === !0 && x.cameras.push(y);
        }
        const Ce = r.enabledFeatures;
        if (Ce && Ce.includes("depth-sensing")) {
          const Ne = d.getDepthInformation(_e[0]);
          Ne && Ne.isValid && Ne.texture && v.init(e, Ne, r.renderState);
        }
      }
      for (let _e = 0; _e < M.length; _e++) {
        const ce = T[_e], Ce = M[_e];
        ce !== null && Ce !== void 0 && Ce.update(ce, ee, c || a);
      }
      me && me(k, ee), ee.detectedPlanes && i.dispatchEvent({ type: "planesdetected", data: ee }), g = null;
    }
    const We = new Yo();
    We.setAnimationLoop(Be), this.setAnimationLoop = function(k) {
      me = k;
    }, this.dispose = function() {
    };
  }
}
const xi = /* @__PURE__ */ new Bt(), Wp = /* @__PURE__ */ new je();
function Xp(n, e) {
  function t(p, u) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), u.value.copy(p.matrix);
  }
  function i(p, u) {
    u.color.getRGB(p.fogColor.value, Ko(n)), u.isFog ? (p.fogNear.value = u.near, p.fogFar.value = u.far) : u.isFogExp2 && (p.fogDensity.value = u.density);
  }
  function r(p, u, b, M, T) {
    u.isMeshBasicMaterial || u.isMeshLambertMaterial ? s(p, u) : u.isMeshToonMaterial ? (s(p, u), d(p, u)) : u.isMeshPhongMaterial ? (s(p, u), h(p, u)) : u.isMeshStandardMaterial ? (s(p, u), f(p, u), u.isMeshPhysicalMaterial && m(p, u, T)) : u.isMeshMatcapMaterial ? (s(p, u), g(p, u)) : u.isMeshDepthMaterial ? s(p, u) : u.isMeshDistanceMaterial ? (s(p, u), v(p, u)) : u.isMeshNormalMaterial ? s(p, u) : u.isLineBasicMaterial ? (a(p, u), u.isLineDashedMaterial && o(p, u)) : u.isPointsMaterial ? l(p, u, b, M) : u.isSpriteMaterial ? c(p, u) : u.isShadowMaterial ? (p.color.value.copy(u.color), p.opacity.value = u.opacity) : u.isShaderMaterial && (u.uniformsNeedUpdate = !1);
  }
  function s(p, u) {
    p.opacity.value = u.opacity, u.color && p.diffuse.value.copy(u.color), u.emissive && p.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity), u.map && (p.map.value = u.map, t(u.map, p.mapTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.bumpMap && (p.bumpMap.value = u.bumpMap, t(u.bumpMap, p.bumpMapTransform), p.bumpScale.value = u.bumpScale, u.side === _t && (p.bumpScale.value *= -1)), u.normalMap && (p.normalMap.value = u.normalMap, t(u.normalMap, p.normalMapTransform), p.normalScale.value.copy(u.normalScale), u.side === _t && p.normalScale.value.negate()), u.displacementMap && (p.displacementMap.value = u.displacementMap, t(u.displacementMap, p.displacementMapTransform), p.displacementScale.value = u.displacementScale, p.displacementBias.value = u.displacementBias), u.emissiveMap && (p.emissiveMap.value = u.emissiveMap, t(u.emissiveMap, p.emissiveMapTransform)), u.specularMap && (p.specularMap.value = u.specularMap, t(u.specularMap, p.specularMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
    const b = e.get(u), M = b.envMap, T = b.envMapRotation;
    M && (p.envMap.value = M, xi.copy(T), xi.x *= -1, xi.y *= -1, xi.z *= -1, M.isCubeTexture && M.isRenderTargetTexture === !1 && (xi.y *= -1, xi.z *= -1), p.envMapRotation.value.setFromMatrix4(Wp.makeRotationFromEuler(xi)), p.flipEnvMap.value = M.isCubeTexture && M.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = u.reflectivity, p.ior.value = u.ior, p.refractionRatio.value = u.refractionRatio), u.lightMap && (p.lightMap.value = u.lightMap, p.lightMapIntensity.value = u.lightMapIntensity, t(u.lightMap, p.lightMapTransform)), u.aoMap && (p.aoMap.value = u.aoMap, p.aoMapIntensity.value = u.aoMapIntensity, t(u.aoMap, p.aoMapTransform));
  }
  function a(p, u) {
    p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, u.map && (p.map.value = u.map, t(u.map, p.mapTransform));
  }
  function o(p, u) {
    p.dashSize.value = u.dashSize, p.totalSize.value = u.dashSize + u.gapSize, p.scale.value = u.scale;
  }
  function l(p, u, b, M) {
    p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, p.size.value = u.size * b, p.scale.value = M * 0.5, u.map && (p.map.value = u.map, t(u.map, p.uvTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
  }
  function c(p, u) {
    p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, p.rotation.value = u.rotation, u.map && (p.map.value = u.map, t(u.map, p.mapTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
  }
  function h(p, u) {
    p.specular.value.copy(u.specular), p.shininess.value = Math.max(u.shininess, 1e-4);
  }
  function d(p, u) {
    u.gradientMap && (p.gradientMap.value = u.gradientMap);
  }
  function f(p, u) {
    p.metalness.value = u.metalness, u.metalnessMap && (p.metalnessMap.value = u.metalnessMap, t(u.metalnessMap, p.metalnessMapTransform)), p.roughness.value = u.roughness, u.roughnessMap && (p.roughnessMap.value = u.roughnessMap, t(u.roughnessMap, p.roughnessMapTransform)), u.envMap && (p.envMapIntensity.value = u.envMapIntensity);
  }
  function m(p, u, b) {
    p.ior.value = u.ior, u.sheen > 0 && (p.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen), p.sheenRoughness.value = u.sheenRoughness, u.sheenColorMap && (p.sheenColorMap.value = u.sheenColorMap, t(u.sheenColorMap, p.sheenColorMapTransform)), u.sheenRoughnessMap && (p.sheenRoughnessMap.value = u.sheenRoughnessMap, t(u.sheenRoughnessMap, p.sheenRoughnessMapTransform))), u.clearcoat > 0 && (p.clearcoat.value = u.clearcoat, p.clearcoatRoughness.value = u.clearcoatRoughness, u.clearcoatMap && (p.clearcoatMap.value = u.clearcoatMap, t(u.clearcoatMap, p.clearcoatMapTransform)), u.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = u.clearcoatRoughnessMap, t(u.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), u.clearcoatNormalMap && (p.clearcoatNormalMap.value = u.clearcoatNormalMap, t(u.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(u.clearcoatNormalScale), u.side === _t && p.clearcoatNormalScale.value.negate())), u.dispersion > 0 && (p.dispersion.value = u.dispersion), u.iridescence > 0 && (p.iridescence.value = u.iridescence, p.iridescenceIOR.value = u.iridescenceIOR, p.iridescenceThicknessMinimum.value = u.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = u.iridescenceThicknessRange[1], u.iridescenceMap && (p.iridescenceMap.value = u.iridescenceMap, t(u.iridescenceMap, p.iridescenceMapTransform)), u.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = u.iridescenceThicknessMap, t(u.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), u.transmission > 0 && (p.transmission.value = u.transmission, p.transmissionSamplerMap.value = b.texture, p.transmissionSamplerSize.value.set(b.width, b.height), u.transmissionMap && (p.transmissionMap.value = u.transmissionMap, t(u.transmissionMap, p.transmissionMapTransform)), p.thickness.value = u.thickness, u.thicknessMap && (p.thicknessMap.value = u.thicknessMap, t(u.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = u.attenuationDistance, p.attenuationColor.value.copy(u.attenuationColor)), u.anisotropy > 0 && (p.anisotropyVector.value.set(u.anisotropy * Math.cos(u.anisotropyRotation), u.anisotropy * Math.sin(u.anisotropyRotation)), u.anisotropyMap && (p.anisotropyMap.value = u.anisotropyMap, t(u.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = u.specularIntensity, p.specularColor.value.copy(u.specularColor), u.specularColorMap && (p.specularColorMap.value = u.specularColorMap, t(u.specularColorMap, p.specularColorMapTransform)), u.specularIntensityMap && (p.specularIntensityMap.value = u.specularIntensityMap, t(u.specularIntensityMap, p.specularIntensityMapTransform));
  }
  function g(p, u) {
    u.matcap && (p.matcap.value = u.matcap);
  }
  function v(p, u) {
    const b = e.get(u).light;
    p.referencePosition.value.setFromMatrixPosition(b.matrixWorld), p.nearDistance.value = b.shadow.camera.near, p.farDistance.value = b.shadow.camera.far;
  }
  return {
    refreshFogUniforms: i,
    refreshMaterialUniforms: r
  };
}
function qp(n, e, t, i) {
  let r = {}, s = {}, a = [];
  const o = n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(b, M) {
    const T = M.program;
    i.uniformBlockBinding(b, T);
  }
  function c(b, M) {
    let T = r[b.id];
    T === void 0 && (g(b), T = h(b), r[b.id] = T, b.addEventListener("dispose", p));
    const O = M.program;
    i.updateUBOMapping(b, O);
    const w = e.render.frame;
    s[b.id] !== w && (f(b), s[b.id] = w);
  }
  function h(b) {
    const M = d();
    b.__bindingPointIndex = M;
    const T = n.createBuffer(), O = b.__size, w = b.usage;
    return n.bindBuffer(n.UNIFORM_BUFFER, T), n.bufferData(n.UNIFORM_BUFFER, O, w), n.bindBuffer(n.UNIFORM_BUFFER, null), n.bindBufferBase(n.UNIFORM_BUFFER, M, T), T;
  }
  function d() {
    for (let b = 0; b < o; b++)
      if (a.indexOf(b) === -1)
        return a.push(b), b;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function f(b) {
    const M = r[b.id], T = b.uniforms, O = b.__cache;
    n.bindBuffer(n.UNIFORM_BUFFER, M);
    for (let w = 0, R = T.length; w < R; w++) {
      const I = Array.isArray(T[w]) ? T[w] : [T[w]];
      for (let E = 0, x = I.length; E < x; E++) {
        const C = I[E];
        if (m(C, w, E, O) === !0) {
          const W = C.__offset, z = Array.isArray(C.value) ? C.value : [C.value];
          let G = 0;
          for (let K = 0; K < z.length; K++) {
            const H = z[K], Q = v(H);
            typeof H == "number" || typeof H == "boolean" ? (C.__data[0] = H, n.bufferSubData(n.UNIFORM_BUFFER, W + G, C.__data)) : H.isMatrix3 ? (C.__data[0] = H.elements[0], C.__data[1] = H.elements[1], C.__data[2] = H.elements[2], C.__data[3] = 0, C.__data[4] = H.elements[3], C.__data[5] = H.elements[4], C.__data[6] = H.elements[5], C.__data[7] = 0, C.__data[8] = H.elements[6], C.__data[9] = H.elements[7], C.__data[10] = H.elements[8], C.__data[11] = 0) : (H.toArray(C.__data, G), G += Q.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          n.bufferSubData(n.UNIFORM_BUFFER, W, C.__data);
        }
      }
    }
    n.bindBuffer(n.UNIFORM_BUFFER, null);
  }
  function m(b, M, T, O) {
    const w = b.value, R = M + "_" + T;
    if (O[R] === void 0)
      return typeof w == "number" || typeof w == "boolean" ? O[R] = w : O[R] = w.clone(), !0;
    {
      const I = O[R];
      if (typeof w == "number" || typeof w == "boolean") {
        if (I !== w)
          return O[R] = w, !0;
      } else if (I.equals(w) === !1)
        return I.copy(w), !0;
    }
    return !1;
  }
  function g(b) {
    const M = b.uniforms;
    let T = 0;
    const O = 16;
    for (let R = 0, I = M.length; R < I; R++) {
      const E = Array.isArray(M[R]) ? M[R] : [M[R]];
      for (let x = 0, C = E.length; x < C; x++) {
        const W = E[x], z = Array.isArray(W.value) ? W.value : [W.value];
        for (let G = 0, K = z.length; G < K; G++) {
          const H = z[G], Q = v(H), V = T % O;
          V !== 0 && O - V < Q.boundary && (T += O - V), W.__data = new Float32Array(Q.storage / Float32Array.BYTES_PER_ELEMENT), W.__offset = T, T += Q.storage;
        }
      }
    }
    const w = T % O;
    return w > 0 && (T += O - w), b.__size = T, b.__cache = {}, this;
  }
  function v(b) {
    const M = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof b == "number" || typeof b == "boolean" ? (M.boundary = 4, M.storage = 4) : b.isVector2 ? (M.boundary = 8, M.storage = 8) : b.isVector3 || b.isColor ? (M.boundary = 16, M.storage = 12) : b.isVector4 ? (M.boundary = 16, M.storage = 16) : b.isMatrix3 ? (M.boundary = 48, M.storage = 48) : b.isMatrix4 ? (M.boundary = 64, M.storage = 64) : b.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", b), M;
  }
  function p(b) {
    const M = b.target;
    M.removeEventListener("dispose", p);
    const T = a.indexOf(M.__bindingPointIndex);
    a.splice(T, 1), n.deleteBuffer(r[M.id]), delete r[M.id], delete s[M.id];
  }
  function u() {
    for (const b in r)
      n.deleteBuffer(r[b]);
    a = [], r = {}, s = {};
  }
  return {
    bind: l,
    update: c,
    dispose: u
  };
}
class tm {
  constructor(e = {}) {
    const {
      canvas: t = cc(),
      context: i = null,
      depth: r = !0,
      stencil: s = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: d = !1
    } = e;
    this.isWebGLRenderer = !0;
    let f;
    if (i !== null) {
      if (typeof WebGLRenderingContext < "u" && i instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      f = i.getContextAttributes().alpha;
    } else
      f = a;
    const m = new Uint32Array(4), g = new Int32Array(4);
    let v = null, p = null;
    const u = [], b = [];
    this.domElement = t, this.debug = {
      /**
       * Enables error checking and reporting when shader programs are being compiled
       * @type {boolean}
       */
      checkShaderErrors: !0,
      /**
       * Callback for custom error reporting.
       * @type {?Function}
       */
      onShaderError: null
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = It, this.toneMapping = li, this.toneMappingExposure = 1;
    const M = this;
    let T = !1, O = 0, w = 0, R = null, I = -1, E = null;
    const x = new $e(), C = new $e();
    let W = null;
    const z = new ke(0);
    let G = 0, K = t.width, H = t.height, Q = 1, V = null, de = null;
    const xe = new $e(0, 0, K, H), me = new $e(0, 0, K, H);
    let Be = !1;
    const We = new Js();
    let k = !1, ee = !1;
    const _e = new je(), ce = new L(), Ce = new $e(), Ne = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let Pe = !1;
    function Ve() {
      return R === null ? Q : 1;
    }
    let y = i;
    function ie(S, D) {
      return t.getContext(S, D);
    }
    try {
      const S = {
        alpha: !0,
        depth: r,
        stencil: s,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: d
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${ol}`), t.addEventListener("webglcontextlost", q, !1), t.addEventListener("webglcontextrestored", Y, !1), t.addEventListener("webglcontextcreationerror", se, !1), y === null) {
        const D = "webgl2";
        if (y = ie(D, S), y === null)
          throw ie(D) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (S) {
      throw console.error("THREE.WebGLRenderer: " + S.message), S;
    }
    let j, he, X, Ae, ue, ve, A, _, F, $, J, Z, Te, ae, ge, Ie, te, pe, He, De, Me, Ue, ze, Qe;
    function P() {
      j = new Qf(y), j.init(), Ue = new Op(y, j), he = new Wf(y, j, e, Ue), X = new Ip(y), Ae = new id(y), ue = new Mp(), ve = new Fp(y, j, X, ue, he, Ue, Ae), A = new Zf(M), _ = new jf(M), F = new th(y), ze = new Vf(y, F), $ = new ed(y, F, Ae, ze), J = new rd(y, $, F, Ae), He = new nd(y, he, ve), Ie = new Xf(ue), Z = new xp(M, A, _, j, he, ze, Ie), Te = new Xp(M, ue), ae = new yp(), ge = new Rp(j), pe = new Gf(M, A, _, X, J, f, l), te = new Up(M, J, he), Qe = new qp(y, Ae, he, X), De = new kf(y, j, Ae), Me = new td(y, j, Ae), Ae.programs = Z.programs, M.capabilities = he, M.extensions = j, M.properties = ue, M.renderLists = ae, M.shadowMap = te, M.state = X, M.info = Ae;
    }
    P();
    const ne = new kp(M, y);
    this.xr = ne, this.getContext = function() {
      return y;
    }, this.getContextAttributes = function() {
      return y.getContextAttributes();
    }, this.forceContextLoss = function() {
      const S = j.get("WEBGL_lose_context");
      S && S.loseContext();
    }, this.forceContextRestore = function() {
      const S = j.get("WEBGL_lose_context");
      S && S.restoreContext();
    }, this.getPixelRatio = function() {
      return Q;
    }, this.setPixelRatio = function(S) {
      S !== void 0 && (Q = S, this.setSize(K, H, !1));
    }, this.getSize = function(S) {
      return S.set(K, H);
    }, this.setSize = function(S, D, N = !0) {
      if (ne.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      K = S, H = D, t.width = Math.floor(S * Q), t.height = Math.floor(D * Q), N === !0 && (t.style.width = S + "px", t.style.height = D + "px"), this.setViewport(0, 0, S, D);
    }, this.getDrawingBufferSize = function(S) {
      return S.set(K * Q, H * Q).floor();
    }, this.setDrawingBufferSize = function(S, D, N) {
      K = S, H = D, Q = N, t.width = Math.floor(S * N), t.height = Math.floor(D * N), this.setViewport(0, 0, S, D);
    }, this.getCurrentViewport = function(S) {
      return S.copy(x);
    }, this.getViewport = function(S) {
      return S.copy(xe);
    }, this.setViewport = function(S, D, N, B) {
      S.isVector4 ? xe.set(S.x, S.y, S.z, S.w) : xe.set(S, D, N, B), X.viewport(x.copy(xe).multiplyScalar(Q).round());
    }, this.getScissor = function(S) {
      return S.copy(me);
    }, this.setScissor = function(S, D, N, B) {
      S.isVector4 ? me.set(S.x, S.y, S.z, S.w) : me.set(S, D, N, B), X.scissor(C.copy(me).multiplyScalar(Q).round());
    }, this.getScissorTest = function() {
      return Be;
    }, this.setScissorTest = function(S) {
      X.setScissorTest(Be = S);
    }, this.setOpaqueSort = function(S) {
      V = S;
    }, this.setTransparentSort = function(S) {
      de = S;
    }, this.getClearColor = function(S) {
      return S.copy(pe.getClearColor());
    }, this.setClearColor = function() {
      pe.setClearColor.apply(pe, arguments);
    }, this.getClearAlpha = function() {
      return pe.getClearAlpha();
    }, this.setClearAlpha = function() {
      pe.setClearAlpha.apply(pe, arguments);
    }, this.clear = function(S = !0, D = !0, N = !0) {
      let B = 0;
      if (S) {
        let U = !1;
        if (R !== null) {
          const re = R.texture.format;
          U = re === Xs || re === Ws || re === ks;
        }
        if (U) {
          const re = R.texture.type, fe = re === jt || re === bi || re === _n || re === tn || re === Gs || re === Vs, Se = pe.getClearColor(), ye = pe.getClearAlpha(), Re = Se.r, Le = Se.g, be = Se.b;
          fe ? (m[0] = Re, m[1] = Le, m[2] = be, m[3] = ye, y.clearBufferuiv(y.COLOR, 0, m)) : (g[0] = Re, g[1] = Le, g[2] = be, g[3] = ye, y.clearBufferiv(y.COLOR, 0, g));
        } else
          B |= y.COLOR_BUFFER_BIT;
      }
      D && (B |= y.DEPTH_BUFFER_BIT), N && (B |= y.STENCIL_BUFFER_BIT, this.state.buffers.stencil.setMask(4294967295)), y.clear(B);
    }, this.clearColor = function() {
      this.clear(!0, !1, !1);
    }, this.clearDepth = function() {
      this.clear(!1, !0, !1);
    }, this.clearStencil = function() {
      this.clear(!1, !1, !0);
    }, this.dispose = function() {
      t.removeEventListener("webglcontextlost", q, !1), t.removeEventListener("webglcontextrestored", Y, !1), t.removeEventListener("webglcontextcreationerror", se, !1), ae.dispose(), ge.dispose(), ue.dispose(), A.dispose(), _.dispose(), J.dispose(), ze.dispose(), Qe.dispose(), Z.dispose(), ne.dispose(), ne.removeEventListener("sessionstart", Ut), ne.removeEventListener("sessionend", ta), di.stop();
    };
    function q(S) {
      S.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), T = !0;
    }
    function Y() {
      console.log("THREE.WebGLRenderer: Context Restored."), T = !1;
      const S = Ae.autoReset, D = te.enabled, N = te.autoUpdate, B = te.needsUpdate, U = te.type;
      P(), Ae.autoReset = S, te.enabled = D, te.autoUpdate = N, te.needsUpdate = B, te.type = U;
    }
    function se(S) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", S.statusMessage);
    }
    function we(S) {
      const D = S.target;
      D.removeEventListener("dispose", we), Ge(D);
    }
    function Ge(S) {
      nt(S), ue.remove(S);
    }
    function nt(S) {
      const D = ue.get(S).programs;
      D !== void 0 && (D.forEach(function(N) {
        Z.releaseProgram(N);
      }), S.isShaderMaterial && Z.releaseShaderCache(S));
    }
    this.renderBufferDirect = function(S, D, N, B, U, re) {
      D === null && (D = Ne);
      const fe = U.isMesh && U.matrixWorld.determinant() < 0, Se = il(S, D, N, B, U);
      X.setMaterial(B, fe);
      let ye = N.index, Re = 1;
      if (B.wireframe === !0) {
        if (ye = $.getWireframeAttribute(N), ye === void 0) return;
        Re = 2;
      }
      const Le = N.drawRange, be = N.attributes.position;
      let qe = Le.start * Re, tt = (Le.start + Le.count) * Re;
      re !== null && (qe = Math.max(qe, re.start * Re), tt = Math.min(tt, (re.start + re.count) * Re)), ye !== null ? (qe = Math.max(qe, 0), tt = Math.min(tt, ye.count)) : be != null && (qe = Math.max(qe, 0), tt = Math.min(tt, be.count));
      const it = tt - qe;
      if (it < 0 || it === 1 / 0) return;
      ze.setup(U, B, Se, N, ye);
      let xt, Ye = De;
      if (ye !== null && (xt = F.get(ye), Ye = Me, Ye.setIndex(xt)), U.isMesh)
        B.wireframe === !0 ? (X.setLineWidth(B.wireframeLinewidth * Ve()), Ye.setMode(y.LINES)) : Ye.setMode(y.TRIANGLES);
      else if (U.isLine) {
        let Ee = B.linewidth;
        Ee === void 0 && (Ee = 1), X.setLineWidth(Ee * Ve()), U.isLineSegments ? Ye.setMode(y.LINES) : U.isLineLoop ? Ye.setMode(y.LINE_LOOP) : Ye.setMode(y.LINE_STRIP);
      } else U.isPoints ? Ye.setMode(y.POINTS) : U.isSprite && Ye.setMode(y.TRIANGLES);
      if (U.isBatchedMesh)
        if (U._multiDrawInstances !== null)
          Ye.renderMultiDrawInstances(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount, U._multiDrawInstances);
        else if (j.get("WEBGL_multi_draw"))
          Ye.renderMultiDraw(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount);
        else {
          const Ee = U._multiDrawStarts, ht = U._multiDrawCounts, Ke = U._multiDrawCount, wt = ye ? F.get(ye).bytesPerElement : 1, Ci = ue.get(B).currentProgram.getUniforms();
          for (let Mt = 0; Mt < Ke; Mt++)
            Ci.setValue(y, "_gl_DrawID", Mt), Ye.render(Ee[Mt] / wt, ht[Mt]);
        }
      else if (U.isInstancedMesh)
        Ye.renderInstances(qe, it, U.count);
      else if (N.isInstancedBufferGeometry) {
        const Ee = N._maxInstanceCount !== void 0 ? N._maxInstanceCount : 1 / 0, ht = Math.min(N.instanceCount, Ee);
        Ye.renderInstances(qe, it, ht);
      } else
        Ye.render(qe, it);
    };
    function ct(S, D, N) {
      S.transparent === !0 && S.side === Yt && S.forceSinglePass === !1 ? (S.side = _t, S.needsUpdate = !0, wn(S, D, N), S.side = ci, S.needsUpdate = !0, wn(S, D, N), S.side = Yt) : wn(S, D, N);
    }
    this.compile = function(S, D, N = null) {
      N === null && (N = S), p = ge.get(N), p.init(D), b.push(p), N.traverseVisible(function(U) {
        U.isLight && U.layers.test(D.layers) && (p.pushLight(U), U.castShadow && p.pushShadow(U));
      }), S !== N && S.traverseVisible(function(U) {
        U.isLight && U.layers.test(D.layers) && (p.pushLight(U), U.castShadow && p.pushShadow(U));
      }), p.setupLights();
      const B = /* @__PURE__ */ new Set();
      return S.traverse(function(U) {
        const re = U.material;
        if (re)
          if (Array.isArray(re))
            for (let fe = 0; fe < re.length; fe++) {
              const Se = re[fe];
              ct(Se, N, U), B.add(Se);
            }
          else
            ct(re, N, U), B.add(re);
      }), b.pop(), p = null, B;
    }, this.compileAsync = function(S, D, N = null) {
      const B = this.compile(S, D, N);
      return new Promise((U) => {
        function re() {
          if (B.forEach(function(fe) {
            ue.get(fe).currentProgram.isReady() && B.delete(fe);
          }), B.size === 0) {
            U(S);
            return;
          }
          setTimeout(re, 10);
        }
        j.get("KHR_parallel_shader_compile") !== null ? re() : setTimeout(re, 10);
      });
    };
    let Xe = null;
    function Ht(S) {
      Xe && Xe(S);
    }
    function Ut() {
      di.stop();
    }
    function ta() {
      di.start();
    }
    const di = new Yo();
    di.setAnimationLoop(Ht), typeof self < "u" && di.setContext(self), this.setAnimationLoop = function(S) {
      Xe = S, ne.setAnimationLoop(S), S === null ? di.stop() : di.start();
    }, ne.addEventListener("sessionstart", Ut), ne.addEventListener("sessionend", ta), this.render = function(S, D) {
      if (D !== void 0 && D.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (T === !0) return;
      if (S.matrixWorldAutoUpdate === !0 && S.updateMatrixWorld(), D.parent === null && D.matrixWorldAutoUpdate === !0 && D.updateMatrixWorld(), ne.enabled === !0 && ne.isPresenting === !0 && (ne.cameraAutoUpdate === !0 && ne.updateCamera(D), D = ne.getCamera()), S.isScene === !0 && S.onBeforeRender(M, S, D, R), p = ge.get(S, b.length), p.init(D), b.push(p), _e.multiplyMatrices(D.projectionMatrix, D.matrixWorldInverse), We.setFromProjectionMatrix(_e), ee = this.localClippingEnabled, k = Ie.init(this.clippingPlanes, ee), v = ae.get(S, u.length), v.init(), u.push(v), ne.enabled === !0 && ne.isPresenting === !0) {
        const re = M.xr.getDepthSensingMesh();
        re !== null && vr(re, D, -1 / 0, M.sortObjects);
      }
      vr(S, D, 0, M.sortObjects), v.finish(), M.sortObjects === !0 && v.sort(V, de), Pe = ne.enabled === !1 || ne.isPresenting === !1 || ne.hasDepthSensing() === !1, Pe && pe.addToRenderList(v, S), this.info.render.frame++, k === !0 && Ie.beginShadows();
      const N = p.state.shadowsArray;
      te.render(N, S, D), k === !0 && Ie.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const B = v.opaque, U = v.transmissive;
      if (p.setupLights(), D.isArrayCamera) {
        const re = D.cameras;
        if (U.length > 0)
          for (let fe = 0, Se = re.length; fe < Se; fe++) {
            const ye = re[fe];
            na(B, U, S, ye);
          }
        Pe && pe.render(S);
        for (let fe = 0, Se = re.length; fe < Se; fe++) {
          const ye = re[fe];
          ia(v, S, ye, ye.viewport);
        }
      } else
        U.length > 0 && na(B, U, S, D), Pe && pe.render(S), ia(v, S, D);
      R !== null && (ve.updateMultisampleRenderTarget(R), ve.updateRenderTargetMipmap(R)), S.isScene === !0 && S.onAfterRender(M, S, D), ze.resetDefaultState(), I = -1, E = null, b.pop(), b.length > 0 ? (p = b[b.length - 1], k === !0 && Ie.setGlobalState(M.clippingPlanes, p.state.camera)) : p = null, u.pop(), u.length > 0 ? v = u[u.length - 1] : v = null;
    };
    function vr(S, D, N, B) {
      if (S.visible === !1) return;
      if (S.layers.test(D.layers)) {
        if (S.isGroup)
          N = S.renderOrder;
        else if (S.isLOD)
          S.autoUpdate === !0 && S.update(D);
        else if (S.isLight)
          p.pushLight(S), S.castShadow && p.pushShadow(S);
        else if (S.isSprite) {
          if (!S.frustumCulled || We.intersectsSprite(S)) {
            B && Ce.setFromMatrixPosition(S.matrixWorld).applyMatrix4(_e);
            const fe = J.update(S), Se = S.material;
            Se.visible && v.push(S, fe, Se, N, Ce.z, null);
          }
        } else if ((S.isMesh || S.isLine || S.isPoints) && (!S.frustumCulled || We.intersectsObject(S))) {
          const fe = J.update(S), Se = S.material;
          if (B && (S.boundingSphere !== void 0 ? (S.boundingSphere === null && S.computeBoundingSphere(), Ce.copy(S.boundingSphere.center)) : (fe.boundingSphere === null && fe.computeBoundingSphere(), Ce.copy(fe.boundingSphere.center)), Ce.applyMatrix4(S.matrixWorld).applyMatrix4(_e)), Array.isArray(Se)) {
            const ye = fe.groups;
            for (let Re = 0, Le = ye.length; Re < Le; Re++) {
              const be = ye[Re], qe = Se[be.materialIndex];
              qe && qe.visible && v.push(S, fe, qe, N, Ce.z, be);
            }
          } else Se.visible && v.push(S, fe, Se, N, Ce.z, null);
        }
      }
      const re = S.children;
      for (let fe = 0, Se = re.length; fe < Se; fe++)
        vr(re[fe], D, N, B);
    }
    function ia(S, D, N, B) {
      const U = S.opaque, re = S.transmissive, fe = S.transparent;
      p.setupLightsView(N), k === !0 && Ie.setGlobalState(M.clippingPlanes, N), B && X.viewport(x.copy(B)), U.length > 0 && bn(U, D, N), re.length > 0 && bn(re, D, N), fe.length > 0 && bn(fe, D, N), X.buffers.depth.setTest(!0), X.buffers.depth.setMask(!0), X.buffers.color.setMask(!0), X.setPolygonOffset(!1);
    }
    function na(S, D, N, B) {
      if ((N.isScene === !0 ? N.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[B.id] === void 0 && (p.state.transmissionRenderTarget[B.id] = new Ri(1, 1, {
        generateMipmaps: !0,
        type: j.has("EXT_color_buffer_half_float") || j.has("EXT_color_buffer_float") ? yn : jt,
        minFilter: Ai,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: Ze.workingColorSpace
      }));
      const re = p.state.transmissionRenderTarget[B.id], fe = B.viewport || x;
      re.setSize(fe.z, fe.w);
      const Se = M.getRenderTarget();
      M.setRenderTarget(re), M.getClearColor(z), G = M.getClearAlpha(), G < 1 && M.setClearColor(16777215, 0.5), Pe ? pe.render(N) : M.clear();
      const ye = M.toneMapping;
      M.toneMapping = li;
      const Re = B.viewport;
      if (B.viewport !== void 0 && (B.viewport = void 0), p.setupLightsView(B), k === !0 && Ie.setGlobalState(M.clippingPlanes, B), bn(S, N, B), ve.updateMultisampleRenderTarget(re), ve.updateRenderTargetMipmap(re), j.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Le = !1;
        for (let be = 0, qe = D.length; be < qe; be++) {
          const tt = D[be], it = tt.object, xt = tt.geometry, Ye = tt.material, Ee = tt.group;
          if (Ye.side === Yt && it.layers.test(B.layers)) {
            const ht = Ye.side;
            Ye.side = _t, Ye.needsUpdate = !0, ra(it, N, B, xt, Ye, Ee), Ye.side = ht, Ye.needsUpdate = !0, Le = !0;
          }
        }
        Le === !0 && (ve.updateMultisampleRenderTarget(re), ve.updateRenderTargetMipmap(re));
      }
      M.setRenderTarget(Se), M.setClearColor(z, G), Re !== void 0 && (B.viewport = Re), M.toneMapping = ye;
    }
    function bn(S, D, N) {
      const B = D.isScene === !0 ? D.overrideMaterial : null;
      for (let U = 0, re = S.length; U < re; U++) {
        const fe = S[U], Se = fe.object, ye = fe.geometry, Re = B === null ? fe.material : B, Le = fe.group;
        Se.layers.test(N.layers) && ra(Se, D, N, ye, Re, Le);
      }
    }
    function ra(S, D, N, B, U, re) {
      S.onBeforeRender(M, D, N, B, U, re), S.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse, S.matrixWorld), S.normalMatrix.getNormalMatrix(S.modelViewMatrix), U.transparent === !0 && U.side === Yt && U.forceSinglePass === !1 ? (U.side = _t, U.needsUpdate = !0, M.renderBufferDirect(N, D, B, U, S, re), U.side = ci, U.needsUpdate = !0, M.renderBufferDirect(N, D, B, U, S, re), U.side = Yt) : M.renderBufferDirect(N, D, B, U, S, re), S.onAfterRender(M, D, N, B, U, re);
    }
    function wn(S, D, N) {
      D.isScene !== !0 && (D = Ne);
      const B = ue.get(S), U = p.state.lights, re = p.state.shadowsArray, fe = U.state.version, Se = Z.getParameters(S, U.state, re, D, N), ye = Z.getProgramCacheKey(Se);
      let Re = B.programs;
      B.environment = S.isMeshStandardMaterial ? D.environment : null, B.fog = D.fog, B.envMap = (S.isMeshStandardMaterial ? _ : A).get(S.envMap || B.environment), B.envMapRotation = B.environment !== null && S.envMap === null ? D.environmentRotation : S.envMapRotation, Re === void 0 && (S.addEventListener("dispose", we), Re = /* @__PURE__ */ new Map(), B.programs = Re);
      let Le = Re.get(ye);
      if (Le !== void 0) {
        if (B.currentProgram === Le && B.lightsStateVersion === fe)
          return aa(S, Se), Le;
      } else
        Se.uniforms = Z.getUniforms(S), S.onBeforeCompile(Se, M), Le = Z.acquireProgram(Se, ye), Re.set(ye, Le), B.uniforms = Se.uniforms;
      const be = B.uniforms;
      return (!S.isShaderMaterial && !S.isRawShaderMaterial || S.clipping === !0) && (be.clippingPlanes = Ie.uniform), aa(S, Se), B.needsLights = rl(S), B.lightsStateVersion = fe, B.needsLights && (be.ambientLightColor.value = U.state.ambient, be.lightProbe.value = U.state.probe, be.directionalLights.value = U.state.directional, be.directionalLightShadows.value = U.state.directionalShadow, be.spotLights.value = U.state.spot, be.spotLightShadows.value = U.state.spotShadow, be.rectAreaLights.value = U.state.rectArea, be.ltc_1.value = U.state.rectAreaLTC1, be.ltc_2.value = U.state.rectAreaLTC2, be.pointLights.value = U.state.point, be.pointLightShadows.value = U.state.pointShadow, be.hemisphereLights.value = U.state.hemi, be.directionalShadowMap.value = U.state.directionalShadowMap, be.directionalShadowMatrix.value = U.state.directionalShadowMatrix, be.spotShadowMap.value = U.state.spotShadowMap, be.spotLightMatrix.value = U.state.spotLightMatrix, be.spotLightMap.value = U.state.spotLightMap, be.pointShadowMap.value = U.state.pointShadowMap, be.pointShadowMatrix.value = U.state.pointShadowMatrix), B.currentProgram = Le, B.uniformsList = null, Le;
    }
    function sa(S) {
      if (S.uniformsList === null) {
        const D = S.currentProgram.getUniforms();
        S.uniformsList = ar.seqWithValue(D.seq, S.uniforms);
      }
      return S.uniformsList;
    }
    function aa(S, D) {
      const N = ue.get(S);
      N.outputColorSpace = D.outputColorSpace, N.batching = D.batching, N.batchingColor = D.batchingColor, N.instancing = D.instancing, N.instancingColor = D.instancingColor, N.instancingMorph = D.instancingMorph, N.skinning = D.skinning, N.morphTargets = D.morphTargets, N.morphNormals = D.morphNormals, N.morphColors = D.morphColors, N.morphTargetsCount = D.morphTargetsCount, N.numClippingPlanes = D.numClippingPlanes, N.numIntersection = D.numClipIntersection, N.vertexAlphas = D.vertexAlphas, N.vertexTangents = D.vertexTangents, N.toneMapping = D.toneMapping;
    }
    function il(S, D, N, B, U) {
      D.isScene !== !0 && (D = Ne), ve.resetTextureUnits();
      const re = D.fog, fe = B.isMeshStandardMaterial ? D.environment : null, Se = R === null ? M.outputColorSpace : R.isXRRenderTarget === !0 ? R.texture.colorSpace : ui, ye = (B.isMeshStandardMaterial ? _ : A).get(B.envMap || fe), Re = B.vertexColors === !0 && !!N.attributes.color && N.attributes.color.itemSize === 4, Le = !!N.attributes.tangent && (!!B.normalMap || B.anisotropy > 0), be = !!N.morphAttributes.position, qe = !!N.morphAttributes.normal, tt = !!N.morphAttributes.color;
      let it = li;
      B.toneMapped && (R === null || R.isXRRenderTarget === !0) && (it = M.toneMapping);
      const xt = N.morphAttributes.position || N.morphAttributes.normal || N.morphAttributes.color, Ye = xt !== void 0 ? xt.length : 0, Ee = ue.get(B), ht = p.state.lights;
      if (k === !0 && (ee === !0 || S !== E)) {
        const Et = S === E && B.id === I;
        Ie.setState(B, S, Et);
      }
      let Ke = !1;
      B.version === Ee.__version ? (Ee.needsLights && Ee.lightsStateVersion !== ht.state.version || Ee.outputColorSpace !== Se || U.isBatchedMesh && Ee.batching === !1 || !U.isBatchedMesh && Ee.batching === !0 || U.isBatchedMesh && Ee.batchingColor === !0 && U.colorTexture === null || U.isBatchedMesh && Ee.batchingColor === !1 && U.colorTexture !== null || U.isInstancedMesh && Ee.instancing === !1 || !U.isInstancedMesh && Ee.instancing === !0 || U.isSkinnedMesh && Ee.skinning === !1 || !U.isSkinnedMesh && Ee.skinning === !0 || U.isInstancedMesh && Ee.instancingColor === !0 && U.instanceColor === null || U.isInstancedMesh && Ee.instancingColor === !1 && U.instanceColor !== null || U.isInstancedMesh && Ee.instancingMorph === !0 && U.morphTexture === null || U.isInstancedMesh && Ee.instancingMorph === !1 && U.morphTexture !== null || Ee.envMap !== ye || B.fog === !0 && Ee.fog !== re || Ee.numClippingPlanes !== void 0 && (Ee.numClippingPlanes !== Ie.numPlanes || Ee.numIntersection !== Ie.numIntersection) || Ee.vertexAlphas !== Re || Ee.vertexTangents !== Le || Ee.morphTargets !== be || Ee.morphNormals !== qe || Ee.morphColors !== tt || Ee.toneMapping !== it || Ee.morphTargetsCount !== Ye) && (Ke = !0) : (Ke = !0, Ee.__version = B.version);
      let wt = Ee.currentProgram;
      Ke === !0 && (wt = wn(B, D, U));
      let Ci = !1, Mt = !1, xr = !1;
      const rt = wt.getUniforms(), Qt = Ee.uniforms;
      if (X.useProgram(wt.program) && (Ci = !0, Mt = !0, xr = !0), B.id !== I && (I = B.id, Mt = !0), Ci || E !== S) {
        rt.setValue(y, "projectionMatrix", S.projectionMatrix), rt.setValue(y, "viewMatrix", S.matrixWorldInverse);
        const Et = rt.map.cameraPosition;
        Et !== void 0 && Et.setValue(y, ce.setFromMatrixPosition(S.matrixWorld)), he.logarithmicDepthBuffer && rt.setValue(
          y,
          "logDepthBufFC",
          2 / (Math.log(S.far + 1) / Math.LN2)
        ), (B.isMeshPhongMaterial || B.isMeshToonMaterial || B.isMeshLambertMaterial || B.isMeshBasicMaterial || B.isMeshStandardMaterial || B.isShaderMaterial) && rt.setValue(y, "isOrthographic", S.isOrthographicCamera === !0), E !== S && (E = S, Mt = !0, xr = !0);
      }
      if (U.isSkinnedMesh) {
        rt.setOptional(y, U, "bindMatrix"), rt.setOptional(y, U, "bindMatrixInverse");
        const Et = U.skeleton;
        Et && (Et.boneTexture === null && Et.computeBoneTexture(), rt.setValue(y, "boneTexture", Et.boneTexture, ve));
      }
      U.isBatchedMesh && (rt.setOptional(y, U, "batchingTexture"), rt.setValue(y, "batchingTexture", U._matricesTexture, ve), rt.setOptional(y, U, "batchingIdTexture"), rt.setValue(y, "batchingIdTexture", U._indirectTexture, ve), rt.setOptional(y, U, "batchingColorTexture"), U._colorsTexture !== null && rt.setValue(y, "batchingColorTexture", U._colorsTexture, ve));
      const Mr = N.morphAttributes;
      if ((Mr.position !== void 0 || Mr.normal !== void 0 || Mr.color !== void 0) && He.update(U, N, wt), (Mt || Ee.receiveShadow !== U.receiveShadow) && (Ee.receiveShadow = U.receiveShadow, rt.setValue(y, "receiveShadow", U.receiveShadow)), B.isMeshGouraudMaterial && B.envMap !== null && (Qt.envMap.value = ye, Qt.flipEnvMap.value = ye.isCubeTexture && ye.isRenderTargetTexture === !1 ? -1 : 1), B.isMeshStandardMaterial && B.envMap === null && D.environment !== null && (Qt.envMapIntensity.value = D.environmentIntensity), Mt && (rt.setValue(y, "toneMappingExposure", M.toneMappingExposure), Ee.needsLights && nl(Qt, xr), re && B.fog === !0 && Te.refreshFogUniforms(Qt, re), Te.refreshMaterialUniforms(Qt, B, Q, H, p.state.transmissionRenderTarget[S.id]), ar.upload(y, sa(Ee), Qt, ve)), B.isShaderMaterial && B.uniformsNeedUpdate === !0 && (ar.upload(y, sa(Ee), Qt, ve), B.uniformsNeedUpdate = !1), B.isSpriteMaterial && rt.setValue(y, "center", U.center), rt.setValue(y, "modelViewMatrix", U.modelViewMatrix), rt.setValue(y, "normalMatrix", U.normalMatrix), rt.setValue(y, "modelMatrix", U.matrixWorld), B.isShaderMaterial || B.isRawShaderMaterial) {
        const Et = B.uniformsGroups;
        for (let Sr = 0, sl = Et.length; Sr < sl; Sr++) {
          const oa = Et[Sr];
          Qe.update(oa, wt), Qe.bind(oa, wt);
        }
      }
      return wt;
    }
    function nl(S, D) {
      S.ambientLightColor.needsUpdate = D, S.lightProbe.needsUpdate = D, S.directionalLights.needsUpdate = D, S.directionalLightShadows.needsUpdate = D, S.pointLights.needsUpdate = D, S.pointLightShadows.needsUpdate = D, S.spotLights.needsUpdate = D, S.spotLightShadows.needsUpdate = D, S.rectAreaLights.needsUpdate = D, S.hemisphereLights.needsUpdate = D;
    }
    function rl(S) {
      return S.isMeshLambertMaterial || S.isMeshToonMaterial || S.isMeshPhongMaterial || S.isMeshStandardMaterial || S.isShadowMaterial || S.isShaderMaterial && S.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return O;
    }, this.getActiveMipmapLevel = function() {
      return w;
    }, this.getRenderTarget = function() {
      return R;
    }, this.setRenderTargetTextures = function(S, D, N) {
      ue.get(S.texture).__webglTexture = D, ue.get(S.depthTexture).__webglTexture = N;
      const B = ue.get(S);
      B.__hasExternalTextures = !0, B.__autoAllocateDepthBuffer = N === void 0, B.__autoAllocateDepthBuffer || j.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), B.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(S, D) {
      const N = ue.get(S);
      N.__webglFramebuffer = D, N.__useDefaultFramebuffer = D === void 0;
    }, this.setRenderTarget = function(S, D = 0, N = 0) {
      R = S, O = D, w = N;
      let B = !0, U = null, re = !1, fe = !1;
      if (S) {
        const ye = ue.get(S);
        ye.__useDefaultFramebuffer !== void 0 ? (X.bindFramebuffer(y.FRAMEBUFFER, null), B = !1) : ye.__webglFramebuffer === void 0 ? ve.setupRenderTarget(S) : ye.__hasExternalTextures && ve.rebindTextures(S, ue.get(S.texture).__webglTexture, ue.get(S.depthTexture).__webglTexture);
        const Re = S.texture;
        (Re.isData3DTexture || Re.isDataArrayTexture || Re.isCompressedArrayTexture) && (fe = !0);
        const Le = ue.get(S).__webglFramebuffer;
        S.isWebGLCubeRenderTarget ? (Array.isArray(Le[D]) ? U = Le[D][N] : U = Le[D], re = !0) : S.samples > 0 && ve.useMultisampledRTT(S) === !1 ? U = ue.get(S).__webglMultisampledFramebuffer : Array.isArray(Le) ? U = Le[N] : U = Le, x.copy(S.viewport), C.copy(S.scissor), W = S.scissorTest;
      } else
        x.copy(xe).multiplyScalar(Q).floor(), C.copy(me).multiplyScalar(Q).floor(), W = Be;
      if (X.bindFramebuffer(y.FRAMEBUFFER, U) && B && X.drawBuffers(S, U), X.viewport(x), X.scissor(C), X.setScissorTest(W), re) {
        const ye = ue.get(S.texture);
        y.framebufferTexture2D(y.FRAMEBUFFER, y.COLOR_ATTACHMENT0, y.TEXTURE_CUBE_MAP_POSITIVE_X + D, ye.__webglTexture, N);
      } else if (fe) {
        const ye = ue.get(S.texture), Re = D || 0;
        y.framebufferTextureLayer(y.FRAMEBUFFER, y.COLOR_ATTACHMENT0, ye.__webglTexture, N || 0, Re);
      }
      I = -1;
    }, this.readRenderTargetPixels = function(S, D, N, B, U, re, fe) {
      if (!(S && S.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let Se = ue.get(S).__webglFramebuffer;
      if (S.isWebGLCubeRenderTarget && fe !== void 0 && (Se = Se[fe]), Se) {
        X.bindFramebuffer(y.FRAMEBUFFER, Se);
        try {
          const ye = S.texture, Re = ye.format, Le = ye.type;
          if (!he.textureFormatReadable(Re)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!he.textureTypeReadable(Le)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          D >= 0 && D <= S.width - B && N >= 0 && N <= S.height - U && y.readPixels(D, N, B, U, Ue.convert(Re), Ue.convert(Le), re);
        } finally {
          const ye = R !== null ? ue.get(R).__webglFramebuffer : null;
          X.bindFramebuffer(y.FRAMEBUFFER, ye);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(S, D, N, B, U, re, fe) {
      if (!(S && S.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Se = ue.get(S).__webglFramebuffer;
      if (S.isWebGLCubeRenderTarget && fe !== void 0 && (Se = Se[fe]), Se) {
        X.bindFramebuffer(y.FRAMEBUFFER, Se);
        try {
          const ye = S.texture, Re = ye.format, Le = ye.type;
          if (!he.textureFormatReadable(Re))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!he.textureTypeReadable(Le))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          if (D >= 0 && D <= S.width - B && N >= 0 && N <= S.height - U) {
            const be = y.createBuffer();
            y.bindBuffer(y.PIXEL_PACK_BUFFER, be), y.bufferData(y.PIXEL_PACK_BUFFER, re.byteLength, y.STREAM_READ), y.readPixels(D, N, B, U, Ue.convert(Re), Ue.convert(Le), 0), y.flush();
            const qe = y.fenceSync(y.SYNC_GPU_COMMANDS_COMPLETE, 0);
            await hc(y, qe, 4);
            try {
              y.bindBuffer(y.PIXEL_PACK_BUFFER, be), y.getBufferSubData(y.PIXEL_PACK_BUFFER, 0, re);
            } finally {
              y.deleteBuffer(be), y.deleteSync(qe);
            }
            return re;
          }
        } finally {
          const ye = R !== null ? ue.get(R).__webglFramebuffer : null;
          X.bindFramebuffer(y.FRAMEBUFFER, ye);
        }
      }
    }, this.copyFramebufferToTexture = function(S, D = null, N = 0) {
      S.isTexture !== !0 && (console.warn("WebGLRenderer: copyFramebufferToTexture function signature has changed."), D = arguments[0] || null, S = arguments[1]);
      const B = Math.pow(2, -N), U = Math.floor(S.image.width * B), re = Math.floor(S.image.height * B), fe = D !== null ? D.x : 0, Se = D !== null ? D.y : 0;
      ve.setTexture2D(S, 0), y.copyTexSubImage2D(y.TEXTURE_2D, N, 0, 0, fe, Se, U, re), X.unbindTexture();
    }, this.copyTextureToTexture = function(S, D, N = null, B = null, U = 0) {
      S.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture function signature has changed."), B = arguments[0] || null, S = arguments[1], D = arguments[2], U = arguments[3] || 0, N = null);
      let re, fe, Se, ye, Re, Le;
      N !== null ? (re = N.max.x - N.min.x, fe = N.max.y - N.min.y, Se = N.min.x, ye = N.min.y) : (re = S.image.width, fe = S.image.height, Se = 0, ye = 0), B !== null ? (Re = B.x, Le = B.y) : (Re = 0, Le = 0);
      const be = Ue.convert(D.format), qe = Ue.convert(D.type);
      ve.setTexture2D(D, 0), y.pixelStorei(y.UNPACK_FLIP_Y_WEBGL, D.flipY), y.pixelStorei(y.UNPACK_PREMULTIPLY_ALPHA_WEBGL, D.premultiplyAlpha), y.pixelStorei(y.UNPACK_ALIGNMENT, D.unpackAlignment);
      const tt = y.getParameter(y.UNPACK_ROW_LENGTH), it = y.getParameter(y.UNPACK_IMAGE_HEIGHT), xt = y.getParameter(y.UNPACK_SKIP_PIXELS), Ye = y.getParameter(y.UNPACK_SKIP_ROWS), Ee = y.getParameter(y.UNPACK_SKIP_IMAGES), ht = S.isCompressedTexture ? S.mipmaps[U] : S.image;
      y.pixelStorei(y.UNPACK_ROW_LENGTH, ht.width), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, ht.height), y.pixelStorei(y.UNPACK_SKIP_PIXELS, Se), y.pixelStorei(y.UNPACK_SKIP_ROWS, ye), S.isDataTexture ? y.texSubImage2D(y.TEXTURE_2D, U, Re, Le, re, fe, be, qe, ht.data) : S.isCompressedTexture ? y.compressedTexSubImage2D(y.TEXTURE_2D, U, Re, Le, ht.width, ht.height, be, ht.data) : y.texSubImage2D(y.TEXTURE_2D, U, Re, Le, re, fe, be, qe, ht), y.pixelStorei(y.UNPACK_ROW_LENGTH, tt), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, it), y.pixelStorei(y.UNPACK_SKIP_PIXELS, xt), y.pixelStorei(y.UNPACK_SKIP_ROWS, Ye), y.pixelStorei(y.UNPACK_SKIP_IMAGES, Ee), U === 0 && D.generateMipmaps && y.generateMipmap(y.TEXTURE_2D), X.unbindTexture();
    }, this.copyTextureToTexture3D = function(S, D, N = null, B = null, U = 0) {
      S.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture3D function signature has changed."), N = arguments[0] || null, B = arguments[1] || null, S = arguments[2], D = arguments[3], U = arguments[4] || 0);
      let re, fe, Se, ye, Re, Le, be, qe, tt;
      const it = S.isCompressedTexture ? S.mipmaps[U] : S.image;
      N !== null ? (re = N.max.x - N.min.x, fe = N.max.y - N.min.y, Se = N.max.z - N.min.z, ye = N.min.x, Re = N.min.y, Le = N.min.z) : (re = it.width, fe = it.height, Se = it.depth, ye = 0, Re = 0, Le = 0), B !== null ? (be = B.x, qe = B.y, tt = B.z) : (be = 0, qe = 0, tt = 0);
      const xt = Ue.convert(D.format), Ye = Ue.convert(D.type);
      let Ee;
      if (D.isData3DTexture)
        ve.setTexture3D(D, 0), Ee = y.TEXTURE_3D;
      else if (D.isDataArrayTexture || D.isCompressedArrayTexture)
        ve.setTexture2DArray(D, 0), Ee = y.TEXTURE_2D_ARRAY;
      else {
        console.warn("THREE.WebGLRenderer.copyTextureToTexture3D: only supports THREE.DataTexture3D and THREE.DataTexture2DArray.");
        return;
      }
      y.pixelStorei(y.UNPACK_FLIP_Y_WEBGL, D.flipY), y.pixelStorei(y.UNPACK_PREMULTIPLY_ALPHA_WEBGL, D.premultiplyAlpha), y.pixelStorei(y.UNPACK_ALIGNMENT, D.unpackAlignment);
      const ht = y.getParameter(y.UNPACK_ROW_LENGTH), Ke = y.getParameter(y.UNPACK_IMAGE_HEIGHT), wt = y.getParameter(y.UNPACK_SKIP_PIXELS), Ci = y.getParameter(y.UNPACK_SKIP_ROWS), Mt = y.getParameter(y.UNPACK_SKIP_IMAGES);
      y.pixelStorei(y.UNPACK_ROW_LENGTH, it.width), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, it.height), y.pixelStorei(y.UNPACK_SKIP_PIXELS, ye), y.pixelStorei(y.UNPACK_SKIP_ROWS, Re), y.pixelStorei(y.UNPACK_SKIP_IMAGES, Le), S.isDataTexture || S.isData3DTexture ? y.texSubImage3D(Ee, U, be, qe, tt, re, fe, Se, xt, Ye, it.data) : D.isCompressedArrayTexture ? y.compressedTexSubImage3D(Ee, U, be, qe, tt, re, fe, Se, xt, it.data) : y.texSubImage3D(Ee, U, be, qe, tt, re, fe, Se, xt, Ye, it), y.pixelStorei(y.UNPACK_ROW_LENGTH, ht), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, Ke), y.pixelStorei(y.UNPACK_SKIP_PIXELS, wt), y.pixelStorei(y.UNPACK_SKIP_ROWS, Ci), y.pixelStorei(y.UNPACK_SKIP_IMAGES, Mt), U === 0 && D.generateMipmaps && y.generateMipmap(Ee), X.unbindTexture();
    }, this.initRenderTarget = function(S) {
      ue.get(S).__webglFramebuffer === void 0 && ve.setupRenderTarget(S);
    }, this.initTexture = function(S) {
      S.isCubeTexture ? ve.setTextureCube(S, 0) : S.isData3DTexture ? ve.setTexture3D(S, 0) : S.isDataArrayTexture || S.isCompressedArrayTexture ? ve.setTexture2DArray(S, 0) : ve.setTexture2D(S, 0), X.unbindTexture();
    }, this.resetState = function() {
      O = 0, w = 0, R = null, X.reset(), ze.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return Zt;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = e === qs ? "display-p3" : "srgb", t.unpackColorSpace = Ze.workingColorSpace === pr ? "display-p3" : "srgb";
  }
}
class im extends Qs {
  constructor(e, t = {}) {
    const i = t.font;
    if (i === void 0)
      super();
    else {
      const r = i.generateShapes(e, t.size);
      t.depth === void 0 && t.height !== void 0 && console.warn("THREE.TextGeometry: .height is now depreciated. Please use .depth instead"), t.depth = t.depth !== void 0 ? t.depth : t.height !== void 0 ? t.height : 50, t.bevelThickness === void 0 && (t.bevelThickness = 10), t.bevelSize === void 0 && (t.bevelSize = 8), t.bevelEnabled === void 0 && (t.bevelEnabled = !1), super(r, t);
    }
    this.type = "TextGeometry";
  }
}
class nm {
  constructor(e) {
    this.isFont = !0, this.type = "Font", this.data = e;
  }
  generateShapes(e, t = 100) {
    const i = [], r = Yp(e, t, this.data);
    for (let s = 0, a = r.length; s < a; s++)
      i.push(...r[s].toShapes());
    return i;
  }
}
function Yp(n, e, t) {
  const i = Array.from(n), r = e / t.resolution, s = (t.boundingBox.yMax - t.boundingBox.yMin + t.underlineThickness) * r, a = [];
  let o = 0, l = 0;
  for (let c = 0; c < i.length; c++) {
    const h = i[c];
    if (h === `
`)
      o = 0, l -= s;
    else {
      const d = Kp(h, r, o, l, t);
      o += d.offsetX, a.push(d.path);
    }
  }
  return a;
}
function Kp(n, e, t, i, r) {
  const s = r.glyphs[n] || r.glyphs["?"];
  if (!s) {
    console.error('THREE.Font: character "' + n + '" does not exists in font family ' + r.familyName + ".");
    return;
  }
  const a = new $c();
  let o, l, c, h, d, f, m, g;
  if (s.o) {
    const v = s._cachedOutline || (s._cachedOutline = s.o.split(" "));
    for (let p = 0, u = v.length; p < u; )
      switch (v[p++]) {
        case "m":
          o = v[p++] * e + t, l = v[p++] * e + i, a.moveTo(o, l);
          break;
        case "l":
          o = v[p++] * e + t, l = v[p++] * e + i, a.lineTo(o, l);
          break;
        case "q":
          c = v[p++] * e + t, h = v[p++] * e + i, d = v[p++] * e + t, f = v[p++] * e + i, a.quadraticCurveTo(d, f, c, h);
          break;
        case "b":
          c = v[p++] * e + t, h = v[p++] * e + i, d = v[p++] * e + t, f = v[p++] * e + i, m = v[p++] * e + t, g = v[p++] * e + i, a.bezierCurveTo(d, f, m, g, c, h);
          break;
      }
  }
  return { offsetX: s.ha * e, path: a };
}
export {
  Zp as A,
  En as B,
  ke as C,
  Jp as D,
  nm as F,
  Gn as G,
  Jt as M,
  Mi as P,
  Qp as R,
  em as S,
  im as T,
  L as V,
  tm as W,
  $p as a,
  Tn as b,
  le as c,
  At as d,
  jp as e
};
