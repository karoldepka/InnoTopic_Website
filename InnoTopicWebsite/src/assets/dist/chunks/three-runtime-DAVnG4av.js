const xa = "166";
const pd = 4;
const md = 303;
const gd = 1006;
const $t = "", Pt = "srgb", Qt = "srgb-linear", Rr = "display-p3", In = "display-p3-linear", Pn = "linear", Je = "srgb", Ln = "rec709", Dn = "p3";
const kr = "300 es";
const ut = ["00", "01", "02", "03", "04", "05", "06", "07", "08", "09", "0a", "0b", "0c", "0d", "0e", "0f", "10", "11", "12", "13", "14", "15", "16", "17", "18", "19", "1a", "1b", "1c", "1d", "1e", "1f", "20", "21", "22", "23", "24", "25", "26", "27", "28", "29", "2a", "2b", "2c", "2d", "2e", "2f", "30", "31", "32", "33", "34", "35", "36", "37", "38", "39", "3a", "3b", "3c", "3d", "3e", "3f", "40", "41", "42", "43", "44", "45", "46", "47", "48", "49", "4a", "4b", "4c", "4d", "4e", "4f", "50", "51", "52", "53", "54", "55", "56", "57", "58", "59", "5a", "5b", "5c", "5d", "5e", "5f", "60", "61", "62", "63", "64", "65", "66", "67", "68", "69", "6a", "6b", "6c", "6d", "6e", "6f", "70", "71", "72", "73", "74", "75", "76", "77", "78", "79", "7a", "7b", "7c", "7d", "7e", "7f", "80", "81", "82", "83", "84", "85", "86", "87", "88", "89", "8a", "8b", "8c", "8d", "8e", "8f", "90", "91", "92", "93", "94", "95", "96", "97", "98", "99", "9a", "9b", "9c", "9d", "9e", "9f", "a0", "a1", "a2", "a3", "a4", "a5", "a6", "a7", "a8", "a9", "aa", "ab", "ac", "ad", "ae", "af", "b0", "b1", "b2", "b3", "b4", "b5", "b6", "b7", "b8", "b9", "ba", "bb", "bc", "bd", "be", "bf", "c0", "c1", "c2", "c3", "c4", "c5", "c6", "c7", "c8", "c9", "ca", "cb", "cc", "cd", "ce", "cf", "d0", "d1", "d2", "d3", "d4", "d5", "d6", "d7", "d8", "d9", "da", "db", "dc", "dd", "de", "df", "e0", "e1", "e2", "e3", "e4", "e5", "e6", "e7", "e8", "e9", "ea", "eb", "ec", "ed", "ee", "ef", "f0", "f1", "f2", "f3", "f4", "f5", "f6", "f7", "f8", "f9", "fa", "fb", "fc", "fd", "fe", "ff"], Hn = Math.PI / 180, Sr = 180 / Math.PI;
function Ni() {
  const n = Math.random() * 4294967295 | 0, e = Math.random() * 4294967295 | 0, t = Math.random() * 4294967295 | 0, i = Math.random() * 4294967295 | 0;
  return (ut[n & 255] + ut[n >> 8 & 255] + ut[n >> 16 & 255] + ut[n >> 24 & 255] + "-" + ut[e & 255] + ut[e >> 8 & 255] + "-" + ut[e >> 16 & 15 | 64] + ut[e >> 24 & 255] + "-" + ut[t & 63 | 128] + ut[t >> 8 & 255] + "-" + ut[t >> 16 & 255] + ut[t >> 24 & 255] + ut[i & 255] + ut[i >> 8 & 255] + ut[i >> 16 & 255] + ut[i >> 24 & 255]).toLowerCase();
}
function ft(n, e, t) {
  return Math.max(e, Math.min(t, n));
}
function Sa(n, e) {
  return (n % e + e) % e;
}
function kn(n, e, t) {
  return (1 - t) * n + t * e;
}
function Bi(n, e) {
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
class Ji {
  constructor(e = 0, t = 0, i = 0, r = 1) {
    this.isQuaternion = !0, this._x = e, this._y = t, this._z = i, this._w = r;
  }
  static slerpFlat(e, t, i, r, s, a, o) {
    let l = i[r + 0], c = i[r + 1], h = i[r + 2], f = i[r + 3];
    const d = s[a + 0], m = s[a + 1], g = s[a + 2], v = s[a + 3];
    if (o === 0) {
      e[t + 0] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = f;
      return;
    }
    if (o === 1) {
      e[t + 0] = d, e[t + 1] = m, e[t + 2] = g, e[t + 3] = v;
      return;
    }
    if (f !== v || l !== d || c !== m || h !== g) {
      let p = 1 - o;
      const u = l * d + c * m + h * g + f * v, b = u >= 0 ? 1 : -1, S = 1 - u * u;
      if (S > Number.EPSILON) {
        const O = Math.sqrt(S), R = Math.atan2(O, u * b);
        p = Math.sin(p * R) / O, o = Math.sin(o * R) / O;
      }
      const T = o * b;
      if (l = l * p + d * T, c = c * p + m * T, h = h * p + g * T, f = f * p + v * T, p === 1 - o) {
        const O = 1 / Math.sqrt(l * l + c * c + h * h + f * f);
        l *= O, c *= O, h *= O, f *= O;
      }
    }
    e[t] = l, e[t + 1] = c, e[t + 2] = h, e[t + 3] = f;
  }
  static multiplyQuaternionsFlat(e, t, i, r, s, a) {
    const o = i[r], l = i[r + 1], c = i[r + 2], h = i[r + 3], f = s[a], d = s[a + 1], m = s[a + 2], g = s[a + 3];
    return e[t] = o * g + h * f + l * m - c * d, e[t + 1] = l * g + h * d + c * f - o * m, e[t + 2] = c * g + h * m + o * d - l * f, e[t + 3] = h * g - o * f - l * d - c * m, e;
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
    const i = e._x, r = e._y, s = e._z, a = e._order, o = Math.cos, l = Math.sin, c = o(i / 2), h = o(r / 2), f = o(s / 2), d = l(i / 2), m = l(r / 2), g = l(s / 2);
    switch (a) {
      case "XYZ":
        this._x = d * h * f + c * m * g, this._y = c * m * f - d * h * g, this._z = c * h * g + d * m * f, this._w = c * h * f - d * m * g;
        break;
      case "YXZ":
        this._x = d * h * f + c * m * g, this._y = c * m * f - d * h * g, this._z = c * h * g - d * m * f, this._w = c * h * f + d * m * g;
        break;
      case "ZXY":
        this._x = d * h * f - c * m * g, this._y = c * m * f + d * h * g, this._z = c * h * g + d * m * f, this._w = c * h * f - d * m * g;
        break;
      case "ZYX":
        this._x = d * h * f - c * m * g, this._y = c * m * f + d * h * g, this._z = c * h * g - d * m * f, this._w = c * h * f + d * m * g;
        break;
      case "YZX":
        this._x = d * h * f + c * m * g, this._y = c * m * f + d * h * g, this._z = c * h * g - d * m * f, this._w = c * h * f - d * m * g;
        break;
      case "XZY":
        this._x = d * h * f - c * m * g, this._y = c * m * f - d * h * g, this._z = c * h * g + d * m * f, this._w = c * h * f + d * m * g;
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
    const t = e.elements, i = t[0], r = t[4], s = t[8], a = t[1], o = t[5], l = t[9], c = t[2], h = t[6], f = t[10], d = i + o + f;
    if (d > 0) {
      const m = 0.5 / Math.sqrt(d + 1);
      this._w = 0.25 / m, this._x = (h - l) * m, this._y = (s - c) * m, this._z = (a - r) * m;
    } else if (i > o && i > f) {
      const m = 2 * Math.sqrt(1 + i - o - f);
      this._w = (h - l) / m, this._x = 0.25 * m, this._y = (r + a) / m, this._z = (s + c) / m;
    } else if (o > f) {
      const m = 2 * Math.sqrt(1 + o - i - f);
      this._w = (s - c) / m, this._x = (r + a) / m, this._y = 0.25 * m, this._z = (l + h) / m;
    } else {
      const m = 2 * Math.sqrt(1 + f - i - o);
      this._w = (a - r) / m, this._x = (s + c) / m, this._y = (l + h) / m, this._z = 0.25 * m;
    }
    return this._onChangeCallback(), this;
  }
  setFromUnitVectors(e, t) {
    let i = e.dot(t) + 1;
    return i < Number.EPSILON ? (i = 0, Math.abs(e.x) > Math.abs(e.z) ? (this._x = -e.y, this._y = e.x, this._z = 0, this._w = i) : (this._x = 0, this._y = -e.z, this._z = e.y, this._w = i)) : (this._x = e.y * t.z - e.z * t.y, this._y = e.z * t.x - e.x * t.z, this._z = e.x * t.y - e.y * t.x, this._w = i), this.normalize();
  }
  angleTo(e) {
    return 2 * Math.acos(Math.abs(ft(this.dot(e), -1, 1)));
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
    const c = Math.sqrt(l), h = Math.atan2(c, o), f = Math.sin((1 - t) * h) / c, d = Math.sin(t * h) / c;
    return this._w = a * f + this._w * d, this._x = i * f + this._x * d, this._y = r * f + this._y * d, this._z = s * f + this._z * d, this._onChangeCallback(), this;
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
    return this.applyQuaternion(Wr.setFromEuler(e));
  }
  applyAxisAngle(e, t) {
    return this.applyQuaternion(Wr.setFromAxisAngle(e, t));
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
    const t = this.x, i = this.y, r = this.z, s = e.x, a = e.y, o = e.z, l = e.w, c = 2 * (a * r - o * i), h = 2 * (o * t - s * r), f = 2 * (s * i - a * t);
    return this.x = t + l * c + a * f - o * h, this.y = i + l * h + o * c - s * f, this.z = r + l * f + s * h - a * c, this;
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
    return Wn.copy(this).projectOnVector(e), this.sub(Wn);
  }
  reflect(e) {
    return this.sub(Wn.copy(e).multiplyScalar(2 * this.dot(e)));
  }
  angleTo(e) {
    const t = Math.sqrt(this.lengthSq() * e.lengthSq());
    if (t === 0) return Math.PI / 2;
    const i = this.dot(e) / t;
    return Math.acos(ft(i, -1, 1));
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
const Wn = /* @__PURE__ */ new L(), Wr = /* @__PURE__ */ new Ji();
class je {
  constructor(e, t, i, r, s, a, o, l, c, h, f, d, m, g, v, p) {
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
    ], e !== void 0 && this.set(e, t, i, r, s, a, o, l, c, h, f, d, m, g, v, p);
  }
  set(e, t, i, r, s, a, o, l, c, h, f, d, m, g, v, p) {
    const u = this.elements;
    return u[0] = e, u[4] = t, u[8] = i, u[12] = r, u[1] = s, u[5] = a, u[9] = o, u[13] = l, u[2] = c, u[6] = h, u[10] = f, u[14] = d, u[3] = m, u[7] = g, u[11] = v, u[15] = p, this;
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
    const t = this.elements, i = e.elements, r = 1 / pi.setFromMatrixColumn(e, 0).length(), s = 1 / pi.setFromMatrixColumn(e, 1).length(), a = 1 / pi.setFromMatrixColumn(e, 2).length();
    return t[0] = i[0] * r, t[1] = i[1] * r, t[2] = i[2] * r, t[3] = 0, t[4] = i[4] * s, t[5] = i[5] * s, t[6] = i[6] * s, t[7] = 0, t[8] = i[8] * a, t[9] = i[9] * a, t[10] = i[10] * a, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromEuler(e) {
    const t = this.elements, i = e.x, r = e.y, s = e.z, a = Math.cos(i), o = Math.sin(i), l = Math.cos(r), c = Math.sin(r), h = Math.cos(s), f = Math.sin(s);
    if (e.order === "XYZ") {
      const d = a * h, m = a * f, g = o * h, v = o * f;
      t[0] = l * h, t[4] = -l * f, t[8] = c, t[1] = m + g * c, t[5] = d - v * c, t[9] = -o * l, t[2] = v - d * c, t[6] = g + m * c, t[10] = a * l;
    } else if (e.order === "YXZ") {
      const d = l * h, m = l * f, g = c * h, v = c * f;
      t[0] = d + v * o, t[4] = g * o - m, t[8] = a * c, t[1] = a * f, t[5] = a * h, t[9] = -o, t[2] = m * o - g, t[6] = v + d * o, t[10] = a * l;
    } else if (e.order === "ZXY") {
      const d = l * h, m = l * f, g = c * h, v = c * f;
      t[0] = d - v * o, t[4] = -a * f, t[8] = g + m * o, t[1] = m + g * o, t[5] = a * h, t[9] = v - d * o, t[2] = -a * c, t[6] = o, t[10] = a * l;
    } else if (e.order === "ZYX") {
      const d = a * h, m = a * f, g = o * h, v = o * f;
      t[0] = l * h, t[4] = g * c - m, t[8] = d * c + v, t[1] = l * f, t[5] = v * c + d, t[9] = m * c - g, t[2] = -c, t[6] = o * l, t[10] = a * l;
    } else if (e.order === "YZX") {
      const d = a * l, m = a * c, g = o * l, v = o * c;
      t[0] = l * h, t[4] = v - d * f, t[8] = g * f + m, t[1] = f, t[5] = a * h, t[9] = -o * h, t[2] = -c * h, t[6] = m * f + g, t[10] = d - v * f;
    } else if (e.order === "XZY") {
      const d = a * l, m = a * c, g = o * l, v = o * c;
      t[0] = l * h, t[4] = -f, t[8] = c * h, t[1] = d * f + v, t[5] = a * h, t[9] = m * f - g, t[2] = g * f - m, t[6] = o * h, t[10] = v * f + d;
    }
    return t[3] = 0, t[7] = 0, t[11] = 0, t[12] = 0, t[13] = 0, t[14] = 0, t[15] = 1, this;
  }
  makeRotationFromQuaternion(e) {
    return this.compose(Ma, e, ya);
  }
  lookAt(e, t, i) {
    const r = this.elements;
    return St.subVectors(e, t), St.lengthSq() === 0 && (St.z = 1), St.normalize(), Xt.crossVectors(i, St), Xt.lengthSq() === 0 && (Math.abs(i.z) === 1 ? St.x += 1e-4 : St.z += 1e-4, St.normalize(), Xt.crossVectors(i, St)), Xt.normalize(), nn.crossVectors(St, Xt), r[0] = Xt.x, r[4] = nn.x, r[8] = St.x, r[1] = Xt.y, r[5] = nn.y, r[9] = St.y, r[2] = Xt.z, r[6] = nn.z, r[10] = St.z, this;
  }
  multiply(e) {
    return this.multiplyMatrices(this, e);
  }
  premultiply(e) {
    return this.multiplyMatrices(e, this);
  }
  multiplyMatrices(e, t) {
    const i = e.elements, r = t.elements, s = this.elements, a = i[0], o = i[4], l = i[8], c = i[12], h = i[1], f = i[5], d = i[9], m = i[13], g = i[2], v = i[6], p = i[10], u = i[14], b = i[3], S = i[7], T = i[11], O = i[15], R = r[0], w = r[4], I = r[8], E = r[12], x = r[1], C = r[5], W = r[9], z = r[13], V = r[2], K = r[6], G = r[10], Q = r[14], H = r[3], fe = r[7], xe = r[11], me = r[15];
    return s[0] = a * R + o * x + l * V + c * H, s[4] = a * w + o * C + l * K + c * fe, s[8] = a * I + o * W + l * G + c * xe, s[12] = a * E + o * z + l * Q + c * me, s[1] = h * R + f * x + d * V + m * H, s[5] = h * w + f * C + d * K + m * fe, s[9] = h * I + f * W + d * G + m * xe, s[13] = h * E + f * z + d * Q + m * me, s[2] = g * R + v * x + p * V + u * H, s[6] = g * w + v * C + p * K + u * fe, s[10] = g * I + v * W + p * G + u * xe, s[14] = g * E + v * z + p * Q + u * me, s[3] = b * R + S * x + T * V + O * H, s[7] = b * w + S * C + T * K + O * fe, s[11] = b * I + S * W + T * G + O * xe, s[15] = b * E + S * z + T * Q + O * me, this;
  }
  multiplyScalar(e) {
    const t = this.elements;
    return t[0] *= e, t[4] *= e, t[8] *= e, t[12] *= e, t[1] *= e, t[5] *= e, t[9] *= e, t[13] *= e, t[2] *= e, t[6] *= e, t[10] *= e, t[14] *= e, t[3] *= e, t[7] *= e, t[11] *= e, t[15] *= e, this;
  }
  determinant() {
    const e = this.elements, t = e[0], i = e[4], r = e[8], s = e[12], a = e[1], o = e[5], l = e[9], c = e[13], h = e[2], f = e[6], d = e[10], m = e[14], g = e[3], v = e[7], p = e[11], u = e[15];
    return g * (+s * l * f - r * c * f - s * o * d + i * c * d + r * o * m - i * l * m) + v * (+t * l * m - t * c * d + s * a * d - r * a * m + r * c * h - s * l * h) + p * (+t * c * f - t * o * m - s * a * f + i * a * m + s * o * h - i * c * h) + u * (-r * o * h - t * l * f + t * o * d + r * a * f - i * a * d + i * l * h);
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
    const e = this.elements, t = e[0], i = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], f = e[9], d = e[10], m = e[11], g = e[12], v = e[13], p = e[14], u = e[15], b = f * p * c - v * d * c + v * l * m - o * p * m - f * l * u + o * d * u, S = g * d * c - h * p * c - g * l * m + a * p * m + h * l * u - a * d * u, T = h * v * c - g * f * c + g * o * m - a * v * m - h * o * u + a * f * u, O = g * f * l - h * v * l - g * o * d + a * v * d + h * o * p - a * f * p, R = t * b + i * S + r * T + s * O;
    if (R === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0);
    const w = 1 / R;
    return e[0] = b * w, e[1] = (v * d * s - f * p * s - v * r * m + i * p * m + f * r * u - i * d * u) * w, e[2] = (o * p * s - v * l * s + v * r * c - i * p * c - o * r * u + i * l * u) * w, e[3] = (f * l * s - o * d * s - f * r * c + i * d * c + o * r * m - i * l * m) * w, e[4] = S * w, e[5] = (h * p * s - g * d * s + g * r * m - t * p * m - h * r * u + t * d * u) * w, e[6] = (g * l * s - a * p * s - g * r * c + t * p * c + a * r * u - t * l * u) * w, e[7] = (a * d * s - h * l * s + h * r * c - t * d * c - a * r * m + t * l * m) * w, e[8] = T * w, e[9] = (g * f * s - h * v * s - g * i * m + t * v * m + h * i * u - t * f * u) * w, e[10] = (a * v * s - g * o * s + g * i * c - t * v * c - a * i * u + t * o * u) * w, e[11] = (h * o * s - a * f * s - h * i * c + t * f * c + a * i * m - t * o * m) * w, e[12] = O * w, e[13] = (h * v * r - g * f * r + g * i * d - t * v * d - h * i * p + t * f * p) * w, e[14] = (g * o * r - a * v * r - g * i * l + t * v * l + a * i * p - t * o * p) * w, e[15] = (a * f * r - h * o * r + h * i * l - t * f * l - a * i * d + t * o * d) * w, this;
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
    const r = this.elements, s = t._x, a = t._y, o = t._z, l = t._w, c = s + s, h = a + a, f = o + o, d = s * c, m = s * h, g = s * f, v = a * h, p = a * f, u = o * f, b = l * c, S = l * h, T = l * f, O = i.x, R = i.y, w = i.z;
    return r[0] = (1 - (v + u)) * O, r[1] = (m + T) * O, r[2] = (g - S) * O, r[3] = 0, r[4] = (m - T) * R, r[5] = (1 - (d + u)) * R, r[6] = (p + b) * R, r[7] = 0, r[8] = (g + S) * w, r[9] = (p - b) * w, r[10] = (1 - (d + v)) * w, r[11] = 0, r[12] = e.x, r[13] = e.y, r[14] = e.z, r[15] = 1, this;
  }
  decompose(e, t, i) {
    const r = this.elements;
    let s = pi.set(r[0], r[1], r[2]).length();
    const a = pi.set(r[4], r[5], r[6]).length(), o = pi.set(r[8], r[9], r[10]).length();
    this.determinant() < 0 && (s = -s), e.x = r[12], e.y = r[13], e.z = r[14], bt.copy(this);
    const c = 1 / s, h = 1 / a, f = 1 / o;
    return bt.elements[0] *= c, bt.elements[1] *= c, bt.elements[2] *= c, bt.elements[4] *= h, bt.elements[5] *= h, bt.elements[6] *= h, bt.elements[8] *= f, bt.elements[9] *= f, bt.elements[10] *= f, t.setFromRotationMatrix(bt), i.x = s, i.y = a, i.z = o, this;
  }
  makePerspective(e, t, i, r, s, a, o = 2e3) {
    const l = this.elements, c = 2 * s / (t - e), h = 2 * s / (i - r), f = (t + e) / (t - e), d = (i + r) / (i - r);
    let m, g;
    if (o === 2e3)
      m = -(a + s) / (a - s), g = -2 * a * s / (a - s);
    else if (o === 2001)
      m = -a / (a - s), g = -a * s / (a - s);
    else
      throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: " + o);
    return l[0] = c, l[4] = 0, l[8] = f, l[12] = 0, l[1] = 0, l[5] = h, l[9] = d, l[13] = 0, l[2] = 0, l[6] = 0, l[10] = m, l[14] = g, l[3] = 0, l[7] = 0, l[11] = -1, l[15] = 0, this;
  }
  makeOrthographic(e, t, i, r, s, a, o = 2e3) {
    const l = this.elements, c = 1 / (t - e), h = 1 / (i - r), f = 1 / (a - s), d = (t + e) * c, m = (i + r) * h;
    let g, v;
    if (o === 2e3)
      g = (a + s) * f, v = -2 * f;
    else if (o === 2001)
      g = s * f, v = -1 * f;
    else
      throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: " + o);
    return l[0] = 2 * c, l[4] = 0, l[8] = 0, l[12] = -d, l[1] = 0, l[5] = 2 * h, l[9] = 0, l[13] = -m, l[2] = 0, l[6] = 0, l[10] = v, l[14] = -g, l[3] = 0, l[7] = 0, l[11] = 0, l[15] = 1, this;
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
const pi = /* @__PURE__ */ new L(), bt = /* @__PURE__ */ new je(), Ma = /* @__PURE__ */ new L(0, 0, 0), ya = /* @__PURE__ */ new L(1, 1, 1), Xt = /* @__PURE__ */ new L(), nn = /* @__PURE__ */ new L(), St = /* @__PURE__ */ new L();
class Fi {
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
const Xr = /* @__PURE__ */ new je(), qr = /* @__PURE__ */ new Ji();
class It {
  constructor(e = 0, t = 0, i = 0, r = It.DEFAULT_ORDER) {
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
    const r = e.elements, s = r[0], a = r[4], o = r[8], l = r[1], c = r[5], h = r[9], f = r[2], d = r[6], m = r[10];
    switch (t) {
      case "XYZ":
        this._y = Math.asin(ft(o, -1, 1)), Math.abs(o) < 0.9999999 ? (this._x = Math.atan2(-h, m), this._z = Math.atan2(-a, s)) : (this._x = Math.atan2(d, c), this._z = 0);
        break;
      case "YXZ":
        this._x = Math.asin(-ft(h, -1, 1)), Math.abs(h) < 0.9999999 ? (this._y = Math.atan2(o, m), this._z = Math.atan2(l, c)) : (this._y = Math.atan2(-f, s), this._z = 0);
        break;
      case "ZXY":
        this._x = Math.asin(ft(d, -1, 1)), Math.abs(d) < 0.9999999 ? (this._y = Math.atan2(-f, m), this._z = Math.atan2(-a, c)) : (this._y = 0, this._z = Math.atan2(l, s));
        break;
      case "ZYX":
        this._y = Math.asin(-ft(f, -1, 1)), Math.abs(f) < 0.9999999 ? (this._x = Math.atan2(d, m), this._z = Math.atan2(l, s)) : (this._x = 0, this._z = Math.atan2(-a, c));
        break;
      case "YZX":
        this._z = Math.asin(ft(l, -1, 1)), Math.abs(l) < 0.9999999 ? (this._x = Math.atan2(-h, c), this._y = Math.atan2(-f, s)) : (this._x = 0, this._y = Math.atan2(o, m));
        break;
      case "XZY":
        this._z = Math.asin(-ft(a, -1, 1)), Math.abs(a) < 0.9999999 ? (this._x = Math.atan2(d, c), this._y = Math.atan2(o, s)) : (this._x = Math.atan2(-h, m), this._y = 0);
        break;
      default:
        console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: " + t);
    }
    return this._order = t, i === !0 && this._onChangeCallback(), this;
  }
  setFromQuaternion(e, t, i) {
    return Xr.makeRotationFromQuaternion(e), this.setFromRotationMatrix(Xr, t, i);
  }
  setFromVector3(e, t = this._order) {
    return this.set(e.x, e.y, e.z, t);
  }
  reorder(e) {
    return qr.setFromEuler(this), this.setFromQuaternion(qr, e);
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
It.DEFAULT_ORDER = "XYZ";
class wr {
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
    const i = e.elements, r = t.elements, s = this.elements, a = i[0], o = i[3], l = i[6], c = i[1], h = i[4], f = i[7], d = i[2], m = i[5], g = i[8], v = r[0], p = r[3], u = r[6], b = r[1], S = r[4], T = r[7], O = r[2], R = r[5], w = r[8];
    return s[0] = a * v + o * b + l * O, s[3] = a * p + o * S + l * R, s[6] = a * u + o * T + l * w, s[1] = c * v + h * b + f * O, s[4] = c * p + h * S + f * R, s[7] = c * u + h * T + f * w, s[2] = d * v + m * b + g * O, s[5] = d * p + m * S + g * R, s[8] = d * u + m * T + g * w, this;
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
    const e = this.elements, t = e[0], i = e[1], r = e[2], s = e[3], a = e[4], o = e[5], l = e[6], c = e[7], h = e[8], f = h * a - o * c, d = o * l - h * s, m = c * s - a * l, g = t * f + i * d + r * m;
    if (g === 0) return this.set(0, 0, 0, 0, 0, 0, 0, 0, 0);
    const v = 1 / g;
    return e[0] = f * v, e[1] = (r * c - h * i) * v, e[2] = (o * i - r * a) * v, e[3] = d * v, e[4] = (h * t - r * l) * v, e[5] = (r * s - o * t) * v, e[6] = m * v, e[7] = (i * l - c * t) * v, e[8] = (a * t - i * s) * v, this;
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
    return this.premultiply(Xn.makeScale(e, t)), this;
  }
  rotate(e) {
    return this.premultiply(Xn.makeRotation(-e)), this;
  }
  translate(e, t) {
    return this.premultiply(Xn.makeTranslation(e, t)), this;
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
const Xn = /* @__PURE__ */ new Oe();
let Ea = 0;
const Yr = /* @__PURE__ */ new L(), mi = /* @__PURE__ */ new Ji(), Ot = /* @__PURE__ */ new je(), rn = /* @__PURE__ */ new L(), zi = /* @__PURE__ */ new L(), Ta = /* @__PURE__ */ new L(), Aa = /* @__PURE__ */ new Ji(), Kr = /* @__PURE__ */ new L(1, 0, 0), Zr = /* @__PURE__ */ new L(0, 1, 0), Jr = /* @__PURE__ */ new L(0, 0, 1), $r = { type: "added" }, ba = { type: "removed" }, gi = { type: "childadded", child: null }, qn = { type: "childremoved", child: null };
class pt extends Fi {
  constructor() {
    super(), this.isObject3D = !0, Object.defineProperty(this, "id", { value: Ea++ }), this.uuid = Ni(), this.name = "", this.type = "Object3D", this.parent = null, this.children = [], this.up = pt.DEFAULT_UP.clone();
    const e = new L(), t = new It(), i = new Ji(), r = new L(1, 1, 1);
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
    }), this.matrix = new je(), this.matrixWorld = new je(), this.matrixAutoUpdate = pt.DEFAULT_MATRIX_AUTO_UPDATE, this.matrixWorldAutoUpdate = pt.DEFAULT_MATRIX_WORLD_AUTO_UPDATE, this.matrixWorldNeedsUpdate = !1, this.layers = new wr(), this.visible = !0, this.castShadow = !1, this.receiveShadow = !1, this.frustumCulled = !0, this.renderOrder = 0, this.animations = [], this.userData = {};
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
    return mi.setFromAxisAngle(e, t), this.quaternion.multiply(mi), this;
  }
  rotateOnWorldAxis(e, t) {
    return mi.setFromAxisAngle(e, t), this.quaternion.premultiply(mi), this;
  }
  rotateX(e) {
    return this.rotateOnAxis(Kr, e);
  }
  rotateY(e) {
    return this.rotateOnAxis(Zr, e);
  }
  rotateZ(e) {
    return this.rotateOnAxis(Jr, e);
  }
  translateOnAxis(e, t) {
    return Yr.copy(e).applyQuaternion(this.quaternion), this.position.add(Yr.multiplyScalar(t)), this;
  }
  translateX(e) {
    return this.translateOnAxis(Kr, e);
  }
  translateY(e) {
    return this.translateOnAxis(Zr, e);
  }
  translateZ(e) {
    return this.translateOnAxis(Jr, e);
  }
  localToWorld(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(this.matrixWorld);
  }
  worldToLocal(e) {
    return this.updateWorldMatrix(!0, !1), e.applyMatrix4(Ot.copy(this.matrixWorld).invert());
  }
  lookAt(e, t, i) {
    e.isVector3 ? rn.copy(e) : rn.set(e, t, i);
    const r = this.parent;
    this.updateWorldMatrix(!0, !1), zi.setFromMatrixPosition(this.matrixWorld), this.isCamera || this.isLight ? Ot.lookAt(zi, rn, this.up) : Ot.lookAt(rn, zi, this.up), this.quaternion.setFromRotationMatrix(Ot), r && (Ot.extractRotation(r.matrixWorld), mi.setFromRotationMatrix(Ot), this.quaternion.premultiply(mi.invert()));
  }
  add(e) {
    if (arguments.length > 1) {
      for (let t = 0; t < arguments.length; t++)
        this.add(arguments[t]);
      return this;
    }
    return e === this ? (console.error("THREE.Object3D.add: object can't be added as a child of itself.", e), this) : (e && e.isObject3D ? (e.removeFromParent(), e.parent = this, this.children.push(e), e.dispatchEvent($r), gi.child = e, this.dispatchEvent(gi), gi.child = null) : console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.", e), this);
  }
  remove(e) {
    if (arguments.length > 1) {
      for (let i = 0; i < arguments.length; i++)
        this.remove(arguments[i]);
      return this;
    }
    const t = this.children.indexOf(e);
    return t !== -1 && (e.parent = null, this.children.splice(t, 1), e.dispatchEvent(ba), qn.child = e, this.dispatchEvent(qn), qn.child = null), this;
  }
  removeFromParent() {
    const e = this.parent;
    return e !== null && e.remove(this), this;
  }
  clear() {
    return this.remove(...this.children);
  }
  attach(e) {
    return this.updateWorldMatrix(!0, !1), Ot.copy(this.matrixWorld).invert(), e.parent !== null && (e.parent.updateWorldMatrix(!0, !1), Ot.multiply(e.parent.matrixWorld)), e.applyMatrix4(Ot), e.removeFromParent(), e.parent = this, this.children.push(e), e.updateWorldMatrix(!1, !0), e.dispatchEvent($r), gi.child = e, this.dispatchEvent(gi), gi.child = null, this;
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
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(zi, e, Ta), e;
  }
  getWorldScale(e) {
    return this.updateWorldMatrix(!0, !1), this.matrixWorld.decompose(zi, Aa, e), e;
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
            const f = l[c];
            s(e.shapes, f);
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
      const o = a(e.geometries), l = a(e.materials), c = a(e.textures), h = a(e.images), f = a(e.shapes), d = a(e.skeletons), m = a(e.animations), g = a(e.nodes);
      o.length > 0 && (i.geometries = o), l.length > 0 && (i.materials = l), c.length > 0 && (i.textures = c), h.length > 0 && (i.images = h), f.length > 0 && (i.shapes = f), d.length > 0 && (i.skeletons = d), m.length > 0 && (i.animations = m), g.length > 0 && (i.nodes = g);
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
const jr = /* @__PURE__ */ new Oe().set(
  0.8224621,
  0.177538,
  0,
  0.0331941,
  0.9668058,
  0,
  0.0170827,
  0.0723974,
  0.9105199
), Qr = /* @__PURE__ */ new Oe().set(
  1.2249401,
  -0.2249404,
  0,
  -0.0420569,
  1.0420571,
  0,
  -0.0196376,
  -0.0786361,
  1.0982735
), sn = {
  [Qt]: {
    transfer: Pn,
    primaries: Ln,
    toReference: (n) => n,
    fromReference: (n) => n
  },
  [Pt]: {
    transfer: Je,
    primaries: Ln,
    toReference: (n) => n.convertSRGBToLinear(),
    fromReference: (n) => n.convertLinearToSRGB()
  },
  [In]: {
    transfer: Pn,
    primaries: Dn,
    toReference: (n) => n.applyMatrix3(Qr),
    fromReference: (n) => n.applyMatrix3(jr)
  },
  [Rr]: {
    transfer: Je,
    primaries: Dn,
    toReference: (n) => n.convertSRGBToLinear().applyMatrix3(Qr),
    fromReference: (n) => n.applyMatrix3(jr).convertLinearToSRGB()
  }
}, Ra = /* @__PURE__ */ new Set([Qt, In]), Ze = {
  enabled: !0,
  _workingColorSpace: Qt,
  get workingColorSpace() {
    return this._workingColorSpace;
  },
  set workingColorSpace(n) {
    if (!Ra.has(n))
      throw new Error(`Unsupported working color space, "${n}".`);
    this._workingColorSpace = n;
  },
  convert: function(n, e, t) {
    if (this.enabled === !1 || e === t || !e || !t)
      return n;
    const i = sn[e].toReference, r = sn[t].fromReference;
    return r(i(n));
  },
  fromWorkingColorSpace: function(n, e) {
    return this.convert(n, this._workingColorSpace, e);
  },
  toWorkingColorSpace: function(n, e) {
    return this.convert(n, e, this._workingColorSpace);
  },
  getPrimaries: function(n) {
    return sn[n].primaries;
  },
  getTransfer: function(n) {
    return n === $t ? Pn : sn[n].transfer;
  }
};
function Di(n) {
  return n < 0.04045 ? n * 0.0773993808 : Math.pow(n * 0.9478672986 + 0.0521327014, 2.4);
}
function Yn(n) {
  return n < 31308e-7 ? n * 12.92 : 1.055 * Math.pow(n, 0.41666) - 0.055;
}
const Hs = {
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
}, qt = { h: 0, s: 0, l: 0 }, an = { h: 0, s: 0, l: 0 };
function Kn(n, e, t) {
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
  setHex(e, t = Pt) {
    return e = Math.floor(e), this.r = (e >> 16 & 255) / 255, this.g = (e >> 8 & 255) / 255, this.b = (e & 255) / 255, Ze.toWorkingColorSpace(this, t), this;
  }
  setRGB(e, t, i, r = Ze.workingColorSpace) {
    return this.r = e, this.g = t, this.b = i, Ze.toWorkingColorSpace(this, r), this;
  }
  setHSL(e, t, i, r = Ze.workingColorSpace) {
    if (e = Sa(e, 1), t = ft(t, 0, 1), i = ft(i, 0, 1), t === 0)
      this.r = this.g = this.b = i;
    else {
      const s = i <= 0.5 ? i * (1 + t) : i + t - i * t, a = 2 * i - s;
      this.r = Kn(a, s, e + 1 / 3), this.g = Kn(a, s, e), this.b = Kn(a, s, e - 1 / 3);
    }
    return Ze.toWorkingColorSpace(this, r), this;
  }
  setStyle(e, t = Pt) {
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
  setColorName(e, t = Pt) {
    const i = Hs[e.toLowerCase()];
    return i !== void 0 ? this.setHex(i, t) : console.warn("THREE.Color: Unknown color " + e), this;
  }
  clone() {
    return new this.constructor(this.r, this.g, this.b);
  }
  copy(e) {
    return this.r = e.r, this.g = e.g, this.b = e.b, this;
  }
  copySRGBToLinear(e) {
    return this.r = Di(e.r), this.g = Di(e.g), this.b = Di(e.b), this;
  }
  copyLinearToSRGB(e) {
    return this.r = Yn(e.r), this.g = Yn(e.g), this.b = Yn(e.b), this;
  }
  convertSRGBToLinear() {
    return this.copySRGBToLinear(this), this;
  }
  convertLinearToSRGB() {
    return this.copyLinearToSRGB(this), this;
  }
  getHex(e = Pt) {
    return Ze.fromWorkingColorSpace(dt.copy(this), e), Math.round(ft(dt.r * 255, 0, 255)) * 65536 + Math.round(ft(dt.g * 255, 0, 255)) * 256 + Math.round(ft(dt.b * 255, 0, 255));
  }
  getHexString(e = Pt) {
    return ("000000" + this.getHex(e).toString(16)).slice(-6);
  }
  getHSL(e, t = Ze.workingColorSpace) {
    Ze.fromWorkingColorSpace(dt.copy(this), t);
    const i = dt.r, r = dt.g, s = dt.b, a = Math.max(i, r, s), o = Math.min(i, r, s);
    let l, c;
    const h = (o + a) / 2;
    if (o === a)
      l = 0, c = 0;
    else {
      const f = a - o;
      switch (c = h <= 0.5 ? f / (a + o) : f / (2 - a - o), a) {
        case i:
          l = (r - s) / f + (r < s ? 6 : 0);
          break;
        case r:
          l = (s - i) / f + 2;
          break;
        case s:
          l = (i - r) / f + 4;
          break;
      }
      l /= 6;
    }
    return e.h = l, e.s = c, e.l = h, e;
  }
  getRGB(e, t = Ze.workingColorSpace) {
    return Ze.fromWorkingColorSpace(dt.copy(this), t), e.r = dt.r, e.g = dt.g, e.b = dt.b, e;
  }
  getStyle(e = Pt) {
    Ze.fromWorkingColorSpace(dt.copy(this), e);
    const t = dt.r, i = dt.g, r = dt.b;
    return e !== Pt ? `color(${e} ${t.toFixed(3)} ${i.toFixed(3)} ${r.toFixed(3)})` : `rgb(${Math.round(t * 255)},${Math.round(i * 255)},${Math.round(r * 255)})`;
  }
  offsetHSL(e, t, i) {
    return this.getHSL(qt), this.setHSL(qt.h + e, qt.s + t, qt.l + i);
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
    this.getHSL(qt), e.getHSL(an);
    const i = kn(qt.h, an.h, t), r = kn(qt.s, an.s, t), s = kn(qt.l, an.l, t);
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
const dt = /* @__PURE__ */ new ke();
ke.NAMES = Hs;
class Cr extends pt {
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
class _d extends Cr {
  constructor(e, t) {
    super(e, t), this.isAmbientLight = !0, this.type = "AmbientLight";
  }
}
class $i {
  constructor(e = new L(1 / 0, 1 / 0, 1 / 0), t = new L(-1 / 0, -1 / 0, -1 / 0)) {
    this.isBox3 = !0, this.min = e, this.max = t;
  }
  set(e, t) {
    return this.min.copy(e), this.max.copy(t), this;
  }
  setFromArray(e) {
    this.makeEmpty();
    for (let t = 0, i = e.length; t < i; t += 3)
      this.expandByPoint(Rt.fromArray(e, t));
    return this;
  }
  setFromBufferAttribute(e) {
    this.makeEmpty();
    for (let t = 0, i = e.count; t < i; t++)
      this.expandByPoint(Rt.fromBufferAttribute(e, t));
    return this;
  }
  setFromPoints(e) {
    this.makeEmpty();
    for (let t = 0, i = e.length; t < i; t++)
      this.expandByPoint(e[t]);
    return this;
  }
  setFromCenterAndSize(e, t) {
    const i = Rt.copy(t).multiplyScalar(0.5);
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
          e.isMesh === !0 ? e.getVertexPosition(a, Rt) : Rt.fromBufferAttribute(s, a), Rt.applyMatrix4(e.matrixWorld), this.expandByPoint(Rt);
      else
        e.boundingBox !== void 0 ? (e.boundingBox === null && e.computeBoundingBox(), on.copy(e.boundingBox)) : (i.boundingBox === null && i.computeBoundingBox(), on.copy(i.boundingBox)), on.applyMatrix4(e.matrixWorld), this.union(on);
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
    return this.clampPoint(e.center, Rt), Rt.distanceToSquared(e.center) <= e.radius * e.radius;
  }
  intersectsPlane(e) {
    let t, i;
    return e.normal.x > 0 ? (t = e.normal.x * this.min.x, i = e.normal.x * this.max.x) : (t = e.normal.x * this.max.x, i = e.normal.x * this.min.x), e.normal.y > 0 ? (t += e.normal.y * this.min.y, i += e.normal.y * this.max.y) : (t += e.normal.y * this.max.y, i += e.normal.y * this.min.y), e.normal.z > 0 ? (t += e.normal.z * this.min.z, i += e.normal.z * this.max.z) : (t += e.normal.z * this.max.z, i += e.normal.z * this.min.z), t <= -e.constant && i >= -e.constant;
  }
  intersectsTriangle(e) {
    if (this.isEmpty())
      return !1;
    this.getCenter(Gi), ln.subVectors(this.max, Gi), _i.subVectors(e.a, Gi), vi.subVectors(e.b, Gi), xi.subVectors(e.c, Gi), Yt.subVectors(vi, _i), Kt.subVectors(xi, vi), ii.subVectors(_i, xi);
    let t = [
      0,
      -Yt.z,
      Yt.y,
      0,
      -Kt.z,
      Kt.y,
      0,
      -ii.z,
      ii.y,
      Yt.z,
      0,
      -Yt.x,
      Kt.z,
      0,
      -Kt.x,
      ii.z,
      0,
      -ii.x,
      -Yt.y,
      Yt.x,
      0,
      -Kt.y,
      Kt.x,
      0,
      -ii.y,
      ii.x,
      0
    ];
    return !Zn(t, _i, vi, xi, ln) || (t = [1, 0, 0, 0, 1, 0, 0, 0, 1], !Zn(t, _i, vi, xi, ln)) ? !1 : (cn.crossVectors(Yt, Kt), t = [cn.x, cn.y, cn.z], Zn(t, _i, vi, xi, ln));
  }
  clampPoint(e, t) {
    return t.copy(e).clamp(this.min, this.max);
  }
  distanceToPoint(e) {
    return this.clampPoint(e, Rt).distanceTo(e);
  }
  getBoundingSphere(e) {
    return this.isEmpty() ? e.makeEmpty() : (this.getCenter(e.center), e.radius = this.getSize(Rt).length() * 0.5), e;
  }
  intersect(e) {
    return this.min.max(e.min), this.max.min(e.max), this.isEmpty() && this.makeEmpty(), this;
  }
  union(e) {
    return this.min.min(e.min), this.max.max(e.max), this;
  }
  applyMatrix4(e) {
    return this.isEmpty() ? this : (Bt[0].set(this.min.x, this.min.y, this.min.z).applyMatrix4(e), Bt[1].set(this.min.x, this.min.y, this.max.z).applyMatrix4(e), Bt[2].set(this.min.x, this.max.y, this.min.z).applyMatrix4(e), Bt[3].set(this.min.x, this.max.y, this.max.z).applyMatrix4(e), Bt[4].set(this.max.x, this.min.y, this.min.z).applyMatrix4(e), Bt[5].set(this.max.x, this.min.y, this.max.z).applyMatrix4(e), Bt[6].set(this.max.x, this.max.y, this.min.z).applyMatrix4(e), Bt[7].set(this.max.x, this.max.y, this.max.z).applyMatrix4(e), this.setFromPoints(Bt), this);
  }
  translate(e) {
    return this.min.add(e), this.max.add(e), this;
  }
  equals(e) {
    return e.min.equals(this.min) && e.max.equals(this.max);
  }
}
const Bt = [
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L(),
  /* @__PURE__ */ new L()
], Rt = /* @__PURE__ */ new L(), on = /* @__PURE__ */ new $i(), _i = /* @__PURE__ */ new L(), vi = /* @__PURE__ */ new L(), xi = /* @__PURE__ */ new L(), Yt = /* @__PURE__ */ new L(), Kt = /* @__PURE__ */ new L(), ii = /* @__PURE__ */ new L(), Gi = /* @__PURE__ */ new L(), ln = /* @__PURE__ */ new L(), cn = /* @__PURE__ */ new L(), ni = /* @__PURE__ */ new L();
function Zn(n, e, t, i, r) {
  for (let s = 0, a = n.length - 3; s <= a; s += 3) {
    ni.fromArray(n, s);
    const o = r.x * Math.abs(ni.x) + r.y * Math.abs(ni.y) + r.z * Math.abs(ni.z), l = e.dot(ni), c = t.dot(ni), h = i.dot(ni);
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
    return Math.acos(ft(i, -1, 1));
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
function ks(n) {
  for (let e = n.length - 1; e >= 0; --e)
    if (n[e] >= 65535) return !0;
  return !1;
}
function Un(n) {
  return document.createElementNS("http://www.w3.org/1999/xhtml", n);
}
function wa() {
  const n = Un("canvas");
  return n.style.display = "block", n;
}
const es = {};
function Ws(n) {
  n in es || (es[n] = !0, console.warn(n));
}
function Ca(n, e, t) {
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
const st = /* @__PURE__ */ new L(), hn = /* @__PURE__ */ new le();
class Ut {
  constructor(e, t, i = !1) {
    if (Array.isArray(e))
      throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");
    this.isBufferAttribute = !0, this.name = "", this.array = e, this.itemSize = t, this.count = e !== void 0 ? e.length / t : 0, this.normalized = i, this.usage = 35044, this._updateRange = { offset: 0, count: -1 }, this.updateRanges = [], this.gpuType = 1015, this.version = 0;
  }
  onUploadCallback() {
  }
  set needsUpdate(e) {
    e === !0 && this.version++;
  }
  get updateRange() {
    return Ws("THREE.BufferAttribute: updateRange() is deprecated and will be removed in r169. Use addUpdateRange() instead."), this._updateRange;
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
        hn.fromBufferAttribute(this, t), hn.applyMatrix3(e), this.setXY(t, hn.x, hn.y);
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
    return this.normalized && (i = Bi(i, this.array)), i;
  }
  setComponent(e, t, i) {
    return this.normalized && (i = gt(i, this.array)), this.array[e * this.itemSize + t] = i, this;
  }
  getX(e) {
    let t = this.array[e * this.itemSize];
    return this.normalized && (t = Bi(t, this.array)), t;
  }
  setX(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize] = t, this;
  }
  getY(e) {
    let t = this.array[e * this.itemSize + 1];
    return this.normalized && (t = Bi(t, this.array)), t;
  }
  setY(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 1] = t, this;
  }
  getZ(e) {
    let t = this.array[e * this.itemSize + 2];
    return this.normalized && (t = Bi(t, this.array)), t;
  }
  setZ(e, t) {
    return this.normalized && (t = gt(t, this.array)), this.array[e * this.itemSize + 2] = t, this;
  }
  getW(e) {
    let t = this.array[e * this.itemSize + 3];
    return this.normalized && (t = Bi(t, this.array)), t;
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
    return this.name !== "" && (e.name = this.name), this.usage !== 35044 && (e.usage = this.usage), e;
  }
}
class Xs extends Ut {
  constructor(e, t, i) {
    super(new Uint16Array(e), t, i);
  }
}
class qs extends Ut {
  constructor(e, t, i) {
    super(new Uint32Array(e), t, i);
  }
}
class kt extends Ut {
  constructor(e, t, i) {
    super(new Float32Array(e), t, i);
  }
}
const Pa = /* @__PURE__ */ new $i(), Vi = /* @__PURE__ */ new L(), Jn = /* @__PURE__ */ new L();
class Pr {
  constructor(e = new L(), t = -1) {
    this.isSphere = !0, this.center = e, this.radius = t;
  }
  set(e, t) {
    return this.center.copy(e), this.radius = t, this;
  }
  setFromPoints(e, t) {
    const i = this.center;
    t !== void 0 ? i.copy(t) : Pa.setFromPoints(e).getCenter(i);
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
    Vi.subVectors(e, this.center);
    const t = Vi.lengthSq();
    if (t > this.radius * this.radius) {
      const i = Math.sqrt(t), r = (i - this.radius) * 0.5;
      this.center.addScaledVector(Vi, r / i), this.radius += r;
    }
    return this;
  }
  union(e) {
    return e.isEmpty() ? this : this.isEmpty() ? (this.copy(e), this) : (this.center.equals(e.center) === !0 ? this.radius = Math.max(this.radius, e.radius) : (Jn.subVectors(e.center, this.center).setLength(e.radius), this.expandByPoint(Vi.copy(e.center).add(Jn)), this.expandByPoint(Vi.copy(e.center).sub(Jn))), this);
  }
  equals(e) {
    return e.center.equals(this.center) && e.radius === this.radius;
  }
  clone() {
    return new this.constructor().copy(this);
  }
}
let La = 0;
const Et = /* @__PURE__ */ new je(), $n = /* @__PURE__ */ new pt(), Si = /* @__PURE__ */ new L(), Mt = /* @__PURE__ */ new $i(), Hi = /* @__PURE__ */ new $i(), lt = /* @__PURE__ */ new L();
class ei extends Fi {
  constructor() {
    super(), this.isBufferGeometry = !0, Object.defineProperty(this, "id", { value: La++ }), this.uuid = Ni(), this.name = "", this.type = "BufferGeometry", this.index = null, this.attributes = {}, this.morphAttributes = {}, this.morphTargetsRelative = !1, this.groups = [], this.boundingBox = null, this.boundingSphere = null, this.drawRange = { start: 0, count: 1 / 0 }, this.userData = {};
  }
  getIndex() {
    return this.index;
  }
  setIndex(e) {
    return Array.isArray(e) ? this.index = new (ks(e) ? qs : Xs)(e, 1) : this.index = e, this;
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
    return Et.makeRotationFromQuaternion(e), this.applyMatrix4(Et), this;
  }
  rotateX(e) {
    return Et.makeRotationX(e), this.applyMatrix4(Et), this;
  }
  rotateY(e) {
    return Et.makeRotationY(e), this.applyMatrix4(Et), this;
  }
  rotateZ(e) {
    return Et.makeRotationZ(e), this.applyMatrix4(Et), this;
  }
  translate(e, t, i) {
    return Et.makeTranslation(e, t, i), this.applyMatrix4(Et), this;
  }
  scale(e, t, i) {
    return Et.makeScale(e, t, i), this.applyMatrix4(Et), this;
  }
  lookAt(e) {
    return $n.lookAt(e), $n.updateMatrix(), this.applyMatrix4($n.matrix), this;
  }
  center() {
    return this.computeBoundingBox(), this.boundingBox.getCenter(Si).negate(), this.translate(Si.x, Si.y, Si.z), this;
  }
  setFromPoints(e) {
    const t = [];
    for (let i = 0, r = e.length; i < r; i++) {
      const s = e[i];
      t.push(s.x, s.y, s.z || 0);
    }
    return this.setAttribute("position", new kt(t, 3)), this;
  }
  computeBoundingBox() {
    this.boundingBox === null && (this.boundingBox = new $i());
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
          Mt.setFromBufferAttribute(s), this.morphTargetsRelative ? (lt.addVectors(this.boundingBox.min, Mt.min), this.boundingBox.expandByPoint(lt), lt.addVectors(this.boundingBox.max, Mt.max), this.boundingBox.expandByPoint(lt)) : (this.boundingBox.expandByPoint(Mt.min), this.boundingBox.expandByPoint(Mt.max));
        }
    } else
      this.boundingBox.makeEmpty();
    (isNaN(this.boundingBox.min.x) || isNaN(this.boundingBox.min.y) || isNaN(this.boundingBox.min.z)) && console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.', this);
  }
  computeBoundingSphere() {
    this.boundingSphere === null && (this.boundingSphere = new Pr());
    const e = this.attributes.position, t = this.morphAttributes.position;
    if (e && e.isGLBufferAttribute) {
      console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.", this), this.boundingSphere.set(new L(), 1 / 0);
      return;
    }
    if (e) {
      const i = this.boundingSphere.center;
      if (Mt.setFromBufferAttribute(e), t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s];
          Hi.setFromBufferAttribute(o), this.morphTargetsRelative ? (lt.addVectors(Mt.min, Hi.min), Mt.expandByPoint(lt), lt.addVectors(Mt.max, Hi.max), Mt.expandByPoint(lt)) : (Mt.expandByPoint(Hi.min), Mt.expandByPoint(Hi.max));
        }
      Mt.getCenter(i);
      let r = 0;
      for (let s = 0, a = e.count; s < a; s++)
        lt.fromBufferAttribute(e, s), r = Math.max(r, i.distanceToSquared(lt));
      if (t)
        for (let s = 0, a = t.length; s < a; s++) {
          const o = t[s], l = this.morphTargetsRelative;
          for (let c = 0, h = o.count; c < h; c++)
            lt.fromBufferAttribute(o, c), l && (Si.fromBufferAttribute(e, c), lt.add(Si)), r = Math.max(r, i.distanceToSquared(lt));
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
    this.hasAttribute("tangent") === !1 && this.setAttribute("tangent", new Ut(new Float32Array(4 * i.count), 4));
    const a = this.getAttribute("tangent"), o = [], l = [];
    for (let I = 0; I < i.count; I++)
      o[I] = new L(), l[I] = new L();
    const c = new L(), h = new L(), f = new L(), d = new le(), m = new le(), g = new le(), v = new L(), p = new L();
    function u(I, E, x) {
      c.fromBufferAttribute(i, I), h.fromBufferAttribute(i, E), f.fromBufferAttribute(i, x), d.fromBufferAttribute(s, I), m.fromBufferAttribute(s, E), g.fromBufferAttribute(s, x), h.sub(c), f.sub(c), m.sub(d), g.sub(d);
      const C = 1 / (m.x * g.y - g.x * m.y);
      isFinite(C) && (v.copy(h).multiplyScalar(g.y).addScaledVector(f, -m.y).multiplyScalar(C), p.copy(f).multiplyScalar(m.x).addScaledVector(h, -g.x).multiplyScalar(C), o[I].add(v), o[E].add(v), o[x].add(v), l[I].add(p), l[E].add(p), l[x].add(p));
    }
    let b = this.groups;
    b.length === 0 && (b = [{
      start: 0,
      count: e.count
    }]);
    for (let I = 0, E = b.length; I < E; ++I) {
      const x = b[I], C = x.start, W = x.count;
      for (let z = C, V = C + W; z < V; z += 3)
        u(
          e.getX(z + 0),
          e.getX(z + 1),
          e.getX(z + 2)
        );
    }
    const S = new L(), T = new L(), O = new L(), R = new L();
    function w(I) {
      O.fromBufferAttribute(r, I), R.copy(O);
      const E = o[I];
      S.copy(E), S.sub(O.multiplyScalar(O.dot(E))).normalize(), T.crossVectors(R, E);
      const C = T.dot(l[I]) < 0 ? -1 : 1;
      a.setXYZW(I, S.x, S.y, S.z, C);
    }
    for (let I = 0, E = b.length; I < E; ++I) {
      const x = b[I], C = x.start, W = x.count;
      for (let z = C, V = C + W; z < V; z += 3)
        w(e.getX(z + 0)), w(e.getX(z + 1)), w(e.getX(z + 2));
    }
  }
  computeVertexNormals() {
    const e = this.index, t = this.getAttribute("position");
    if (t !== void 0) {
      let i = this.getAttribute("normal");
      if (i === void 0)
        i = new Ut(new Float32Array(t.count * 3), 3), this.setAttribute("normal", i);
      else
        for (let d = 0, m = i.count; d < m; d++)
          i.setXYZ(d, 0, 0, 0);
      const r = new L(), s = new L(), a = new L(), o = new L(), l = new L(), c = new L(), h = new L(), f = new L();
      if (e)
        for (let d = 0, m = e.count; d < m; d += 3) {
          const g = e.getX(d + 0), v = e.getX(d + 1), p = e.getX(d + 2);
          r.fromBufferAttribute(t, g), s.fromBufferAttribute(t, v), a.fromBufferAttribute(t, p), h.subVectors(a, s), f.subVectors(r, s), h.cross(f), o.fromBufferAttribute(i, g), l.fromBufferAttribute(i, v), c.fromBufferAttribute(i, p), o.add(h), l.add(h), c.add(h), i.setXYZ(g, o.x, o.y, o.z), i.setXYZ(v, l.x, l.y, l.z), i.setXYZ(p, c.x, c.y, c.z);
        }
      else
        for (let d = 0, m = t.count; d < m; d += 3)
          r.fromBufferAttribute(t, d + 0), s.fromBufferAttribute(t, d + 1), a.fromBufferAttribute(t, d + 2), h.subVectors(a, s), f.subVectors(r, s), h.cross(f), i.setXYZ(d + 0, h.x, h.y, h.z), i.setXYZ(d + 1, h.x, h.y, h.z), i.setXYZ(d + 2, h.x, h.y, h.z);
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
      const c = o.array, h = o.itemSize, f = o.normalized, d = new c.constructor(l.length * h);
      let m = 0, g = 0;
      for (let v = 0, p = l.length; v < p; v++) {
        o.isInterleavedBufferAttribute ? m = l[v] * o.data.stride + o.offset : m = l[v] * h;
        for (let u = 0; u < h; u++)
          d[g++] = c[m++];
      }
      return new Ut(d, h, f);
    }
    if (this.index === null)
      return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."), this;
    const t = new ei(), i = this.index.array, r = this.attributes;
    for (const o in r) {
      const l = r[o], c = e(l, i);
      t.setAttribute(o, c);
    }
    const s = this.morphAttributes;
    for (const o in s) {
      const l = [], c = s[o];
      for (let h = 0, f = c.length; h < f; h++) {
        const d = c[h], m = e(d, i);
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
      for (let f = 0, d = c.length; f < d; f++) {
        const m = c[f];
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
      const h = [], f = s[c];
      for (let d = 0, m = f.length; d < m; d++)
        h.push(f[d].clone(t));
      this.morphAttributes[c] = h;
    }
    this.morphTargetsRelative = e.morphTargetsRelative;
    const a = e.groups;
    for (let c = 0, h = a.length; c < h; c++) {
      const f = a[c];
      this.addGroup(f.start, f.count, f.materialIndex);
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
class ji extends ei {
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
    const l = [], c = [], h = [], f = [];
    let d = 0, m = 0;
    g("z", "y", "x", -1, -1, i, t, e, a, s, 0), g("z", "y", "x", 1, -1, i, t, -e, a, s, 1), g("x", "z", "y", 1, 1, e, i, t, r, a, 2), g("x", "z", "y", 1, -1, e, i, -t, r, a, 3), g("x", "y", "z", 1, -1, e, t, i, r, s, 4), g("x", "y", "z", -1, -1, e, t, -i, r, s, 5), this.setIndex(l), this.setAttribute("position", new kt(c, 3)), this.setAttribute("normal", new kt(h, 3)), this.setAttribute("uv", new kt(f, 2));
    function g(v, p, u, b, S, T, O, R, w, I, E) {
      const x = T / w, C = O / I, W = T / 2, z = O / 2, V = R / 2, K = w + 1, G = I + 1;
      let Q = 0, H = 0;
      const fe = new L();
      for (let xe = 0; xe < G; xe++) {
        const me = xe * C - z;
        for (let Be = 0; Be < K; Be++) {
          const We = Be * x - W;
          fe[v] = We * b, fe[p] = me * S, fe[u] = V, c.push(fe.x, fe.y, fe.z), fe[v] = 0, fe[p] = 0, fe[u] = R > 0 ? 1 : -1, h.push(fe.x, fe.y, fe.z), f.push(Be / w), f.push(1 - xe / I), Q += 1;
        }
      }
      for (let xe = 0; xe < I; xe++)
        for (let me = 0; me < w; me++) {
          const Be = d + me + K * xe, We = d + me + K * (xe + 1), k = d + (me + 1) + K * (xe + 1), ee = d + (me + 1) + K * xe;
          l.push(Be, We, ee), l.push(We, k, ee), H += 6;
        }
      o.addGroup(m, H, E), m += H, d += Q;
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new ji(e.width, e.height, e.depth, e.widthSegments, e.heightSegments, e.depthSegments);
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
    const l = e.elements, c = l[0], h = l[4], f = l[8], d = l[1], m = l[5], g = l[9], v = l[2], p = l[6], u = l[10];
    if (Math.abs(h - d) < 0.01 && Math.abs(f - v) < 0.01 && Math.abs(g - p) < 0.01) {
      if (Math.abs(h + d) < 0.1 && Math.abs(f + v) < 0.1 && Math.abs(g + p) < 0.1 && Math.abs(c + m + u - 3) < 0.1)
        return this.set(1, 0, 0, 0), this;
      t = Math.PI;
      const S = (c + 1) / 2, T = (m + 1) / 2, O = (u + 1) / 2, R = (h + d) / 4, w = (f + v) / 4, I = (g + p) / 4;
      return S > T && S > O ? S < 0.01 ? (i = 0, r = 0.707106781, s = 0.707106781) : (i = Math.sqrt(S), r = R / i, s = w / i) : T > O ? T < 0.01 ? (i = 0.707106781, r = 0, s = 0.707106781) : (r = Math.sqrt(T), i = R / r, s = I / r) : O < 0.01 ? (i = 0.707106781, r = 0.707106781, s = 0) : (s = Math.sqrt(O), i = w / s, r = I / s), this.set(i, r, s, t), this;
    }
    let b = Math.sqrt((p - g) * (p - g) + (f - v) * (f - v) + (d - h) * (d - h));
    return Math.abs(b) < 1e-3 && (b = 1), this.x = (p - g) / b, this.y = (f - v) / b, this.z = (d - h) / b, this.w = Math.acos((c + m + u - 1) / 2), this;
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
const jn = /* @__PURE__ */ new L(), Da = /* @__PURE__ */ new L(), Ua = /* @__PURE__ */ new Oe();
class li {
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
    const r = jn.subVectors(i, t).cross(Da.subVectors(e, t)).normalize();
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
    const i = e.delta(jn), r = this.normal.dot(i);
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
    const i = t || Ua.getNormalMatrix(e), r = this.coplanarPoint(jn).applyMatrix4(e), s = this.normal.applyMatrix3(i).normalize();
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
const ri = /* @__PURE__ */ new Pr(), un = /* @__PURE__ */ new L();
class Lr {
  constructor(e = new li(), t = new li(), i = new li(), r = new li(), s = new li(), a = new li()) {
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
  setFromProjectionMatrix(e, t = 2e3) {
    const i = this.planes, r = e.elements, s = r[0], a = r[1], o = r[2], l = r[3], c = r[4], h = r[5], f = r[6], d = r[7], m = r[8], g = r[9], v = r[10], p = r[11], u = r[12], b = r[13], S = r[14], T = r[15];
    if (i[0].setComponents(l - s, d - c, p - m, T - u).normalize(), i[1].setComponents(l + s, d + c, p + m, T + u).normalize(), i[2].setComponents(l + a, d + h, p + g, T + b).normalize(), i[3].setComponents(l - a, d - h, p - g, T - b).normalize(), i[4].setComponents(l - o, d - f, p - v, T - S).normalize(), t === 2e3)
      i[5].setComponents(l + o, d + f, p + v, T + S).normalize();
    else if (t === 2001)
      i[5].setComponents(o, f, v, S).normalize();
    else
      throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: " + t);
    return this;
  }
  intersectsObject(e) {
    if (e.boundingSphere !== void 0)
      e.boundingSphere === null && e.computeBoundingSphere(), ri.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);
    else {
      const t = e.geometry;
      t.boundingSphere === null && t.computeBoundingSphere(), ri.copy(t.boundingSphere).applyMatrix4(e.matrixWorld);
    }
    return this.intersectsSphere(ri);
  }
  intersectsSprite(e) {
    return ri.center.set(0, 0, 0), ri.radius = 0.7071067811865476, ri.applyMatrix4(e.matrixWorld), this.intersectsSphere(ri);
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
      if (un.x = r.normal.x > 0 ? e.max.x : e.min.x, un.y = r.normal.y > 0 ? e.max.y : e.min.y, un.z = r.normal.z > 0 ? e.max.z : e.min.z, r.distanceToPoint(un) < 0)
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
const Qn = /* @__PURE__ */ new je(), ts = /* @__PURE__ */ new L(), is = /* @__PURE__ */ new L();
class Ys {
  constructor(e) {
    this.camera = e, this.intensity = 1, this.bias = 0, this.normalBias = 0, this.radius = 1, this.blurSamples = 8, this.mapSize = new le(512, 512), this.map = null, this.mapPass = null, this.matrix = new je(), this.autoUpdate = !0, this.needsUpdate = !1, this._frustum = new Lr(), this._frameExtents = new le(1, 1), this._viewportCount = 1, this._viewports = [
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
    ts.setFromMatrixPosition(e.matrixWorld), t.position.copy(ts), is.setFromMatrixPosition(e.target.matrixWorld), t.lookAt(is), t.updateMatrixWorld(), Qn.multiplyMatrices(t.projectionMatrix, t.matrixWorldInverse), this._frustum.setFromProjectionMatrix(Qn), i.set(
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
    ), i.multiply(Qn);
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
class Ks extends pt {
  constructor() {
    super(), this.isCamera = !0, this.type = "Camera", this.matrixWorldInverse = new je(), this.projectionMatrix = new je(), this.projectionMatrixInverse = new je(), this.coordinateSystem = 2e3;
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
class Zs extends Ks {
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
class Ia extends Ys {
  constructor() {
    super(new Zs(-5, 5, 5, -5, 0.5, 500)), this.isDirectionalLightShadow = !0;
  }
}
class vd extends Cr {
  constructor(e, t) {
    super(e, t), this.isDirectionalLight = !0, this.type = "DirectionalLight", this.position.copy(pt.DEFAULT_UP), this.updateMatrix(), this.target = new pt(), this.shadow = new Ia();
  }
  dispose() {
    this.shadow.dispose();
  }
  copy(e) {
    return super.copy(e), this.target = e.target.clone(), this.shadow = e.shadow.clone(), this;
  }
}
class Nt {
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
    const h = i[r], d = i[r + 1] - h, m = (a - h) / d;
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
    const h = Math.abs(r[0].x), f = Math.abs(r[0].y), d = Math.abs(r[0].z);
    h <= c && (c = h, i.set(1, 0, 0)), f <= c && (c = f, i.set(0, 1, 0)), d <= c && i.set(0, 0, 1), o.crossVectors(r[0], i).normalize(), s[0].crossVectors(r[0], o), a[0].crossVectors(r[0], s[0]);
    for (let m = 1; m <= e; m++) {
      if (s[m] = s[m - 1].clone(), a[m] = a[m - 1].clone(), o.crossVectors(r[m - 1], r[m]), o.length() > Number.EPSILON) {
        o.normalize();
        const g = Math.acos(ft(r[m - 1].dot(r[m]), -1, 1));
        s[m].applyMatrix4(l.makeRotationAxis(o, g));
      }
      a[m].crossVectors(r[m], s[m]);
    }
    if (t === !0) {
      let m = Math.acos(ft(s[0].dot(s[e]), -1, 1));
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
class Dr extends Nt {
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
      const h = Math.cos(this.aRotation), f = Math.sin(this.aRotation), d = l - this.aX, m = c - this.aY;
      l = d * h - m * f + this.aX, c = d * f + m * h + this.aY;
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
class Na extends Dr {
  constructor(e, t, i, r, s, a) {
    super(e, t, i, i, r, s, a), this.isArcCurve = !0, this.type = "ArcCurve";
  }
}
function Ur() {
  let n = 0, e = 0, t = 0, i = 0;
  function r(s, a, o, l) {
    n = s, e = o, t = -3 * s + 3 * a - 2 * o - l, i = 2 * s - 2 * a + o + l;
  }
  return {
    initCatmullRom: function(s, a, o, l, c) {
      r(a, o, c * (o - s), c * (l - a));
    },
    initNonuniformCatmullRom: function(s, a, o, l, c, h, f) {
      let d = (a - s) / c - (o - s) / (c + h) + (o - a) / h, m = (o - a) / h - (l - a) / (h + f) + (l - o) / f;
      d *= h, m *= h, r(a, o, d, m);
    },
    calc: function(s) {
      const a = s * s, o = a * s;
      return n + e * s + t * a + i * o;
    }
  };
}
const dn = /* @__PURE__ */ new L(), er = /* @__PURE__ */ new Ur(), tr = /* @__PURE__ */ new Ur(), ir = /* @__PURE__ */ new Ur();
class Fa extends Nt {
  constructor(e = [], t = !1, i = "centripetal", r = 0.5) {
    super(), this.isCatmullRomCurve3 = !0, this.type = "CatmullRomCurve3", this.points = e, this.closed = t, this.curveType = i, this.tension = r;
  }
  getPoint(e, t = new L()) {
    const i = t, r = this.points, s = r.length, a = (s - (this.closed ? 0 : 1)) * e;
    let o = Math.floor(a), l = a - o;
    this.closed ? o += o > 0 ? 0 : (Math.floor(Math.abs(o) / s) + 1) * s : l === 0 && o === s - 1 && (o = s - 2, l = 1);
    let c, h;
    this.closed || o > 0 ? c = r[(o - 1) % s] : (dn.subVectors(r[0], r[1]).add(r[0]), c = dn);
    const f = r[o % s], d = r[(o + 1) % s];
    if (this.closed || o + 2 < s ? h = r[(o + 2) % s] : (dn.subVectors(r[s - 1], r[s - 2]).add(r[s - 1]), h = dn), this.curveType === "centripetal" || this.curveType === "chordal") {
      const m = this.curveType === "chordal" ? 0.5 : 0.25;
      let g = Math.pow(c.distanceToSquared(f), m), v = Math.pow(f.distanceToSquared(d), m), p = Math.pow(d.distanceToSquared(h), m);
      v < 1e-4 && (v = 1), g < 1e-4 && (g = v), p < 1e-4 && (p = v), er.initNonuniformCatmullRom(c.x, f.x, d.x, h.x, g, v, p), tr.initNonuniformCatmullRom(c.y, f.y, d.y, h.y, g, v, p), ir.initNonuniformCatmullRom(c.z, f.z, d.z, h.z, g, v, p);
    } else this.curveType === "catmullrom" && (er.initCatmullRom(c.x, f.x, d.x, h.x, this.tension), tr.initCatmullRom(c.y, f.y, d.y, h.y, this.tension), ir.initCatmullRom(c.z, f.z, d.z, h.z, this.tension));
    return i.set(
      er.calc(l),
      tr.calc(l),
      ir.calc(l)
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
function ns(n, e, t, i, r) {
  const s = (i - e) * 0.5, a = (r - t) * 0.5, o = n * n, l = n * o;
  return (2 * t - 2 * i + s + a) * l + (-3 * t + 3 * i - 2 * s - a) * o + s * n + t;
}
function Oa(n, e) {
  const t = 1 - n;
  return t * t * e;
}
function Ba(n, e) {
  return 2 * (1 - n) * n * e;
}
function za(n, e) {
  return n * n * e;
}
function Xi(n, e, t, i) {
  return Oa(n, e) + Ba(n, t) + za(n, i);
}
function Ga(n, e) {
  const t = 1 - n;
  return t * t * t * e;
}
function Va(n, e) {
  const t = 1 - n;
  return 3 * t * t * n * e;
}
function Ha(n, e) {
  return 3 * (1 - n) * n * n * e;
}
function ka(n, e) {
  return n * n * n * e;
}
function qi(n, e, t, i, r) {
  return Ga(n, e) + Va(n, t) + Ha(n, i) + ka(n, r);
}
class Js extends Nt {
  constructor(e = new le(), t = new le(), i = new le(), r = new le()) {
    super(), this.isCubicBezierCurve = !0, this.type = "CubicBezierCurve", this.v0 = e, this.v1 = t, this.v2 = i, this.v3 = r;
  }
  getPoint(e, t = new le()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2, o = this.v3;
    return i.set(
      qi(e, r.x, s.x, a.x, o.x),
      qi(e, r.y, s.y, a.y, o.y)
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
class Wa extends Nt {
  constructor(e = new L(), t = new L(), i = new L(), r = new L()) {
    super(), this.isCubicBezierCurve3 = !0, this.type = "CubicBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = i, this.v3 = r;
  }
  getPoint(e, t = new L()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2, o = this.v3;
    return i.set(
      qi(e, r.x, s.x, a.x, o.x),
      qi(e, r.y, s.y, a.y, o.y),
      qi(e, r.z, s.z, a.z, o.z)
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
class $s extends Nt {
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
class Xa extends Nt {
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
class js extends Nt {
  constructor(e = new le(), t = new le(), i = new le()) {
    super(), this.isQuadraticBezierCurve = !0, this.type = "QuadraticBezierCurve", this.v0 = e, this.v1 = t, this.v2 = i;
  }
  getPoint(e, t = new le()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2;
    return i.set(
      Xi(e, r.x, s.x, a.x),
      Xi(e, r.y, s.y, a.y)
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
class qa extends Nt {
  constructor(e = new L(), t = new L(), i = new L()) {
    super(), this.isQuadraticBezierCurve3 = !0, this.type = "QuadraticBezierCurve3", this.v0 = e, this.v1 = t, this.v2 = i;
  }
  getPoint(e, t = new L()) {
    const i = t, r = this.v0, s = this.v1, a = this.v2;
    return i.set(
      Xi(e, r.x, s.x, a.x),
      Xi(e, r.y, s.y, a.y),
      Xi(e, r.z, s.z, a.z)
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
class Qs extends Nt {
  constructor(e = []) {
    super(), this.isSplineCurve = !0, this.type = "SplineCurve", this.points = e;
  }
  getPoint(e, t = new le()) {
    const i = t, r = this.points, s = (r.length - 1) * e, a = Math.floor(s), o = s - a, l = r[a === 0 ? a : a - 1], c = r[a], h = r[a > r.length - 2 ? r.length - 1 : a + 1], f = r[a > r.length - 3 ? r.length - 1 : a + 2];
    return i.set(
      ns(o, l.x, c.x, h.x, f.x),
      ns(o, l.y, c.y, h.y, f.y)
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
const Mr = /* @__PURE__ */ Object.freeze(/* @__PURE__ */ Object.defineProperty({
  __proto__: null,
  ArcCurve: Na,
  CatmullRomCurve3: Fa,
  CubicBezierCurve: Js,
  CubicBezierCurve3: Wa,
  EllipseCurve: Dr,
  LineCurve: $s,
  LineCurve3: Xa,
  QuadraticBezierCurve: js,
  QuadraticBezierCurve3: qa,
  SplineCurve: Qs
}, Symbol.toStringTag, { value: "Module" }));
class Ya extends Nt {
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
      this.curves.push(new Mr[i](t, e));
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
      this.curves.push(new Mr[r.type]().fromJSON(r));
    }
    return this;
  }
}
class yr extends Ya {
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
    const i = new $s(this.currentPoint.clone(), new le(e, t));
    return this.curves.push(i), this.currentPoint.set(e, t), this;
  }
  quadraticCurveTo(e, t, i, r) {
    const s = new js(
      this.currentPoint.clone(),
      new le(e, t),
      new le(i, r)
    );
    return this.curves.push(s), this.currentPoint.set(i, r), this;
  }
  bezierCurveTo(e, t, i, r, s, a) {
    const o = new Js(
      this.currentPoint.clone(),
      new le(e, t),
      new le(i, r),
      new le(s, a)
    );
    return this.curves.push(o), this.currentPoint.set(s, a), this;
  }
  splineThru(e) {
    const t = [this.currentPoint.clone()].concat(e), i = new Qs(t);
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
    const c = new Dr(e, t, i, r, s, a, o, l);
    if (this.curves.length > 0) {
      const f = c.getPoint(0);
      f.equals(this.currentPoint) || this.lineTo(f.x, f.y);
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
class wn extends yr {
  constructor(e) {
    super(e), this.uuid = Ni(), this.type = "Shape", this.holes = [];
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
      this.holes.push(new yr().fromJSON(r));
    }
    return this;
  }
}
const Ka = {
  triangulate: function(n, e, t = 2) {
    const i = e && e.length, r = i ? e[0] * t : n.length;
    let s = ea(n, 0, r, t, !0);
    const a = [];
    if (!s || s.next === s.prev) return a;
    let o, l, c, h, f, d, m;
    if (i && (s = Qa(n, e, s, t)), n.length > 80 * t) {
      o = c = n[0], l = h = n[1];
      for (let g = t; g < r; g += t)
        f = n[g], d = n[g + 1], f < o && (o = f), d < l && (l = d), f > c && (c = f), d > h && (h = d);
      m = Math.max(c - o, h - l), m = m !== 0 ? 32767 / m : 0;
    }
    return Yi(s, a, t, o, l, m, 0), a;
  }
};
function ea(n, e, t, i, r) {
  let s, a;
  if (r === ho(n, e, t, i) > 0)
    for (s = e; s < t; s += i) a = rs(s, n[s], n[s + 1], a);
  else
    for (s = t - i; s >= e; s -= i) a = rs(s, n[s], n[s + 1], a);
  return a && Nn(a, a.next) && (Zi(a), a = a.next), a;
}
function ui(n, e) {
  if (!n) return n;
  e || (e = n);
  let t = n, i;
  do
    if (i = !1, !t.steiner && (Nn(t, t.next) || et(t.prev, t, t.next) === 0)) {
      if (Zi(t), t = e = t.prev, t === t.next) break;
      i = !0;
    } else
      t = t.next;
  while (i || t !== e);
  return e;
}
function Yi(n, e, t, i, r, s, a) {
  if (!n) return;
  !a && s && ro(n, i, r, s);
  let o = n, l, c;
  for (; n.prev !== n.next; ) {
    if (l = n.prev, c = n.next, s ? Ja(n, i, r, s) : Za(n)) {
      e.push(l.i / t | 0), e.push(n.i / t | 0), e.push(c.i / t | 0), Zi(n), n = c.next, o = c.next;
      continue;
    }
    if (n = c, n === o) {
      a ? a === 1 ? (n = $a(ui(n), e, t), Yi(n, e, t, i, r, s, 2)) : a === 2 && ja(n, e, t, i, r, s) : Yi(ui(n), e, t, i, r, s, 1);
      break;
    }
  }
}
function Za(n) {
  const e = n.prev, t = n, i = n.next;
  if (et(e, t, i) >= 0) return !1;
  const r = e.x, s = t.x, a = i.x, o = e.y, l = t.y, c = i.y, h = r < s ? r < a ? r : a : s < a ? s : a, f = o < l ? o < c ? o : c : l < c ? l : c, d = r > s ? r > a ? r : a : s > a ? s : a, m = o > l ? o > c ? o : c : l > c ? l : c;
  let g = i.next;
  for (; g !== e; ) {
    if (g.x >= h && g.x <= d && g.y >= f && g.y <= m && Pi(r, o, s, l, a, c, g.x, g.y) && et(g.prev, g, g.next) >= 0) return !1;
    g = g.next;
  }
  return !0;
}
function Ja(n, e, t, i) {
  const r = n.prev, s = n, a = n.next;
  if (et(r, s, a) >= 0) return !1;
  const o = r.x, l = s.x, c = a.x, h = r.y, f = s.y, d = a.y, m = o < l ? o < c ? o : c : l < c ? l : c, g = h < f ? h < d ? h : d : f < d ? f : d, v = o > l ? o > c ? o : c : l > c ? l : c, p = h > f ? h > d ? h : d : f > d ? f : d, u = Er(m, g, e, t, i), b = Er(v, p, e, t, i);
  let S = n.prevZ, T = n.nextZ;
  for (; S && S.z >= u && T && T.z <= b; ) {
    if (S.x >= m && S.x <= v && S.y >= g && S.y <= p && S !== r && S !== a && Pi(o, h, l, f, c, d, S.x, S.y) && et(S.prev, S, S.next) >= 0 || (S = S.prevZ, T.x >= m && T.x <= v && T.y >= g && T.y <= p && T !== r && T !== a && Pi(o, h, l, f, c, d, T.x, T.y) && et(T.prev, T, T.next) >= 0)) return !1;
    T = T.nextZ;
  }
  for (; S && S.z >= u; ) {
    if (S.x >= m && S.x <= v && S.y >= g && S.y <= p && S !== r && S !== a && Pi(o, h, l, f, c, d, S.x, S.y) && et(S.prev, S, S.next) >= 0) return !1;
    S = S.prevZ;
  }
  for (; T && T.z <= b; ) {
    if (T.x >= m && T.x <= v && T.y >= g && T.y <= p && T !== r && T !== a && Pi(o, h, l, f, c, d, T.x, T.y) && et(T.prev, T, T.next) >= 0) return !1;
    T = T.nextZ;
  }
  return !0;
}
function $a(n, e, t) {
  let i = n;
  do {
    const r = i.prev, s = i.next.next;
    !Nn(r, s) && ta(r, i, i.next, s) && Ki(r, s) && Ki(s, r) && (e.push(r.i / t | 0), e.push(i.i / t | 0), e.push(s.i / t | 0), Zi(i), Zi(i.next), i = n = s), i = i.next;
  } while (i !== n);
  return ui(i);
}
function ja(n, e, t, i, r, s) {
  let a = n;
  do {
    let o = a.next.next;
    for (; o !== a.prev; ) {
      if (a.i !== o.i && oo(a, o)) {
        let l = ia(a, o);
        a = ui(a, a.next), l = ui(l, l.next), Yi(a, e, t, i, r, s, 0), Yi(l, e, t, i, r, s, 0);
        return;
      }
      o = o.next;
    }
    a = a.next;
  } while (a !== n);
}
function Qa(n, e, t, i) {
  const r = [];
  let s, a, o, l, c;
  for (s = 0, a = e.length; s < a; s++)
    o = e[s] * i, l = s < a - 1 ? e[s + 1] * i : n.length, c = ea(n, o, l, i, !1), c === c.next && (c.steiner = !0), r.push(ao(c));
  for (r.sort(eo), s = 0; s < r.length; s++)
    t = to(r[s], t);
  return t;
}
function eo(n, e) {
  return n.x - e.x;
}
function to(n, e) {
  const t = io(n, e);
  if (!t)
    return e;
  const i = ia(t, n);
  return ui(i, i.next), ui(t, t.next);
}
function io(n, e) {
  let t = e, i = -1 / 0, r;
  const s = n.x, a = n.y;
  do {
    if (a <= t.y && a >= t.next.y && t.next.y !== t.y) {
      const d = t.x + (a - t.y) * (t.next.x - t.x) / (t.next.y - t.y);
      if (d <= s && d > i && (i = d, r = t.x < t.next.x ? t : t.next, d === s))
        return r;
    }
    t = t.next;
  } while (t !== e);
  if (!r) return null;
  const o = r, l = r.x, c = r.y;
  let h = 1 / 0, f;
  t = r;
  do
    s >= t.x && t.x >= l && s !== t.x && Pi(a < c ? s : i, a, l, c, a < c ? i : s, a, t.x, t.y) && (f = Math.abs(a - t.y) / (s - t.x), Ki(t, n) && (f < h || f === h && (t.x > r.x || t.x === r.x && no(r, t))) && (r = t, h = f)), t = t.next;
  while (t !== o);
  return r;
}
function no(n, e) {
  return et(n.prev, n, e.prev) < 0 && et(e.next, n, n.next) < 0;
}
function ro(n, e, t, i) {
  let r = n;
  do
    r.z === 0 && (r.z = Er(r.x, r.y, e, t, i)), r.prevZ = r.prev, r.nextZ = r.next, r = r.next;
  while (r !== n);
  r.prevZ.nextZ = null, r.prevZ = null, so(r);
}
function so(n) {
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
function Er(n, e, t, i, r) {
  return n = (n - t) * r | 0, e = (e - i) * r | 0, n = (n | n << 8) & 16711935, n = (n | n << 4) & 252645135, n = (n | n << 2) & 858993459, n = (n | n << 1) & 1431655765, e = (e | e << 8) & 16711935, e = (e | e << 4) & 252645135, e = (e | e << 2) & 858993459, e = (e | e << 1) & 1431655765, n | e << 1;
}
function ao(n) {
  let e = n, t = n;
  do
    (e.x < t.x || e.x === t.x && e.y < t.y) && (t = e), e = e.next;
  while (e !== n);
  return t;
}
function Pi(n, e, t, i, r, s, a, o) {
  return (r - a) * (e - o) >= (n - a) * (s - o) && (n - a) * (i - o) >= (t - a) * (e - o) && (t - a) * (s - o) >= (r - a) * (i - o);
}
function oo(n, e) {
  return n.next.i !== e.i && n.prev.i !== e.i && !lo(n, e) && // dones't intersect other edges
  (Ki(n, e) && Ki(e, n) && co(n, e) && // locally visible
  (et(n.prev, n, e.prev) || et(n, e.prev, e)) || // does not create opposite-facing sectors
  Nn(n, e) && et(n.prev, n, n.next) > 0 && et(e.prev, e, e.next) > 0);
}
function et(n, e, t) {
  return (e.y - n.y) * (t.x - e.x) - (e.x - n.x) * (t.y - e.y);
}
function Nn(n, e) {
  return n.x === e.x && n.y === e.y;
}
function ta(n, e, t, i) {
  const r = pn(et(n, e, t)), s = pn(et(n, e, i)), a = pn(et(t, i, n)), o = pn(et(t, i, e));
  return !!(r !== s && a !== o || r === 0 && fn(n, t, e) || s === 0 && fn(n, i, e) || a === 0 && fn(t, n, i) || o === 0 && fn(t, e, i));
}
function fn(n, e, t) {
  return e.x <= Math.max(n.x, t.x) && e.x >= Math.min(n.x, t.x) && e.y <= Math.max(n.y, t.y) && e.y >= Math.min(n.y, t.y);
}
function pn(n) {
  return n > 0 ? 1 : n < 0 ? -1 : 0;
}
function lo(n, e) {
  let t = n;
  do {
    if (t.i !== n.i && t.next.i !== n.i && t.i !== e.i && t.next.i !== e.i && ta(t, t.next, n, e)) return !0;
    t = t.next;
  } while (t !== n);
  return !1;
}
function Ki(n, e) {
  return et(n.prev, n, n.next) < 0 ? et(n, e, n.next) >= 0 && et(n, n.prev, e) >= 0 : et(n, e, n.prev) < 0 || et(n, n.next, e) < 0;
}
function co(n, e) {
  let t = n, i = !1;
  const r = (n.x + e.x) / 2, s = (n.y + e.y) / 2;
  do
    t.y > s != t.next.y > s && t.next.y !== t.y && r < (t.next.x - t.x) * (s - t.y) / (t.next.y - t.y) + t.x && (i = !i), t = t.next;
  while (t !== n);
  return i;
}
function ia(n, e) {
  const t = new Tr(n.i, n.x, n.y), i = new Tr(e.i, e.x, e.y), r = n.next, s = e.prev;
  return n.next = e, e.prev = n, t.next = r, r.prev = t, i.next = t, t.prev = i, s.next = i, i.prev = s, i;
}
function rs(n, e, t, i) {
  const r = new Tr(n, e, t);
  return i ? (r.next = i.next, r.prev = i, i.next.prev = r, i.next = r) : (r.prev = r, r.next = r), r;
}
function Zi(n) {
  n.next.prev = n.prev, n.prev.next = n.next, n.prevZ && (n.prevZ.nextZ = n.nextZ), n.nextZ && (n.nextZ.prevZ = n.prevZ);
}
function Tr(n, e, t) {
  this.i = n, this.x = e, this.y = t, this.prev = null, this.next = null, this.z = 0, this.prevZ = null, this.nextZ = null, this.steiner = !1;
}
function ho(n, e, t, i) {
  let r = 0;
  for (let s = e, a = t - i; s < t; s += i)
    r += (n[a] - n[s]) * (n[s + 1] + n[a + 1]), a = s;
  return r;
}
class Ui {
  // calculate area of the contour polygon
  static area(e) {
    const t = e.length;
    let i = 0;
    for (let r = t - 1, s = 0; s < t; r = s++)
      i += e[r].x * e[s].y - e[s].x * e[r].y;
    return i * 0.5;
  }
  static isClockWise(e) {
    return Ui.area(e) < 0;
  }
  static triangulateShape(e, t) {
    const i = [], r = [], s = [];
    ss(e), as(i, e);
    let a = e.length;
    t.forEach(ss);
    for (let l = 0; l < t.length; l++)
      r.push(a), a += t[l].length, as(i, t[l]);
    const o = Ka.triangulate(i, r);
    for (let l = 0; l < o.length; l += 3)
      s.push(o.slice(l, l + 3));
    return s;
  }
}
function ss(n) {
  const e = n.length;
  e > 2 && n[e - 1].equals(n[0]) && n.pop();
}
function as(n, e) {
  for (let t = 0; t < e.length; t++)
    n.push(e[t].x), n.push(e[t].y);
}
class Ir extends ei {
  constructor(e = new wn([new le(0.5, 0.5), new le(-0.5, 0.5), new le(-0.5, -0.5), new le(0.5, -0.5)]), t = {}) {
    super(), this.type = "ExtrudeGeometry", this.parameters = {
      shapes: e,
      options: t
    }, e = Array.isArray(e) ? e : [e];
    const i = this, r = [], s = [];
    for (let o = 0, l = e.length; o < l; o++) {
      const c = e[o];
      a(c);
    }
    this.setAttribute("position", new kt(r, 3)), this.setAttribute("uv", new kt(s, 2)), this.computeVertexNormals();
    function a(o) {
      const l = [], c = t.curveSegments !== void 0 ? t.curveSegments : 12, h = t.steps !== void 0 ? t.steps : 1, f = t.depth !== void 0 ? t.depth : 1;
      let d = t.bevelEnabled !== void 0 ? t.bevelEnabled : !0, m = t.bevelThickness !== void 0 ? t.bevelThickness : 0.2, g = t.bevelSize !== void 0 ? t.bevelSize : m - 0.1, v = t.bevelOffset !== void 0 ? t.bevelOffset : 0, p = t.bevelSegments !== void 0 ? t.bevelSegments : 3;
      const u = t.extrudePath, b = t.UVGenerator !== void 0 ? t.UVGenerator : uo;
      let S, T = !1, O, R, w, I;
      u && (S = u.getSpacedPoints(h), T = !0, d = !1, O = u.computeFrenetFrames(h, !1), R = new L(), w = new L(), I = new L()), d || (p = 0, m = 0, g = 0, v = 0);
      const E = o.extractPoints(c);
      let x = E.shape;
      const C = E.holes;
      if (!Ui.isClockWise(x)) {
        x = x.reverse();
        for (let y = 0, ie = C.length; y < ie; y++) {
          const j = C[y];
          Ui.isClockWise(j) && (C[y] = j.reverse());
        }
      }
      const z = Ui.triangulateShape(x, C), V = x;
      for (let y = 0, ie = C.length; y < ie; y++) {
        const j = C[y];
        x = x.concat(j);
      }
      function K(y, ie, j) {
        return ie || console.error("THREE.ExtrudeGeometry: vec does not exist"), y.clone().addScaledVector(ie, j);
      }
      const G = x.length, Q = z.length;
      function H(y, ie, j) {
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
      const fe = [];
      for (let y = 0, ie = V.length, j = ie - 1, he = y + 1; y < ie; y++, j++, he++)
        j === ie && (j = 0), he === ie && (he = 0), fe[y] = H(V[y], V[j], V[he]);
      const xe = [];
      let me, Be = fe.concat();
      for (let y = 0, ie = C.length; y < ie; y++) {
        const j = C[y];
        me = [];
        for (let he = 0, X = j.length, Ae = X - 1, ue = he + 1; he < X; he++, Ae++, ue++)
          Ae === X && (Ae = 0), ue === X && (ue = 0), me[he] = H(j[he], j[Ae], j[ue]);
        xe.push(me), Be = Be.concat(me);
      }
      for (let y = 0; y < p; y++) {
        const ie = y / p, j = m * Math.cos(ie * Math.PI / 2), he = g * Math.sin(ie * Math.PI / 2) + v;
        for (let X = 0, Ae = V.length; X < Ae; X++) {
          const ue = K(V[X], fe[X], he);
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
      for (let y = 0; y < G; y++) {
        const ie = d ? K(x[y], Be[y], We) : x[y];
        T ? (w.copy(O.normals[0]).multiplyScalar(ie.x), R.copy(O.binormals[0]).multiplyScalar(ie.y), I.copy(S[0]).add(w).add(R), ce(I.x, I.y, I.z)) : ce(ie.x, ie.y, 0);
      }
      for (let y = 1; y <= h; y++)
        for (let ie = 0; ie < G; ie++) {
          const j = d ? K(x[ie], Be[ie], We) : x[ie];
          T ? (w.copy(O.normals[y]).multiplyScalar(j.x), R.copy(O.binormals[y]).multiplyScalar(j.y), I.copy(S[y]).add(w).add(R), ce(I.x, I.y, I.z)) : ce(j.x, j.y, f / h * y);
        }
      for (let y = p - 1; y >= 0; y--) {
        const ie = y / p, j = m * Math.cos(ie * Math.PI / 2), he = g * Math.sin(ie * Math.PI / 2) + v;
        for (let X = 0, Ae = V.length; X < Ae; X++) {
          const ue = K(V[X], fe[X], he);
          ce(ue.x, ue.y, f + j);
        }
        for (let X = 0, Ae = C.length; X < Ae; X++) {
          const ue = C[X];
          me = xe[X];
          for (let ve = 0, A = ue.length; ve < A; ve++) {
            const _ = K(ue[ve], me[ve], he);
            T ? ce(_.x, _.y + S[h - 1].y, S[h - 1].x + j) : ce(_.x, _.y, f + j);
          }
        }
      }
      k(), ee();
      function k() {
        const y = r.length / 3;
        if (d) {
          let ie = 0, j = G * ie;
          for (let he = 0; he < Q; he++) {
            const X = z[he];
            Ce(X[2] + j, X[1] + j, X[0] + j);
          }
          ie = h + p * 2, j = G * ie;
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
            Ce(j[0] + G * h, j[1] + G * h, j[2] + G * h);
          }
        }
        i.addGroup(y, r.length / 3 - y, 0);
      }
      function ee() {
        const y = r.length / 3;
        let ie = 0;
        _e(V, ie), ie += V.length;
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
            const ve = G * Ae, A = G * (Ae + 1), _ = ie + he + ve, F = ie + X + ve, $ = ie + X + A, J = ie + he + A;
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
        He(X[0]), He(X[1]), He(X[2]);
      }
      function Ne(y, ie, j, he) {
        Pe(y), Pe(ie), Pe(he), Pe(ie), Pe(j), Pe(he);
        const X = r.length / 3, Ae = b.generateSideWallUV(i, r, X - 6, X - 3, X - 2, X - 1);
        He(Ae[0]), He(Ae[1]), He(Ae[3]), He(Ae[1]), He(Ae[2]), He(Ae[3]);
      }
      function Pe(y) {
        r.push(l[y * 3 + 0]), r.push(l[y * 3 + 1]), r.push(l[y * 3 + 2]);
      }
      function He(y) {
        s.push(y.x), s.push(y.y);
      }
    }
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  toJSON() {
    const e = super.toJSON(), t = this.parameters.shapes, i = this.parameters.options;
    return fo(t, i, e);
  }
  static fromJSON(e, t) {
    const i = [];
    for (let s = 0, a = e.shapes.length; s < a; s++) {
      const o = t[e.shapes[s]];
      i.push(o);
    }
    const r = e.options.extrudePath;
    return r !== void 0 && (e.options.extrudePath = new Mr[r.type]().fromJSON(r)), new Ir(i, e.options);
  }
}
const uo = {
  generateTopUV: function(n, e, t, i, r) {
    const s = e[t * 3], a = e[t * 3 + 1], o = e[i * 3], l = e[i * 3 + 1], c = e[r * 3], h = e[r * 3 + 1];
    return [
      new le(s, a),
      new le(o, l),
      new le(c, h)
    ];
  },
  generateSideWallUV: function(n, e, t, i, r, s) {
    const a = e[t * 3], o = e[t * 3 + 1], l = e[t * 3 + 2], c = e[i * 3], h = e[i * 3 + 1], f = e[i * 3 + 2], d = e[r * 3], m = e[r * 3 + 1], g = e[r * 3 + 2], v = e[s * 3], p = e[s * 3 + 1], u = e[s * 3 + 2];
    return Math.abs(o - h) < Math.abs(a - c) ? [
      new le(a, 1 - l),
      new le(c, 1 - f),
      new le(d, 1 - g),
      new le(v, 1 - u)
    ] : [
      new le(o, 1 - l),
      new le(h, 1 - f),
      new le(m, 1 - g),
      new le(p, 1 - u)
    ];
  }
};
function fo(n, e, t) {
  if (t.shapes = [], Array.isArray(n))
    for (let i = 0, r = n.length; i < r; i++) {
      const s = n[i];
      t.shapes.push(s.uuid);
    }
  else
    t.shapes.push(n.uuid);
  return t.options = Object.assign({}, e), e.extrudePath !== void 0 && (t.options.extrudePath = e.extrudePath.toJSON()), t;
}
class mn extends pt {
  constructor() {
    super(), this.isGroup = !0, this.type = "Group";
  }
}
const zt = /* @__PURE__ */ new L(), nr = /* @__PURE__ */ new L(), gn = /* @__PURE__ */ new L(), Zt = /* @__PURE__ */ new L(), rr = /* @__PURE__ */ new L(), _n = /* @__PURE__ */ new L(), sr = /* @__PURE__ */ new L();
class na {
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
    return this.origin.copy(this.at(e, zt)), this;
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
    const t = zt.subVectors(e, this.origin).dot(this.direction);
    return t < 0 ? this.origin.distanceToSquared(e) : (zt.copy(this.origin).addScaledVector(this.direction, t), zt.distanceToSquared(e));
  }
  distanceSqToSegment(e, t, i, r) {
    nr.copy(e).add(t).multiplyScalar(0.5), gn.copy(t).sub(e).normalize(), Zt.copy(this.origin).sub(nr);
    const s = e.distanceTo(t) * 0.5, a = -this.direction.dot(gn), o = Zt.dot(this.direction), l = -Zt.dot(gn), c = Zt.lengthSq(), h = Math.abs(1 - a * a);
    let f, d, m, g;
    if (h > 0)
      if (f = a * l - o, d = a * o - l, g = s * h, f >= 0)
        if (d >= -g)
          if (d <= g) {
            const v = 1 / h;
            f *= v, d *= v, m = f * (f + a * d + 2 * o) + d * (a * f + d + 2 * l) + c;
          } else
            d = s, f = Math.max(0, -(a * d + o)), m = -f * f + d * (d + 2 * l) + c;
        else
          d = -s, f = Math.max(0, -(a * d + o)), m = -f * f + d * (d + 2 * l) + c;
      else
        d <= -g ? (f = Math.max(0, -(-a * s + o)), d = f > 0 ? -s : Math.min(Math.max(-s, -l), s), m = -f * f + d * (d + 2 * l) + c) : d <= g ? (f = 0, d = Math.min(Math.max(-s, -l), s), m = d * (d + 2 * l) + c) : (f = Math.max(0, -(a * s + o)), d = f > 0 ? s : Math.min(Math.max(-s, -l), s), m = -f * f + d * (d + 2 * l) + c);
    else
      d = a > 0 ? -s : s, f = Math.max(0, -(a * d + o)), m = -f * f + d * (d + 2 * l) + c;
    return i && i.copy(this.origin).addScaledVector(this.direction, f), r && r.copy(nr).addScaledVector(gn, d), m;
  }
  intersectSphere(e, t) {
    zt.subVectors(e.center, this.origin);
    const i = zt.dot(this.direction), r = zt.dot(zt) - i * i, s = e.radius * e.radius;
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
    const c = 1 / this.direction.x, h = 1 / this.direction.y, f = 1 / this.direction.z, d = this.origin;
    return c >= 0 ? (i = (e.min.x - d.x) * c, r = (e.max.x - d.x) * c) : (i = (e.max.x - d.x) * c, r = (e.min.x - d.x) * c), h >= 0 ? (s = (e.min.y - d.y) * h, a = (e.max.y - d.y) * h) : (s = (e.max.y - d.y) * h, a = (e.min.y - d.y) * h), i > a || s > r || ((s > i || isNaN(i)) && (i = s), (a < r || isNaN(r)) && (r = a), f >= 0 ? (o = (e.min.z - d.z) * f, l = (e.max.z - d.z) * f) : (o = (e.max.z - d.z) * f, l = (e.min.z - d.z) * f), i > l || o > r) || ((o > i || i !== i) && (i = o), (l < r || r !== r) && (r = l), r < 0) ? null : this.at(i >= 0 ? i : r, t);
  }
  intersectsBox(e) {
    return this.intersectBox(e, zt) !== null;
  }
  intersectTriangle(e, t, i, r, s) {
    rr.subVectors(t, e), _n.subVectors(i, e), sr.crossVectors(rr, _n);
    let a = this.direction.dot(sr), o;
    if (a > 0) {
      if (r) return null;
      o = 1;
    } else if (a < 0)
      o = -1, a = -a;
    else
      return null;
    Zt.subVectors(this.origin, e);
    const l = o * this.direction.dot(_n.crossVectors(Zt, _n));
    if (l < 0)
      return null;
    const c = o * this.direction.dot(rr.cross(Zt));
    if (c < 0 || l + c > a)
      return null;
    const h = -o * Zt.dot(sr);
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
const wt = /* @__PURE__ */ new L(), Gt = /* @__PURE__ */ new L(), ar = /* @__PURE__ */ new L(), Vt = /* @__PURE__ */ new L(), Mi = /* @__PURE__ */ new L(), yi = /* @__PURE__ */ new L(), os = /* @__PURE__ */ new L(), or = /* @__PURE__ */ new L(), lr = /* @__PURE__ */ new L(), cr = /* @__PURE__ */ new L();
class Dt {
  constructor(e = new L(), t = new L(), i = new L()) {
    this.a = e, this.b = t, this.c = i;
  }
  static getNormal(e, t, i, r) {
    r.subVectors(i, t), wt.subVectors(e, t), r.cross(wt);
    const s = r.lengthSq();
    return s > 0 ? r.multiplyScalar(1 / Math.sqrt(s)) : r.set(0, 0, 0);
  }
  // static/instance method to calculate barycentric coordinates
  // based on: http://www.blackpawn.com/texts/pointinpoly/default.html
  static getBarycoord(e, t, i, r, s) {
    wt.subVectors(r, t), Gt.subVectors(i, t), ar.subVectors(e, t);
    const a = wt.dot(wt), o = wt.dot(Gt), l = wt.dot(ar), c = Gt.dot(Gt), h = Gt.dot(ar), f = a * c - o * o;
    if (f === 0)
      return s.set(0, 0, 0), null;
    const d = 1 / f, m = (c * l - o * h) * d, g = (a * h - o * l) * d;
    return s.set(1 - m - g, g, m);
  }
  static containsPoint(e, t, i, r) {
    return this.getBarycoord(e, t, i, r, Vt) === null ? !1 : Vt.x >= 0 && Vt.y >= 0 && Vt.x + Vt.y <= 1;
  }
  static getInterpolation(e, t, i, r, s, a, o, l) {
    return this.getBarycoord(e, t, i, r, Vt) === null ? (l.x = 0, l.y = 0, "z" in l && (l.z = 0), "w" in l && (l.w = 0), null) : (l.setScalar(0), l.addScaledVector(s, Vt.x), l.addScaledVector(a, Vt.y), l.addScaledVector(o, Vt.z), l);
  }
  static isFrontFacing(e, t, i, r) {
    return wt.subVectors(i, t), Gt.subVectors(e, t), wt.cross(Gt).dot(r) < 0;
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
    return wt.subVectors(this.c, this.b), Gt.subVectors(this.a, this.b), wt.cross(Gt).length() * 0.5;
  }
  getMidpoint(e) {
    return e.addVectors(this.a, this.b).add(this.c).multiplyScalar(1 / 3);
  }
  getNormal(e) {
    return Dt.getNormal(this.a, this.b, this.c, e);
  }
  getPlane(e) {
    return e.setFromCoplanarPoints(this.a, this.b, this.c);
  }
  getBarycoord(e, t) {
    return Dt.getBarycoord(e, this.a, this.b, this.c, t);
  }
  getInterpolation(e, t, i, r, s) {
    return Dt.getInterpolation(e, this.a, this.b, this.c, t, i, r, s);
  }
  containsPoint(e) {
    return Dt.containsPoint(e, this.a, this.b, this.c);
  }
  isFrontFacing(e) {
    return Dt.isFrontFacing(this.a, this.b, this.c, e);
  }
  intersectsBox(e) {
    return e.intersectsTriangle(this);
  }
  closestPointToPoint(e, t) {
    const i = this.a, r = this.b, s = this.c;
    let a, o;
    Mi.subVectors(r, i), yi.subVectors(s, i), or.subVectors(e, i);
    const l = Mi.dot(or), c = yi.dot(or);
    if (l <= 0 && c <= 0)
      return t.copy(i);
    lr.subVectors(e, r);
    const h = Mi.dot(lr), f = yi.dot(lr);
    if (h >= 0 && f <= h)
      return t.copy(r);
    const d = l * f - h * c;
    if (d <= 0 && l >= 0 && h <= 0)
      return a = l / (l - h), t.copy(i).addScaledVector(Mi, a);
    cr.subVectors(e, s);
    const m = Mi.dot(cr), g = yi.dot(cr);
    if (g >= 0 && m <= g)
      return t.copy(s);
    const v = m * c - l * g;
    if (v <= 0 && c >= 0 && g <= 0)
      return o = c / (c - g), t.copy(i).addScaledVector(yi, o);
    const p = h * g - m * f;
    if (p <= 0 && f - h >= 0 && m - g >= 0)
      return os.subVectors(s, r), o = (f - h) / (f - h + (m - g)), t.copy(r).addScaledVector(os, o);
    const u = 1 / (p + v + d);
    return a = v * u, o = d * u, t.copy(i).addScaledVector(Mi, a).addScaledVector(yi, o);
  }
  equals(e) {
    return e.a.equals(this.a) && e.b.equals(this.b) && e.c.equals(this.c);
  }
}
let po = 0;
class Qi extends Fi {
  constructor() {
    super(), this.isMaterial = !0, Object.defineProperty(this, "id", { value: po++ }), this.uuid = Ni(), this.name = "", this.type = "Material", this.blending = 1, this.side = 0, this.vertexColors = !1, this.opacity = 1, this.transparent = !1, this.alphaHash = !1, this.blendSrc = 204, this.blendDst = 205, this.blendEquation = 100, this.blendSrcAlpha = null, this.blendDstAlpha = null, this.blendEquationAlpha = null, this.blendColor = new ke(0, 0, 0), this.blendAlpha = 0, this.depthFunc = 3, this.depthTest = !0, this.depthWrite = !0, this.stencilWriteMask = 255, this.stencilFunc = 519, this.stencilRef = 0, this.stencilFuncMask = 255, this.stencilFail = 7680, this.stencilZFail = 7680, this.stencilZPass = 7680, this.stencilWrite = !1, this.clippingPlanes = null, this.clipIntersection = !1, this.clipShadows = !1, this.shadowSide = null, this.colorWrite = !0, this.precision = null, this.polygonOffset = !1, this.polygonOffsetFactor = 0, this.polygonOffsetUnits = 0, this.dithering = !1, this.alphaToCoverage = !1, this.premultipliedAlpha = !1, this.forceSinglePass = !1, this.visible = !0, this.toneMapped = !0, this.userData = {}, this.version = 0, this._alphaTest = 0;
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
    i.uuid = this.uuid, i.type = this.type, this.name !== "" && (i.name = this.name), this.color && this.color.isColor && (i.color = this.color.getHex()), this.roughness !== void 0 && (i.roughness = this.roughness), this.metalness !== void 0 && (i.metalness = this.metalness), this.sheen !== void 0 && (i.sheen = this.sheen), this.sheenColor && this.sheenColor.isColor && (i.sheenColor = this.sheenColor.getHex()), this.sheenRoughness !== void 0 && (i.sheenRoughness = this.sheenRoughness), this.emissive && this.emissive.isColor && (i.emissive = this.emissive.getHex()), this.emissiveIntensity !== void 0 && this.emissiveIntensity !== 1 && (i.emissiveIntensity = this.emissiveIntensity), this.specular && this.specular.isColor && (i.specular = this.specular.getHex()), this.specularIntensity !== void 0 && (i.specularIntensity = this.specularIntensity), this.specularColor && this.specularColor.isColor && (i.specularColor = this.specularColor.getHex()), this.shininess !== void 0 && (i.shininess = this.shininess), this.clearcoat !== void 0 && (i.clearcoat = this.clearcoat), this.clearcoatRoughness !== void 0 && (i.clearcoatRoughness = this.clearcoatRoughness), this.clearcoatMap && this.clearcoatMap.isTexture && (i.clearcoatMap = this.clearcoatMap.toJSON(e).uuid), this.clearcoatRoughnessMap && this.clearcoatRoughnessMap.isTexture && (i.clearcoatRoughnessMap = this.clearcoatRoughnessMap.toJSON(e).uuid), this.clearcoatNormalMap && this.clearcoatNormalMap.isTexture && (i.clearcoatNormalMap = this.clearcoatNormalMap.toJSON(e).uuid, i.clearcoatNormalScale = this.clearcoatNormalScale.toArray()), this.dispersion !== void 0 && (i.dispersion = this.dispersion), this.iridescence !== void 0 && (i.iridescence = this.iridescence), this.iridescenceIOR !== void 0 && (i.iridescenceIOR = this.iridescenceIOR), this.iridescenceThicknessRange !== void 0 && (i.iridescenceThicknessRange = this.iridescenceThicknessRange), this.iridescenceMap && this.iridescenceMap.isTexture && (i.iridescenceMap = this.iridescenceMap.toJSON(e).uuid), this.iridescenceThicknessMap && this.iridescenceThicknessMap.isTexture && (i.iridescenceThicknessMap = this.iridescenceThicknessMap.toJSON(e).uuid), this.anisotropy !== void 0 && (i.anisotropy = this.anisotropy), this.anisotropyRotation !== void 0 && (i.anisotropyRotation = this.anisotropyRotation), this.anisotropyMap && this.anisotropyMap.isTexture && (i.anisotropyMap = this.anisotropyMap.toJSON(e).uuid), this.map && this.map.isTexture && (i.map = this.map.toJSON(e).uuid), this.matcap && this.matcap.isTexture && (i.matcap = this.matcap.toJSON(e).uuid), this.alphaMap && this.alphaMap.isTexture && (i.alphaMap = this.alphaMap.toJSON(e).uuid), this.lightMap && this.lightMap.isTexture && (i.lightMap = this.lightMap.toJSON(e).uuid, i.lightMapIntensity = this.lightMapIntensity), this.aoMap && this.aoMap.isTexture && (i.aoMap = this.aoMap.toJSON(e).uuid, i.aoMapIntensity = this.aoMapIntensity), this.bumpMap && this.bumpMap.isTexture && (i.bumpMap = this.bumpMap.toJSON(e).uuid, i.bumpScale = this.bumpScale), this.normalMap && this.normalMap.isTexture && (i.normalMap = this.normalMap.toJSON(e).uuid, i.normalMapType = this.normalMapType, i.normalScale = this.normalScale.toArray()), this.displacementMap && this.displacementMap.isTexture && (i.displacementMap = this.displacementMap.toJSON(e).uuid, i.displacementScale = this.displacementScale, i.displacementBias = this.displacementBias), this.roughnessMap && this.roughnessMap.isTexture && (i.roughnessMap = this.roughnessMap.toJSON(e).uuid), this.metalnessMap && this.metalnessMap.isTexture && (i.metalnessMap = this.metalnessMap.toJSON(e).uuid), this.emissiveMap && this.emissiveMap.isTexture && (i.emissiveMap = this.emissiveMap.toJSON(e).uuid), this.specularMap && this.specularMap.isTexture && (i.specularMap = this.specularMap.toJSON(e).uuid), this.specularIntensityMap && this.specularIntensityMap.isTexture && (i.specularIntensityMap = this.specularIntensityMap.toJSON(e).uuid), this.specularColorMap && this.specularColorMap.isTexture && (i.specularColorMap = this.specularColorMap.toJSON(e).uuid), this.envMap && this.envMap.isTexture && (i.envMap = this.envMap.toJSON(e).uuid, this.combine !== void 0 && (i.combine = this.combine)), this.envMapRotation !== void 0 && (i.envMapRotation = this.envMapRotation.toArray()), this.envMapIntensity !== void 0 && (i.envMapIntensity = this.envMapIntensity), this.reflectivity !== void 0 && (i.reflectivity = this.reflectivity), this.refractionRatio !== void 0 && (i.refractionRatio = this.refractionRatio), this.gradientMap && this.gradientMap.isTexture && (i.gradientMap = this.gradientMap.toJSON(e).uuid), this.transmission !== void 0 && (i.transmission = this.transmission), this.transmissionMap && this.transmissionMap.isTexture && (i.transmissionMap = this.transmissionMap.toJSON(e).uuid), this.thickness !== void 0 && (i.thickness = this.thickness), this.thicknessMap && this.thicknessMap.isTexture && (i.thicknessMap = this.thicknessMap.toJSON(e).uuid), this.attenuationDistance !== void 0 && this.attenuationDistance !== 1 / 0 && (i.attenuationDistance = this.attenuationDistance), this.attenuationColor !== void 0 && (i.attenuationColor = this.attenuationColor.getHex()), this.size !== void 0 && (i.size = this.size), this.shadowSide !== null && (i.shadowSide = this.shadowSide), this.sizeAttenuation !== void 0 && (i.sizeAttenuation = this.sizeAttenuation), this.blending !== 1 && (i.blending = this.blending), this.side !== 0 && (i.side = this.side), this.vertexColors === !0 && (i.vertexColors = !0), this.opacity < 1 && (i.opacity = this.opacity), this.transparent === !0 && (i.transparent = !0), this.blendSrc !== 204 && (i.blendSrc = this.blendSrc), this.blendDst !== 205 && (i.blendDst = this.blendDst), this.blendEquation !== 100 && (i.blendEquation = this.blendEquation), this.blendSrcAlpha !== null && (i.blendSrcAlpha = this.blendSrcAlpha), this.blendDstAlpha !== null && (i.blendDstAlpha = this.blendDstAlpha), this.blendEquationAlpha !== null && (i.blendEquationAlpha = this.blendEquationAlpha), this.blendColor && this.blendColor.isColor && (i.blendColor = this.blendColor.getHex()), this.blendAlpha !== 0 && (i.blendAlpha = this.blendAlpha), this.depthFunc !== 3 && (i.depthFunc = this.depthFunc), this.depthTest === !1 && (i.depthTest = this.depthTest), this.depthWrite === !1 && (i.depthWrite = this.depthWrite), this.colorWrite === !1 && (i.colorWrite = this.colorWrite), this.stencilWriteMask !== 255 && (i.stencilWriteMask = this.stencilWriteMask), this.stencilFunc !== 519 && (i.stencilFunc = this.stencilFunc), this.stencilRef !== 0 && (i.stencilRef = this.stencilRef), this.stencilFuncMask !== 255 && (i.stencilFuncMask = this.stencilFuncMask), this.stencilFail !== 7680 && (i.stencilFail = this.stencilFail), this.stencilZFail !== 7680 && (i.stencilZFail = this.stencilZFail), this.stencilZPass !== 7680 && (i.stencilZPass = this.stencilZPass), this.stencilWrite === !0 && (i.stencilWrite = this.stencilWrite), this.rotation !== void 0 && this.rotation !== 0 && (i.rotation = this.rotation), this.polygonOffset === !0 && (i.polygonOffset = !0), this.polygonOffsetFactor !== 0 && (i.polygonOffsetFactor = this.polygonOffsetFactor), this.polygonOffsetUnits !== 0 && (i.polygonOffsetUnits = this.polygonOffsetUnits), this.linewidth !== void 0 && this.linewidth !== 1 && (i.linewidth = this.linewidth), this.dashSize !== void 0 && (i.dashSize = this.dashSize), this.gapSize !== void 0 && (i.gapSize = this.gapSize), this.scale !== void 0 && (i.scale = this.scale), this.dithering === !0 && (i.dithering = !0), this.alphaTest > 0 && (i.alphaTest = this.alphaTest), this.alphaHash === !0 && (i.alphaHash = !0), this.alphaToCoverage === !0 && (i.alphaToCoverage = !0), this.premultipliedAlpha === !0 && (i.premultipliedAlpha = !0), this.forceSinglePass === !0 && (i.forceSinglePass = !0), this.wireframe === !0 && (i.wireframe = !0), this.wireframeLinewidth > 1 && (i.wireframeLinewidth = this.wireframeLinewidth), this.wireframeLinecap !== "round" && (i.wireframeLinecap = this.wireframeLinecap), this.wireframeLinejoin !== "round" && (i.wireframeLinejoin = this.wireframeLinejoin), this.flatShading === !0 && (i.flatShading = !0), this.visible === !1 && (i.visible = !1), this.toneMapped === !1 && (i.toneMapped = !1), this.fog === !1 && (i.fog = !1), Object.keys(this.userData).length > 0 && (i.userData = this.userData);
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
class ra extends Qi {
  constructor(e) {
    super(), this.isMeshBasicMaterial = !0, this.type = "MeshBasicMaterial", this.color = new ke(16777215), this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.specularMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new It(), this.combine = 0, this.reflectivity = 1, this.refractionRatio = 0.98, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.color.copy(e.color), this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.specularMap = e.specularMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.combine = e.combine, this.reflectivity = e.reflectivity, this.refractionRatio = e.refractionRatio, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.fog = e.fog, this;
  }
}
const ls = /* @__PURE__ */ new je(), si = /* @__PURE__ */ new na(), vn = /* @__PURE__ */ new Pr(), cs = /* @__PURE__ */ new L(), Ei = /* @__PURE__ */ new L(), Ti = /* @__PURE__ */ new L(), Ai = /* @__PURE__ */ new L(), hr = /* @__PURE__ */ new L(), xn = /* @__PURE__ */ new L(), Sn = /* @__PURE__ */ new le(), Mn = /* @__PURE__ */ new le(), yn = /* @__PURE__ */ new le(), hs = /* @__PURE__ */ new L(), us = /* @__PURE__ */ new L(), ds = /* @__PURE__ */ new L(), En = /* @__PURE__ */ new L(), Tn = /* @__PURE__ */ new L();
class Ht extends pt {
  constructor(e = new ei(), t = new ra()) {
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
      xn.set(0, 0, 0);
      for (let l = 0, c = s.length; l < c; l++) {
        const h = o[l], f = s[l];
        h !== 0 && (hr.fromBufferAttribute(f, e), a ? xn.addScaledVector(hr, h) : xn.addScaledVector(hr.sub(t), h));
      }
      t.add(xn);
    }
    return t;
  }
  raycast(e, t) {
    const i = this.geometry, r = this.material, s = this.matrixWorld;
    r !== void 0 && (i.boundingSphere === null && i.computeBoundingSphere(), vn.copy(i.boundingSphere), vn.applyMatrix4(s), si.copy(e.ray).recast(e.near), !(vn.containsPoint(si.origin) === !1 && (si.intersectSphere(vn, cs) === null || si.origin.distanceToSquared(cs) > (e.far - e.near) ** 2)) && (ls.copy(s).invert(), si.copy(e.ray).applyMatrix4(ls), !(i.boundingBox !== null && si.intersectsBox(i.boundingBox) === !1) && this._computeIntersections(e, t, si)));
  }
  _computeIntersections(e, t, i) {
    let r;
    const s = this.geometry, a = this.material, o = s.index, l = s.attributes.position, c = s.attributes.uv, h = s.attributes.uv1, f = s.attributes.normal, d = s.groups, m = s.drawRange;
    if (o !== null)
      if (Array.isArray(a))
        for (let g = 0, v = d.length; g < v; g++) {
          const p = d[g], u = a[p.materialIndex], b = Math.max(p.start, m.start), S = Math.min(o.count, Math.min(p.start + p.count, m.start + m.count));
          for (let T = b, O = S; T < O; T += 3) {
            const R = o.getX(T), w = o.getX(T + 1), I = o.getX(T + 2);
            r = An(this, u, e, i, c, h, f, R, w, I), r && (r.faceIndex = Math.floor(T / 3), r.face.materialIndex = p.materialIndex, t.push(r));
          }
        }
      else {
        const g = Math.max(0, m.start), v = Math.min(o.count, m.start + m.count);
        for (let p = g, u = v; p < u; p += 3) {
          const b = o.getX(p), S = o.getX(p + 1), T = o.getX(p + 2);
          r = An(this, a, e, i, c, h, f, b, S, T), r && (r.faceIndex = Math.floor(p / 3), t.push(r));
        }
      }
    else if (l !== void 0)
      if (Array.isArray(a))
        for (let g = 0, v = d.length; g < v; g++) {
          const p = d[g], u = a[p.materialIndex], b = Math.max(p.start, m.start), S = Math.min(l.count, Math.min(p.start + p.count, m.start + m.count));
          for (let T = b, O = S; T < O; T += 3) {
            const R = T, w = T + 1, I = T + 2;
            r = An(this, u, e, i, c, h, f, R, w, I), r && (r.faceIndex = Math.floor(T / 3), r.face.materialIndex = p.materialIndex, t.push(r));
          }
        }
      else {
        const g = Math.max(0, m.start), v = Math.min(l.count, m.start + m.count);
        for (let p = g, u = v; p < u; p += 3) {
          const b = p, S = p + 1, T = p + 2;
          r = An(this, a, e, i, c, h, f, b, S, T), r && (r.faceIndex = Math.floor(p / 3), t.push(r));
        }
      }
  }
}
function mo(n, e, t, i, r, s, a, o) {
  let l;
  if (e.side === 1 ? l = i.intersectTriangle(a, s, r, !0, o) : l = i.intersectTriangle(r, s, a, e.side === 0, o), l === null) return null;
  Tn.copy(o), Tn.applyMatrix4(n.matrixWorld);
  const c = t.ray.origin.distanceTo(Tn);
  return c < t.near || c > t.far ? null : {
    distance: c,
    point: Tn.clone(),
    object: n
  };
}
function An(n, e, t, i, r, s, a, o, l, c) {
  n.getVertexPosition(o, Ei), n.getVertexPosition(l, Ti), n.getVertexPosition(c, Ai);
  const h = mo(n, e, t, i, Ei, Ti, Ai, En);
  if (h) {
    r && (Sn.fromBufferAttribute(r, o), Mn.fromBufferAttribute(r, l), yn.fromBufferAttribute(r, c), h.uv = Dt.getInterpolation(En, Ei, Ti, Ai, Sn, Mn, yn, new le())), s && (Sn.fromBufferAttribute(s, o), Mn.fromBufferAttribute(s, l), yn.fromBufferAttribute(s, c), h.uv1 = Dt.getInterpolation(En, Ei, Ti, Ai, Sn, Mn, yn, new le())), a && (hs.fromBufferAttribute(a, o), us.fromBufferAttribute(a, l), ds.fromBufferAttribute(a, c), h.normal = Dt.getInterpolation(En, Ei, Ti, Ai, hs, us, ds, new L()), h.normal.dot(i.direction) > 0 && h.normal.multiplyScalar(-1));
    const f = {
      a: o,
      b: l,
      c,
      normal: new L(),
      materialIndex: 0
    };
    Dt.getNormal(Ei, Ti, Ai, f.normal), h.face = f;
  }
  return h;
}
class xd extends Qi {
  constructor(e) {
    super(), this.isMeshStandardMaterial = !0, this.defines = { STANDARD: "" }, this.type = "MeshStandardMaterial", this.color = new ke(16777215), this.roughness = 1, this.metalness = 0, this.map = null, this.lightMap = null, this.lightMapIntensity = 1, this.aoMap = null, this.aoMapIntensity = 1, this.emissive = new ke(0), this.emissiveIntensity = 1, this.emissiveMap = null, this.bumpMap = null, this.bumpScale = 1, this.normalMap = null, this.normalMapType = 0, this.normalScale = new le(1, 1), this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.roughnessMap = null, this.metalnessMap = null, this.alphaMap = null, this.envMap = null, this.envMapRotation = new It(), this.envMapIntensity = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.wireframeLinecap = "round", this.wireframeLinejoin = "round", this.flatShading = !1, this.fog = !0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.defines = { STANDARD: "" }, this.color.copy(e.color), this.roughness = e.roughness, this.metalness = e.metalness, this.map = e.map, this.lightMap = e.lightMap, this.lightMapIntensity = e.lightMapIntensity, this.aoMap = e.aoMap, this.aoMapIntensity = e.aoMapIntensity, this.emissive.copy(e.emissive), this.emissiveMap = e.emissiveMap, this.emissiveIntensity = e.emissiveIntensity, this.bumpMap = e.bumpMap, this.bumpScale = e.bumpScale, this.normalMap = e.normalMap, this.normalMapType = e.normalMapType, this.normalScale.copy(e.normalScale), this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.roughnessMap = e.roughnessMap, this.metalnessMap = e.metalnessMap, this.alphaMap = e.alphaMap, this.envMap = e.envMap, this.envMapRotation.copy(e.envMapRotation), this.envMapIntensity = e.envMapIntensity, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.wireframeLinecap = e.wireframeLinecap, this.wireframeLinejoin = e.wireframeLinejoin, this.flatShading = e.flatShading, this.fog = e.fog, this;
  }
}
const Jt = /* @__PURE__ */ new L(), fs = /* @__PURE__ */ new le(), ps = /* @__PURE__ */ new le();
class Tt extends Ks {
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
    this.fov = Sr * 2 * Math.atan(t), this.updateProjectionMatrix();
  }
  /**
   * Calculates the focal length from the current .fov and .filmGauge.
   */
  getFocalLength() {
    const e = Math.tan(Hn * 0.5 * this.fov);
    return 0.5 * this.getFilmHeight() / e;
  }
  getEffectiveFOV() {
    return Sr * 2 * Math.atan(
      Math.tan(Hn * 0.5 * this.fov) / this.zoom
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
    Jt.set(-1, -1, 0.5).applyMatrix4(this.projectionMatrixInverse), t.set(Jt.x, Jt.y).multiplyScalar(-e / Jt.z), Jt.set(1, 1, 0.5).applyMatrix4(this.projectionMatrixInverse), i.set(Jt.x, Jt.y).multiplyScalar(-e / Jt.z);
  }
  /**
   * Computes the width and height of the camera's viewable rectangle at a given distance along the viewing direction.
   * Copies the result into the target Vector2, where x is width and y is height.
   */
  getViewSize(e, t) {
    return this.getViewBounds(e, fs, ps), t.subVectors(ps, fs);
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
    let t = e * Math.tan(Hn * 0.5 * this.fov) / this.zoom, i = 2 * t, r = this.aspect * i, s = -0.5 * r;
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
class Fn extends ei {
  constructor(e = 1, t = 1, i = 1, r = 1) {
    super(), this.type = "PlaneGeometry", this.parameters = {
      width: e,
      height: t,
      widthSegments: i,
      heightSegments: r
    };
    const s = e / 2, a = t / 2, o = Math.floor(i), l = Math.floor(r), c = o + 1, h = l + 1, f = e / o, d = t / l, m = [], g = [], v = [], p = [];
    for (let u = 0; u < h; u++) {
      const b = u * d - a;
      for (let S = 0; S < c; S++) {
        const T = S * f - s;
        g.push(T, -b, 0), v.push(0, 0, 1), p.push(S / o), p.push(1 - u / l);
      }
    }
    for (let u = 0; u < l; u++)
      for (let b = 0; b < o; b++) {
        const S = b + c * u, T = b + c * (u + 1), O = b + 1 + c * (u + 1), R = b + 1 + c * u;
        m.push(S, T, R), m.push(T, O, R);
      }
    this.setIndex(m), this.setAttribute("position", new kt(g, 3)), this.setAttribute("normal", new kt(v, 3)), this.setAttribute("uv", new kt(p, 2));
  }
  copy(e) {
    return super.copy(e), this.parameters = Object.assign({}, e.parameters), this;
  }
  static fromJSON(e) {
    return new Fn(e.width, e.height, e.widthSegments, e.heightSegments);
  }
}
function Ii(n) {
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
    const i = Ii(n[t]);
    for (const r in i)
      e[r] = i[r];
  }
  return e;
}
function go(n) {
  const e = [];
  for (let t = 0; t < n.length; t++)
    e.push(n[t].clone());
  return e;
}
function sa(n) {
  const e = n.getRenderTarget();
  return e === null ? n.outputColorSpace : e.isXRRenderTarget === !0 ? e.texture.colorSpace : Ze.workingColorSpace;
}
const _o = { clone: Ii, merge: mt }, vo = (
  /* glsl */
  `
void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
), xo = (
  /* glsl */
  `
void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}
`
);
class jt extends Qi {
  constructor(e) {
    super(), this.isShaderMaterial = !0, this.type = "ShaderMaterial", this.defines = {}, this.uniforms = {}, this.uniformsGroups = [], this.vertexShader = vo, this.fragmentShader = xo, this.linewidth = 1, this.wireframe = !1, this.wireframeLinewidth = 1, this.fog = !1, this.lights = !1, this.clipping = !1, this.forceSinglePass = !0, this.extensions = {
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
    return super.copy(e), this.fragmentShader = e.fragmentShader, this.vertexShader = e.vertexShader, this.uniforms = Ii(e.uniforms), this.uniformsGroups = go(e.uniformsGroups), this.defines = Object.assign({}, e.defines), this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this.fog = e.fog, this.lights = e.lights, this.clipping = e.clipping, this.extensions = Object.assign({}, e.extensions), this.glslVersion = e.glslVersion, this;
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
let bi;
class So {
  static getDataURL(e) {
    if (/^data:/i.test(e.src) || typeof HTMLCanvasElement > "u")
      return e.src;
    let t;
    if (e instanceof HTMLCanvasElement)
      t = e;
    else {
      bi === void 0 && (bi = Un("canvas")), bi.width = e.width, bi.height = e.height;
      const i = bi.getContext("2d");
      e instanceof ImageData ? i.putImageData(e, 0, 0) : i.drawImage(e, 0, 0, e.width, e.height), t = bi;
    }
    return t.width > 2048 || t.height > 2048 ? (console.warn("THREE.ImageUtils.getDataURL: Image converted to jpg for performance reasons", e), t.toDataURL("image/jpeg", 0.6)) : t.toDataURL("image/png");
  }
  static sRGBToLinear(e) {
    if (typeof HTMLImageElement < "u" && e instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && e instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && e instanceof ImageBitmap) {
      const t = Un("canvas");
      t.width = e.width, t.height = e.height;
      const i = t.getContext("2d");
      i.drawImage(e, 0, 0, e.width, e.height);
      const r = i.getImageData(0, 0, e.width, e.height), s = r.data;
      for (let a = 0; a < s.length; a++)
        s[a] = Di(s[a] / 255) * 255;
      return i.putImageData(r, 0, 0), t;
    } else if (e.data) {
      const t = e.data.slice(0);
      for (let i = 0; i < t.length; i++)
        t instanceof Uint8Array || t instanceof Uint8ClampedArray ? t[i] = Math.floor(Di(t[i] / 255) * 255) : t[i] = Di(t[i]);
      return {
        data: t,
        width: e.width,
        height: e.height
      };
    } else
      return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."), e;
  }
}
let Mo = 0;
class aa {
  constructor(e = null) {
    this.isSource = !0, Object.defineProperty(this, "id", { value: Mo++ }), this.uuid = Ni(), this.data = e, this.dataReady = !0, this.version = 0;
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
          r[a].isDataTexture ? s.push(ur(r[a].image)) : s.push(ur(r[a]));
      } else
        s = ur(r);
      i.url = s;
    }
    return t || (e.images[this.uuid] = i), i;
  }
}
function ur(n) {
  return typeof HTMLImageElement < "u" && n instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && n instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && n instanceof ImageBitmap ? So.getDataURL(n) : n.data ? {
    data: Array.from(n.data),
    width: n.width,
    height: n.height,
    type: n.data.constructor.name
  } : (console.warn("THREE.Texture: Unable to serialize Texture."), {});
}
let yo = 0;
class _t extends Fi {
  constructor(e = _t.DEFAULT_IMAGE, t = _t.DEFAULT_MAPPING, i = 1001, r = 1001, s = 1006, a = 1008, o = 1023, l = 1009, c = _t.DEFAULT_ANISOTROPY, h = $t) {
    super(), this.isTexture = !0, Object.defineProperty(this, "id", { value: yo++ }), this.uuid = Ni(), this.name = "", this.source = new aa(e), this.mipmaps = [], this.mapping = t, this.channel = 0, this.wrapS = i, this.wrapT = r, this.magFilter = s, this.minFilter = a, this.anisotropy = c, this.format = o, this.internalFormat = null, this.type = l, this.offset = new le(0, 0), this.repeat = new le(1, 1), this.center = new le(0, 0), this.rotation = 0, this.matrixAutoUpdate = !0, this.matrix = new Oe(), this.generateMipmaps = !0, this.premultiplyAlpha = !1, this.flipY = !0, this.unpackAlignment = 4, this.colorSpace = h, this.userData = {}, this.version = 0, this.onUpdate = null, this.isRenderTargetTexture = !1, this.pmremVersion = 0;
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
    if (this.mapping !== 300) return e;
    if (e.applyMatrix3(this.matrix), e.x < 0 || e.x > 1)
      switch (this.wrapS) {
        case 1e3:
          e.x = e.x - Math.floor(e.x);
          break;
        case 1001:
          e.x = e.x < 0 ? 0 : 1;
          break;
        case 1002:
          Math.abs(Math.floor(e.x) % 2) === 1 ? e.x = Math.ceil(e.x) - e.x : e.x = e.x - Math.floor(e.x);
          break;
      }
    if (e.y < 0 || e.y > 1)
      switch (this.wrapT) {
        case 1e3:
          e.y = e.y - Math.floor(e.y);
          break;
        case 1001:
          e.y = e.y < 0 ? 0 : 1;
          break;
        case 1002:
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
_t.DEFAULT_IMAGE = null;
_t.DEFAULT_MAPPING = 300;
_t.DEFAULT_ANISOTROPY = 1;
class Eo extends Fi {
  constructor(e = 1, t = 1, i = {}) {
    super(), this.isRenderTarget = !0, this.width = e, this.height = t, this.depth = 1, this.scissor = new $e(0, 0, e, t), this.scissorTest = !1, this.viewport = new $e(0, 0, e, t);
    const r = { width: e, height: t, depth: 1 };
    i = Object.assign({
      generateMipmaps: !1,
      internalFormat: null,
      minFilter: 1006,
      depthBuffer: !0,
      stencilBuffer: !1,
      resolveDepthBuffer: !0,
      resolveStencilBuffer: !0,
      depthTexture: null,
      samples: 0,
      count: 1
    }, i);
    const s = new _t(r, i.mapping, i.wrapS, i.wrapT, i.magFilter, i.minFilter, i.format, i.type, i.anisotropy, i.colorSpace);
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
    return this.texture.source = new aa(t), this.depthBuffer = e.depthBuffer, this.stencilBuffer = e.stencilBuffer, this.resolveDepthBuffer = e.resolveDepthBuffer, this.resolveStencilBuffer = e.resolveStencilBuffer, e.depthTexture !== null && (this.depthTexture = e.depthTexture.clone()), this.samples = e.samples, this;
  }
  dispose() {
    this.dispatchEvent({ type: "dispose" });
  }
}
class di extends Eo {
  constructor(e = 1, t = 1, i = {}) {
    super(e, t, i), this.isWebGLRenderTarget = !0;
  }
}
const Li = 4, ms = [0.125, 0.215, 0.35, 0.446, 0.526, 0.582], hi = 20, dr = /* @__PURE__ */ new Zs(), gs = /* @__PURE__ */ new ke();
let fr = null, pr = 0, mr = 0, gr = !1;
const ci = (1 + Math.sqrt(5)) / 2, Ri = 1 / ci, _s = [
  /* @__PURE__ */ new L(-ci, Ri, 0),
  /* @__PURE__ */ new L(ci, Ri, 0),
  /* @__PURE__ */ new L(-Ri, 0, ci),
  /* @__PURE__ */ new L(Ri, 0, ci),
  /* @__PURE__ */ new L(0, ci, -Ri),
  /* @__PURE__ */ new L(0, ci, Ri),
  /* @__PURE__ */ new L(-1, 1, -1),
  /* @__PURE__ */ new L(1, 1, -1),
  /* @__PURE__ */ new L(-1, 1, 1),
  /* @__PURE__ */ new L(1, 1, 1)
];
class vs {
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
    fr = this._renderer.getRenderTarget(), pr = this._renderer.getActiveCubeFace(), mr = this._renderer.getActiveMipmapLevel(), gr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1, this._setSize(256);
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
    this._cubemapMaterial === null && (this._cubemapMaterial = Ms(), this._compileMaterial(this._cubemapMaterial));
  }
  /**
   * Pre-compiles the equirectangular shader. You can get faster start-up by invoking this method during
   * your texture's network fetch for increased concurrency.
   */
  compileEquirectangularShader() {
    this._equirectMaterial === null && (this._equirectMaterial = Ss(), this._compileMaterial(this._equirectMaterial));
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
    this._renderer.setRenderTarget(fr, pr, mr), this._renderer.xr.enabled = gr, e.scissorTest = !1, bn(e, 0, 0, e.width, e.height);
  }
  _fromTexture(e, t) {
    e.mapping === 301 || e.mapping === 302 ? this._setSize(e.image.length === 0 ? 16 : e.image[0].width || e.image[0].image.width) : this._setSize(e.image.width / 4), fr = this._renderer.getRenderTarget(), pr = this._renderer.getActiveCubeFace(), mr = this._renderer.getActiveMipmapLevel(), gr = this._renderer.xr.enabled, this._renderer.xr.enabled = !1;
    const i = t || this._allocateTargets();
    return this._textureToCubeUV(e, i), this._applyPMREM(i), this._cleanup(i), i;
  }
  _allocateTargets() {
    const e = 3 * Math.max(this._cubeSize, 112), t = 4 * this._cubeSize, i = {
      magFilter: 1006,
      minFilter: 1006,
      generateMipmaps: !1,
      type: 1016,
      format: 1023,
      colorSpace: Qt,
      depthBuffer: !1
    }, r = xs(e, t, i);
    if (this._pingPongRenderTarget === null || this._pingPongRenderTarget.width !== e || this._pingPongRenderTarget.height !== t) {
      this._pingPongRenderTarget !== null && this._dispose(), this._pingPongRenderTarget = xs(e, t, i);
      const { _lodMax: s } = this;
      ({ sizeLods: this._sizeLods, lodPlanes: this._lodPlanes, sigmas: this._sigmas } = To(s)), this._blurMaterial = Ao(s, e, t);
    }
    return r;
  }
  _compileMaterial(e) {
    const t = new Ht(this._lodPlanes[0], e);
    this._renderer.compile(t, dr);
  }
  _sceneToCubeUV(e, t, i, r) {
    const o = new Tt(90, 1, t, i), l = [1, -1, 1, 1, 1, 1], c = [1, 1, 1, -1, -1, -1], h = this._renderer, f = h.autoClear, d = h.toneMapping;
    h.getClearColor(gs), h.toneMapping = 0, h.autoClear = !1;
    const m = new ra({
      name: "PMREM.Background",
      side: 1,
      depthWrite: !1,
      depthTest: !1
    }), g = new Ht(new ji(), m);
    let v = !1;
    const p = e.background;
    p ? p.isColor && (m.color.copy(p), e.background = null, v = !0) : (m.color.copy(gs), v = !0);
    for (let u = 0; u < 6; u++) {
      const b = u % 3;
      b === 0 ? (o.up.set(0, l[u], 0), o.lookAt(c[u], 0, 0)) : b === 1 ? (o.up.set(0, 0, l[u]), o.lookAt(0, c[u], 0)) : (o.up.set(0, l[u], 0), o.lookAt(0, 0, c[u]));
      const S = this._cubeSize;
      bn(r, b * S, u > 2 ? S : 0, S, S), h.setRenderTarget(r), v && h.render(g, o), h.render(e, o);
    }
    g.geometry.dispose(), g.material.dispose(), h.toneMapping = d, h.autoClear = f, e.background = p;
  }
  _textureToCubeUV(e, t) {
    const i = this._renderer, r = e.mapping === 301 || e.mapping === 302;
    r ? (this._cubemapMaterial === null && (this._cubemapMaterial = Ms()), this._cubemapMaterial.uniforms.flipEnvMap.value = e.isRenderTargetTexture === !1 ? -1 : 1) : this._equirectMaterial === null && (this._equirectMaterial = Ss());
    const s = r ? this._cubemapMaterial : this._equirectMaterial, a = new Ht(this._lodPlanes[0], s), o = s.uniforms;
    o.envMap.value = e;
    const l = this._cubeSize;
    bn(t, 0, 0, 3 * l, 2 * l), i.setRenderTarget(t), i.render(a, dr);
  }
  _applyPMREM(e) {
    const t = this._renderer, i = t.autoClear;
    t.autoClear = !1;
    const r = this._lodPlanes.length;
    for (let s = 1; s < r; s++) {
      const a = Math.sqrt(this._sigmas[s] * this._sigmas[s] - this._sigmas[s - 1] * this._sigmas[s - 1]), o = _s[(r - s - 1) % _s.length];
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
    const h = 3, f = new Ht(this._lodPlanes[r], c), d = c.uniforms, m = this._sizeLods[i] - 1, g = isFinite(s) ? Math.PI / (2 * m) : 2 * Math.PI / (2 * hi - 1), v = s / g, p = isFinite(s) ? 1 + Math.floor(h * v) : hi;
    p > hi && console.warn(`sigmaRadians, ${s}, is too large and will clip, as it requested ${p} samples when the maximum is set to ${hi}`);
    const u = [];
    let b = 0;
    for (let w = 0; w < hi; ++w) {
      const I = w / v, E = Math.exp(-I * I / 2);
      u.push(E), w === 0 ? b += E : w < p && (b += 2 * E);
    }
    for (let w = 0; w < u.length; w++)
      u[w] = u[w] / b;
    d.envMap.value = e.texture, d.samples.value = p, d.weights.value = u, d.latitudinal.value = a === "latitudinal", o && (d.poleAxis.value = o);
    const { _lodMax: S } = this;
    d.dTheta.value = g, d.mipInt.value = S - i;
    const T = this._sizeLods[r], O = 3 * T * (r > S - Li ? r - S + Li : 0), R = 4 * (this._cubeSize - T);
    bn(t, O, R, 3 * T, 2 * T), l.setRenderTarget(t), l.render(f, dr);
  }
}
function To(n) {
  const e = [], t = [], i = [];
  let r = n;
  const s = n - Li + 1 + ms.length;
  for (let a = 0; a < s; a++) {
    const o = Math.pow(2, r);
    t.push(o);
    let l = 1 / o;
    a > n - Li ? l = ms[a - n + Li - 1] : a === 0 && (l = 0), i.push(l);
    const c = 1 / (o - 2), h = -c, f = 1 + c, d = [h, h, f, h, f, f, h, h, f, f, h, f], m = 6, g = 6, v = 3, p = 2, u = 1, b = new Float32Array(v * g * m), S = new Float32Array(p * g * m), T = new Float32Array(u * g * m);
    for (let R = 0; R < m; R++) {
      const w = R % 3 * 2 / 3 - 1, I = R > 2 ? 0 : -1, E = [
        w,
        I,
        0,
        w + 2 / 3,
        I,
        0,
        w + 2 / 3,
        I + 1,
        0,
        w,
        I,
        0,
        w + 2 / 3,
        I + 1,
        0,
        w,
        I + 1,
        0
      ];
      b.set(E, v * g * R), S.set(d, p * g * R);
      const x = [R, R, R, R, R, R];
      T.set(x, u * g * R);
    }
    const O = new ei();
    O.setAttribute("position", new Ut(b, v)), O.setAttribute("uv", new Ut(S, p)), O.setAttribute("faceIndex", new Ut(T, u)), e.push(O), r > Li && r--;
  }
  return { lodPlanes: e, sizeLods: t, sigmas: i };
}
function xs(n, e, t) {
  const i = new di(n, e, t);
  return i.texture.mapping = 306, i.texture.name = "PMREM.cubeUv", i.scissorTest = !0, i;
}
function bn(n, e, t, i, r) {
  n.viewport.set(e, t, i, r), n.scissor.set(e, t, i, r);
}
function Ao(n, e, t) {
  const i = new Float32Array(hi), r = new L(0, 1, 0);
  return new jt({
    name: "SphericalGaussianBlur",
    defines: {
      n: hi,
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
    vertexShader: Nr(),
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
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ss() {
  return new jt({
    name: "EquirectangularToCubeUV",
    uniforms: {
      envMap: { value: null }
    },
    vertexShader: Nr(),
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
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Ms() {
  return new jt({
    name: "CubemapToCubeUV",
    uniforms: {
      envMap: { value: null },
      flipEnvMap: { value: -1 }
    },
    vertexShader: Nr(),
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
    blending: 0,
    depthTest: !1,
    depthWrite: !1
  });
}
function Nr() {
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
const ys = /* @__PURE__ */ new je(), ki = /* @__PURE__ */ new L(), _r = /* @__PURE__ */ new L();
class bo extends Ys {
  constructor() {
    super(new Tt(90, 1, 0.5, 500)), this.isPointLightShadow = !0, this._frameExtents = new le(4, 2), this._viewportCount = 6, this._viewports = [
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
    s !== i.far && (i.far = s, i.updateProjectionMatrix()), ki.setFromMatrixPosition(e.matrixWorld), i.position.copy(ki), _r.copy(i.position), _r.add(this._cubeDirections[t]), i.up.copy(this._cubeUps[t]), i.lookAt(_r), i.updateMatrixWorld(), r.makeTranslation(-ki.x, -ki.y, -ki.z), ys.multiplyMatrices(i.projectionMatrix, i.matrixWorldInverse), this._frustum.setFromProjectionMatrix(ys);
  }
}
class Sd extends Cr {
  constructor(e, t, i = 0, r = 2) {
    super(e, t), this.isPointLight = !0, this.type = "PointLight", this.distance = i, this.decay = r, this.shadow = new bo();
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
const Es = /* @__PURE__ */ new je();
class Md {
  constructor(e, t, i = 0, r = 1 / 0) {
    this.ray = new na(e, t), this.near = i, this.far = r, this.camera = null, this.layers = new wr(), this.params = {
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
    return Es.identity().extractRotation(e.matrixWorld), this.ray.origin.setFromMatrixPosition(e.matrixWorld), this.ray.direction.set(0, 0, -1).applyMatrix4(Es), this;
  }
  intersectObject(e, t = !0, i = []) {
    return Ar(e, this, i, t), i.sort(Ts), i;
  }
  intersectObjects(e, t = !0, i = []) {
    for (let r = 0, s = e.length; r < s; r++)
      Ar(e[r], this, i, t);
    return i.sort(Ts), i;
  }
}
function Ts(n, e) {
  return n.distance - e.distance;
}
function Ar(n, e, t, i) {
  let r = !0;
  if (n.layers.test(e.layers) && n.raycast(e, t) === !1 && (r = !1), r === !0 && i === !0) {
    const s = n.children;
    for (let a = 0, o = s.length; a < o; a++)
      Ar(s[a], e, t, !0);
  }
}
class yd extends pt {
  constructor() {
    super(), this.isScene = !0, this.type = "Scene", this.background = null, this.environment = null, this.fog = null, this.backgroundBlurriness = 0, this.backgroundIntensity = 1, this.backgroundRotation = new It(), this.environmentIntensity = 1, this.environmentRotation = new It(), this.overrideMaterial = null, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  copy(e, t) {
    return super.copy(e, t), e.background !== null && (this.background = e.background.clone()), e.environment !== null && (this.environment = e.environment.clone()), e.fog !== null && (this.fog = e.fog.clone()), this.backgroundBlurriness = e.backgroundBlurriness, this.backgroundIntensity = e.backgroundIntensity, this.backgroundRotation.copy(e.backgroundRotation), this.environmentIntensity = e.environmentIntensity, this.environmentRotation.copy(e.environmentRotation), e.overrideMaterial !== null && (this.overrideMaterial = e.overrideMaterial.clone()), this.matrixAutoUpdate = e.matrixAutoUpdate, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.fog !== null && (t.object.fog = this.fog.toJSON()), this.backgroundBlurriness > 0 && (t.object.backgroundBlurriness = this.backgroundBlurriness), this.backgroundIntensity !== 1 && (t.object.backgroundIntensity = this.backgroundIntensity), t.object.backgroundRotation = this.backgroundRotation.toArray(), this.environmentIntensity !== 1 && (t.object.environmentIntensity = this.environmentIntensity), t.object.environmentRotation = this.environmentRotation.toArray(), t;
  }
}
class Ro {
  constructor() {
    this.type = "ShapePath", this.color = new ke(), this.subPaths = [], this.currentPath = null;
  }
  moveTo(e, t) {
    return this.currentPath = new yr(), this.subPaths.push(this.currentPath), this.currentPath.moveTo(e, t), this;
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
      for (let S = 0, T = u.length; S < T; S++) {
        const O = u[S], R = new wn();
        R.curves = O.curves, b.push(R);
      }
      return b;
    }
    function i(u, b) {
      const S = b.length;
      let T = !1;
      for (let O = S - 1, R = 0; R < S; O = R++) {
        let w = b[O], I = b[R], E = I.x - w.x, x = I.y - w.y;
        if (Math.abs(x) > Number.EPSILON) {
          if (x < 0 && (w = b[R], E = -E, I = b[O], x = -x), u.y < w.y || u.y > I.y) continue;
          if (u.y === w.y) {
            if (u.x === w.x) return !0;
          } else {
            const C = x * (u.x - w.x) - E * (u.y - w.y);
            if (C === 0) return !0;
            if (C < 0) continue;
            T = !T;
          }
        } else {
          if (u.y !== w.y) continue;
          if (I.x <= u.x && u.x <= w.x || w.x <= u.x && u.x <= I.x) return !0;
        }
      }
      return T;
    }
    const r = Ui.isClockWise, s = this.subPaths;
    if (s.length === 0) return [];
    let a, o, l;
    const c = [];
    if (s.length === 1)
      return o = s[0], l = new wn(), l.curves = o.curves, c.push(l), c;
    let h = !r(s[0].getPoints());
    h = e ? !h : h;
    const f = [], d = [];
    let m = [], g = 0, v;
    d[g] = void 0, m[g] = [];
    for (let u = 0, b = s.length; u < b; u++)
      o = s[u], v = o.getPoints(), a = r(v), a = e ? !a : a, a ? (!h && d[g] && g++, d[g] = { s: new wn(), p: v }, d[g].s.curves = o.curves, h && g++, m[g] = []) : m[g].push({ h: o, p: v[0] });
    if (!d[0]) return t(s);
    if (d.length > 1) {
      let u = !1, b = 0;
      for (let S = 0, T = d.length; S < T; S++)
        f[S] = [];
      for (let S = 0, T = d.length; S < T; S++) {
        const O = m[S];
        for (let R = 0; R < O.length; R++) {
          const w = O[R];
          let I = !0;
          for (let E = 0; E < d.length; E++)
            i(w.p, d[E].p) && (S !== E && b++, I ? (I = !1, f[E].push(w)) : u = !0);
          I && f[S].push(w);
        }
      }
      b > 0 && u === !1 && (m = f);
    }
    let p;
    for (let u = 0, b = d.length; u < b; u++) {
      l = d[u].s, c.push(l), p = m[u];
      for (let S = 0, T = p.length; S < T; S++)
        l.holes.push(p[S].h);
    }
    return c;
  }
}
function oa() {
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
function wo(n) {
  const e = /* @__PURE__ */ new WeakMap();
  function t(o, l) {
    const c = o.array, h = o.usage, f = c.byteLength, d = n.createBuffer();
    n.bindBuffer(l, d), n.bufferData(l, c, h), o.onUploadCallback();
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
      buffer: d,
      type: m,
      bytesPerElement: c.BYTES_PER_ELEMENT,
      version: o.version,
      size: f
    };
  }
  function i(o, l, c) {
    const h = l.array, f = l._updateRange, d = l.updateRanges;
    if (n.bindBuffer(c, o), f.count === -1 && d.length === 0 && n.bufferSubData(c, 0, h), d.length !== 0) {
      for (let m = 0, g = d.length; m < g; m++) {
        const v = d[m];
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
    f.count !== -1 && (n.bufferSubData(
      c,
      f.offset * h.BYTES_PER_ELEMENT,
      h,
      f.offset,
      f.count
    ), f.count = -1), l.onUploadCallback();
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
const Co = (
  /* glsl */
  `
#ifdef USE_ALPHAHASH

	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;

#endif
`
), Po = (
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
), Lo = (
  /* glsl */
  `
#ifdef USE_ALPHAMAP

	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;

#endif
`
), Do = (
  /* glsl */
  `
#ifdef USE_ALPHAMAP

	uniform sampler2D alphaMap;

#endif
`
), Uo = (
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
), Io = (
  /* glsl */
  `
#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif
`
), No = (
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
), Fo = (
  /* glsl */
  `
#ifdef USE_AOMAP

	uniform sampler2D aoMap;
	uniform float aoMapIntensity;

#endif
`
), Oo = (
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
), Bo = (
  /* glsl */
  `
#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif
`
), zo = (
  /* glsl */
  `
vec3 transformed = vec3( position );

#ifdef USE_ALPHAHASH

	vPosition = vec3( position );

#endif
`
), Go = (
  /* glsl */
  `
vec3 objectNormal = vec3( normal );

#ifdef USE_TANGENT

	vec3 objectTangent = vec3( tangent.xyz );

#endif
`
), Vo = (
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
), Ho = (
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
), ko = (
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
), Wo = (
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
), Xo = (
  /* glsl */
  `
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];

#endif
`
), qo = (
  /* glsl */
  `
#if NUM_CLIPPING_PLANES > 0

	varying vec3 vClipPosition;

#endif
`
), Yo = (
  /* glsl */
  `
#if NUM_CLIPPING_PLANES > 0

	vClipPosition = - mvPosition.xyz;

#endif
`
), Ko = (
  /* glsl */
  `
#if defined( USE_COLOR_ALPHA )

	diffuseColor *= vColor;

#elif defined( USE_COLOR )

	diffuseColor.rgb *= vColor;

#endif
`
), Zo = (
  /* glsl */
  `
#if defined( USE_COLOR_ALPHA )

	varying vec4 vColor;

#elif defined( USE_COLOR )

	varying vec3 vColor;

#endif
`
), Jo = (
  /* glsl */
  `
#if defined( USE_COLOR_ALPHA )

	varying vec4 vColor;

#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )

	varying vec3 vColor;

#endif
`
), $o = (
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
), jo = (
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
), Qo = (
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
), el = (
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
), tl = (
  /* glsl */
  `
#ifdef USE_DISPLACEMENTMAP

	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;

#endif
`
), il = (
  /* glsl */
  `
#ifdef USE_DISPLACEMENTMAP

	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );

#endif
`
), nl = (
  /* glsl */
  `
#ifdef USE_EMISSIVEMAP

	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );

	totalEmissiveRadiance *= emissiveColor.rgb;

#endif
`
), rl = (
  /* glsl */
  `
#ifdef USE_EMISSIVEMAP

	uniform sampler2D emissiveMap;

#endif
`
), sl = (
  /* glsl */
  `
gl_FragColor = linearToOutputTexel( gl_FragColor );
`
), al = (
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
), ol = (
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
), ll = (
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
), cl = (
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
), hl = (
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
), ul = (
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
), dl = (
  /* glsl */
  `
#ifdef USE_FOG

	vFogDepth = - mvPosition.z;

#endif
`
), fl = (
  /* glsl */
  `
#ifdef USE_FOG

	varying float vFogDepth;

#endif
`
), pl = (
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
), ml = (
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
), gl = (
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
), _l = (
  /* glsl */
  `
#ifdef USE_LIGHTMAP

	uniform sampler2D lightMap;
	uniform float lightMapIntensity;

#endif
`
), vl = (
  /* glsl */
  `
LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;
`
), xl = (
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
), Sl = (
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
), Ml = (
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
), yl = (
  /* glsl */
  `
ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;
`
), El = (
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
), Tl = (
  /* glsl */
  `
BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;
`
), Al = (
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
), bl = (
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
), Rl = (
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
), wl = (
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
), Cl = (
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
), Pl = (
  /* glsl */
  `
#if defined( RE_IndirectDiffuse )

	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

#endif

#if defined( RE_IndirectSpecular )

	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );

#endif
`
), Ll = (
  /* glsl */
  `
#if defined( USE_LOGDEPTHBUF )

	// Doing a strict comparison with == 1.0 can cause noise artifacts
	// on some platforms. See issue #17623.
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;

#endif
`
), Dl = (
  /* glsl */
  `
#if defined( USE_LOGDEPTHBUF )

	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;

#endif
`
), Ul = (
  /* glsl */
  `
#ifdef USE_LOGDEPTHBUF

	varying float vFragDepth;
	varying float vIsPerspective;

#endif
`
), Il = (
  /* glsl */
  `
#ifdef USE_LOGDEPTHBUF

	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );

#endif
`
), Nl = (
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
), Fl = (
  /* glsl */
  `
#ifdef USE_MAP

	uniform sampler2D map;

#endif
`
), Ol = (
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
), Bl = (
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
), zl = (
  /* glsl */
  `
float metalnessFactor = metalness;

#ifdef USE_METALNESSMAP

	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );

	// reads channel B, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	metalnessFactor *= texelMetalness.b;

#endif
`
), Gl = (
  /* glsl */
  `
#ifdef USE_METALNESSMAP

	uniform sampler2D metalnessMap;

#endif
`
), Vl = (
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
), Hl = (
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
), kl = (
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
), Wl = (
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
), Xl = (
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
), ql = (
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
), Yl = (
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
), Kl = (
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
), Zl = (
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
), Jl = (
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
), $l = (
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
), jl = (
  /* glsl */
  `
#ifdef USE_CLEARCOAT

	vec3 clearcoatNormal = nonPerturbedNormal;

#endif
`
), Ql = (
  /* glsl */
  `
#ifdef USE_CLEARCOAT_NORMALMAP

	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;

	clearcoatNormal = normalize( tbn2 * clearcoatMapN );

#endif
`
), ec = (
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
), tc = (
  /* glsl */
  `

#ifdef USE_IRIDESCENCEMAP

	uniform sampler2D iridescenceMap;

#endif

#ifdef USE_IRIDESCENCE_THICKNESSMAP

	uniform sampler2D iridescenceThicknessMap;

#endif
`
), ic = (
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
), nc = (
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
), rc = (
  /* glsl */
  `
#ifdef PREMULTIPLIED_ALPHA

	// Get get normal blending with premultipled, use with CustomBlending, OneFactor, OneMinusSrcAlphaFactor, AddEquation.
	gl_FragColor.rgb *= gl_FragColor.a;

#endif
`
), sc = (
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
), ac = (
  /* glsl */
  `
#ifdef DITHERING

	gl_FragColor.rgb = dithering( gl_FragColor.rgb );

#endif
`
), oc = (
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
), lc = (
  /* glsl */
  `
float roughnessFactor = roughness;

#ifdef USE_ROUGHNESSMAP

	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );

	// reads channel G, compatible with a combined OcclusionRoughnessMetallic (RGB) texture
	roughnessFactor *= texelRoughness.g;

#endif
`
), cc = (
  /* glsl */
  `
#ifdef USE_ROUGHNESSMAP

	uniform sampler2D roughnessMap;

#endif
`
), hc = (
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
), uc = (
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
), dc = (
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
), fc = (
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
), pc = (
  /* glsl */
  `
#ifdef USE_SKINNING

	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );

#endif
`
), mc = (
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
), gc = (
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
), _c = (
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
), vc = (
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
), xc = (
  /* glsl */
  `
#ifdef USE_SPECULARMAP

	uniform sampler2D specularMap;

#endif
`
), Sc = (
  /* glsl */
  `
#if defined( TONE_MAPPING )

	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );

#endif
`
), Mc = (
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
), yc = (
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
), Ec = (
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
), Tc = (
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
), Ac = (
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
), bc = (
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
), Rc = (
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
), wc = (
  /* glsl */
  `
varying vec2 vUv;
uniform mat3 uvTransform;

void main() {

	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;

	gl_Position = vec4( position.xy, 1.0, 1.0 );

}
`
), Cc = (
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
), Pc = (
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
), Lc = (
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
), Dc = (
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
), Uc = (
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
), Ic = (
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
), Nc = (
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
), Fc = (
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
), Oc = (
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
), Bc = (
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
), zc = (
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
), Gc = (
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
), Vc = (
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
), Hc = (
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
), kc = (
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
), Wc = (
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
), Xc = (
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
), qc = (
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
), Yc = (
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
), Kc = (
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
), Zc = (
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
), Jc = (
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
), $c = (
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
), jc = (
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
), Qc = (
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
), eh = (
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
), th = (
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
), ih = (
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
), nh = (
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
), rh = (
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
), sh = (
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
), ah = (
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
), oh = (
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
  alphahash_fragment: Co,
  alphahash_pars_fragment: Po,
  alphamap_fragment: Lo,
  alphamap_pars_fragment: Do,
  alphatest_fragment: Uo,
  alphatest_pars_fragment: Io,
  aomap_fragment: No,
  aomap_pars_fragment: Fo,
  batching_pars_vertex: Oo,
  batching_vertex: Bo,
  begin_vertex: zo,
  beginnormal_vertex: Go,
  bsdfs: Vo,
  iridescence_fragment: Ho,
  bumpmap_pars_fragment: ko,
  clipping_planes_fragment: Wo,
  clipping_planes_pars_fragment: Xo,
  clipping_planes_pars_vertex: qo,
  clipping_planes_vertex: Yo,
  color_fragment: Ko,
  color_pars_fragment: Zo,
  color_pars_vertex: Jo,
  color_vertex: $o,
  common: jo,
  cube_uv_reflection_fragment: Qo,
  defaultnormal_vertex: el,
  displacementmap_pars_vertex: tl,
  displacementmap_vertex: il,
  emissivemap_fragment: nl,
  emissivemap_pars_fragment: rl,
  colorspace_fragment: sl,
  colorspace_pars_fragment: al,
  envmap_fragment: ol,
  envmap_common_pars_fragment: ll,
  envmap_pars_fragment: cl,
  envmap_pars_vertex: hl,
  envmap_physical_pars_fragment: Ml,
  envmap_vertex: ul,
  fog_vertex: dl,
  fog_pars_vertex: fl,
  fog_fragment: pl,
  fog_pars_fragment: ml,
  gradientmap_pars_fragment: gl,
  lightmap_pars_fragment: _l,
  lights_lambert_fragment: vl,
  lights_lambert_pars_fragment: xl,
  lights_pars_begin: Sl,
  lights_toon_fragment: yl,
  lights_toon_pars_fragment: El,
  lights_phong_fragment: Tl,
  lights_phong_pars_fragment: Al,
  lights_physical_fragment: bl,
  lights_physical_pars_fragment: Rl,
  lights_fragment_begin: wl,
  lights_fragment_maps: Cl,
  lights_fragment_end: Pl,
  logdepthbuf_fragment: Ll,
  logdepthbuf_pars_fragment: Dl,
  logdepthbuf_pars_vertex: Ul,
  logdepthbuf_vertex: Il,
  map_fragment: Nl,
  map_pars_fragment: Fl,
  map_particle_fragment: Ol,
  map_particle_pars_fragment: Bl,
  metalnessmap_fragment: zl,
  metalnessmap_pars_fragment: Gl,
  morphinstance_vertex: Vl,
  morphcolor_vertex: Hl,
  morphnormal_vertex: kl,
  morphtarget_pars_vertex: Wl,
  morphtarget_vertex: Xl,
  normal_fragment_begin: ql,
  normal_fragment_maps: Yl,
  normal_pars_fragment: Kl,
  normal_pars_vertex: Zl,
  normal_vertex: Jl,
  normalmap_pars_fragment: $l,
  clearcoat_normal_fragment_begin: jl,
  clearcoat_normal_fragment_maps: Ql,
  clearcoat_pars_fragment: ec,
  iridescence_pars_fragment: tc,
  opaque_fragment: ic,
  packing: nc,
  premultiplied_alpha_fragment: rc,
  project_vertex: sc,
  dithering_fragment: ac,
  dithering_pars_fragment: oc,
  roughnessmap_fragment: lc,
  roughnessmap_pars_fragment: cc,
  shadowmap_pars_fragment: hc,
  shadowmap_pars_vertex: uc,
  shadowmap_vertex: dc,
  shadowmask_pars_fragment: fc,
  skinbase_vertex: pc,
  skinning_pars_vertex: mc,
  skinning_vertex: gc,
  skinnormal_vertex: _c,
  specularmap_fragment: vc,
  specularmap_pars_fragment: xc,
  tonemapping_fragment: Sc,
  tonemapping_pars_fragment: Mc,
  transmission_fragment: yc,
  transmission_pars_fragment: Ec,
  uv_pars_fragment: Tc,
  uv_pars_vertex: Ac,
  uv_vertex: bc,
  worldpos_vertex: Rc,
  background_vert: wc,
  background_frag: Cc,
  backgroundCube_vert: Pc,
  backgroundCube_frag: Lc,
  cube_vert: Dc,
  cube_frag: Uc,
  depth_vert: Ic,
  depth_frag: Nc,
  distanceRGBA_vert: Fc,
  distanceRGBA_frag: Oc,
  equirect_vert: Bc,
  equirect_frag: zc,
  linedashed_vert: Gc,
  linedashed_frag: Vc,
  meshbasic_vert: Hc,
  meshbasic_frag: kc,
  meshlambert_vert: Wc,
  meshlambert_frag: Xc,
  meshmatcap_vert: qc,
  meshmatcap_frag: Yc,
  meshnormal_vert: Kc,
  meshnormal_frag: Zc,
  meshphong_vert: Jc,
  meshphong_frag: $c,
  meshphysical_vert: jc,
  meshphysical_frag: Qc,
  meshtoon_vert: eh,
  meshtoon_frag: th,
  points_vert: ih,
  points_frag: nh,
  shadow_vert: rh,
  shadow_frag: sh,
  sprite_vert: ah,
  sprite_frag: oh
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
}, Lt = {
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
Lt.physical = {
  uniforms: /* @__PURE__ */ mt([
    Lt.standard.uniforms,
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
const Rn = { r: 0, b: 0, g: 0 }, ai = /* @__PURE__ */ new It(), lh = /* @__PURE__ */ new je();
function ch(n, e, t, i, r, s, a) {
  const o = new ke(0);
  let l = s === !0 ? 0 : 1, c, h, f = null, d = 0, m = null;
  function g(b) {
    let S = b.isScene === !0 ? b.background : null;
    return S && S.isTexture && (S = (b.backgroundBlurriness > 0 ? t : e).get(S)), S;
  }
  function v(b) {
    let S = !1;
    const T = g(b);
    T === null ? u(o, l) : T && T.isColor && (u(T, 1), S = !0);
    const O = n.xr.getEnvironmentBlendMode();
    O === "additive" ? i.buffers.color.setClear(0, 0, 0, 1, a) : O === "alpha-blend" && i.buffers.color.setClear(0, 0, 0, 0, a), (n.autoClear || S) && (i.buffers.depth.setTest(!0), i.buffers.depth.setMask(!0), i.buffers.color.setMask(!0), n.clear(n.autoClearColor, n.autoClearDepth, n.autoClearStencil));
  }
  function p(b, S) {
    const T = g(S);
    T && (T.isCubeTexture || T.mapping === 306) ? (h === void 0 && (h = new Ht(
      new ji(1, 1, 1),
      new jt({
        name: "BackgroundCubeMaterial",
        uniforms: Ii(Lt.backgroundCube.uniforms),
        vertexShader: Lt.backgroundCube.vertexShader,
        fragmentShader: Lt.backgroundCube.fragmentShader,
        side: 1,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), h.geometry.deleteAttribute("normal"), h.geometry.deleteAttribute("uv"), h.onBeforeRender = function(O, R, w) {
      this.matrixWorld.copyPosition(w.matrixWorld);
    }, Object.defineProperty(h.material, "envMap", {
      get: function() {
        return this.uniforms.envMap.value;
      }
    }), r.update(h)), ai.copy(S.backgroundRotation), ai.x *= -1, ai.y *= -1, ai.z *= -1, T.isCubeTexture && T.isRenderTargetTexture === !1 && (ai.y *= -1, ai.z *= -1), h.material.uniforms.envMap.value = T, h.material.uniforms.flipEnvMap.value = T.isCubeTexture && T.isRenderTargetTexture === !1 ? -1 : 1, h.material.uniforms.backgroundBlurriness.value = S.backgroundBlurriness, h.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, h.material.uniforms.backgroundRotation.value.setFromMatrix4(lh.makeRotationFromEuler(ai)), h.material.toneMapped = Ze.getTransfer(T.colorSpace) !== Je, (f !== T || d !== T.version || m !== n.toneMapping) && (h.material.needsUpdate = !0, f = T, d = T.version, m = n.toneMapping), h.layers.enableAll(), b.unshift(h, h.geometry, h.material, 0, 0, null)) : T && T.isTexture && (c === void 0 && (c = new Ht(
      new Fn(2, 2),
      new jt({
        name: "BackgroundMaterial",
        uniforms: Ii(Lt.background.uniforms),
        vertexShader: Lt.background.vertexShader,
        fragmentShader: Lt.background.fragmentShader,
        side: 0,
        depthTest: !1,
        depthWrite: !1,
        fog: !1
      })
    ), c.geometry.deleteAttribute("normal"), Object.defineProperty(c.material, "map", {
      get: function() {
        return this.uniforms.t2D.value;
      }
    }), r.update(c)), c.material.uniforms.t2D.value = T, c.material.uniforms.backgroundIntensity.value = S.backgroundIntensity, c.material.toneMapped = Ze.getTransfer(T.colorSpace) !== Je, T.matrixAutoUpdate === !0 && T.updateMatrix(), c.material.uniforms.uvTransform.value.copy(T.matrix), (f !== T || d !== T.version || m !== n.toneMapping) && (c.material.needsUpdate = !0, f = T, d = T.version, m = n.toneMapping), c.layers.enableAll(), b.unshift(c, c.geometry, c.material, 0, 0, null));
  }
  function u(b, S) {
    b.getRGB(Rn, sa(n)), i.buffers.color.setClear(Rn.r, Rn.g, Rn.b, S, a);
  }
  return {
    getClearColor: function() {
      return o;
    },
    setClearColor: function(b, S = 1) {
      o.set(b), l = S, u(o, l);
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
function hh(n, e) {
  const t = n.getParameter(n.MAX_VERTEX_ATTRIBS), i = {}, r = d(null);
  let s = r, a = !1;
  function o(x, C, W, z, V) {
    let K = !1;
    const G = f(z, W, C);
    s !== G && (s = G, c(s.object)), K = m(x, z, W, V), K && g(x, z, W, V), V !== null && e.update(V, n.ELEMENT_ARRAY_BUFFER), (K || a) && (a = !1, T(x, C, W, z), V !== null && n.bindBuffer(n.ELEMENT_ARRAY_BUFFER, e.get(V).buffer));
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
  function f(x, C, W) {
    const z = W.wireframe === !0;
    let V = i[x.id];
    V === void 0 && (V = {}, i[x.id] = V);
    let K = V[C.id];
    K === void 0 && (K = {}, V[C.id] = K);
    let G = K[z];
    return G === void 0 && (G = d(l()), K[z] = G), G;
  }
  function d(x) {
    const C = [], W = [], z = [];
    for (let V = 0; V < t; V++)
      C[V] = 0, W[V] = 0, z[V] = 0;
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
    const V = s.attributes, K = C.attributes;
    let G = 0;
    const Q = W.getAttributes();
    for (const H in Q)
      if (Q[H].location >= 0) {
        const xe = V[H];
        let me = K[H];
        if (me === void 0 && (H === "instanceMatrix" && x.instanceMatrix && (me = x.instanceMatrix), H === "instanceColor" && x.instanceColor && (me = x.instanceColor)), xe === void 0 || xe.attribute !== me || me && xe.data !== me.data) return !0;
        G++;
      }
    return s.attributesNum !== G || s.index !== z;
  }
  function g(x, C, W, z) {
    const V = {}, K = C.attributes;
    let G = 0;
    const Q = W.getAttributes();
    for (const H in Q)
      if (Q[H].location >= 0) {
        let xe = K[H];
        xe === void 0 && (H === "instanceMatrix" && x.instanceMatrix && (xe = x.instanceMatrix), H === "instanceColor" && x.instanceColor && (xe = x.instanceColor));
        const me = {};
        me.attribute = xe, xe && xe.data && (me.data = xe.data), V[H] = me, G++;
      }
    s.attributes = V, s.attributesNum = G, s.index = z;
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
    const W = s.newAttributes, z = s.enabledAttributes, V = s.attributeDivisors;
    W[x] = 1, z[x] === 0 && (n.enableVertexAttribArray(x), z[x] = 1), V[x] !== C && (n.vertexAttribDivisor(x, C), V[x] = C);
  }
  function b() {
    const x = s.newAttributes, C = s.enabledAttributes;
    for (let W = 0, z = C.length; W < z; W++)
      C[W] !== x[W] && (n.disableVertexAttribArray(W), C[W] = 0);
  }
  function S(x, C, W, z, V, K, G) {
    G === !0 ? n.vertexAttribIPointer(x, C, W, V, K) : n.vertexAttribPointer(x, C, W, z, V, K);
  }
  function T(x, C, W, z) {
    v();
    const V = z.attributes, K = W.getAttributes(), G = C.defaultAttributeValues;
    for (const Q in K) {
      const H = K[Q];
      if (H.location >= 0) {
        let fe = V[Q];
        if (fe === void 0 && (Q === "instanceMatrix" && x.instanceMatrix && (fe = x.instanceMatrix), Q === "instanceColor" && x.instanceColor && (fe = x.instanceColor)), fe !== void 0) {
          const xe = fe.normalized, me = fe.itemSize, Be = e.get(fe);
          if (Be === void 0) continue;
          const We = Be.buffer, k = Be.type, ee = Be.bytesPerElement, _e = k === n.INT || k === n.UNSIGNED_INT || fe.gpuType === 1013;
          if (fe.isInterleavedBufferAttribute) {
            const ce = fe.data, Ce = ce.stride, Ne = fe.offset;
            if (ce.isInstancedInterleavedBuffer) {
              for (let Pe = 0; Pe < H.locationSize; Pe++)
                u(H.location + Pe, ce.meshPerAttribute);
              x.isInstancedMesh !== !0 && z._maxInstanceCount === void 0 && (z._maxInstanceCount = ce.meshPerAttribute * ce.count);
            } else
              for (let Pe = 0; Pe < H.locationSize; Pe++)
                p(H.location + Pe);
            n.bindBuffer(n.ARRAY_BUFFER, We);
            for (let Pe = 0; Pe < H.locationSize; Pe++)
              S(
                H.location + Pe,
                me / H.locationSize,
                k,
                xe,
                Ce * ee,
                (Ne + me / H.locationSize * Pe) * ee,
                _e
              );
          } else {
            if (fe.isInstancedBufferAttribute) {
              for (let ce = 0; ce < H.locationSize; ce++)
                u(H.location + ce, fe.meshPerAttribute);
              x.isInstancedMesh !== !0 && z._maxInstanceCount === void 0 && (z._maxInstanceCount = fe.meshPerAttribute * fe.count);
            } else
              for (let ce = 0; ce < H.locationSize; ce++)
                p(H.location + ce);
            n.bindBuffer(n.ARRAY_BUFFER, We);
            for (let ce = 0; ce < H.locationSize; ce++)
              S(
                H.location + ce,
                me / H.locationSize,
                k,
                xe,
                me * ee,
                me / H.locationSize * ce * ee,
                _e
              );
          }
        } else if (G !== void 0) {
          const xe = G[Q];
          if (xe !== void 0)
            switch (xe.length) {
              case 2:
                n.vertexAttrib2fv(H.location, xe);
                break;
              case 3:
                n.vertexAttrib3fv(H.location, xe);
                break;
              case 4:
                n.vertexAttrib4fv(H.location, xe);
                break;
              default:
                n.vertexAttrib1fv(H.location, xe);
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
        for (const V in z)
          h(z[V].object), delete z[V];
        delete C[W];
      }
      delete i[x];
    }
  }
  function R(x) {
    if (i[x.id] === void 0) return;
    const C = i[x.id];
    for (const W in C) {
      const z = C[W];
      for (const V in z)
        h(z[V].object), delete z[V];
      delete C[W];
    }
    delete i[x.id];
  }
  function w(x) {
    for (const C in i) {
      const W = i[C];
      if (W[x.id] === void 0) continue;
      const z = W[x.id];
      for (const V in z)
        h(z[V].object), delete z[V];
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
    releaseStatesOfGeometry: R,
    releaseStatesOfProgram: w,
    initAttributes: v,
    enableAttribute: p,
    disableUnusedAttributes: b
  };
}
function uh(n, e, t) {
  let i;
  function r(c) {
    i = c;
  }
  function s(c, h) {
    n.drawArrays(i, c, h), t.update(h, i, 1);
  }
  function a(c, h, f) {
    f !== 0 && (n.drawArraysInstanced(i, c, h, f), t.update(h, i, f));
  }
  function o(c, h, f) {
    if (f === 0) return;
    e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(i, c, 0, h, 0, f);
    let m = 0;
    for (let g = 0; g < f; g++)
      m += h[g];
    t.update(m, i, 1);
  }
  function l(c, h, f, d) {
    if (f === 0) return;
    const m = e.get("WEBGL_multi_draw");
    if (m === null)
      for (let g = 0; g < c.length; g++)
        a(c[g], h[g], d[g]);
    else {
      m.multiDrawArraysInstancedWEBGL(i, c, 0, h, 0, d, 0, f);
      let g = 0;
      for (let v = 0; v < f; v++)
        g += h[v];
      for (let v = 0; v < d.length; v++)
        t.update(g, i, d[v]);
    }
  }
  this.setMode = r, this.render = s, this.renderInstances = a, this.renderMultiDraw = o, this.renderMultiDrawInstances = l;
}
function dh(n, e, t, i) {
  let r;
  function s() {
    if (r !== void 0) return r;
    if (e.has("EXT_texture_filter_anisotropic") === !0) {
      const R = e.get("EXT_texture_filter_anisotropic");
      r = n.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT);
    } else
      r = 0;
    return r;
  }
  function a(R) {
    return !(R !== 1023 && i.convert(R) !== n.getParameter(n.IMPLEMENTATION_COLOR_READ_FORMAT));
  }
  function o(R) {
    const w = R === 1016 && (e.has("EXT_color_buffer_half_float") || e.has("EXT_color_buffer_float"));
    return !(R !== 1009 && i.convert(R) !== n.getParameter(n.IMPLEMENTATION_COLOR_READ_TYPE) && // Edge and Chrome Mac < 52 (#9513)
    R !== 1015 && !w);
  }
  function l(R) {
    if (R === "highp") {
      if (n.getShaderPrecisionFormat(n.VERTEX_SHADER, n.HIGH_FLOAT).precision > 0 && n.getShaderPrecisionFormat(n.FRAGMENT_SHADER, n.HIGH_FLOAT).precision > 0)
        return "highp";
      R = "mediump";
    }
    return R === "mediump" && n.getShaderPrecisionFormat(n.VERTEX_SHADER, n.MEDIUM_FLOAT).precision > 0 && n.getShaderPrecisionFormat(n.FRAGMENT_SHADER, n.MEDIUM_FLOAT).precision > 0 ? "mediump" : "lowp";
  }
  let c = t.precision !== void 0 ? t.precision : "highp";
  const h = l(c);
  h !== c && (console.warn("THREE.WebGLRenderer:", c, "not supported, using", h, "instead."), c = h);
  const f = t.logarithmicDepthBuffer === !0, d = n.getParameter(n.MAX_TEXTURE_IMAGE_UNITS), m = n.getParameter(n.MAX_VERTEX_TEXTURE_IMAGE_UNITS), g = n.getParameter(n.MAX_TEXTURE_SIZE), v = n.getParameter(n.MAX_CUBE_MAP_TEXTURE_SIZE), p = n.getParameter(n.MAX_VERTEX_ATTRIBS), u = n.getParameter(n.MAX_VERTEX_UNIFORM_VECTORS), b = n.getParameter(n.MAX_VARYING_VECTORS), S = n.getParameter(n.MAX_FRAGMENT_UNIFORM_VECTORS), T = m > 0, O = n.getParameter(n.MAX_SAMPLES);
  return {
    isWebGL2: !0,
    // keeping this for backwards compatibility
    getMaxAnisotropy: s,
    getMaxPrecision: l,
    textureFormatReadable: a,
    textureTypeReadable: o,
    precision: c,
    logarithmicDepthBuffer: f,
    maxTextures: d,
    maxVertexTextures: m,
    maxTextureSize: g,
    maxCubemapSize: v,
    maxAttributes: p,
    maxVertexUniforms: u,
    maxVaryings: b,
    maxFragmentUniforms: S,
    vertexTextures: T,
    maxSamples: O
  };
}
function fh(n) {
  const e = this;
  let t = null, i = 0, r = !1, s = !1;
  const a = new li(), o = new Oe(), l = { value: null, needsUpdate: !1 };
  this.uniform = l, this.numPlanes = 0, this.numIntersection = 0, this.init = function(f, d) {
    const m = f.length !== 0 || d || // enable state of previous frame - the clipping code has to
    // run another frame in order to reset the state:
    i !== 0 || r;
    return r = d, i = f.length, m;
  }, this.beginShadows = function() {
    s = !0, h(null);
  }, this.endShadows = function() {
    s = !1;
  }, this.setGlobalState = function(f, d) {
    t = h(f, d, 0);
  }, this.setState = function(f, d, m) {
    const g = f.clippingPlanes, v = f.clipIntersection, p = f.clipShadows, u = n.get(f);
    if (!r || g === null || g.length === 0 || s && !p)
      s ? h(null) : c();
    else {
      const b = s ? 0 : i, S = b * 4;
      let T = u.clippingState || null;
      l.value = T, T = h(g, d, S, m);
      for (let O = 0; O !== S; ++O)
        T[O] = t[O];
      u.clippingState = T, this.numIntersection = v ? this.numPlanes : 0, this.numPlanes += b;
    }
  };
  function c() {
    l.value !== t && (l.value = t, l.needsUpdate = i > 0), e.numPlanes = i, e.numIntersection = 0;
  }
  function h(f, d, m, g) {
    const v = f !== null ? f.length : 0;
    let p = null;
    if (v !== 0) {
      if (p = l.value, g !== !0 || p === null) {
        const u = m + v * 4, b = d.matrixWorldInverse;
        o.getNormalMatrix(b), (p === null || p.length < u) && (p = new Float32Array(u));
        for (let S = 0, T = m; S !== v; ++S, T += 4)
          a.copy(f[S]).applyMatrix4(b, o), a.normal.toArray(p, T), p[T + 3] = a.constant;
      }
      l.value = p, l.needsUpdate = !0;
    }
    return e.numPlanes = v, e.numIntersection = 0, p;
  }
}
const wi = -90, Ci = 1;
class ph extends pt {
  constructor(e, t, i) {
    super(), this.type = "CubeCamera", this.renderTarget = i, this.coordinateSystem = null, this.activeMipmapLevel = 0;
    const r = new Tt(wi, Ci, e, t);
    r.layers = this.layers, this.add(r);
    const s = new Tt(wi, Ci, e, t);
    s.layers = this.layers, this.add(s);
    const a = new Tt(wi, Ci, e, t);
    a.layers = this.layers, this.add(a);
    const o = new Tt(wi, Ci, e, t);
    o.layers = this.layers, this.add(o);
    const l = new Tt(wi, Ci, e, t);
    l.layers = this.layers, this.add(l);
    const c = new Tt(wi, Ci, e, t);
    c.layers = this.layers, this.add(c);
  }
  updateCoordinateSystem() {
    const e = this.coordinateSystem, t = this.children.concat(), [i, r, s, a, o, l] = t;
    for (const c of t) this.remove(c);
    if (e === 2e3)
      i.up.set(0, 1, 0), i.lookAt(1, 0, 0), r.up.set(0, 1, 0), r.lookAt(-1, 0, 0), s.up.set(0, 0, -1), s.lookAt(0, 1, 0), a.up.set(0, 0, 1), a.lookAt(0, -1, 0), o.up.set(0, 1, 0), o.lookAt(0, 0, 1), l.up.set(0, 1, 0), l.lookAt(0, 0, -1);
    else if (e === 2001)
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
    const [s, a, o, l, c, h] = this.children, f = e.getRenderTarget(), d = e.getActiveCubeFace(), m = e.getActiveMipmapLevel(), g = e.xr.enabled;
    e.xr.enabled = !1;
    const v = i.texture.generateMipmaps;
    i.texture.generateMipmaps = !1, e.setRenderTarget(i, 0, r), e.render(t, s), e.setRenderTarget(i, 1, r), e.render(t, a), e.setRenderTarget(i, 2, r), e.render(t, o), e.setRenderTarget(i, 3, r), e.render(t, l), e.setRenderTarget(i, 4, r), e.render(t, c), i.texture.generateMipmaps = v, e.setRenderTarget(i, 5, r), e.render(t, h), e.setRenderTarget(f, d, m), e.xr.enabled = g, i.texture.needsPMREMUpdate = !0;
  }
}
class la extends _t {
  constructor(e, t, i, r, s, a, o, l, c, h) {
    e = e !== void 0 ? e : [], t = t !== void 0 ? t : 301, super(e, t, i, r, s, a, o, l, c, h), this.isCubeTexture = !0, this.flipY = !1;
  }
  get images() {
    return this.image;
  }
  set images(e) {
    this.image = e;
  }
}
class mh extends di {
  constructor(e = 1, t = {}) {
    super(e, e, t), this.isWebGLCubeRenderTarget = !0;
    const i = { width: e, height: e, depth: 1 }, r = [i, i, i, i, i, i];
    this.texture = new la(r, t.mapping, t.wrapS, t.wrapT, t.magFilter, t.minFilter, t.format, t.type, t.anisotropy, t.colorSpace), this.texture.isRenderTargetTexture = !0, this.texture.generateMipmaps = t.generateMipmaps !== void 0 ? t.generateMipmaps : !1, this.texture.minFilter = t.minFilter !== void 0 ? t.minFilter : 1006;
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
    }, r = new ji(5, 5, 5), s = new jt({
      name: "CubemapFromEquirect",
      uniforms: Ii(i.uniforms),
      vertexShader: i.vertexShader,
      fragmentShader: i.fragmentShader,
      side: 1,
      blending: 0
    });
    s.uniforms.tEquirect.value = t;
    const a = new Ht(r, s), o = t.minFilter;
    return t.minFilter === 1008 && (t.minFilter = 1006), new ph(1, 10, this).update(e, a), t.minFilter = o, a.geometry.dispose(), a.material.dispose(), this;
  }
  clear(e, t, i, r) {
    const s = e.getRenderTarget();
    for (let a = 0; a < 6; a++)
      e.setRenderTarget(this, a), e.clear(t, i, r);
    e.setRenderTarget(s);
  }
}
function gh(n) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(a, o) {
    return o === 303 ? a.mapping = 301 : o === 304 && (a.mapping = 302), a;
  }
  function i(a) {
    if (a && a.isTexture) {
      const o = a.mapping;
      if (o === 303 || o === 304)
        if (e.has(a)) {
          const l = e.get(a).texture;
          return t(l, a.mapping);
        } else {
          const l = a.image;
          if (l && l.height > 0) {
            const c = new mh(l.height);
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
function _h(n) {
  let e = /* @__PURE__ */ new WeakMap(), t = null;
  function i(o) {
    if (o && o.isTexture) {
      const l = o.mapping, c = l === 303 || l === 304, h = l === 301 || l === 302;
      if (c || h) {
        let f = e.get(o);
        const d = f !== void 0 ? f.texture.pmremVersion : 0;
        if (o.isRenderTargetTexture && o.pmremVersion !== d)
          return t === null && (t = new vs(n)), f = c ? t.fromEquirectangular(o, f) : t.fromCubemap(o, f), f.texture.pmremVersion = o.pmremVersion, e.set(o, f), f.texture;
        if (f !== void 0)
          return f.texture;
        {
          const m = o.image;
          return c && m && m.height > 0 || h && m && r(m) ? (t === null && (t = new vs(n)), f = c ? t.fromEquirectangular(o) : t.fromCubemap(o), f.texture.pmremVersion = o.pmremVersion, e.set(o, f), o.addEventListener("dispose", s), f.texture) : null;
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
function vh(n) {
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
      return r === null && Ws("THREE.WebGLRenderer: " + i + " extension not supported."), r;
    }
  };
}
function xh(n, e, t, i) {
  const r = {}, s = /* @__PURE__ */ new WeakMap();
  function a(f) {
    const d = f.target;
    d.index !== null && e.remove(d.index);
    for (const g in d.attributes)
      e.remove(d.attributes[g]);
    for (const g in d.morphAttributes) {
      const v = d.morphAttributes[g];
      for (let p = 0, u = v.length; p < u; p++)
        e.remove(v[p]);
    }
    d.removeEventListener("dispose", a), delete r[d.id];
    const m = s.get(d);
    m && (e.remove(m), s.delete(d)), i.releaseStatesOfGeometry(d), d.isInstancedBufferGeometry === !0 && delete d._maxInstanceCount, t.memory.geometries--;
  }
  function o(f, d) {
    return r[d.id] === !0 || (d.addEventListener("dispose", a), r[d.id] = !0, t.memory.geometries++), d;
  }
  function l(f) {
    const d = f.attributes;
    for (const g in d)
      e.update(d[g], n.ARRAY_BUFFER);
    const m = f.morphAttributes;
    for (const g in m) {
      const v = m[g];
      for (let p = 0, u = v.length; p < u; p++)
        e.update(v[p], n.ARRAY_BUFFER);
    }
  }
  function c(f) {
    const d = [], m = f.index, g = f.attributes.position;
    let v = 0;
    if (m !== null) {
      const b = m.array;
      v = m.version;
      for (let S = 0, T = b.length; S < T; S += 3) {
        const O = b[S + 0], R = b[S + 1], w = b[S + 2];
        d.push(O, R, R, w, w, O);
      }
    } else if (g !== void 0) {
      const b = g.array;
      v = g.version;
      for (let S = 0, T = b.length / 3 - 1; S < T; S += 3) {
        const O = S + 0, R = S + 1, w = S + 2;
        d.push(O, R, R, w, w, O);
      }
    } else
      return;
    const p = new (ks(d) ? qs : Xs)(d, 1);
    p.version = v;
    const u = s.get(f);
    u && e.remove(u), s.set(f, p);
  }
  function h(f) {
    const d = s.get(f);
    if (d) {
      const m = f.index;
      m !== null && d.version < m.version && c(f);
    } else
      c(f);
    return s.get(f);
  }
  return {
    get: o,
    update: l,
    getWireframeAttribute: h
  };
}
function Sh(n, e, t) {
  let i;
  function r(d) {
    i = d;
  }
  let s, a;
  function o(d) {
    s = d.type, a = d.bytesPerElement;
  }
  function l(d, m) {
    n.drawElements(i, m, s, d * a), t.update(m, i, 1);
  }
  function c(d, m, g) {
    g !== 0 && (n.drawElementsInstanced(i, m, s, d * a, g), t.update(m, i, g));
  }
  function h(d, m, g) {
    if (g === 0) return;
    e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(i, m, 0, s, d, 0, g);
    let p = 0;
    for (let u = 0; u < g; u++)
      p += m[u];
    t.update(p, i, 1);
  }
  function f(d, m, g, v) {
    if (g === 0) return;
    const p = e.get("WEBGL_multi_draw");
    if (p === null)
      for (let u = 0; u < d.length; u++)
        c(d[u] / a, m[u], v[u]);
    else {
      p.multiDrawElementsInstancedWEBGL(i, m, 0, s, d, 0, v, 0, g);
      let u = 0;
      for (let b = 0; b < g; b++)
        u += m[b];
      for (let b = 0; b < v.length; b++)
        t.update(u, i, v[b]);
    }
  }
  this.setMode = r, this.setIndex = o, this.render = l, this.renderInstances = c, this.renderMultiDraw = h, this.renderMultiDrawInstances = f;
}
function Mh(n) {
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
class ca extends _t {
  constructor(e = null, t = 1, i = 1, r = 1) {
    super(null), this.isDataArrayTexture = !0, this.image = { data: e, width: t, height: i, depth: r }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1, this.layerUpdates = /* @__PURE__ */ new Set();
  }
  addLayerUpdate(e) {
    this.layerUpdates.add(e);
  }
  clearLayerUpdates() {
    this.layerUpdates.clear();
  }
}
function yh(n, e, t) {
  const i = /* @__PURE__ */ new WeakMap(), r = new $e();
  function s(a, o, l) {
    const c = a.morphTargetInfluences, h = o.morphAttributes.position || o.morphAttributes.normal || o.morphAttributes.color, f = h !== void 0 ? h.length : 0;
    let d = i.get(o);
    if (d === void 0 || d.count !== f) {
      let E = function() {
        w.dispose(), i.delete(o), o.removeEventListener("dispose", E);
      };
      d !== void 0 && d.texture.dispose();
      const m = o.morphAttributes.position !== void 0, g = o.morphAttributes.normal !== void 0, v = o.morphAttributes.color !== void 0, p = o.morphAttributes.position || [], u = o.morphAttributes.normal || [], b = o.morphAttributes.color || [];
      let S = 0;
      m === !0 && (S = 1), g === !0 && (S = 2), v === !0 && (S = 3);
      let T = o.attributes.position.count * S, O = 1;
      T > e.maxTextureSize && (O = Math.ceil(T / e.maxTextureSize), T = e.maxTextureSize);
      const R = new Float32Array(T * O * 4 * f), w = new ca(R, T, O, f);
      w.type = 1015, w.needsUpdate = !0;
      const I = S * 4;
      for (let x = 0; x < f; x++) {
        const C = p[x], W = u[x], z = b[x], V = T * O * 4 * x;
        for (let K = 0; K < C.count; K++) {
          const G = K * I;
          m === !0 && (r.fromBufferAttribute(C, K), R[V + G + 0] = r.x, R[V + G + 1] = r.y, R[V + G + 2] = r.z, R[V + G + 3] = 0), g === !0 && (r.fromBufferAttribute(W, K), R[V + G + 4] = r.x, R[V + G + 5] = r.y, R[V + G + 6] = r.z, R[V + G + 7] = 0), v === !0 && (r.fromBufferAttribute(z, K), R[V + G + 8] = r.x, R[V + G + 9] = r.y, R[V + G + 10] = r.z, R[V + G + 11] = z.itemSize === 4 ? r.w : 1);
        }
      }
      d = {
        count: f,
        texture: w,
        size: new le(T, O)
      }, i.set(o, d), o.addEventListener("dispose", E);
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
    l.getUniforms().setValue(n, "morphTargetsTexture", d.texture, t), l.getUniforms().setValue(n, "morphTargetsTextureSize", d.size);
  }
  return {
    update: s
  };
}
function Eh(n, e, t, i) {
  let r = /* @__PURE__ */ new WeakMap();
  function s(l) {
    const c = i.render.frame, h = l.geometry, f = e.get(l, h);
    if (r.get(f) !== c && (e.update(f), r.set(f, c)), l.isInstancedMesh && (l.hasEventListener("dispose", o) === !1 && l.addEventListener("dispose", o), r.get(l) !== c && (t.update(l.instanceMatrix, n.ARRAY_BUFFER), l.instanceColor !== null && t.update(l.instanceColor, n.ARRAY_BUFFER), r.set(l, c))), l.isSkinnedMesh) {
      const d = l.skeleton;
      r.get(d) !== c && (d.update(), r.set(d, c));
    }
    return f;
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
class Th extends _t {
  constructor(e = null, t = 1, i = 1, r = 1) {
    super(null), this.isData3DTexture = !0, this.image = { data: e, width: t, height: i, depth: r }, this.magFilter = 1003, this.minFilter = 1003, this.wrapR = 1001, this.generateMipmaps = !1, this.flipY = !1, this.unpackAlignment = 1;
  }
}
class ha extends _t {
  constructor(e, t, i, r, s, a, o, l, c, h = 1026) {
    if (h !== 1026 && h !== 1027)
      throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");
    i === void 0 && h === 1026 && (i = 1014), i === void 0 && h === 1027 && (i = 1020), super(null, r, s, a, o, l, h, i, c), this.isDepthTexture = !0, this.image = { width: e, height: t }, this.magFilter = o !== void 0 ? o : 1003, this.minFilter = l !== void 0 ? l : 1003, this.flipY = !1, this.generateMipmaps = !1, this.compareFunction = null;
  }
  copy(e) {
    return super.copy(e), this.compareFunction = e.compareFunction, this;
  }
  toJSON(e) {
    const t = super.toJSON(e);
    return this.compareFunction !== null && (t.compareFunction = this.compareFunction), t;
  }
}
const ua = /* @__PURE__ */ new _t(), As = /* @__PURE__ */ new ha(1, 1), da = /* @__PURE__ */ new ca(), fa = /* @__PURE__ */ new Th(), pa = /* @__PURE__ */ new la(), bs = [], Rs = [], ws = new Float32Array(16), Cs = new Float32Array(9), Ps = new Float32Array(4);
function Oi(n, e, t) {
  const i = n[0];
  if (i <= 0 || i > 0) return n;
  const r = e * t;
  let s = bs[r];
  if (s === void 0 && (s = new Float32Array(r), bs[r] = s), e !== 0) {
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
function On(n, e) {
  let t = Rs[e];
  t === void 0 && (t = new Int32Array(e), Rs[e] = t);
  for (let i = 0; i !== e; ++i)
    t[i] = n.allocateTextureUnit();
  return t;
}
function Ah(n, e) {
  const t = this.cache;
  t[0] !== e && (n.uniform1f(this.addr, e), t[0] = e);
}
function bh(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (n.uniform2f(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (at(t, e)) return;
    n.uniform2fv(this.addr, e), ot(t, e);
  }
}
function Rh(n, e) {
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
function wh(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (n.uniform4f(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (at(t, e)) return;
    n.uniform4fv(this.addr, e), ot(t, e);
  }
}
function Ch(n, e) {
  const t = this.cache, i = e.elements;
  if (i === void 0) {
    if (at(t, e)) return;
    n.uniformMatrix2fv(this.addr, !1, e), ot(t, e);
  } else {
    if (at(t, i)) return;
    Ps.set(i), n.uniformMatrix2fv(this.addr, !1, Ps), ot(t, i);
  }
}
function Ph(n, e) {
  const t = this.cache, i = e.elements;
  if (i === void 0) {
    if (at(t, e)) return;
    n.uniformMatrix3fv(this.addr, !1, e), ot(t, e);
  } else {
    if (at(t, i)) return;
    Cs.set(i), n.uniformMatrix3fv(this.addr, !1, Cs), ot(t, i);
  }
}
function Lh(n, e) {
  const t = this.cache, i = e.elements;
  if (i === void 0) {
    if (at(t, e)) return;
    n.uniformMatrix4fv(this.addr, !1, e), ot(t, e);
  } else {
    if (at(t, i)) return;
    ws.set(i), n.uniformMatrix4fv(this.addr, !1, ws), ot(t, i);
  }
}
function Dh(n, e) {
  const t = this.cache;
  t[0] !== e && (n.uniform1i(this.addr, e), t[0] = e);
}
function Uh(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (n.uniform2i(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (at(t, e)) return;
    n.uniform2iv(this.addr, e), ot(t, e);
  }
}
function Ih(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (n.uniform3i(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (at(t, e)) return;
    n.uniform3iv(this.addr, e), ot(t, e);
  }
}
function Nh(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (n.uniform4i(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (at(t, e)) return;
    n.uniform4iv(this.addr, e), ot(t, e);
  }
}
function Fh(n, e) {
  const t = this.cache;
  t[0] !== e && (n.uniform1ui(this.addr, e), t[0] = e);
}
function Oh(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y) && (n.uniform2ui(this.addr, e.x, e.y), t[0] = e.x, t[1] = e.y);
  else {
    if (at(t, e)) return;
    n.uniform2uiv(this.addr, e), ot(t, e);
  }
}
function Bh(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z) && (n.uniform3ui(this.addr, e.x, e.y, e.z), t[0] = e.x, t[1] = e.y, t[2] = e.z);
  else {
    if (at(t, e)) return;
    n.uniform3uiv(this.addr, e), ot(t, e);
  }
}
function zh(n, e) {
  const t = this.cache;
  if (e.x !== void 0)
    (t[0] !== e.x || t[1] !== e.y || t[2] !== e.z || t[3] !== e.w) && (n.uniform4ui(this.addr, e.x, e.y, e.z, e.w), t[0] = e.x, t[1] = e.y, t[2] = e.z, t[3] = e.w);
  else {
    if (at(t, e)) return;
    n.uniform4uiv(this.addr, e), ot(t, e);
  }
}
function Gh(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r);
  let s;
  this.type === n.SAMPLER_2D_SHADOW ? (As.compareFunction = 515, s = As) : s = ua, t.setTexture2D(e || s, r);
}
function Vh(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r), t.setTexture3D(e || fa, r);
}
function Hh(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r), t.setTextureCube(e || pa, r);
}
function kh(n, e, t) {
  const i = this.cache, r = t.allocateTextureUnit();
  i[0] !== r && (n.uniform1i(this.addr, r), i[0] = r), t.setTexture2DArray(e || da, r);
}
function Wh(n) {
  switch (n) {
    case 5126:
      return Ah;
    case 35664:
      return bh;
    case 35665:
      return Rh;
    case 35666:
      return wh;
    case 35674:
      return Ch;
    case 35675:
      return Ph;
    case 35676:
      return Lh;
    case 5124:
    case 35670:
      return Dh;
    case 35667:
    case 35671:
      return Uh;
    case 35668:
    case 35672:
      return Ih;
    case 35669:
    case 35673:
      return Nh;
    case 5125:
      return Fh;
    case 36294:
      return Oh;
    case 36295:
      return Bh;
    case 36296:
      return zh;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return Gh;
    case 35679:
    case 36299:
    case 36307:
      return Vh;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return Hh;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return kh;
  }
}
function Xh(n, e) {
  n.uniform1fv(this.addr, e);
}
function qh(n, e) {
  const t = Oi(e, this.size, 2);
  n.uniform2fv(this.addr, t);
}
function Yh(n, e) {
  const t = Oi(e, this.size, 3);
  n.uniform3fv(this.addr, t);
}
function Kh(n, e) {
  const t = Oi(e, this.size, 4);
  n.uniform4fv(this.addr, t);
}
function Zh(n, e) {
  const t = Oi(e, this.size, 4);
  n.uniformMatrix2fv(this.addr, !1, t);
}
function Jh(n, e) {
  const t = Oi(e, this.size, 9);
  n.uniformMatrix3fv(this.addr, !1, t);
}
function $h(n, e) {
  const t = Oi(e, this.size, 16);
  n.uniformMatrix4fv(this.addr, !1, t);
}
function jh(n, e) {
  n.uniform1iv(this.addr, e);
}
function Qh(n, e) {
  n.uniform2iv(this.addr, e);
}
function eu(n, e) {
  n.uniform3iv(this.addr, e);
}
function tu(n, e) {
  n.uniform4iv(this.addr, e);
}
function iu(n, e) {
  n.uniform1uiv(this.addr, e);
}
function nu(n, e) {
  n.uniform2uiv(this.addr, e);
}
function ru(n, e) {
  n.uniform3uiv(this.addr, e);
}
function su(n, e) {
  n.uniform4uiv(this.addr, e);
}
function au(n, e, t) {
  const i = this.cache, r = e.length, s = On(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2D(e[a] || ua, s[a]);
}
function ou(n, e, t) {
  const i = this.cache, r = e.length, s = On(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture3D(e[a] || fa, s[a]);
}
function lu(n, e, t) {
  const i = this.cache, r = e.length, s = On(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTextureCube(e[a] || pa, s[a]);
}
function cu(n, e, t) {
  const i = this.cache, r = e.length, s = On(t, r);
  at(i, s) || (n.uniform1iv(this.addr, s), ot(i, s));
  for (let a = 0; a !== r; ++a)
    t.setTexture2DArray(e[a] || da, s[a]);
}
function hu(n) {
  switch (n) {
    case 5126:
      return Xh;
    case 35664:
      return qh;
    case 35665:
      return Yh;
    case 35666:
      return Kh;
    case 35674:
      return Zh;
    case 35675:
      return Jh;
    case 35676:
      return $h;
    case 5124:
    case 35670:
      return jh;
    case 35667:
    case 35671:
      return Qh;
    case 35668:
    case 35672:
      return eu;
    case 35669:
    case 35673:
      return tu;
    case 5125:
      return iu;
    case 36294:
      return nu;
    case 36295:
      return ru;
    case 36296:
      return su;
    case 35678:
    case 36198:
    case 36298:
    case 36306:
    case 35682:
      return au;
    case 35679:
    case 36299:
    case 36307:
      return ou;
    case 35680:
    case 36300:
    case 36308:
    case 36293:
      return lu;
    case 36289:
    case 36303:
    case 36311:
    case 36292:
      return cu;
  }
}
class uu {
  constructor(e, t, i) {
    this.id = e, this.addr = i, this.cache = [], this.type = t.type, this.setValue = Wh(t.type);
  }
}
class du {
  constructor(e, t, i) {
    this.id = e, this.addr = i, this.cache = [], this.type = t.type, this.size = t.size, this.setValue = hu(t.type);
  }
}
class fu {
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
const vr = /(\w+)(\])?(\[|\.)?/g;
function Ls(n, e) {
  n.seq.push(e), n.map[e.id] = e;
}
function pu(n, e, t) {
  const i = n.name, r = i.length;
  for (vr.lastIndex = 0; ; ) {
    const s = vr.exec(i), a = vr.lastIndex;
    let o = s[1];
    const l = s[2] === "]", c = s[3];
    if (l && (o = o | 0), c === void 0 || c === "[" && a + 2 === r) {
      Ls(t, c === void 0 ? new uu(o, n, e) : new du(o, n, e));
      break;
    } else {
      let f = t.map[o];
      f === void 0 && (f = new fu(o), Ls(t, f)), t = f;
    }
  }
}
class Cn {
  constructor(e, t) {
    this.seq = [], this.map = {};
    const i = e.getProgramParameter(t, e.ACTIVE_UNIFORMS);
    for (let r = 0; r < i; ++r) {
      const s = e.getActiveUniform(t, r), a = e.getUniformLocation(t, s.name);
      pu(s, a, this);
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
function Ds(n, e, t) {
  const i = n.createShader(e);
  return n.shaderSource(i, t), n.compileShader(i), i;
}
const mu = 37297;
let gu = 0;
function _u(n, e) {
  const t = n.split(`
`), i = [], r = Math.max(e - 6, 0), s = Math.min(e + 6, t.length);
  for (let a = r; a < s; a++) {
    const o = a + 1;
    i.push(`${o === e ? ">" : " "} ${o}: ${t[a]}`);
  }
  return i.join(`
`);
}
function vu(n) {
  const e = Ze.getPrimaries(Ze.workingColorSpace), t = Ze.getPrimaries(n);
  let i;
  switch (e === t ? i = "" : e === Dn && t === Ln ? i = "LinearDisplayP3ToLinearSRGB" : e === Ln && t === Dn && (i = "LinearSRGBToLinearDisplayP3"), n) {
    case Qt:
    case In:
      return [i, "LinearTransferOETF"];
    case Pt:
    case Rr:
      return [i, "sRGBTransferOETF"];
    default:
      return console.warn("THREE.WebGLProgram: Unsupported color space:", n), [i, "LinearTransferOETF"];
  }
}
function Us(n, e, t) {
  const i = n.getShaderParameter(e, n.COMPILE_STATUS), r = n.getShaderInfoLog(e).trim();
  if (i && r === "") return "";
  const s = /ERROR: 0:(\d+)/.exec(r);
  if (s) {
    const a = parseInt(s[1]);
    return t.toUpperCase() + `

` + r + `

` + _u(n.getShaderSource(e), a);
  } else
    return r;
}
function xu(n, e) {
  const t = vu(e);
  return `vec4 ${n}( vec4 value ) { return ${t[0]}( ${t[1]}( value ) ); }`;
}
function Su(n, e) {
  let t;
  switch (e) {
    case 1:
      t = "Linear";
      break;
    case 2:
      t = "Reinhard";
      break;
    case 3:
      t = "OptimizedCineon";
      break;
    case 4:
      t = "ACESFilmic";
      break;
    case 6:
      t = "AgX";
      break;
    case 7:
      t = "Neutral";
      break;
    case 5:
      t = "Custom";
      break;
    default:
      console.warn("THREE.WebGLProgram: Unsupported toneMapping:", e), t = "Linear";
  }
  return "vec3 " + n + "( vec3 color ) { return " + t + "ToneMapping( color ); }";
}
function Mu(n) {
  return [
    n.extensionClipCullDistance ? "#extension GL_ANGLE_clip_cull_distance : require" : "",
    n.extensionMultiDraw ? "#extension GL_ANGLE_multi_draw : require" : ""
  ].filter(Wi).join(`
`);
}
function yu(n) {
  const e = [];
  for (const t in n) {
    const i = n[t];
    i !== !1 && e.push("#define " + t + " " + i);
  }
  return e.join(`
`);
}
function Eu(n, e) {
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
function Wi(n) {
  return n !== "";
}
function Is(n, e) {
  const t = e.numSpotLightShadows + e.numSpotLightMaps - e.numSpotLightShadowsWithMaps;
  return n.replace(/NUM_DIR_LIGHTS/g, e.numDirLights).replace(/NUM_SPOT_LIGHTS/g, e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g, e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g, t).replace(/NUM_RECT_AREA_LIGHTS/g, e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g, e.numPointLights).replace(/NUM_HEMI_LIGHTS/g, e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g, e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g, e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g, e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g, e.numPointLightShadows);
}
function Ns(n, e) {
  return n.replace(/NUM_CLIPPING_PLANES/g, e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g, e.numClippingPlanes - e.numClipIntersection);
}
const Tu = /^[ \t]*#include +<([\w\d./]+)>/gm;
function br(n) {
  return n.replace(Tu, bu);
}
const Au = /* @__PURE__ */ new Map();
function bu(n, e) {
  let t = Fe[e];
  if (t === void 0) {
    const i = Au.get(e);
    if (i !== void 0)
      t = Fe[i], console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.', e, i);
    else
      throw new Error("Can not resolve #include <" + e + ">");
  }
  return br(t);
}
const Ru = /#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;
function Fs(n) {
  return n.replace(Ru, wu);
}
function wu(n, e, t, i) {
  let r = "";
  for (let s = parseInt(e); s < parseInt(t); s++)
    r += i.replace(/\[\s*i\s*\]/g, "[ " + s + " ]").replace(/UNROLLED_LOOP_INDEX/g, s);
  return r;
}
function Os(n) {
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
function Cu(n) {
  let e = "SHADOWMAP_TYPE_BASIC";
  return n.shadowMapType === 1 ? e = "SHADOWMAP_TYPE_PCF" : n.shadowMapType === 2 ? e = "SHADOWMAP_TYPE_PCF_SOFT" : n.shadowMapType === 3 && (e = "SHADOWMAP_TYPE_VSM"), e;
}
function Pu(n) {
  let e = "ENVMAP_TYPE_CUBE";
  if (n.envMap)
    switch (n.envMapMode) {
      case 301:
      case 302:
        e = "ENVMAP_TYPE_CUBE";
        break;
      case 306:
        e = "ENVMAP_TYPE_CUBE_UV";
        break;
    }
  return e;
}
function Lu(n) {
  let e = "ENVMAP_MODE_REFLECTION";
  if (n.envMap)
    switch (n.envMapMode) {
      case 302:
        e = "ENVMAP_MODE_REFRACTION";
        break;
    }
  return e;
}
function Du(n) {
  let e = "ENVMAP_BLENDING_NONE";
  if (n.envMap)
    switch (n.combine) {
      case 0:
        e = "ENVMAP_BLENDING_MULTIPLY";
        break;
      case 1:
        e = "ENVMAP_BLENDING_MIX";
        break;
      case 2:
        e = "ENVMAP_BLENDING_ADD";
        break;
    }
  return e;
}
function Uu(n) {
  const e = n.envMapCubeUVHeight;
  if (e === null) return null;
  const t = Math.log2(e) - 2, i = 1 / e;
  return { texelWidth: 1 / (3 * Math.max(Math.pow(2, t), 7 * 16)), texelHeight: i, maxMip: t };
}
function Iu(n, e, t, i) {
  const r = n.getContext(), s = t.defines;
  let a = t.vertexShader, o = t.fragmentShader;
  const l = Cu(t), c = Pu(t), h = Lu(t), f = Du(t), d = Uu(t), m = Mu(t), g = yu(s), v = r.createProgram();
  let p, u, b = t.glslVersion ? "#version " + t.glslVersion + `
` : "";
  t.isRawShaderMaterial ? (p = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(Wi).join(`
`), p.length > 0 && (p += `
`), u = [
    "#define SHADER_TYPE " + t.shaderType,
    "#define SHADER_NAME " + t.shaderName,
    g
  ].filter(Wi).join(`
`), u.length > 0 && (u += `
`)) : (p = [
    Os(t),
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
  ].filter(Wi).join(`
`), u = [
    Os(t),
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
    t.envMap ? "#define " + f : "",
    d ? "#define CUBEUV_TEXEL_WIDTH " + d.texelWidth : "",
    d ? "#define CUBEUV_TEXEL_HEIGHT " + d.texelHeight : "",
    d ? "#define CUBEUV_MAX_MIP " + d.maxMip + ".0" : "",
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
    t.toneMapping !== 0 ? "#define TONE_MAPPING" : "",
    t.toneMapping !== 0 ? Fe.tonemapping_pars_fragment : "",
    // this code is required here because it is used by the toneMapping() function defined below
    t.toneMapping !== 0 ? Su("toneMapping", t.toneMapping) : "",
    t.dithering ? "#define DITHERING" : "",
    t.opaque ? "#define OPAQUE" : "",
    Fe.colorspace_pars_fragment,
    // this code is required here because it is used by the various encoding/decoding function defined below
    xu("linearToOutputTexel", t.outputColorSpace),
    t.useDepthPacking ? "#define DEPTH_PACKING " + t.depthPacking : "",
    `
`
  ].filter(Wi).join(`
`)), a = br(a), a = Is(a, t), a = Ns(a, t), o = br(o), o = Is(o, t), o = Ns(o, t), a = Fs(a), o = Fs(o), t.isRawShaderMaterial !== !0 && (b = `#version 300 es
`, p = [
    m,
    "#define attribute in",
    "#define varying out",
    "#define texture2D texture"
  ].join(`
`) + `
` + p, u = [
    "#define varying in",
    t.glslVersion === kr ? "" : "layout(location = 0) out highp vec4 pc_fragColor;",
    t.glslVersion === kr ? "" : "#define gl_FragColor pc_fragColor",
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
  const S = b + p + a, T = b + u + o, O = Ds(r, r.VERTEX_SHADER, S), R = Ds(r, r.FRAGMENT_SHADER, T);
  r.attachShader(v, O), r.attachShader(v, R), t.index0AttributeName !== void 0 ? r.bindAttribLocation(v, 0, t.index0AttributeName) : t.morphTargets === !0 && r.bindAttribLocation(v, 0, "position"), r.linkProgram(v);
  function w(C) {
    if (n.debug.checkShaderErrors) {
      const W = r.getProgramInfoLog(v).trim(), z = r.getShaderInfoLog(O).trim(), V = r.getShaderInfoLog(R).trim();
      let K = !0, G = !0;
      if (r.getProgramParameter(v, r.LINK_STATUS) === !1)
        if (K = !1, typeof n.debug.onShaderError == "function")
          n.debug.onShaderError(r, v, O, R);
        else {
          const Q = Us(r, O, "vertex"), H = Us(r, R, "fragment");
          console.error(
            "THREE.WebGLProgram: Shader Error " + r.getError() + " - VALIDATE_STATUS " + r.getProgramParameter(v, r.VALIDATE_STATUS) + `

Material Name: ` + C.name + `
Material Type: ` + C.type + `

Program Info Log: ` + W + `
` + Q + `
` + H
          );
        }
      else W !== "" ? console.warn("THREE.WebGLProgram: Program Info Log:", W) : (z === "" || V === "") && (G = !1);
      G && (C.diagnostics = {
        runnable: K,
        programLog: W,
        vertexShader: {
          log: z,
          prefix: p
        },
        fragmentShader: {
          log: V,
          prefix: u
        }
      });
    }
    r.deleteShader(O), r.deleteShader(R), I = new Cn(r, v), E = Eu(r, v);
  }
  let I;
  this.getUniforms = function() {
    return I === void 0 && w(this), I;
  };
  let E;
  this.getAttributes = function() {
    return E === void 0 && w(this), E;
  };
  let x = t.rendererExtensionParallelShaderCompile === !1;
  return this.isReady = function() {
    return x === !1 && (x = r.getProgramParameter(v, mu)), x;
  }, this.destroy = function() {
    i.releaseStatesOfProgram(this), r.deleteProgram(v), this.program = void 0;
  }, this.type = t.shaderType, this.name = t.shaderName, this.id = gu++, this.cacheKey = e, this.usedTimes = 1, this.program = v, this.vertexShader = O, this.fragmentShader = R, this;
}
let Nu = 0;
class Fu {
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
    return i === void 0 && (i = new Ou(e), t.set(e, i)), i;
  }
}
class Ou {
  constructor(e) {
    this.id = Nu++, this.code = e, this.usedTimes = 0;
  }
}
function Bu(n, e, t, i, r, s, a) {
  const o = new wr(), l = new Fu(), c = /* @__PURE__ */ new Set(), h = [], f = r.logarithmicDepthBuffer, d = r.vertexTextures;
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
    const V = W.fog, K = z.geometry, G = E.isMeshStandardMaterial ? W.environment : null, Q = (E.isMeshStandardMaterial ? t : e).get(E.envMap || G), H = Q && Q.mapping === 306 ? Q.image.height : null, fe = g[E.type];
    E.precision !== null && (m = r.getMaxPrecision(E.precision), m !== E.precision && console.warn("THREE.WebGLProgram.getParameters:", E.precision, "not supported, using", m, "instead."));
    const xe = K.morphAttributes.position || K.morphAttributes.normal || K.morphAttributes.color, me = xe !== void 0 ? xe.length : 0;
    let Be = 0;
    K.morphAttributes.position !== void 0 && (Be = 1), K.morphAttributes.normal !== void 0 && (Be = 2), K.morphAttributes.color !== void 0 && (Be = 3);
    let We, k, ee, _e;
    if (fe) {
      const Xe = Lt[fe];
      We = Xe.vertexShader, k = Xe.fragmentShader;
    } else
      We = E.vertexShader, k = E.fragmentShader, l.update(E), ee = l.getVertexShaderID(E), _e = l.getFragmentShaderID(E);
    const ce = n.getRenderTarget(), Ce = z.isInstancedMesh === !0, Ne = z.isBatchedMesh === !0, Pe = !!E.map, He = !!E.matcap, y = !!Q, ie = !!E.aoMap, j = !!E.lightMap, he = !!E.bumpMap, X = !!E.normalMap, Ae = !!E.displacementMap, ue = !!E.emissiveMap, ve = !!E.metalnessMap, A = !!E.roughnessMap, _ = E.anisotropy > 0, F = E.clearcoat > 0, $ = E.dispersion > 0, J = E.iridescence > 0, Z = E.sheen > 0, Te = E.transmission > 0, ae = _ && !!E.anisotropyMap, ge = F && !!E.clearcoatMap, Ie = F && !!E.clearcoatNormalMap, te = F && !!E.clearcoatRoughnessMap, pe = J && !!E.iridescenceMap, Ge = J && !!E.iridescenceThicknessMap, De = Z && !!E.sheenColorMap, Se = Z && !!E.sheenRoughnessMap, Ue = !!E.specularMap, ze = !!E.specularColorMap, Qe = !!E.specularIntensityMap, P = Te && !!E.transmissionMap, ne = Te && !!E.thicknessMap, q = !!E.gradientMap, Y = !!E.alphaMap, se = E.alphaTest > 0, Re = !!E.alphaHash, Ve = !!E.extensions;
    let nt = 0;
    E.toneMapped && (ce === null || ce.isXRRenderTarget === !0) && (nt = n.toneMapping);
    const ct = {
      shaderID: fe,
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
      supportsVertexTextures: d,
      outputColorSpace: ce === null ? n.outputColorSpace : ce.isXRRenderTarget === !0 ? ce.texture.colorSpace : Qt,
      alphaToCoverage: !!E.alphaToCoverage,
      map: Pe,
      matcap: He,
      envMap: y,
      envMapMode: y && Q.mapping,
      envMapCubeUVHeight: H,
      aoMap: ie,
      lightMap: j,
      bumpMap: he,
      normalMap: X,
      displacementMap: d && Ae,
      emissiveMap: ue,
      normalMapObjectSpace: X && E.normalMapType === 1,
      normalMapTangentSpace: X && E.normalMapType === 0,
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
      iridescenceThicknessMap: Ge,
      sheen: Z,
      sheenColorMap: De,
      sheenRoughnessMap: Se,
      specularMap: Ue,
      specularColorMap: ze,
      specularIntensityMap: Qe,
      transmission: Te,
      transmissionMap: P,
      thicknessMap: ne,
      gradientMap: q,
      opaque: E.transparent === !1 && E.blending === 1 && E.alphaToCoverage === !1,
      alphaMap: Y,
      alphaTest: se,
      alphaHash: Re,
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
      iridescenceThicknessMapUv: Ge && v(E.iridescenceThicknessMap.channel),
      sheenColorMapUv: De && v(E.sheenColorMap.channel),
      sheenRoughnessMapUv: Se && v(E.sheenRoughnessMap.channel),
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
      fog: !!V,
      useFog: E.fog === !0,
      fogExp2: !!V && V.isFogExp2,
      flatShading: E.flatShading === !0,
      sizeAttenuation: E.sizeAttenuation === !0,
      logarithmicDepthBuffer: f,
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
      doubleSided: E.side === 2,
      flipSided: E.side === 1,
      useDepthPacking: E.depthPacking >= 0,
      depthPacking: E.depthPacking || 0,
      index0AttributeName: E.index0AttributeName,
      extensionClipCullDistance: Ve && E.extensions.clipCullDistance === !0 && i.has("WEBGL_clip_cull_distance"),
      extensionMultiDraw: (Ve && E.extensions.multiDraw === !0 || Ne) && i.has("WEBGL_multi_draw"),
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
    return E.isRawShaderMaterial === !1 && (b(x, E), S(x, E), x.push(n.outputColorSpace)), x.push(E.customProgramCacheKey), x.join();
  }
  function b(E, x) {
    E.push(x.precision), E.push(x.outputColorSpace), E.push(x.envMapMode), E.push(x.envMapCubeUVHeight), E.push(x.mapUv), E.push(x.alphaMapUv), E.push(x.lightMapUv), E.push(x.aoMapUv), E.push(x.bumpMapUv), E.push(x.normalMapUv), E.push(x.displacementMapUv), E.push(x.emissiveMapUv), E.push(x.metalnessMapUv), E.push(x.roughnessMapUv), E.push(x.anisotropyMapUv), E.push(x.clearcoatMapUv), E.push(x.clearcoatNormalMapUv), E.push(x.clearcoatRoughnessMapUv), E.push(x.iridescenceMapUv), E.push(x.iridescenceThicknessMapUv), E.push(x.sheenColorMapUv), E.push(x.sheenRoughnessMapUv), E.push(x.specularMapUv), E.push(x.specularColorMapUv), E.push(x.specularIntensityMapUv), E.push(x.transmissionMapUv), E.push(x.thicknessMapUv), E.push(x.combine), E.push(x.fogExp2), E.push(x.sizeAttenuation), E.push(x.morphTargetsCount), E.push(x.morphAttributeCount), E.push(x.numDirLights), E.push(x.numPointLights), E.push(x.numSpotLights), E.push(x.numSpotLightMaps), E.push(x.numHemiLights), E.push(x.numRectAreaLights), E.push(x.numDirLightShadows), E.push(x.numPointLightShadows), E.push(x.numSpotLightShadows), E.push(x.numSpotLightShadowsWithMaps), E.push(x.numLightProbes), E.push(x.shadowMapType), E.push(x.toneMapping), E.push(x.numClippingPlanes), E.push(x.numClipIntersection), E.push(x.depthPacking);
  }
  function S(E, x) {
    o.disableAll(), x.supportsVertexTextures && o.enable(0), x.instancing && o.enable(1), x.instancingColor && o.enable(2), x.instancingMorph && o.enable(3), x.matcap && o.enable(4), x.envMap && o.enable(5), x.normalMapObjectSpace && o.enable(6), x.normalMapTangentSpace && o.enable(7), x.clearcoat && o.enable(8), x.iridescence && o.enable(9), x.alphaTest && o.enable(10), x.vertexColors && o.enable(11), x.vertexAlphas && o.enable(12), x.vertexUv1s && o.enable(13), x.vertexUv2s && o.enable(14), x.vertexUv3s && o.enable(15), x.vertexTangents && o.enable(16), x.anisotropy && o.enable(17), x.alphaHash && o.enable(18), x.batching && o.enable(19), x.dispersion && o.enable(20), x.batchingColor && o.enable(21), E.push(o.mask), o.disableAll(), x.fog && o.enable(0), x.useFog && o.enable(1), x.flatShading && o.enable(2), x.logarithmicDepthBuffer && o.enable(3), x.skinning && o.enable(4), x.morphTargets && o.enable(5), x.morphNormals && o.enable(6), x.morphColors && o.enable(7), x.premultipliedAlpha && o.enable(8), x.shadowMapEnabled && o.enable(9), x.doubleSided && o.enable(10), x.flipSided && o.enable(11), x.useDepthPacking && o.enable(12), x.dithering && o.enable(13), x.transmission && o.enable(14), x.sheen && o.enable(15), x.opaque && o.enable(16), x.pointsUvs && o.enable(17), x.decodeVideoTexture && o.enable(18), x.alphaToCoverage && o.enable(19), E.push(o.mask);
  }
  function T(E) {
    const x = g[E.type];
    let C;
    if (x) {
      const W = Lt[x];
      C = _o.clone(W.uniforms);
    } else
      C = E.uniforms;
    return C;
  }
  function O(E, x) {
    let C;
    for (let W = 0, z = h.length; W < z; W++) {
      const V = h[W];
      if (V.cacheKey === x) {
        C = V, ++C.usedTimes;
        break;
      }
    }
    return C === void 0 && (C = new Iu(n, x, E, s), h.push(C)), C;
  }
  function R(E) {
    if (--E.usedTimes === 0) {
      const x = h.indexOf(E);
      h[x] = h[h.length - 1], h.pop(), E.destroy();
    }
  }
  function w(E) {
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
    releaseProgram: R,
    releaseShaderCache: w,
    // Exposed for resource monitoring & error feedback via renderer.info:
    programs: h,
    dispose: I
  };
}
function zu() {
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
function Gu(n, e) {
  return n.groupOrder !== e.groupOrder ? n.groupOrder - e.groupOrder : n.renderOrder !== e.renderOrder ? n.renderOrder - e.renderOrder : n.material.id !== e.material.id ? n.material.id - e.material.id : n.z !== e.z ? n.z - e.z : n.id - e.id;
}
function Bs(n, e) {
  return n.groupOrder !== e.groupOrder ? n.groupOrder - e.groupOrder : n.renderOrder !== e.renderOrder ? n.renderOrder - e.renderOrder : n.z !== e.z ? e.z - n.z : n.id - e.id;
}
function zs() {
  const n = [];
  let e = 0;
  const t = [], i = [], r = [];
  function s() {
    e = 0, t.length = 0, i.length = 0, r.length = 0;
  }
  function a(f, d, m, g, v, p) {
    let u = n[e];
    return u === void 0 ? (u = {
      id: f.id,
      object: f,
      geometry: d,
      material: m,
      groupOrder: g,
      renderOrder: f.renderOrder,
      z: v,
      group: p
    }, n[e] = u) : (u.id = f.id, u.object = f, u.geometry = d, u.material = m, u.groupOrder = g, u.renderOrder = f.renderOrder, u.z = v, u.group = p), e++, u;
  }
  function o(f, d, m, g, v, p) {
    const u = a(f, d, m, g, v, p);
    m.transmission > 0 ? i.push(u) : m.transparent === !0 ? r.push(u) : t.push(u);
  }
  function l(f, d, m, g, v, p) {
    const u = a(f, d, m, g, v, p);
    m.transmission > 0 ? i.unshift(u) : m.transparent === !0 ? r.unshift(u) : t.unshift(u);
  }
  function c(f, d) {
    t.length > 1 && t.sort(f || Gu), i.length > 1 && i.sort(d || Bs), r.length > 1 && r.sort(d || Bs);
  }
  function h() {
    for (let f = e, d = n.length; f < d; f++) {
      const m = n[f];
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
function Vu() {
  let n = /* @__PURE__ */ new WeakMap();
  function e(i, r) {
    const s = n.get(i);
    let a;
    return s === void 0 ? (a = new zs(), n.set(i, [a])) : r >= s.length ? (a = new zs(), s.push(a)) : a = s[r], a;
  }
  function t() {
    n = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: e,
    dispose: t
  };
}
function Hu() {
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
function ku() {
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
let Wu = 0;
function Xu(n, e) {
  return (e.castShadow ? 2 : 0) - (n.castShadow ? 2 : 0) + (e.map ? 1 : 0) - (n.map ? 1 : 0);
}
function qu(n) {
  const e = new Hu(), t = ku(), i = {
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
    let h = 0, f = 0, d = 0;
    for (let E = 0; E < 9; E++) i.probe[E].set(0, 0, 0);
    let m = 0, g = 0, v = 0, p = 0, u = 0, b = 0, S = 0, T = 0, O = 0, R = 0, w = 0;
    c.sort(Xu);
    for (let E = 0, x = c.length; E < x; E++) {
      const C = c[E], W = C.color, z = C.intensity, V = C.distance, K = C.shadow && C.shadow.map ? C.shadow.map.texture : null;
      if (C.isAmbientLight)
        h += W.r * z, f += W.g * z, d += W.b * z;
      else if (C.isLightProbe) {
        for (let G = 0; G < 9; G++)
          i.probe[G].addScaledVector(C.sh.coefficients[G], z);
        w++;
      } else if (C.isDirectionalLight) {
        const G = e.get(C);
        if (G.color.copy(C.color).multiplyScalar(C.intensity), C.castShadow) {
          const Q = C.shadow, H = t.get(C);
          H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, i.directionalShadow[m] = H, i.directionalShadowMap[m] = K, i.directionalShadowMatrix[m] = C.shadow.matrix, b++;
        }
        i.directional[m] = G, m++;
      } else if (C.isSpotLight) {
        const G = e.get(C);
        G.position.setFromMatrixPosition(C.matrixWorld), G.color.copy(W).multiplyScalar(z), G.distance = V, G.coneCos = Math.cos(C.angle), G.penumbraCos = Math.cos(C.angle * (1 - C.penumbra)), G.decay = C.decay, i.spot[v] = G;
        const Q = C.shadow;
        if (C.map && (i.spotLightMap[O] = C.map, O++, Q.updateMatrices(C), C.castShadow && R++), i.spotLightMatrix[v] = Q.matrix, C.castShadow) {
          const H = t.get(C);
          H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, i.spotShadow[v] = H, i.spotShadowMap[v] = K, T++;
        }
        v++;
      } else if (C.isRectAreaLight) {
        const G = e.get(C);
        G.color.copy(W).multiplyScalar(z), G.halfWidth.set(C.width * 0.5, 0, 0), G.halfHeight.set(0, C.height * 0.5, 0), i.rectArea[p] = G, p++;
      } else if (C.isPointLight) {
        const G = e.get(C);
        if (G.color.copy(C.color).multiplyScalar(C.intensity), G.distance = C.distance, G.decay = C.decay, C.castShadow) {
          const Q = C.shadow, H = t.get(C);
          H.shadowIntensity = Q.intensity, H.shadowBias = Q.bias, H.shadowNormalBias = Q.normalBias, H.shadowRadius = Q.radius, H.shadowMapSize = Q.mapSize, H.shadowCameraNear = Q.camera.near, H.shadowCameraFar = Q.camera.far, i.pointShadow[g] = H, i.pointShadowMap[g] = K, i.pointShadowMatrix[g] = C.shadow.matrix, S++;
        }
        i.point[g] = G, g++;
      } else if (C.isHemisphereLight) {
        const G = e.get(C);
        G.skyColor.copy(C.color).multiplyScalar(z), G.groundColor.copy(C.groundColor).multiplyScalar(z), i.hemi[u] = G, u++;
      }
    }
    p > 0 && (n.has("OES_texture_float_linear") === !0 ? (i.rectAreaLTC1 = oe.LTC_FLOAT_1, i.rectAreaLTC2 = oe.LTC_FLOAT_2) : (i.rectAreaLTC1 = oe.LTC_HALF_1, i.rectAreaLTC2 = oe.LTC_HALF_2)), i.ambient[0] = h, i.ambient[1] = f, i.ambient[2] = d;
    const I = i.hash;
    (I.directionalLength !== m || I.pointLength !== g || I.spotLength !== v || I.rectAreaLength !== p || I.hemiLength !== u || I.numDirectionalShadows !== b || I.numPointShadows !== S || I.numSpotShadows !== T || I.numSpotMaps !== O || I.numLightProbes !== w) && (i.directional.length = m, i.spot.length = v, i.rectArea.length = p, i.point.length = g, i.hemi.length = u, i.directionalShadow.length = b, i.directionalShadowMap.length = b, i.pointShadow.length = S, i.pointShadowMap.length = S, i.spotShadow.length = T, i.spotShadowMap.length = T, i.directionalShadowMatrix.length = b, i.pointShadowMatrix.length = S, i.spotLightMatrix.length = T + O - R, i.spotLightMap.length = O, i.numSpotLightShadowsWithMaps = R, i.numLightProbes = w, I.directionalLength = m, I.pointLength = g, I.spotLength = v, I.rectAreaLength = p, I.hemiLength = u, I.numDirectionalShadows = b, I.numPointShadows = S, I.numSpotShadows = T, I.numSpotMaps = O, I.numLightProbes = w, i.version = Wu++);
  }
  function l(c, h) {
    let f = 0, d = 0, m = 0, g = 0, v = 0;
    const p = h.matrixWorldInverse;
    for (let u = 0, b = c.length; u < b; u++) {
      const S = c[u];
      if (S.isDirectionalLight) {
        const T = i.directional[f];
        T.direction.setFromMatrixPosition(S.matrixWorld), r.setFromMatrixPosition(S.target.matrixWorld), T.direction.sub(r), T.direction.transformDirection(p), f++;
      } else if (S.isSpotLight) {
        const T = i.spot[m];
        T.position.setFromMatrixPosition(S.matrixWorld), T.position.applyMatrix4(p), T.direction.setFromMatrixPosition(S.matrixWorld), r.setFromMatrixPosition(S.target.matrixWorld), T.direction.sub(r), T.direction.transformDirection(p), m++;
      } else if (S.isRectAreaLight) {
        const T = i.rectArea[g];
        T.position.setFromMatrixPosition(S.matrixWorld), T.position.applyMatrix4(p), a.identity(), s.copy(S.matrixWorld), s.premultiply(p), a.extractRotation(s), T.halfWidth.set(S.width * 0.5, 0, 0), T.halfHeight.set(0, S.height * 0.5, 0), T.halfWidth.applyMatrix4(a), T.halfHeight.applyMatrix4(a), g++;
      } else if (S.isPointLight) {
        const T = i.point[d];
        T.position.setFromMatrixPosition(S.matrixWorld), T.position.applyMatrix4(p), d++;
      } else if (S.isHemisphereLight) {
        const T = i.hemi[v];
        T.direction.setFromMatrixPosition(S.matrixWorld), T.direction.transformDirection(p), v++;
      }
    }
  }
  return {
    setup: o,
    setupView: l,
    state: i
  };
}
function Gs(n) {
  const e = new qu(n), t = [], i = [];
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
function Yu(n) {
  let e = /* @__PURE__ */ new WeakMap();
  function t(r, s = 0) {
    const a = e.get(r);
    let o;
    return a === void 0 ? (o = new Gs(n), e.set(r, [o])) : s >= a.length ? (o = new Gs(n), a.push(o)) : o = a[s], o;
  }
  function i() {
    e = /* @__PURE__ */ new WeakMap();
  }
  return {
    get: t,
    dispose: i
  };
}
class Ku extends Qi {
  constructor(e) {
    super(), this.isMeshDepthMaterial = !0, this.type = "MeshDepthMaterial", this.depthPacking = 3200, this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.wireframe = !1, this.wireframeLinewidth = 1, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.depthPacking = e.depthPacking, this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this.wireframe = e.wireframe, this.wireframeLinewidth = e.wireframeLinewidth, this;
  }
}
class Zu extends Qi {
  constructor(e) {
    super(), this.isMeshDistanceMaterial = !0, this.type = "MeshDistanceMaterial", this.map = null, this.alphaMap = null, this.displacementMap = null, this.displacementScale = 1, this.displacementBias = 0, this.setValues(e);
  }
  copy(e) {
    return super.copy(e), this.map = e.map, this.alphaMap = e.alphaMap, this.displacementMap = e.displacementMap, this.displacementScale = e.displacementScale, this.displacementBias = e.displacementBias, this;
  }
}
const Ju = (
  /* glsl */
  `
void main() {

	gl_Position = vec4( position, 1.0 );

}
`
), $u = (
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
function ju(n, e, t) {
  let i = new Lr();
  const r = new le(), s = new le(), a = new $e(), o = new Ku({ depthPacking: 3201 }), l = new Zu(), c = {}, h = t.maxTextureSize, f = { 0: 1, 1: 0, 2: 2 }, d = new jt({
    defines: {
      VSM_SAMPLES: 8
    },
    uniforms: {
      shadow_pass: { value: null },
      resolution: { value: new le() },
      radius: { value: 4 }
    },
    vertexShader: Ju,
    fragmentShader: $u
  }), m = d.clone();
  m.defines.HORIZONTAL_PASS = 1;
  const g = new ei();
  g.setAttribute(
    "position",
    new Ut(
      new Float32Array([-1, -1, 0.5, 3, -1, 0.5, -1, 3, 0.5]),
      3
    )
  );
  const v = new Ht(g, d), p = this;
  this.enabled = !1, this.autoUpdate = !0, this.needsUpdate = !1, this.type = 1;
  let u = this.type;
  this.render = function(R, w, I) {
    if (p.enabled === !1 || p.autoUpdate === !1 && p.needsUpdate === !1 || R.length === 0) return;
    const E = n.getRenderTarget(), x = n.getActiveCubeFace(), C = n.getActiveMipmapLevel(), W = n.state;
    W.setBlending(0), W.buffers.color.setClear(1, 1, 1, 1), W.buffers.depth.setTest(!0), W.setScissorTest(!1);
    const z = u !== 3 && this.type === 3, V = u === 3 && this.type !== 3;
    for (let K = 0, G = R.length; K < G; K++) {
      const Q = R[K], H = Q.shadow;
      if (H === void 0) {
        console.warn("THREE.WebGLShadowMap:", Q, "has no shadow.");
        continue;
      }
      if (H.autoUpdate === !1 && H.needsUpdate === !1) continue;
      r.copy(H.mapSize);
      const fe = H.getFrameExtents();
      if (r.multiply(fe), s.copy(H.mapSize), (r.x > h || r.y > h) && (r.x > h && (s.x = Math.floor(h / fe.x), r.x = s.x * fe.x, H.mapSize.x = s.x), r.y > h && (s.y = Math.floor(h / fe.y), r.y = s.y * fe.y, H.mapSize.y = s.y)), H.map === null || z === !0 || V === !0) {
        const me = this.type !== 3 ? { minFilter: 1003, magFilter: 1003 } : {};
        H.map !== null && H.map.dispose(), H.map = new di(r.x, r.y, me), H.map.texture.name = Q.name + ".shadowMap", H.camera.updateProjectionMatrix();
      }
      n.setRenderTarget(H.map), n.clear();
      const xe = H.getViewportCount();
      for (let me = 0; me < xe; me++) {
        const Be = H.getViewport(me);
        a.set(
          s.x * Be.x,
          s.y * Be.y,
          s.x * Be.z,
          s.y * Be.w
        ), W.viewport(a), H.updateMatrices(Q, me), i = H.getFrustum(), T(w, I, H.camera, Q, this.type);
      }
      H.isPointLightShadow !== !0 && this.type === 3 && b(H, I), H.needsUpdate = !1;
    }
    u = this.type, p.needsUpdate = !1, n.setRenderTarget(E, x, C);
  };
  function b(R, w) {
    const I = e.update(v);
    d.defines.VSM_SAMPLES !== R.blurSamples && (d.defines.VSM_SAMPLES = R.blurSamples, m.defines.VSM_SAMPLES = R.blurSamples, d.needsUpdate = !0, m.needsUpdate = !0), R.mapPass === null && (R.mapPass = new di(r.x, r.y)), d.uniforms.shadow_pass.value = R.map.texture, d.uniforms.resolution.value = R.mapSize, d.uniforms.radius.value = R.radius, n.setRenderTarget(R.mapPass), n.clear(), n.renderBufferDirect(w, null, I, d, v, null), m.uniforms.shadow_pass.value = R.mapPass.texture, m.uniforms.resolution.value = R.mapSize, m.uniforms.radius.value = R.radius, n.setRenderTarget(R.map), n.clear(), n.renderBufferDirect(w, null, I, m, v, null);
  }
  function S(R, w, I, E) {
    let x = null;
    const C = I.isPointLight === !0 ? R.customDistanceMaterial : R.customDepthMaterial;
    if (C !== void 0)
      x = C;
    else if (x = I.isPointLight === !0 ? l : o, n.localClippingEnabled && w.clipShadows === !0 && Array.isArray(w.clippingPlanes) && w.clippingPlanes.length !== 0 || w.displacementMap && w.displacementScale !== 0 || w.alphaMap && w.alphaTest > 0 || w.map && w.alphaTest > 0) {
      const W = x.uuid, z = w.uuid;
      let V = c[W];
      V === void 0 && (V = {}, c[W] = V);
      let K = V[z];
      K === void 0 && (K = x.clone(), V[z] = K, w.addEventListener("dispose", O)), x = K;
    }
    if (x.visible = w.visible, x.wireframe = w.wireframe, E === 3 ? x.side = w.shadowSide !== null ? w.shadowSide : w.side : x.side = w.shadowSide !== null ? w.shadowSide : f[w.side], x.alphaMap = w.alphaMap, x.alphaTest = w.alphaTest, x.map = w.map, x.clipShadows = w.clipShadows, x.clippingPlanes = w.clippingPlanes, x.clipIntersection = w.clipIntersection, x.displacementMap = w.displacementMap, x.displacementScale = w.displacementScale, x.displacementBias = w.displacementBias, x.wireframeLinewidth = w.wireframeLinewidth, x.linewidth = w.linewidth, I.isPointLight === !0 && x.isMeshDistanceMaterial === !0) {
      const W = n.properties.get(x);
      W.light = I;
    }
    return x;
  }
  function T(R, w, I, E, x) {
    if (R.visible === !1) return;
    if (R.layers.test(w.layers) && (R.isMesh || R.isLine || R.isPoints) && (R.castShadow || R.receiveShadow && x === 3) && (!R.frustumCulled || i.intersectsObject(R))) {
      R.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse, R.matrixWorld);
      const z = e.update(R), V = R.material;
      if (Array.isArray(V)) {
        const K = z.groups;
        for (let G = 0, Q = K.length; G < Q; G++) {
          const H = K[G], fe = V[H.materialIndex];
          if (fe && fe.visible) {
            const xe = S(R, fe, E, x);
            R.onBeforeShadow(n, R, w, I, z, xe, H), n.renderBufferDirect(I, null, z, xe, R, H), R.onAfterShadow(n, R, w, I, z, xe, H);
          }
        }
      } else if (V.visible) {
        const K = S(R, V, E, x);
        R.onBeforeShadow(n, R, w, I, z, K, null), n.renderBufferDirect(I, null, z, K, R, null), R.onAfterShadow(n, R, w, I, z, K, null);
      }
    }
    const W = R.children;
    for (let z = 0, V = W.length; z < V; z++)
      T(W[z], w, I, E, x);
  }
  function O(R) {
    R.target.removeEventListener("dispose", O);
    for (const I in c) {
      const E = c[I], x = R.target.uuid;
      x in E && (E[x].dispose(), delete E[x]);
    }
  }
}
function Qu(n) {
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
      setClear: function(se, Re, Ve, nt, ct) {
        ct === !0 && (se *= nt, Re *= nt, Ve *= nt), ne.set(se, Re, Ve, nt), Y.equals(ne) === !1 && (n.clearColor(se, Re, Ve, nt), Y.copy(ne));
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
            case 0:
              n.depthFunc(n.NEVER);
              break;
            case 1:
              n.depthFunc(n.ALWAYS);
              break;
            case 2:
              n.depthFunc(n.LESS);
              break;
            case 3:
              n.depthFunc(n.LEQUAL);
              break;
            case 4:
              n.depthFunc(n.EQUAL);
              break;
            case 5:
              n.depthFunc(n.GEQUAL);
              break;
            case 6:
              n.depthFunc(n.GREATER);
              break;
            case 7:
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
    let P = !1, ne = null, q = null, Y = null, se = null, Re = null, Ve = null, nt = null, ct = null;
    return {
      setTest: function(Xe) {
        P || (Xe ? _e(n.STENCIL_TEST) : ce(n.STENCIL_TEST));
      },
      setMask: function(Xe) {
        ne !== Xe && !P && (n.stencilMask(Xe), ne = Xe);
      },
      setFunc: function(Xe, Ft, Ct) {
        (q !== Xe || Y !== Ft || se !== Ct) && (n.stencilFunc(Xe, Ft, Ct), q = Xe, Y = Ft, se = Ct);
      },
      setOp: function(Xe, Ft, Ct) {
        (Re !== Xe || Ve !== Ft || nt !== Ct) && (n.stencilOp(Xe, Ft, Ct), Re = Xe, Ve = Ft, nt = Ct);
      },
      setLocked: function(Xe) {
        P = Xe;
      },
      setClear: function(Xe) {
        ct !== Xe && (n.clearStencil(Xe), ct = Xe);
      },
      reset: function() {
        P = !1, ne = null, q = null, Y = null, se = null, Re = null, Ve = null, nt = null, ct = null;
      }
    };
  }
  const r = new e(), s = new t(), a = new i(), o = /* @__PURE__ */ new WeakMap(), l = /* @__PURE__ */ new WeakMap();
  let c = {}, h = {}, f = /* @__PURE__ */ new WeakMap(), d = [], m = null, g = !1, v = null, p = null, u = null, b = null, S = null, T = null, O = null, R = new ke(0, 0, 0), w = 0, I = !1, E = null, x = null, C = null, W = null, z = null;
  const V = n.getParameter(n.MAX_COMBINED_TEXTURE_IMAGE_UNITS);
  let K = !1, G = 0;
  const Q = n.getParameter(n.VERSION);
  Q.indexOf("WebGL") !== -1 ? (G = parseFloat(/^WebGL (\d)/.exec(Q)[1]), K = G >= 1) : Q.indexOf("OpenGL ES") !== -1 && (G = parseFloat(/^OpenGL ES (\d)/.exec(Q)[1]), K = G >= 2);
  let H = null, fe = {};
  const xe = n.getParameter(n.SCISSOR_BOX), me = n.getParameter(n.VIEWPORT), Be = new $e().fromArray(xe), We = new $e().fromArray(me);
  function k(P, ne, q, Y) {
    const se = new Uint8Array(4), Re = n.createTexture();
    n.bindTexture(P, Re), n.texParameteri(P, n.TEXTURE_MIN_FILTER, n.NEAREST), n.texParameteri(P, n.TEXTURE_MAG_FILTER, n.NEAREST);
    for (let Ve = 0; Ve < q; Ve++)
      P === n.TEXTURE_3D || P === n.TEXTURE_2D_ARRAY ? n.texImage3D(ne, 0, n.RGBA, 1, 1, Y, 0, n.RGBA, n.UNSIGNED_BYTE, se) : n.texImage2D(ne + Ve, 0, n.RGBA, 1, 1, 0, n.RGBA, n.UNSIGNED_BYTE, se);
    return Re;
  }
  const ee = {};
  ee[n.TEXTURE_2D] = k(n.TEXTURE_2D, n.TEXTURE_2D, 1), ee[n.TEXTURE_CUBE_MAP] = k(n.TEXTURE_CUBE_MAP, n.TEXTURE_CUBE_MAP_POSITIVE_X, 6), ee[n.TEXTURE_2D_ARRAY] = k(n.TEXTURE_2D_ARRAY, n.TEXTURE_2D_ARRAY, 1, 1), ee[n.TEXTURE_3D] = k(n.TEXTURE_3D, n.TEXTURE_3D, 1, 1), r.setClear(0, 0, 0, 1), s.setClear(1), a.setClear(0), _e(n.DEPTH_TEST), s.setFunc(3), he(!1), X(1), _e(n.CULL_FACE), ie(0);
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
    let q = d, Y = !1;
    if (P) {
      q = f.get(ne), q === void 0 && (q = [], f.set(ne, q));
      const se = P.textures;
      if (q.length !== se.length || q[0] !== n.COLOR_ATTACHMENT0) {
        for (let Re = 0, Ve = se.length; Re < Ve; Re++)
          q[Re] = n.COLOR_ATTACHMENT0 + Re;
        q.length = se.length, Y = !0;
      }
    } else
      q[0] !== n.BACK && (q[0] = n.BACK, Y = !0);
    Y && n.drawBuffers(q);
  }
  function Pe(P) {
    return m !== P ? (n.useProgram(P), m = P, !0) : !1;
  }
  const He = {
    100: n.FUNC_ADD,
    101: n.FUNC_SUBTRACT,
    102: n.FUNC_REVERSE_SUBTRACT
  };
  He[103] = n.MIN, He[104] = n.MAX;
  const y = {
    200: n.ZERO,
    201: n.ONE,
    202: n.SRC_COLOR,
    204: n.SRC_ALPHA,
    210: n.SRC_ALPHA_SATURATE,
    208: n.DST_COLOR,
    206: n.DST_ALPHA,
    203: n.ONE_MINUS_SRC_COLOR,
    205: n.ONE_MINUS_SRC_ALPHA,
    209: n.ONE_MINUS_DST_COLOR,
    207: n.ONE_MINUS_DST_ALPHA,
    211: n.CONSTANT_COLOR,
    212: n.ONE_MINUS_CONSTANT_COLOR,
    213: n.CONSTANT_ALPHA,
    214: n.ONE_MINUS_CONSTANT_ALPHA
  };
  function ie(P, ne, q, Y, se, Re, Ve, nt, ct, Xe) {
    if (P === 0) {
      g === !0 && (ce(n.BLEND), g = !1);
      return;
    }
    if (g === !1 && (_e(n.BLEND), g = !0), P !== 5) {
      if (P !== v || Xe !== I) {
        if ((p !== 100 || S !== 100) && (n.blendEquation(n.FUNC_ADD), p = 100, S = 100), Xe)
          switch (P) {
            case 1:
              n.blendFuncSeparate(n.ONE, n.ONE_MINUS_SRC_ALPHA, n.ONE, n.ONE_MINUS_SRC_ALPHA);
              break;
            case 2:
              n.blendFunc(n.ONE, n.ONE);
              break;
            case 3:
              n.blendFuncSeparate(n.ZERO, n.ONE_MINUS_SRC_COLOR, n.ZERO, n.ONE);
              break;
            case 4:
              n.blendFuncSeparate(n.ZERO, n.SRC_COLOR, n.ZERO, n.SRC_ALPHA);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        else
          switch (P) {
            case 1:
              n.blendFuncSeparate(n.SRC_ALPHA, n.ONE_MINUS_SRC_ALPHA, n.ONE, n.ONE_MINUS_SRC_ALPHA);
              break;
            case 2:
              n.blendFunc(n.SRC_ALPHA, n.ONE);
              break;
            case 3:
              n.blendFuncSeparate(n.ZERO, n.ONE_MINUS_SRC_COLOR, n.ZERO, n.ONE);
              break;
            case 4:
              n.blendFunc(n.ZERO, n.SRC_COLOR);
              break;
            default:
              console.error("THREE.WebGLState: Invalid blending: ", P);
              break;
          }
        u = null, b = null, T = null, O = null, R.set(0, 0, 0), w = 0, v = P, I = Xe;
      }
      return;
    }
    se = se || ne, Re = Re || q, Ve = Ve || Y, (ne !== p || se !== S) && (n.blendEquationSeparate(He[ne], He[se]), p = ne, S = se), (q !== u || Y !== b || Re !== T || Ve !== O) && (n.blendFuncSeparate(y[q], y[Y], y[Re], y[Ve]), u = q, b = Y, T = Re, O = Ve), (nt.equals(R) === !1 || ct !== w) && (n.blendColor(nt.r, nt.g, nt.b, ct), R.copy(nt), w = ct), v = P, I = !1;
  }
  function j(P, ne) {
    P.side === 2 ? ce(n.CULL_FACE) : _e(n.CULL_FACE);
    let q = P.side === 1;
    ne && (q = !q), he(q), P.blending === 1 && P.transparent === !1 ? ie(0) : ie(P.blending, P.blendEquation, P.blendSrc, P.blendDst, P.blendEquationAlpha, P.blendSrcAlpha, P.blendDstAlpha, P.blendColor, P.blendAlpha, P.premultipliedAlpha), s.setFunc(P.depthFunc), s.setTest(P.depthTest), s.setMask(P.depthWrite), r.setMask(P.colorWrite);
    const Y = P.stencilWrite;
    a.setTest(Y), Y && (a.setMask(P.stencilWriteMask), a.setFunc(P.stencilFunc, P.stencilRef, P.stencilFuncMask), a.setOp(P.stencilFail, P.stencilZFail, P.stencilZPass)), ue(P.polygonOffset, P.polygonOffsetFactor, P.polygonOffsetUnits), P.alphaToCoverage === !0 ? _e(n.SAMPLE_ALPHA_TO_COVERAGE) : ce(n.SAMPLE_ALPHA_TO_COVERAGE);
  }
  function he(P) {
    E !== P && (P ? n.frontFace(n.CW) : n.frontFace(n.CCW), E = P);
  }
  function X(P) {
    P !== 0 ? (_e(n.CULL_FACE), P !== x && (P === 1 ? n.cullFace(n.BACK) : P === 2 ? n.cullFace(n.FRONT) : n.cullFace(n.FRONT_AND_BACK))) : ce(n.CULL_FACE), x = P;
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
    P === void 0 && (P = n.TEXTURE0 + V - 1), H !== P && (n.activeTexture(P), H = P);
  }
  function _(P, ne, q) {
    q === void 0 && (H === null ? q = n.TEXTURE0 + V - 1 : q = H);
    let Y = fe[q];
    Y === void 0 && (Y = { type: void 0, texture: void 0 }, fe[q] = Y), (Y.type !== P || Y.texture !== ne) && (H !== q && (n.activeTexture(q), H = q), n.bindTexture(P, ne || ee[P]), Y.type = P, Y.texture = ne);
  }
  function F() {
    const P = fe[H];
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
  function Ge() {
    try {
      n.texImage3D.apply(n, arguments);
    } catch (P) {
      console.error("THREE.WebGLState:", P);
    }
  }
  function De(P) {
    Be.equals(P) === !1 && (n.scissor(P.x, P.y, P.z, P.w), Be.copy(P));
  }
  function Se(P) {
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
    n.disable(n.BLEND), n.disable(n.CULL_FACE), n.disable(n.DEPTH_TEST), n.disable(n.POLYGON_OFFSET_FILL), n.disable(n.SCISSOR_TEST), n.disable(n.STENCIL_TEST), n.disable(n.SAMPLE_ALPHA_TO_COVERAGE), n.blendEquation(n.FUNC_ADD), n.blendFunc(n.ONE, n.ZERO), n.blendFuncSeparate(n.ONE, n.ZERO, n.ONE, n.ZERO), n.blendColor(0, 0, 0, 0), n.colorMask(!0, !0, !0, !0), n.clearColor(0, 0, 0, 0), n.depthMask(!0), n.depthFunc(n.LESS), n.clearDepth(1), n.stencilMask(4294967295), n.stencilFunc(n.ALWAYS, 0, 4294967295), n.stencilOp(n.KEEP, n.KEEP, n.KEEP), n.clearStencil(0), n.cullFace(n.BACK), n.frontFace(n.CCW), n.polygonOffset(0, 0), n.activeTexture(n.TEXTURE0), n.bindFramebuffer(n.FRAMEBUFFER, null), n.bindFramebuffer(n.DRAW_FRAMEBUFFER, null), n.bindFramebuffer(n.READ_FRAMEBUFFER, null), n.useProgram(null), n.lineWidth(1), n.scissor(0, 0, n.canvas.width, n.canvas.height), n.viewport(0, 0, n.canvas.width, n.canvas.height), c = {}, H = null, fe = {}, h = {}, f = /* @__PURE__ */ new WeakMap(), d = [], m = null, g = !1, v = null, p = null, u = null, b = null, S = null, T = null, O = null, R = new ke(0, 0, 0), w = 0, I = !1, E = null, x = null, C = null, W = null, z = null, Be.set(0, 0, n.canvas.width, n.canvas.height), We.set(0, 0, n.canvas.width, n.canvas.height), r.reset(), s.reset(), a.reset();
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
    texImage3D: Ge,
    updateUBOMapping: Ue,
    uniformBlockBinding: ze,
    texStorage2D: Ie,
    texStorage3D: te,
    texSubImage2D: Z,
    texSubImage3D: Te,
    compressedTexSubImage2D: ae,
    compressedTexSubImage3D: ge,
    scissor: De,
    viewport: Se,
    reset: Qe
  };
}
function Vs(n, e, t, i) {
  const r = ed(i);
  switch (t) {
    case 1021:
      return n * e;
    case 1024:
      return n * e;
    case 1025:
      return n * e * 2;
    case 1028:
      return n * e / r.components * r.byteLength;
    case 1029:
      return n * e / r.components * r.byteLength;
    case 1030:
      return n * e * 2 / r.components * r.byteLength;
    case 1031:
      return n * e * 2 / r.components * r.byteLength;
    case 1022:
      return n * e * 3 / r.components * r.byteLength;
    case 1023:
      return n * e * 4 / r.components * r.byteLength;
    case 1033:
      return n * e * 4 / r.components * r.byteLength;
    case 33776:
    case 33777:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case 33778:
    case 33779:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case 35841:
    case 35843:
      return Math.max(n, 16) * Math.max(e, 8) / 4;
    case 35840:
    case 35842:
      return Math.max(n, 8) * Math.max(e, 8) / 2;
    case 36196:
    case 37492:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 8;
    case 37496:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case 37808:
      return Math.floor((n + 3) / 4) * Math.floor((e + 3) / 4) * 16;
    case 37809:
      return Math.floor((n + 4) / 5) * Math.floor((e + 3) / 4) * 16;
    case 37810:
      return Math.floor((n + 4) / 5) * Math.floor((e + 4) / 5) * 16;
    case 37811:
      return Math.floor((n + 5) / 6) * Math.floor((e + 4) / 5) * 16;
    case 37812:
      return Math.floor((n + 5) / 6) * Math.floor((e + 5) / 6) * 16;
    case 37813:
      return Math.floor((n + 7) / 8) * Math.floor((e + 4) / 5) * 16;
    case 37814:
      return Math.floor((n + 7) / 8) * Math.floor((e + 5) / 6) * 16;
    case 37815:
      return Math.floor((n + 7) / 8) * Math.floor((e + 7) / 8) * 16;
    case 37816:
      return Math.floor((n + 9) / 10) * Math.floor((e + 4) / 5) * 16;
    case 37817:
      return Math.floor((n + 9) / 10) * Math.floor((e + 5) / 6) * 16;
    case 37818:
      return Math.floor((n + 9) / 10) * Math.floor((e + 7) / 8) * 16;
    case 37819:
      return Math.floor((n + 9) / 10) * Math.floor((e + 9) / 10) * 16;
    case 37820:
      return Math.floor((n + 11) / 12) * Math.floor((e + 9) / 10) * 16;
    case 37821:
      return Math.floor((n + 11) / 12) * Math.floor((e + 11) / 12) * 16;
    case 36492:
    case 36494:
    case 36495:
      return Math.ceil(n / 4) * Math.ceil(e / 4) * 16;
    case 36283:
    case 36284:
      return Math.ceil(n / 4) * Math.ceil(e / 4) * 8;
    case 36285:
    case 36286:
      return Math.ceil(n / 4) * Math.ceil(e / 4) * 16;
  }
  throw new Error(
    `Unable to determine texture byte length for ${t} format.`
  );
}
function ed(n) {
  switch (n) {
    case 1009:
    case 1010:
      return { byteLength: 1, components: 1 };
    case 1012:
    case 1011:
    case 1016:
      return { byteLength: 2, components: 1 };
    case 1017:
    case 1018:
      return { byteLength: 2, components: 4 };
    case 1014:
    case 1013:
    case 1015:
      return { byteLength: 4, components: 1 };
    case 35902:
      return { byteLength: 4, components: 3 };
  }
  throw new Error(`Unknown texture type ${n}.`);
}
function td(n, e, t, i, r, s, a) {
  const o = e.has("WEBGL_multisampled_render_to_texture") ? e.get("WEBGL_multisampled_render_to_texture") : null, l = typeof navigator > "u" ? !1 : /OculusBrowser/g.test(navigator.userAgent), c = new le(), h = /* @__PURE__ */ new WeakMap();
  let f;
  const d = /* @__PURE__ */ new WeakMap();
  let m = !1;
  try {
    m = typeof OffscreenCanvas < "u" && new OffscreenCanvas(1, 1).getContext("2d") !== null;
  } catch {
  }
  function g(A, _) {
    return m ? (
      // eslint-disable-next-line compat/compat
      new OffscreenCanvas(A, _)
    ) : Un("canvas");
  }
  function v(A, _, F) {
    let $ = 1;
    const J = ve(A);
    if ((J.width > F || J.height > F) && ($ = F / Math.max(J.width, J.height)), $ < 1)
      if (typeof HTMLImageElement < "u" && A instanceof HTMLImageElement || typeof HTMLCanvasElement < "u" && A instanceof HTMLCanvasElement || typeof ImageBitmap < "u" && A instanceof ImageBitmap || typeof VideoFrame < "u" && A instanceof VideoFrame) {
        const Z = Math.floor($ * J.width), Te = Math.floor($ * J.height);
        f === void 0 && (f = g(Z, Te));
        const ae = _ ? g(Z, Te) : f;
        return ae.width = Z, ae.height = Te, ae.getContext("2d").drawImage(A, 0, 0, Z, Te), console.warn("THREE.WebGLRenderer: Texture has been resized from (" + J.width + "x" + J.height + ") to (" + Z + "x" + Te + ")."), ae;
      } else
        return "data" in A && console.warn("THREE.WebGLRenderer: Image in DataTexture is too big (" + J.width + "x" + J.height + ")."), A;
    return A;
  }
  function p(A) {
    return A.generateMipmaps && A.minFilter !== 1003 && A.minFilter !== 1006;
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
      const Te = J ? Pn : Ze.getTransfer($);
      F === n.FLOAT && (Z = n.RGBA32F), F === n.HALF_FLOAT && (Z = n.RGBA16F), F === n.UNSIGNED_BYTE && (Z = Te === Je ? n.SRGB8_ALPHA8 : n.RGBA8), F === n.UNSIGNED_SHORT_4_4_4_4 && (Z = n.RGBA4), F === n.UNSIGNED_SHORT_5_5_5_1 && (Z = n.RGB5_A1);
    }
    return (Z === n.R16F || Z === n.R32F || Z === n.RG16F || Z === n.RG32F || Z === n.RGBA16F || Z === n.RGBA32F) && e.get("EXT_color_buffer_float"), Z;
  }
  function S(A, _) {
    let F;
    return A ? _ === null || _ === 1014 || _ === 1020 ? F = n.DEPTH24_STENCIL8 : _ === 1015 ? F = n.DEPTH32F_STENCIL8 : _ === 1012 && (F = n.DEPTH24_STENCIL8, console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")) : _ === null || _ === 1014 || _ === 1020 ? F = n.DEPTH_COMPONENT24 : _ === 1015 ? F = n.DEPTH_COMPONENT32F : _ === 1012 && (F = n.DEPTH_COMPONENT16), F;
  }
  function T(A, _) {
    return p(A) === !0 || A.isFramebufferTexture && A.minFilter !== 1003 && A.minFilter !== 1006 ? Math.log2(Math.max(_.width, _.height)) + 1 : A.mipmaps !== void 0 && A.mipmaps.length > 0 ? A.mipmaps.length : A.isCompressedTexture && Array.isArray(A.image) ? _.mipmaps.length : 1;
  }
  function O(A) {
    const _ = A.target;
    _.removeEventListener("dispose", O), w(_), _.isVideoTexture && h.delete(_);
  }
  function R(A) {
    const _ = A.target;
    _.removeEventListener("dispose", R), E(_);
  }
  function w(A) {
    const _ = i.get(A);
    if (_.__webglInit === void 0) return;
    const F = A.source, $ = d.get(F);
    if ($) {
      const J = $[_.__cacheKey];
      J.usedTimes--, J.usedTimes === 0 && I(A), Object.keys($).length === 0 && d.delete(F);
    }
    i.remove(A);
  }
  function I(A) {
    const _ = i.get(A);
    n.deleteTexture(_.__webglTexture);
    const F = A.source, $ = d.get(F);
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
  function V(A, _) {
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
  function G(A, _) {
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
  const H = {
    1e3: n.REPEAT,
    1001: n.CLAMP_TO_EDGE,
    1002: n.MIRRORED_REPEAT
  }, fe = {
    1003: n.NEAREST,
    1004: n.NEAREST_MIPMAP_NEAREST,
    1005: n.NEAREST_MIPMAP_LINEAR,
    1006: n.LINEAR,
    1007: n.LINEAR_MIPMAP_NEAREST,
    1008: n.LINEAR_MIPMAP_LINEAR
  }, xe = {
    512: n.NEVER,
    519: n.ALWAYS,
    513: n.LESS,
    515: n.LEQUAL,
    514: n.EQUAL,
    518: n.GEQUAL,
    516: n.GREATER,
    517: n.NOTEQUAL
  };
  function me(A, _) {
    if (_.type === 1015 && e.has("OES_texture_float_linear") === !1 && (_.magFilter === 1006 || _.magFilter === 1007 || _.magFilter === 1005 || _.magFilter === 1008 || _.minFilter === 1006 || _.minFilter === 1007 || _.minFilter === 1005 || _.minFilter === 1008) && console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."), n.texParameteri(A, n.TEXTURE_WRAP_S, H[_.wrapS]), n.texParameteri(A, n.TEXTURE_WRAP_T, H[_.wrapT]), (A === n.TEXTURE_3D || A === n.TEXTURE_2D_ARRAY) && n.texParameteri(A, n.TEXTURE_WRAP_R, H[_.wrapR]), n.texParameteri(A, n.TEXTURE_MAG_FILTER, fe[_.magFilter]), n.texParameteri(A, n.TEXTURE_MIN_FILTER, fe[_.minFilter]), _.compareFunction && (n.texParameteri(A, n.TEXTURE_COMPARE_MODE, n.COMPARE_REF_TO_TEXTURE), n.texParameteri(A, n.TEXTURE_COMPARE_FUNC, xe[_.compareFunction])), e.has("EXT_texture_filter_anisotropic") === !0) {
      if (_.magFilter === 1003 || _.minFilter !== 1005 && _.minFilter !== 1008 || _.type === 1015 && e.has("OES_texture_float_linear") === !1) return;
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
    let J = d.get($);
    J === void 0 && (J = {}, d.set($, J));
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
      const ae = Ze.getPrimaries(Ze.workingColorSpace), ge = _.colorSpace === $t ? null : Ze.getPrimaries(_.colorSpace), Ie = _.colorSpace === $t || ae === ge ? n.NONE : n.BROWSER_DEFAULT_WEBGL;
      n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, _.flipY), n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL, _.premultiplyAlpha), n.pixelStorei(n.UNPACK_ALIGNMENT, _.unpackAlignment), n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL, Ie);
      let te = v(_.image, !1, r.maxTextureSize);
      te = ue(_, te);
      const pe = s.convert(_.format, _.colorSpace), Ge = s.convert(_.type);
      let De = b(_.internalFormat, pe, Ge, _.colorSpace, _.isVideoTexture);
      me($, _);
      let Se;
      const Ue = _.mipmaps, ze = _.isVideoTexture !== !0, Qe = Te.__version === void 0 || J === !0, P = Z.dataReady, ne = T(_, te);
      if (_.isDepthTexture)
        De = S(_.format === 1027, _.type), Qe && (ze ? t.texStorage2D(n.TEXTURE_2D, 1, De, te.width, te.height) : t.texImage2D(n.TEXTURE_2D, 0, De, te.width, te.height, 0, pe, Ge, null));
      else if (_.isDataTexture)
        if (Ue.length > 0) {
          ze && Qe && t.texStorage2D(n.TEXTURE_2D, ne, De, Ue[0].width, Ue[0].height);
          for (let q = 0, Y = Ue.length; q < Y; q++)
            Se = Ue[q], ze ? P && t.texSubImage2D(n.TEXTURE_2D, q, 0, 0, Se.width, Se.height, pe, Ge, Se.data) : t.texImage2D(n.TEXTURE_2D, q, De, Se.width, Se.height, 0, pe, Ge, Se.data);
          _.generateMipmaps = !1;
        } else
          ze ? (Qe && t.texStorage2D(n.TEXTURE_2D, ne, De, te.width, te.height), P && t.texSubImage2D(n.TEXTURE_2D, 0, 0, 0, te.width, te.height, pe, Ge, te.data)) : t.texImage2D(n.TEXTURE_2D, 0, De, te.width, te.height, 0, pe, Ge, te.data);
      else if (_.isCompressedTexture)
        if (_.isCompressedArrayTexture) {
          ze && Qe && t.texStorage3D(n.TEXTURE_2D_ARRAY, ne, De, Ue[0].width, Ue[0].height, te.depth);
          for (let q = 0, Y = Ue.length; q < Y; q++)
            if (Se = Ue[q], _.format !== 1023)
              if (pe !== null)
                if (ze) {
                  if (P)
                    if (_.layerUpdates.size > 0) {
                      const se = Vs(Se.width, Se.height, _.format, _.type);
                      for (const Re of _.layerUpdates) {
                        const Ve = Se.data.subarray(
                          Re * se / Se.data.BYTES_PER_ELEMENT,
                          (Re + 1) * se / Se.data.BYTES_PER_ELEMENT
                        );
                        t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY, q, 0, 0, Re, Se.width, Se.height, 1, pe, Ve, 0, 0);
                      }
                      _.clearLayerUpdates();
                    } else
                      t.compressedTexSubImage3D(n.TEXTURE_2D_ARRAY, q, 0, 0, 0, Se.width, Se.height, te.depth, pe, Se.data, 0, 0);
                } else
                  t.compressedTexImage3D(n.TEXTURE_2D_ARRAY, q, De, Se.width, Se.height, te.depth, 0, Se.data, 0, 0);
              else
                console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");
            else
              ze ? P && t.texSubImage3D(n.TEXTURE_2D_ARRAY, q, 0, 0, 0, Se.width, Se.height, te.depth, pe, Ge, Se.data) : t.texImage3D(n.TEXTURE_2D_ARRAY, q, De, Se.width, Se.height, te.depth, 0, pe, Ge, Se.data);
        } else {
          ze && Qe && t.texStorage2D(n.TEXTURE_2D, ne, De, Ue[0].width, Ue[0].height);
          for (let q = 0, Y = Ue.length; q < Y; q++)
            Se = Ue[q], _.format !== 1023 ? pe !== null ? ze ? P && t.compressedTexSubImage2D(n.TEXTURE_2D, q, 0, 0, Se.width, Se.height, pe, Se.data) : t.compressedTexImage2D(n.TEXTURE_2D, q, De, Se.width, Se.height, 0, Se.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()") : ze ? P && t.texSubImage2D(n.TEXTURE_2D, q, 0, 0, Se.width, Se.height, pe, Ge, Se.data) : t.texImage2D(n.TEXTURE_2D, q, De, Se.width, Se.height, 0, pe, Ge, Se.data);
        }
      else if (_.isDataArrayTexture)
        if (ze) {
          if (Qe && t.texStorage3D(n.TEXTURE_2D_ARRAY, ne, De, te.width, te.height, te.depth), P)
            if (_.layerUpdates.size > 0) {
              const q = Vs(te.width, te.height, _.format, _.type);
              for (const Y of _.layerUpdates) {
                const se = te.data.subarray(
                  Y * q / te.data.BYTES_PER_ELEMENT,
                  (Y + 1) * q / te.data.BYTES_PER_ELEMENT
                );
                t.texSubImage3D(n.TEXTURE_2D_ARRAY, 0, 0, 0, Y, te.width, te.height, 1, pe, Ge, se);
              }
              _.clearLayerUpdates();
            } else
              t.texSubImage3D(n.TEXTURE_2D_ARRAY, 0, 0, 0, 0, te.width, te.height, te.depth, pe, Ge, te.data);
        } else
          t.texImage3D(n.TEXTURE_2D_ARRAY, 0, De, te.width, te.height, te.depth, 0, pe, Ge, te.data);
      else if (_.isData3DTexture)
        ze ? (Qe && t.texStorage3D(n.TEXTURE_3D, ne, De, te.width, te.height, te.depth), P && t.texSubImage3D(n.TEXTURE_3D, 0, 0, 0, 0, te.width, te.height, te.depth, pe, Ge, te.data)) : t.texImage3D(n.TEXTURE_3D, 0, De, te.width, te.height, te.depth, 0, pe, Ge, te.data);
      else if (_.isFramebufferTexture) {
        if (Qe)
          if (ze)
            t.texStorage2D(n.TEXTURE_2D, ne, De, te.width, te.height);
          else {
            let q = te.width, Y = te.height;
            for (let se = 0; se < ne; se++)
              t.texImage2D(n.TEXTURE_2D, se, De, q, Y, 0, pe, Ge, null), q >>= 1, Y >>= 1;
          }
      } else if (Ue.length > 0) {
        if (ze && Qe) {
          const q = ve(Ue[0]);
          t.texStorage2D(n.TEXTURE_2D, ne, De, q.width, q.height);
        }
        for (let q = 0, Y = Ue.length; q < Y; q++)
          Se = Ue[q], ze ? P && t.texSubImage2D(n.TEXTURE_2D, q, 0, 0, pe, Ge, Se) : t.texImage2D(n.TEXTURE_2D, q, De, pe, Ge, Se);
        _.generateMipmaps = !1;
      } else if (ze) {
        if (Qe) {
          const q = ve(te);
          t.texStorage2D(n.TEXTURE_2D, ne, De, q.width, q.height);
        }
        P && t.texSubImage2D(n.TEXTURE_2D, 0, 0, 0, pe, Ge, te);
      } else
        t.texImage2D(n.TEXTURE_2D, 0, De, pe, Ge, te);
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
      const Te = Ze.getPrimaries(Ze.workingColorSpace), ae = _.colorSpace === $t ? null : Ze.getPrimaries(_.colorSpace), ge = _.colorSpace === $t || Te === ae ? n.NONE : n.BROWSER_DEFAULT_WEBGL;
      n.pixelStorei(n.UNPACK_FLIP_Y_WEBGL, _.flipY), n.pixelStorei(n.UNPACK_PREMULTIPLY_ALPHA_WEBGL, _.premultiplyAlpha), n.pixelStorei(n.UNPACK_ALIGNMENT, _.unpackAlignment), n.pixelStorei(n.UNPACK_COLORSPACE_CONVERSION_WEBGL, ge);
      const Ie = _.isCompressedTexture || _.image[0].isCompressedTexture, te = _.image[0] && _.image[0].isDataTexture, pe = [];
      for (let Y = 0; Y < 6; Y++)
        !Ie && !te ? pe[Y] = v(_.image[Y], !0, r.maxCubemapSize) : pe[Y] = te ? _.image[Y].image : _.image[Y], pe[Y] = ue(_, pe[Y]);
      const Ge = pe[0], De = s.convert(_.format, _.colorSpace), Se = s.convert(_.type), Ue = b(_.internalFormat, De, Se, _.colorSpace), ze = _.isVideoTexture !== !0, Qe = Z.__version === void 0 || $ === !0, P = J.dataReady;
      let ne = T(_, Ge);
      me(n.TEXTURE_CUBE_MAP, _);
      let q;
      if (Ie) {
        ze && Qe && t.texStorage2D(n.TEXTURE_CUBE_MAP, ne, Ue, Ge.width, Ge.height);
        for (let Y = 0; Y < 6; Y++) {
          q = pe[Y].mipmaps;
          for (let se = 0; se < q.length; se++) {
            const Re = q[se];
            _.format !== 1023 ? De !== null ? ze ? P && t.compressedTexSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, 0, 0, Re.width, Re.height, De, Re.data) : t.compressedTexImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, Ue, Re.width, Re.height, 0, Re.data) : console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()") : ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, 0, 0, Re.width, Re.height, De, Se, Re.data) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se, Ue, Re.width, Re.height, 0, De, Se, Re.data);
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
            ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, 0, 0, pe[Y].width, pe[Y].height, De, Se, pe[Y].data) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, Ue, pe[Y].width, pe[Y].height, 0, De, Se, pe[Y].data);
            for (let se = 0; se < q.length; se++) {
              const Ve = q[se].image[Y].image;
              ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, 0, 0, Ve.width, Ve.height, De, Se, Ve.data) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, Ue, Ve.width, Ve.height, 0, De, Se, Ve.data);
            }
          } else {
            ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, 0, 0, De, Se, pe[Y]) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, 0, Ue, De, Se, pe[Y]);
            for (let se = 0; se < q.length; se++) {
              const Re = q[se];
              ze ? P && t.texSubImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, 0, 0, De, Se, Re.image[Y]) : t.texImage2D(n.TEXTURE_CUBE_MAP_POSITIVE_X + Y, se + 1, Ue, De, Se, Re.image[Y]);
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
      const $ = _.depthTexture, J = $ && $.isDepthTexture ? $.type : null, Z = S(_.stencilBuffer, J), Te = _.stencilBuffer ? n.DEPTH_STENCIL_ATTACHMENT : n.DEPTH_ATTACHMENT, ae = he(_);
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
    (!i.get(_.depthTexture).__webglTexture || _.depthTexture.image.width !== _.width || _.depthTexture.image.height !== _.height) && (_.depthTexture.image.width = _.width, _.depthTexture.image.height = _.height, _.depthTexture.needsUpdate = !0), V(_.depthTexture, 0);
    const $ = i.get(_.depthTexture).__webglTexture, J = he(_);
    if (_.depthTexture.format === 1026)
      X(_) ? o.framebufferTexture2DMultisampleEXT(n.FRAMEBUFFER, n.DEPTH_ATTACHMENT, n.TEXTURE_2D, $, 0, J) : n.framebufferTexture2D(n.FRAMEBUFFER, n.DEPTH_ATTACHMENT, n.TEXTURE_2D, $, 0);
    else if (_.depthTexture.format === 1027)
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
    A.addEventListener("dispose", R);
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
          const Ie = s.convert(ge.format, ge.colorSpace), te = s.convert(ge.type), pe = b(ge.internalFormat, Ie, te, ge.colorSpace, A.isXRRenderTarget === !0), Ge = he(A);
          n.renderbufferStorageMultisample(n.RENDERBUFFER, Ge, pe, A.width, A.height), n.framebufferRenderbuffer(n.FRAMEBUFFER, n.COLOR_ATTACHMENT0 + ae, n.RENDERBUFFER, F.__webglColorRenderbuffer[ae]);
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
  function He(A) {
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
    return A.isCompressedTexture === !0 || A.isVideoTexture === !0 || F !== Qt && F !== $t && (Ze.getTransfer(F) === Je ? ($ !== 1023 || J !== 1009) && console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType.") : console.error("THREE.WebGLTextures: Unsupported texture color space:", F)), _;
  }
  function ve(A) {
    return typeof HTMLImageElement < "u" && A instanceof HTMLImageElement ? (c.width = A.naturalWidth || A.width, c.height = A.naturalHeight || A.height) : typeof VideoFrame < "u" && A instanceof VideoFrame ? (c.width = A.displayWidth, c.height = A.displayHeight) : (c.width = A.width, c.height = A.height), c;
  }
  this.allocateTextureUnit = W, this.resetTextureUnits = C, this.setTexture2D = V, this.setTexture2DArray = K, this.setTexture3D = G, this.setTextureCube = Q, this.rebindTextures = Ne, this.setupRenderTarget = Pe, this.updateRenderTargetMipmap = He, this.updateMultisampleRenderTarget = j, this.setupDepthRenderbuffer = Ce, this.setupFrameBufferTexture = ee, this.useMultisampledRTT = X;
}
function id(n, e) {
  function t(i, r = $t) {
    let s;
    const a = Ze.getTransfer(r);
    if (i === 1009) return n.UNSIGNED_BYTE;
    if (i === 1017) return n.UNSIGNED_SHORT_4_4_4_4;
    if (i === 1018) return n.UNSIGNED_SHORT_5_5_5_1;
    if (i === 35902) return n.UNSIGNED_INT_5_9_9_9_REV;
    if (i === 1010) return n.BYTE;
    if (i === 1011) return n.SHORT;
    if (i === 1012) return n.UNSIGNED_SHORT;
    if (i === 1013) return n.INT;
    if (i === 1014) return n.UNSIGNED_INT;
    if (i === 1015) return n.FLOAT;
    if (i === 1016) return n.HALF_FLOAT;
    if (i === 1021) return n.ALPHA;
    if (i === 1022) return n.RGB;
    if (i === 1023) return n.RGBA;
    if (i === 1024) return n.LUMINANCE;
    if (i === 1025) return n.LUMINANCE_ALPHA;
    if (i === 1026) return n.DEPTH_COMPONENT;
    if (i === 1027) return n.DEPTH_STENCIL;
    if (i === 1028) return n.RED;
    if (i === 1029) return n.RED_INTEGER;
    if (i === 1030) return n.RG;
    if (i === 1031) return n.RG_INTEGER;
    if (i === 1033) return n.RGBA_INTEGER;
    if (i === 33776 || i === 33777 || i === 33778 || i === 33779)
      if (a === Je)
        if (s = e.get("WEBGL_compressed_texture_s3tc_srgb"), s !== null) {
          if (i === 33776) return s.COMPRESSED_SRGB_S3TC_DXT1_EXT;
          if (i === 33777) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;
          if (i === 33778) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;
          if (i === 33779) return s.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT;
        } else
          return null;
      else if (s = e.get("WEBGL_compressed_texture_s3tc"), s !== null) {
        if (i === 33776) return s.COMPRESSED_RGB_S3TC_DXT1_EXT;
        if (i === 33777) return s.COMPRESSED_RGBA_S3TC_DXT1_EXT;
        if (i === 33778) return s.COMPRESSED_RGBA_S3TC_DXT3_EXT;
        if (i === 33779) return s.COMPRESSED_RGBA_S3TC_DXT5_EXT;
      } else
        return null;
    if (i === 35840 || i === 35841 || i === 35842 || i === 35843)
      if (s = e.get("WEBGL_compressed_texture_pvrtc"), s !== null) {
        if (i === 35840) return s.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;
        if (i === 35841) return s.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;
        if (i === 35842) return s.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;
        if (i === 35843) return s.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG;
      } else
        return null;
    if (i === 36196 || i === 37492 || i === 37496)
      if (s = e.get("WEBGL_compressed_texture_etc"), s !== null) {
        if (i === 36196 || i === 37492) return a === Je ? s.COMPRESSED_SRGB8_ETC2 : s.COMPRESSED_RGB8_ETC2;
        if (i === 37496) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC : s.COMPRESSED_RGBA8_ETC2_EAC;
      } else
        return null;
    if (i === 37808 || i === 37809 || i === 37810 || i === 37811 || i === 37812 || i === 37813 || i === 37814 || i === 37815 || i === 37816 || i === 37817 || i === 37818 || i === 37819 || i === 37820 || i === 37821)
      if (s = e.get("WEBGL_compressed_texture_astc"), s !== null) {
        if (i === 37808) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR : s.COMPRESSED_RGBA_ASTC_4x4_KHR;
        if (i === 37809) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR : s.COMPRESSED_RGBA_ASTC_5x4_KHR;
        if (i === 37810) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR : s.COMPRESSED_RGBA_ASTC_5x5_KHR;
        if (i === 37811) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR : s.COMPRESSED_RGBA_ASTC_6x5_KHR;
        if (i === 37812) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR : s.COMPRESSED_RGBA_ASTC_6x6_KHR;
        if (i === 37813) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR : s.COMPRESSED_RGBA_ASTC_8x5_KHR;
        if (i === 37814) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR : s.COMPRESSED_RGBA_ASTC_8x6_KHR;
        if (i === 37815) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR : s.COMPRESSED_RGBA_ASTC_8x8_KHR;
        if (i === 37816) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR : s.COMPRESSED_RGBA_ASTC_10x5_KHR;
        if (i === 37817) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR : s.COMPRESSED_RGBA_ASTC_10x6_KHR;
        if (i === 37818) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR : s.COMPRESSED_RGBA_ASTC_10x8_KHR;
        if (i === 37819) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR : s.COMPRESSED_RGBA_ASTC_10x10_KHR;
        if (i === 37820) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR : s.COMPRESSED_RGBA_ASTC_12x10_KHR;
        if (i === 37821) return a === Je ? s.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR : s.COMPRESSED_RGBA_ASTC_12x12_KHR;
      } else
        return null;
    if (i === 36492 || i === 36494 || i === 36495)
      if (s = e.get("EXT_texture_compression_bptc"), s !== null) {
        if (i === 36492) return a === Je ? s.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT : s.COMPRESSED_RGBA_BPTC_UNORM_EXT;
        if (i === 36494) return s.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;
        if (i === 36495) return s.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT;
      } else
        return null;
    if (i === 36283 || i === 36284 || i === 36285 || i === 36286)
      if (s = e.get("EXT_texture_compression_rgtc"), s !== null) {
        if (i === 36492) return s.COMPRESSED_RED_RGTC1_EXT;
        if (i === 36284) return s.COMPRESSED_SIGNED_RED_RGTC1_EXT;
        if (i === 36285) return s.COMPRESSED_RED_GREEN_RGTC2_EXT;
        if (i === 36286) return s.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT;
      } else
        return null;
    return i === 1020 ? n.UNSIGNED_INT_24_8 : n[i] !== void 0 ? n[i] : null;
  }
  return { convert: t };
}
class nd extends Tt {
  constructor(e = []) {
    super(), this.isArrayCamera = !0, this.cameras = e;
  }
}
const rd = { type: "move" };
class xr {
  constructor() {
    this._targetRay = null, this._grip = null, this._hand = null;
  }
  getHandSpace() {
    return this._hand === null && (this._hand = new mn(), this._hand.matrixAutoUpdate = !1, this._hand.visible = !1, this._hand.joints = {}, this._hand.inputState = { pinching: !1 }), this._hand;
  }
  getTargetRaySpace() {
    return this._targetRay === null && (this._targetRay = new mn(), this._targetRay.matrixAutoUpdate = !1, this._targetRay.visible = !1, this._targetRay.hasLinearVelocity = !1, this._targetRay.linearVelocity = new L(), this._targetRay.hasAngularVelocity = !1, this._targetRay.angularVelocity = new L()), this._targetRay;
  }
  getGripSpace() {
    return this._grip === null && (this._grip = new mn(), this._grip.matrixAutoUpdate = !1, this._grip.visible = !1, this._grip.hasLinearVelocity = !1, this._grip.linearVelocity = new L(), this._grip.hasAngularVelocity = !1, this._grip.angularVelocity = new L()), this._grip;
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
        const h = c.joints["index-finger-tip"], f = c.joints["thumb-tip"], d = h.position.distanceTo(f.position), m = 0.02, g = 5e-3;
        c.inputState.pinching && d > m + g ? (c.inputState.pinching = !1, this.dispatchEvent({
          type: "pinchend",
          handedness: e.handedness,
          target: this
        })) : !c.inputState.pinching && d <= m - g && (c.inputState.pinching = !0, this.dispatchEvent({
          type: "pinchstart",
          handedness: e.handedness,
          target: this
        }));
      } else
        l !== null && e.gripSpace && (s = t.getPose(e.gripSpace, i), s !== null && (l.matrix.fromArray(s.transform.matrix), l.matrix.decompose(l.position, l.rotation, l.scale), l.matrixWorldNeedsUpdate = !0, s.linearVelocity ? (l.hasLinearVelocity = !0, l.linearVelocity.copy(s.linearVelocity)) : l.hasLinearVelocity = !1, s.angularVelocity ? (l.hasAngularVelocity = !0, l.angularVelocity.copy(s.angularVelocity)) : l.hasAngularVelocity = !1));
      o !== null && (r = t.getPose(e.targetRaySpace, i), r === null && s !== null && (r = s), r !== null && (o.matrix.fromArray(r.transform.matrix), o.matrix.decompose(o.position, o.rotation, o.scale), o.matrixWorldNeedsUpdate = !0, r.linearVelocity ? (o.hasLinearVelocity = !0, o.linearVelocity.copy(r.linearVelocity)) : o.hasLinearVelocity = !1, r.angularVelocity ? (o.hasAngularVelocity = !0, o.angularVelocity.copy(r.angularVelocity)) : o.hasAngularVelocity = !1, this.dispatchEvent(rd)));
    }
    return o !== null && (o.visible = r !== null), l !== null && (l.visible = s !== null), c !== null && (c.visible = a !== null), this;
  }
  // private method
  _getHandJoint(e, t) {
    if (e.joints[t.jointName] === void 0) {
      const i = new mn();
      i.matrixAutoUpdate = !1, i.visible = !1, e.joints[t.jointName] = i, e.add(i);
    }
    return e.joints[t.jointName];
  }
}
const sd = `
void main() {

	gl_Position = vec4( position, 1.0 );

}`, ad = `
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
class od {
  constructor() {
    this.texture = null, this.mesh = null, this.depthNear = 0, this.depthFar = 0;
  }
  init(e, t, i) {
    if (this.texture === null) {
      const r = new _t(), s = e.properties.get(r);
      s.__webglTexture = t.texture, (t.depthNear != i.depthNear || t.depthFar != i.depthFar) && (this.depthNear = t.depthNear, this.depthFar = t.depthFar), this.texture = r;
    }
  }
  getMesh(e) {
    if (this.texture !== null && this.mesh === null) {
      const t = e.cameras[0].viewport, i = new jt({
        vertexShader: sd,
        fragmentShader: ad,
        uniforms: {
          depthColor: { value: this.texture },
          depthWidth: { value: t.z },
          depthHeight: { value: t.w }
        }
      });
      this.mesh = new Ht(new Fn(20, 20), i);
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
class ld extends Fi {
  constructor(e, t) {
    super();
    const i = this;
    let r = null, s = 1, a = null, o = "local-floor", l = 1, c = null, h = null, f = null, d = null, m = null, g = null;
    const v = new od(), p = t.getContextAttributes();
    let u = null, b = null;
    const S = [], T = [], O = new le();
    let R = null;
    const w = new Tt();
    w.layers.enable(1), w.viewport = new $e();
    const I = new Tt();
    I.layers.enable(2), I.viewport = new $e();
    const E = [w, I], x = new nd();
    x.layers.enable(1), x.layers.enable(2);
    let C = null, W = null;
    this.cameraAutoUpdate = !0, this.enabled = !1, this.isPresenting = !1, this.getController = function(k) {
      let ee = S[k];
      return ee === void 0 && (ee = new xr(), S[k] = ee), ee.getTargetRaySpace();
    }, this.getControllerGrip = function(k) {
      let ee = S[k];
      return ee === void 0 && (ee = new xr(), S[k] = ee), ee.getGripSpace();
    }, this.getHand = function(k) {
      let ee = S[k];
      return ee === void 0 && (ee = new xr(), S[k] = ee), ee.getHandSpace();
    };
    function z(k) {
      const ee = T.indexOf(k.inputSource);
      if (ee === -1)
        return;
      const _e = S[ee];
      _e !== void 0 && (_e.update(k.inputSource, k.frame, c || a), _e.dispatchEvent({ type: k.type, data: k.inputSource }));
    }
    function V() {
      r.removeEventListener("select", z), r.removeEventListener("selectstart", z), r.removeEventListener("selectend", z), r.removeEventListener("squeeze", z), r.removeEventListener("squeezestart", z), r.removeEventListener("squeezeend", z), r.removeEventListener("end", V), r.removeEventListener("inputsourceschange", K);
      for (let k = 0; k < S.length; k++) {
        const ee = T[k];
        ee !== null && (T[k] = null, S[k].disconnect(ee));
      }
      C = null, W = null, v.reset(), e.setRenderTarget(u), m = null, d = null, f = null, r = null, b = null, We.stop(), i.isPresenting = !1, e.setPixelRatio(R), e.setSize(O.width, O.height, !1), i.dispatchEvent({ type: "sessionend" });
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
      return d !== null ? d : m;
    }, this.getBinding = function() {
      return f;
    }, this.getFrame = function() {
      return g;
    }, this.getSession = function() {
      return r;
    }, this.setSession = async function(k) {
      if (r = k, r !== null) {
        if (u = e.getRenderTarget(), r.addEventListener("select", z), r.addEventListener("selectstart", z), r.addEventListener("selectend", z), r.addEventListener("squeeze", z), r.addEventListener("squeezestart", z), r.addEventListener("squeezeend", z), r.addEventListener("end", V), r.addEventListener("inputsourceschange", K), p.xrCompatible !== !0 && await t.makeXRCompatible(), R = e.getPixelRatio(), e.getSize(O), r.renderState.layers === void 0) {
          const ee = {
            antialias: p.antialias,
            alpha: !0,
            depth: p.depth,
            stencil: p.stencil,
            framebufferScaleFactor: s
          };
          m = new XRWebGLLayer(r, t, ee), r.updateRenderState({ baseLayer: m }), e.setPixelRatio(1), e.setSize(m.framebufferWidth, m.framebufferHeight, !1), b = new di(
            m.framebufferWidth,
            m.framebufferHeight,
            {
              format: 1023,
              type: 1009,
              colorSpace: e.outputColorSpace,
              stencilBuffer: p.stencil
            }
          );
        } else {
          let ee = null, _e = null, ce = null;
          p.depth && (ce = p.stencil ? t.DEPTH24_STENCIL8 : t.DEPTH_COMPONENT24, ee = p.stencil ? 1027 : 1026, _e = p.stencil ? 1020 : 1014);
          const Ce = {
            colorFormat: t.RGBA8,
            depthFormat: ce,
            scaleFactor: s
          };
          f = new XRWebGLBinding(r, t), d = f.createProjectionLayer(Ce), r.updateRenderState({ layers: [d] }), e.setPixelRatio(1), e.setSize(d.textureWidth, d.textureHeight, !1), b = new di(
            d.textureWidth,
            d.textureHeight,
            {
              format: 1023,
              type: 1009,
              depthTexture: new ha(d.textureWidth, d.textureHeight, _e, void 0, void 0, void 0, void 0, void 0, void 0, ee),
              stencilBuffer: p.stencil,
              colorSpace: e.outputColorSpace,
              samples: p.antialias ? 4 : 0,
              resolveDepthBuffer: d.ignoreDepthValues === !1
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
        ce >= 0 && (T[ce] = null, S[ce].disconnect(_e));
      }
      for (let ee = 0; ee < k.added.length; ee++) {
        const _e = k.added[ee];
        let ce = T.indexOf(_e);
        if (ce === -1) {
          for (let Ne = 0; Ne < S.length; Ne++)
            if (Ne >= T.length) {
              T.push(_e), ce = Ne;
              break;
            } else if (T[Ne] === null) {
              T[Ne] = _e, ce = Ne;
              break;
            }
          if (ce === -1) break;
        }
        const Ce = S[ce];
        Ce && Ce.connect(_e);
      }
    }
    const G = new L(), Q = new L();
    function H(k, ee, _e) {
      G.setFromMatrixPosition(ee.matrixWorld), Q.setFromMatrixPosition(_e.matrixWorld);
      const ce = G.distanceTo(Q), Ce = ee.projectionMatrix.elements, Ne = _e.projectionMatrix.elements, Pe = Ce[14] / (Ce[10] - 1), He = Ce[14] / (Ce[10] + 1), y = (Ce[9] + 1) / Ce[5], ie = (Ce[9] - 1) / Ce[5], j = (Ce[8] - 1) / Ce[0], he = (Ne[8] + 1) / Ne[0], X = Pe * j, Ae = Pe * he, ue = ce / (-j + he), ve = ue * -j;
      ee.matrixWorld.decompose(k.position, k.quaternion, k.scale), k.translateX(ve), k.translateZ(ue), k.matrixWorld.compose(k.position, k.quaternion, k.scale), k.matrixWorldInverse.copy(k.matrixWorld).invert();
      const A = Pe + ue, _ = He + ue, F = X - ve, $ = Ae + (ce - ve), J = y * He / _ * A, Z = ie * He / _ * A;
      k.projectionMatrix.makePerspective(F, $, J, Z, A, _), k.projectionMatrixInverse.copy(k.projectionMatrix).invert();
    }
    function fe(k, ee) {
      ee === null ? k.matrixWorld.copy(k.matrix) : k.matrixWorld.multiplyMatrices(ee.matrixWorld, k.matrix), k.matrixWorldInverse.copy(k.matrixWorld).invert();
    }
    this.updateCamera = function(k) {
      if (r === null) return;
      v.texture !== null && (k.near = v.depthNear, k.far = v.depthFar), x.near = I.near = w.near = k.near, x.far = I.far = w.far = k.far, (C !== x.near || W !== x.far) && (r.updateRenderState({
        depthNear: x.near,
        depthFar: x.far
      }), C = x.near, W = x.far, w.near = C, w.far = W, I.near = C, I.far = W, w.updateProjectionMatrix(), I.updateProjectionMatrix(), k.updateProjectionMatrix());
      const ee = k.parent, _e = x.cameras;
      fe(x, ee);
      for (let ce = 0; ce < _e.length; ce++)
        fe(_e[ce], ee);
      _e.length === 2 ? H(x, w, I) : x.projectionMatrix.copy(w.projectionMatrix), xe(k, x, ee);
    };
    function xe(k, ee, _e) {
      _e === null ? k.matrix.copy(ee.matrixWorld) : (k.matrix.copy(_e.matrixWorld), k.matrix.invert(), k.matrix.multiply(ee.matrixWorld)), k.matrix.decompose(k.position, k.quaternion, k.scale), k.updateMatrixWorld(!0), k.projectionMatrix.copy(ee.projectionMatrix), k.projectionMatrixInverse.copy(ee.projectionMatrixInverse), k.isPerspectiveCamera && (k.fov = Sr * 2 * Math.atan(1 / k.projectionMatrix.elements[5]), k.zoom = 1);
    }
    this.getCamera = function() {
      return x;
    }, this.getFoveation = function() {
      if (!(d === null && m === null))
        return l;
    }, this.setFoveation = function(k) {
      l = k, d !== null && (d.fixedFoveation = k), m !== null && m.fixedFoveation !== void 0 && (m.fixedFoveation = k);
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
          let He = null;
          if (m !== null)
            He = m.getViewport(Pe);
          else {
            const ie = f.getViewSubImage(d, Pe);
            He = ie.viewport, Ne === 0 && (e.setRenderTargetTextures(
              b,
              ie.colorTexture,
              d.ignoreDepthValues ? void 0 : ie.depthStencilTexture
            ), e.setRenderTarget(b));
          }
          let y = E[Ne];
          y === void 0 && (y = new Tt(), y.layers.enable(Ne), y.viewport = new $e(), E[Ne] = y), y.matrix.fromArray(Pe.transform.matrix), y.matrix.decompose(y.position, y.quaternion, y.scale), y.projectionMatrix.fromArray(Pe.projectionMatrix), y.projectionMatrixInverse.copy(y.projectionMatrix).invert(), y.viewport.set(He.x, He.y, He.width, He.height), Ne === 0 && (x.matrix.copy(y.matrix), x.matrix.decompose(x.position, x.quaternion, x.scale)), ce === !0 && x.cameras.push(y);
        }
        const Ce = r.enabledFeatures;
        if (Ce && Ce.includes("depth-sensing")) {
          const Ne = f.getDepthInformation(_e[0]);
          Ne && Ne.isValid && Ne.texture && v.init(e, Ne, r.renderState);
        }
      }
      for (let _e = 0; _e < S.length; _e++) {
        const ce = T[_e], Ce = S[_e];
        ce !== null && Ce !== void 0 && Ce.update(ce, ee, c || a);
      }
      me && me(k, ee), ee.detectedPlanes && i.dispatchEvent({ type: "planesdetected", data: ee }), g = null;
    }
    const We = new oa();
    We.setAnimationLoop(Be), this.setAnimationLoop = function(k) {
      me = k;
    }, this.dispose = function() {
    };
  }
}
const oi = /* @__PURE__ */ new It(), cd = /* @__PURE__ */ new je();
function hd(n, e) {
  function t(p, u) {
    p.matrixAutoUpdate === !0 && p.updateMatrix(), u.value.copy(p.matrix);
  }
  function i(p, u) {
    u.color.getRGB(p.fogColor.value, sa(n)), u.isFog ? (p.fogNear.value = u.near, p.fogFar.value = u.far) : u.isFogExp2 && (p.fogDensity.value = u.density);
  }
  function r(p, u, b, S, T) {
    u.isMeshBasicMaterial || u.isMeshLambertMaterial ? s(p, u) : u.isMeshToonMaterial ? (s(p, u), f(p, u)) : u.isMeshPhongMaterial ? (s(p, u), h(p, u)) : u.isMeshStandardMaterial ? (s(p, u), d(p, u), u.isMeshPhysicalMaterial && m(p, u, T)) : u.isMeshMatcapMaterial ? (s(p, u), g(p, u)) : u.isMeshDepthMaterial ? s(p, u) : u.isMeshDistanceMaterial ? (s(p, u), v(p, u)) : u.isMeshNormalMaterial ? s(p, u) : u.isLineBasicMaterial ? (a(p, u), u.isLineDashedMaterial && o(p, u)) : u.isPointsMaterial ? l(p, u, b, S) : u.isSpriteMaterial ? c(p, u) : u.isShadowMaterial ? (p.color.value.copy(u.color), p.opacity.value = u.opacity) : u.isShaderMaterial && (u.uniformsNeedUpdate = !1);
  }
  function s(p, u) {
    p.opacity.value = u.opacity, u.color && p.diffuse.value.copy(u.color), u.emissive && p.emissive.value.copy(u.emissive).multiplyScalar(u.emissiveIntensity), u.map && (p.map.value = u.map, t(u.map, p.mapTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.bumpMap && (p.bumpMap.value = u.bumpMap, t(u.bumpMap, p.bumpMapTransform), p.bumpScale.value = u.bumpScale, u.side === 1 && (p.bumpScale.value *= -1)), u.normalMap && (p.normalMap.value = u.normalMap, t(u.normalMap, p.normalMapTransform), p.normalScale.value.copy(u.normalScale), u.side === 1 && p.normalScale.value.negate()), u.displacementMap && (p.displacementMap.value = u.displacementMap, t(u.displacementMap, p.displacementMapTransform), p.displacementScale.value = u.displacementScale, p.displacementBias.value = u.displacementBias), u.emissiveMap && (p.emissiveMap.value = u.emissiveMap, t(u.emissiveMap, p.emissiveMapTransform)), u.specularMap && (p.specularMap.value = u.specularMap, t(u.specularMap, p.specularMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
    const b = e.get(u), S = b.envMap, T = b.envMapRotation;
    S && (p.envMap.value = S, oi.copy(T), oi.x *= -1, oi.y *= -1, oi.z *= -1, S.isCubeTexture && S.isRenderTargetTexture === !1 && (oi.y *= -1, oi.z *= -1), p.envMapRotation.value.setFromMatrix4(cd.makeRotationFromEuler(oi)), p.flipEnvMap.value = S.isCubeTexture && S.isRenderTargetTexture === !1 ? -1 : 1, p.reflectivity.value = u.reflectivity, p.ior.value = u.ior, p.refractionRatio.value = u.refractionRatio), u.lightMap && (p.lightMap.value = u.lightMap, p.lightMapIntensity.value = u.lightMapIntensity, t(u.lightMap, p.lightMapTransform)), u.aoMap && (p.aoMap.value = u.aoMap, p.aoMapIntensity.value = u.aoMapIntensity, t(u.aoMap, p.aoMapTransform));
  }
  function a(p, u) {
    p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, u.map && (p.map.value = u.map, t(u.map, p.mapTransform));
  }
  function o(p, u) {
    p.dashSize.value = u.dashSize, p.totalSize.value = u.dashSize + u.gapSize, p.scale.value = u.scale;
  }
  function l(p, u, b, S) {
    p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, p.size.value = u.size * b, p.scale.value = S * 0.5, u.map && (p.map.value = u.map, t(u.map, p.uvTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
  }
  function c(p, u) {
    p.diffuse.value.copy(u.color), p.opacity.value = u.opacity, p.rotation.value = u.rotation, u.map && (p.map.value = u.map, t(u.map, p.mapTransform)), u.alphaMap && (p.alphaMap.value = u.alphaMap, t(u.alphaMap, p.alphaMapTransform)), u.alphaTest > 0 && (p.alphaTest.value = u.alphaTest);
  }
  function h(p, u) {
    p.specular.value.copy(u.specular), p.shininess.value = Math.max(u.shininess, 1e-4);
  }
  function f(p, u) {
    u.gradientMap && (p.gradientMap.value = u.gradientMap);
  }
  function d(p, u) {
    p.metalness.value = u.metalness, u.metalnessMap && (p.metalnessMap.value = u.metalnessMap, t(u.metalnessMap, p.metalnessMapTransform)), p.roughness.value = u.roughness, u.roughnessMap && (p.roughnessMap.value = u.roughnessMap, t(u.roughnessMap, p.roughnessMapTransform)), u.envMap && (p.envMapIntensity.value = u.envMapIntensity);
  }
  function m(p, u, b) {
    p.ior.value = u.ior, u.sheen > 0 && (p.sheenColor.value.copy(u.sheenColor).multiplyScalar(u.sheen), p.sheenRoughness.value = u.sheenRoughness, u.sheenColorMap && (p.sheenColorMap.value = u.sheenColorMap, t(u.sheenColorMap, p.sheenColorMapTransform)), u.sheenRoughnessMap && (p.sheenRoughnessMap.value = u.sheenRoughnessMap, t(u.sheenRoughnessMap, p.sheenRoughnessMapTransform))), u.clearcoat > 0 && (p.clearcoat.value = u.clearcoat, p.clearcoatRoughness.value = u.clearcoatRoughness, u.clearcoatMap && (p.clearcoatMap.value = u.clearcoatMap, t(u.clearcoatMap, p.clearcoatMapTransform)), u.clearcoatRoughnessMap && (p.clearcoatRoughnessMap.value = u.clearcoatRoughnessMap, t(u.clearcoatRoughnessMap, p.clearcoatRoughnessMapTransform)), u.clearcoatNormalMap && (p.clearcoatNormalMap.value = u.clearcoatNormalMap, t(u.clearcoatNormalMap, p.clearcoatNormalMapTransform), p.clearcoatNormalScale.value.copy(u.clearcoatNormalScale), u.side === 1 && p.clearcoatNormalScale.value.negate())), u.dispersion > 0 && (p.dispersion.value = u.dispersion), u.iridescence > 0 && (p.iridescence.value = u.iridescence, p.iridescenceIOR.value = u.iridescenceIOR, p.iridescenceThicknessMinimum.value = u.iridescenceThicknessRange[0], p.iridescenceThicknessMaximum.value = u.iridescenceThicknessRange[1], u.iridescenceMap && (p.iridescenceMap.value = u.iridescenceMap, t(u.iridescenceMap, p.iridescenceMapTransform)), u.iridescenceThicknessMap && (p.iridescenceThicknessMap.value = u.iridescenceThicknessMap, t(u.iridescenceThicknessMap, p.iridescenceThicknessMapTransform))), u.transmission > 0 && (p.transmission.value = u.transmission, p.transmissionSamplerMap.value = b.texture, p.transmissionSamplerSize.value.set(b.width, b.height), u.transmissionMap && (p.transmissionMap.value = u.transmissionMap, t(u.transmissionMap, p.transmissionMapTransform)), p.thickness.value = u.thickness, u.thicknessMap && (p.thicknessMap.value = u.thicknessMap, t(u.thicknessMap, p.thicknessMapTransform)), p.attenuationDistance.value = u.attenuationDistance, p.attenuationColor.value.copy(u.attenuationColor)), u.anisotropy > 0 && (p.anisotropyVector.value.set(u.anisotropy * Math.cos(u.anisotropyRotation), u.anisotropy * Math.sin(u.anisotropyRotation)), u.anisotropyMap && (p.anisotropyMap.value = u.anisotropyMap, t(u.anisotropyMap, p.anisotropyMapTransform))), p.specularIntensity.value = u.specularIntensity, p.specularColor.value.copy(u.specularColor), u.specularColorMap && (p.specularColorMap.value = u.specularColorMap, t(u.specularColorMap, p.specularColorMapTransform)), u.specularIntensityMap && (p.specularIntensityMap.value = u.specularIntensityMap, t(u.specularIntensityMap, p.specularIntensityMapTransform));
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
function ud(n, e, t, i) {
  let r = {}, s = {}, a = [];
  const o = n.getParameter(n.MAX_UNIFORM_BUFFER_BINDINGS);
  function l(b, S) {
    const T = S.program;
    i.uniformBlockBinding(b, T);
  }
  function c(b, S) {
    let T = r[b.id];
    T === void 0 && (g(b), T = h(b), r[b.id] = T, b.addEventListener("dispose", p));
    const O = S.program;
    i.updateUBOMapping(b, O);
    const R = e.render.frame;
    s[b.id] !== R && (d(b), s[b.id] = R);
  }
  function h(b) {
    const S = f();
    b.__bindingPointIndex = S;
    const T = n.createBuffer(), O = b.__size, R = b.usage;
    return n.bindBuffer(n.UNIFORM_BUFFER, T), n.bufferData(n.UNIFORM_BUFFER, O, R), n.bindBuffer(n.UNIFORM_BUFFER, null), n.bindBufferBase(n.UNIFORM_BUFFER, S, T), T;
  }
  function f() {
    for (let b = 0; b < o; b++)
      if (a.indexOf(b) === -1)
        return a.push(b), b;
    return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."), 0;
  }
  function d(b) {
    const S = r[b.id], T = b.uniforms, O = b.__cache;
    n.bindBuffer(n.UNIFORM_BUFFER, S);
    for (let R = 0, w = T.length; R < w; R++) {
      const I = Array.isArray(T[R]) ? T[R] : [T[R]];
      for (let E = 0, x = I.length; E < x; E++) {
        const C = I[E];
        if (m(C, R, E, O) === !0) {
          const W = C.__offset, z = Array.isArray(C.value) ? C.value : [C.value];
          let V = 0;
          for (let K = 0; K < z.length; K++) {
            const G = z[K], Q = v(G);
            typeof G == "number" || typeof G == "boolean" ? (C.__data[0] = G, n.bufferSubData(n.UNIFORM_BUFFER, W + V, C.__data)) : G.isMatrix3 ? (C.__data[0] = G.elements[0], C.__data[1] = G.elements[1], C.__data[2] = G.elements[2], C.__data[3] = 0, C.__data[4] = G.elements[3], C.__data[5] = G.elements[4], C.__data[6] = G.elements[5], C.__data[7] = 0, C.__data[8] = G.elements[6], C.__data[9] = G.elements[7], C.__data[10] = G.elements[8], C.__data[11] = 0) : (G.toArray(C.__data, V), V += Q.storage / Float32Array.BYTES_PER_ELEMENT);
          }
          n.bufferSubData(n.UNIFORM_BUFFER, W, C.__data);
        }
      }
    }
    n.bindBuffer(n.UNIFORM_BUFFER, null);
  }
  function m(b, S, T, O) {
    const R = b.value, w = S + "_" + T;
    if (O[w] === void 0)
      return typeof R == "number" || typeof R == "boolean" ? O[w] = R : O[w] = R.clone(), !0;
    {
      const I = O[w];
      if (typeof R == "number" || typeof R == "boolean") {
        if (I !== R)
          return O[w] = R, !0;
      } else if (I.equals(R) === !1)
        return I.copy(R), !0;
    }
    return !1;
  }
  function g(b) {
    const S = b.uniforms;
    let T = 0;
    const O = 16;
    for (let w = 0, I = S.length; w < I; w++) {
      const E = Array.isArray(S[w]) ? S[w] : [S[w]];
      for (let x = 0, C = E.length; x < C; x++) {
        const W = E[x], z = Array.isArray(W.value) ? W.value : [W.value];
        for (let V = 0, K = z.length; V < K; V++) {
          const G = z[V], Q = v(G), H = T % O;
          H !== 0 && O - H < Q.boundary && (T += O - H), W.__data = new Float32Array(Q.storage / Float32Array.BYTES_PER_ELEMENT), W.__offset = T, T += Q.storage;
        }
      }
    }
    const R = T % O;
    return R > 0 && (T += O - R), b.__size = T, b.__cache = {}, this;
  }
  function v(b) {
    const S = {
      boundary: 0,
      // bytes
      storage: 0
      // bytes
    };
    return typeof b == "number" || typeof b == "boolean" ? (S.boundary = 4, S.storage = 4) : b.isVector2 ? (S.boundary = 8, S.storage = 8) : b.isVector3 || b.isColor ? (S.boundary = 16, S.storage = 12) : b.isVector4 ? (S.boundary = 16, S.storage = 16) : b.isMatrix3 ? (S.boundary = 48, S.storage = 48) : b.isMatrix4 ? (S.boundary = 64, S.storage = 64) : b.isTexture ? console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group.") : console.warn("THREE.WebGLRenderer: Unsupported uniform value type.", b), S;
  }
  function p(b) {
    const S = b.target;
    S.removeEventListener("dispose", p);
    const T = a.indexOf(S.__bindingPointIndex);
    a.splice(T, 1), n.deleteBuffer(r[S.id]), delete r[S.id], delete s[S.id];
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
class Ed {
  constructor(e = {}) {
    const {
      canvas: t = wa(),
      context: i = null,
      depth: r = !0,
      stencil: s = !1,
      alpha: a = !1,
      antialias: o = !1,
      premultipliedAlpha: l = !0,
      preserveDrawingBuffer: c = !1,
      powerPreference: h = "default",
      failIfMajorPerformanceCaveat: f = !1
    } = e;
    this.isWebGLRenderer = !0;
    let d;
    if (i !== null) {
      if (typeof WebGLRenderingContext < "u" && i instanceof WebGLRenderingContext)
        throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");
      d = i.getContextAttributes().alpha;
    } else
      d = a;
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
    }, this.autoClear = !0, this.autoClearColor = !0, this.autoClearDepth = !0, this.autoClearStencil = !0, this.sortObjects = !0, this.clippingPlanes = [], this.localClippingEnabled = !1, this._outputColorSpace = Pt, this.toneMapping = 0, this.toneMappingExposure = 1;
    const S = this;
    let T = !1, O = 0, R = 0, w = null, I = -1, E = null;
    const x = new $e(), C = new $e();
    let W = null;
    const z = new ke(0);
    let V = 0, K = t.width, G = t.height, Q = 1, H = null, fe = null;
    const xe = new $e(0, 0, K, G), me = new $e(0, 0, K, G);
    let Be = !1;
    const We = new Lr();
    let k = !1, ee = !1;
    const _e = new je(), ce = new L(), Ce = new $e(), Ne = { background: null, fog: null, environment: null, overrideMaterial: null, isScene: !0 };
    let Pe = !1;
    function He() {
      return w === null ? Q : 1;
    }
    let y = i;
    function ie(M, D) {
      return t.getContext(M, D);
    }
    try {
      const M = {
        alpha: !0,
        depth: r,
        stencil: s,
        antialias: o,
        premultipliedAlpha: l,
        preserveDrawingBuffer: c,
        powerPreference: h,
        failIfMajorPerformanceCaveat: f
      };
      if ("setAttribute" in t && t.setAttribute("data-engine", `three.js r${xa}`), t.addEventListener("webglcontextlost", q, !1), t.addEventListener("webglcontextrestored", Y, !1), t.addEventListener("webglcontextcreationerror", se, !1), y === null) {
        const D = "webgl2";
        if (y = ie(D, M), y === null)
          throw ie(D) ? new Error("Error creating WebGL context with your selected attributes.") : new Error("Error creating WebGL context.");
      }
    } catch (M) {
      throw console.error("THREE.WebGLRenderer: " + M.message), M;
    }
    let j, he, X, Ae, ue, ve, A, _, F, $, J, Z, Te, ae, ge, Ie, te, pe, Ge, De, Se, Ue, ze, Qe;
    function P() {
      j = new vh(y), j.init(), Ue = new id(y, j), he = new dh(y, j, e, Ue), X = new Qu(y), Ae = new Mh(y), ue = new zu(), ve = new td(y, j, X, ue, he, Ue, Ae), A = new gh(S), _ = new _h(S), F = new wo(y), ze = new hh(y, F), $ = new xh(y, F, Ae, ze), J = new Eh(y, $, F, Ae), Ge = new yh(y, he, ve), Ie = new fh(ue), Z = new Bu(S, A, _, j, he, ze, Ie), Te = new hd(S, ue), ae = new Vu(), ge = new Yu(j), pe = new ch(S, A, _, X, J, d, l), te = new ju(S, J, he), Qe = new ud(y, Ae, he, X), De = new uh(y, j, Ae), Se = new Sh(y, j, Ae), Ae.programs = Z.programs, S.capabilities = he, S.extensions = j, S.properties = ue, S.renderLists = ae, S.shadowMap = te, S.state = X, S.info = Ae;
    }
    P();
    const ne = new ld(S, y);
    this.xr = ne, this.getContext = function() {
      return y;
    }, this.getContextAttributes = function() {
      return y.getContextAttributes();
    }, this.forceContextLoss = function() {
      const M = j.get("WEBGL_lose_context");
      M && M.loseContext();
    }, this.forceContextRestore = function() {
      const M = j.get("WEBGL_lose_context");
      M && M.restoreContext();
    }, this.getPixelRatio = function() {
      return Q;
    }, this.setPixelRatio = function(M) {
      M !== void 0 && (Q = M, this.setSize(K, G, !1));
    }, this.getSize = function(M) {
      return M.set(K, G);
    }, this.setSize = function(M, D, N = !0) {
      if (ne.isPresenting) {
        console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");
        return;
      }
      K = M, G = D, t.width = Math.floor(M * Q), t.height = Math.floor(D * Q), N === !0 && (t.style.width = M + "px", t.style.height = D + "px"), this.setViewport(0, 0, M, D);
    }, this.getDrawingBufferSize = function(M) {
      return M.set(K * Q, G * Q).floor();
    }, this.setDrawingBufferSize = function(M, D, N) {
      K = M, G = D, Q = N, t.width = Math.floor(M * N), t.height = Math.floor(D * N), this.setViewport(0, 0, M, D);
    }, this.getCurrentViewport = function(M) {
      return M.copy(x);
    }, this.getViewport = function(M) {
      return M.copy(xe);
    }, this.setViewport = function(M, D, N, B) {
      M.isVector4 ? xe.set(M.x, M.y, M.z, M.w) : xe.set(M, D, N, B), X.viewport(x.copy(xe).multiplyScalar(Q).round());
    }, this.getScissor = function(M) {
      return M.copy(me);
    }, this.setScissor = function(M, D, N, B) {
      M.isVector4 ? me.set(M.x, M.y, M.z, M.w) : me.set(M, D, N, B), X.scissor(C.copy(me).multiplyScalar(Q).round());
    }, this.getScissorTest = function() {
      return Be;
    }, this.setScissorTest = function(M) {
      X.setScissorTest(Be = M);
    }, this.setOpaqueSort = function(M) {
      H = M;
    }, this.setTransparentSort = function(M) {
      fe = M;
    }, this.getClearColor = function(M) {
      return M.copy(pe.getClearColor());
    }, this.setClearColor = function() {
      pe.setClearColor.apply(pe, arguments);
    }, this.getClearAlpha = function() {
      return pe.getClearAlpha();
    }, this.setClearAlpha = function() {
      pe.setClearAlpha.apply(pe, arguments);
    }, this.clear = function(M = !0, D = !0, N = !0) {
      let B = 0;
      if (M) {
        let U = !1;
        if (w !== null) {
          const re = w.texture.format;
          U = re === 1033 || re === 1031 || re === 1029;
        }
        if (U) {
          const re = w.texture.type, de = re === 1009 || re === 1014 || re === 1012 || re === 1020 || re === 1017 || re === 1018, Me = pe.getClearColor(), ye = pe.getClearAlpha(), we = Me.r, Le = Me.g, be = Me.b;
          de ? (m[0] = we, m[1] = Le, m[2] = be, m[3] = ye, y.clearBufferuiv(y.COLOR, 0, m)) : (g[0] = we, g[1] = Le, g[2] = be, g[3] = ye, y.clearBufferiv(y.COLOR, 0, g));
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
      t.removeEventListener("webglcontextlost", q, !1), t.removeEventListener("webglcontextrestored", Y, !1), t.removeEventListener("webglcontextcreationerror", se, !1), ae.dispose(), ge.dispose(), ue.dispose(), A.dispose(), _.dispose(), J.dispose(), ze.dispose(), Qe.dispose(), Z.dispose(), ne.dispose(), ne.removeEventListener("sessionstart", Ct), ne.removeEventListener("sessionend", Fr), ti.stop();
    };
    function q(M) {
      M.preventDefault(), console.log("THREE.WebGLRenderer: Context Lost."), T = !0;
    }
    function Y() {
      console.log("THREE.WebGLRenderer: Context Restored."), T = !1;
      const M = Ae.autoReset, D = te.enabled, N = te.autoUpdate, B = te.needsUpdate, U = te.type;
      P(), Ae.autoReset = M, te.enabled = D, te.autoUpdate = N, te.needsUpdate = B, te.type = U;
    }
    function se(M) {
      console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ", M.statusMessage);
    }
    function Re(M) {
      const D = M.target;
      D.removeEventListener("dispose", Re), Ve(D);
    }
    function Ve(M) {
      nt(M), ue.remove(M);
    }
    function nt(M) {
      const D = ue.get(M).programs;
      D !== void 0 && (D.forEach(function(N) {
        Z.releaseProgram(N);
      }), M.isShaderMaterial && Z.releaseShaderCache(M));
    }
    this.renderBufferDirect = function(M, D, N, B, U, re) {
      D === null && (D = Ne);
      const de = U.isMesh && U.matrixWorld.determinant() < 0, Me = ma(M, D, N, B, U);
      X.setMaterial(B, de);
      let ye = N.index, we = 1;
      if (B.wireframe === !0) {
        if (ye = $.getWireframeAttribute(N), ye === void 0) return;
        we = 2;
      }
      const Le = N.drawRange, be = N.attributes.position;
      let qe = Le.start * we, tt = (Le.start + Le.count) * we;
      re !== null && (qe = Math.max(qe, re.start * we), tt = Math.min(tt, (re.start + re.count) * we)), ye !== null ? (qe = Math.max(qe, 0), tt = Math.min(tt, ye.count)) : be != null && (qe = Math.max(qe, 0), tt = Math.min(tt, be.count));
      const it = tt - qe;
      if (it < 0 || it === 1 / 0) return;
      ze.setup(U, B, Me, N, ye);
      let vt, Ye = De;
      if (ye !== null && (vt = F.get(ye), Ye = Se, Ye.setIndex(vt)), U.isMesh)
        B.wireframe === !0 ? (X.setLineWidth(B.wireframeLinewidth * He()), Ye.setMode(y.LINES)) : Ye.setMode(y.TRIANGLES);
      else if (U.isLine) {
        let Ee = B.linewidth;
        Ee === void 0 && (Ee = 1), X.setLineWidth(Ee * He()), U.isLineSegments ? Ye.setMode(y.LINES) : U.isLineLoop ? Ye.setMode(y.LINE_LOOP) : Ye.setMode(y.LINE_STRIP);
      } else U.isPoints ? Ye.setMode(y.POINTS) : U.isSprite && Ye.setMode(y.TRIANGLES);
      if (U.isBatchedMesh)
        if (U._multiDrawInstances !== null)
          Ye.renderMultiDrawInstances(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount, U._multiDrawInstances);
        else if (j.get("WEBGL_multi_draw"))
          Ye.renderMultiDraw(U._multiDrawStarts, U._multiDrawCounts, U._multiDrawCount);
        else {
          const Ee = U._multiDrawStarts, ht = U._multiDrawCounts, Ke = U._multiDrawCount, At = ye ? F.get(ye).bytesPerElement : 1, fi = ue.get(B).currentProgram.getUniforms();
          for (let xt = 0; xt < Ke; xt++)
            fi.setValue(y, "_gl_DrawID", xt), Ye.render(Ee[xt] / At, ht[xt]);
        }
      else if (U.isInstancedMesh)
        Ye.renderInstances(qe, it, U.count);
      else if (N.isInstancedBufferGeometry) {
        const Ee = N._maxInstanceCount !== void 0 ? N._maxInstanceCount : 1 / 0, ht = Math.min(N.instanceCount, Ee);
        Ye.renderInstances(qe, it, ht);
      } else
        Ye.render(qe, it);
    };
    function ct(M, D, N) {
      M.transparent === !0 && M.side === 2 && M.forceSinglePass === !1 ? (M.side = 1, M.needsUpdate = !0, tn(M, D, N), M.side = 0, M.needsUpdate = !0, tn(M, D, N), M.side = 2) : tn(M, D, N);
    }
    this.compile = function(M, D, N = null) {
      N === null && (N = M), p = ge.get(N), p.init(D), b.push(p), N.traverseVisible(function(U) {
        U.isLight && U.layers.test(D.layers) && (p.pushLight(U), U.castShadow && p.pushShadow(U));
      }), M !== N && M.traverseVisible(function(U) {
        U.isLight && U.layers.test(D.layers) && (p.pushLight(U), U.castShadow && p.pushShadow(U));
      }), p.setupLights();
      const B = /* @__PURE__ */ new Set();
      return M.traverse(function(U) {
        const re = U.material;
        if (re)
          if (Array.isArray(re))
            for (let de = 0; de < re.length; de++) {
              const Me = re[de];
              ct(Me, N, U), B.add(Me);
            }
          else
            ct(re, N, U), B.add(re);
      }), b.pop(), p = null, B;
    }, this.compileAsync = function(M, D, N = null) {
      const B = this.compile(M, D, N);
      return new Promise((U) => {
        function re() {
          if (B.forEach(function(de) {
            ue.get(de).currentProgram.isReady() && B.delete(de);
          }), B.size === 0) {
            U(M);
            return;
          }
          setTimeout(re, 10);
        }
        j.get("KHR_parallel_shader_compile") !== null ? re() : setTimeout(re, 10);
      });
    };
    let Xe = null;
    function Ft(M) {
      Xe && Xe(M);
    }
    function Ct() {
      ti.stop();
    }
    function Fr() {
      ti.start();
    }
    const ti = new oa();
    ti.setAnimationLoop(Ft), typeof self < "u" && ti.setContext(self), this.setAnimationLoop = function(M) {
      Xe = M, ne.setAnimationLoop(M), M === null ? ti.stop() : ti.start();
    }, ne.addEventListener("sessionstart", Ct), ne.addEventListener("sessionend", Fr), this.render = function(M, D) {
      if (D !== void 0 && D.isCamera !== !0) {
        console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");
        return;
      }
      if (T === !0) return;
      if (M.matrixWorldAutoUpdate === !0 && M.updateMatrixWorld(), D.parent === null && D.matrixWorldAutoUpdate === !0 && D.updateMatrixWorld(), ne.enabled === !0 && ne.isPresenting === !0 && (ne.cameraAutoUpdate === !0 && ne.updateCamera(D), D = ne.getCamera()), M.isScene === !0 && M.onBeforeRender(S, M, D, w), p = ge.get(M, b.length), p.init(D), b.push(p), _e.multiplyMatrices(D.projectionMatrix, D.matrixWorldInverse), We.setFromProjectionMatrix(_e), ee = this.localClippingEnabled, k = Ie.init(this.clippingPlanes, ee), v = ae.get(M, u.length), v.init(), u.push(v), ne.enabled === !0 && ne.isPresenting === !0) {
        const re = S.xr.getDepthSensingMesh();
        re !== null && Bn(re, D, -1 / 0, S.sortObjects);
      }
      Bn(M, D, 0, S.sortObjects), v.finish(), S.sortObjects === !0 && v.sort(H, fe), Pe = ne.enabled === !1 || ne.isPresenting === !1 || ne.hasDepthSensing() === !1, Pe && pe.addToRenderList(v, M), this.info.render.frame++, k === !0 && Ie.beginShadows();
      const N = p.state.shadowsArray;
      te.render(N, M, D), k === !0 && Ie.endShadows(), this.info.autoReset === !0 && this.info.reset();
      const B = v.opaque, U = v.transmissive;
      if (p.setupLights(), D.isArrayCamera) {
        const re = D.cameras;
        if (U.length > 0)
          for (let de = 0, Me = re.length; de < Me; de++) {
            const ye = re[de];
            Br(B, U, M, ye);
          }
        Pe && pe.render(M);
        for (let de = 0, Me = re.length; de < Me; de++) {
          const ye = re[de];
          Or(v, M, ye, ye.viewport);
        }
      } else
        U.length > 0 && Br(B, U, M, D), Pe && pe.render(M), Or(v, M, D);
      w !== null && (ve.updateMultisampleRenderTarget(w), ve.updateRenderTargetMipmap(w)), M.isScene === !0 && M.onAfterRender(S, M, D), ze.resetDefaultState(), I = -1, E = null, b.pop(), b.length > 0 ? (p = b[b.length - 1], k === !0 && Ie.setGlobalState(S.clippingPlanes, p.state.camera)) : p = null, u.pop(), u.length > 0 ? v = u[u.length - 1] : v = null;
    };
    function Bn(M, D, N, B) {
      if (M.visible === !1) return;
      if (M.layers.test(D.layers)) {
        if (M.isGroup)
          N = M.renderOrder;
        else if (M.isLOD)
          M.autoUpdate === !0 && M.update(D);
        else if (M.isLight)
          p.pushLight(M), M.castShadow && p.pushShadow(M);
        else if (M.isSprite) {
          if (!M.frustumCulled || We.intersectsSprite(M)) {
            B && Ce.setFromMatrixPosition(M.matrixWorld).applyMatrix4(_e);
            const de = J.update(M), Me = M.material;
            Me.visible && v.push(M, de, Me, N, Ce.z, null);
          }
        } else if ((M.isMesh || M.isLine || M.isPoints) && (!M.frustumCulled || We.intersectsObject(M))) {
          const de = J.update(M), Me = M.material;
          if (B && (M.boundingSphere !== void 0 ? (M.boundingSphere === null && M.computeBoundingSphere(), Ce.copy(M.boundingSphere.center)) : (de.boundingSphere === null && de.computeBoundingSphere(), Ce.copy(de.boundingSphere.center)), Ce.applyMatrix4(M.matrixWorld).applyMatrix4(_e)), Array.isArray(Me)) {
            const ye = de.groups;
            for (let we = 0, Le = ye.length; we < Le; we++) {
              const be = ye[we], qe = Me[be.materialIndex];
              qe && qe.visible && v.push(M, de, qe, N, Ce.z, be);
            }
          } else Me.visible && v.push(M, de, Me, N, Ce.z, null);
        }
      }
      const re = M.children;
      for (let de = 0, Me = re.length; de < Me; de++)
        Bn(re[de], D, N, B);
    }
    function Or(M, D, N, B) {
      const U = M.opaque, re = M.transmissive, de = M.transparent;
      p.setupLightsView(N), k === !0 && Ie.setGlobalState(S.clippingPlanes, N), B && X.viewport(x.copy(B)), U.length > 0 && en(U, D, N), re.length > 0 && en(re, D, N), de.length > 0 && en(de, D, N), X.buffers.depth.setTest(!0), X.buffers.depth.setMask(!0), X.buffers.color.setMask(!0), X.setPolygonOffset(!1);
    }
    function Br(M, D, N, B) {
      if ((N.isScene === !0 ? N.overrideMaterial : null) !== null)
        return;
      p.state.transmissionRenderTarget[B.id] === void 0 && (p.state.transmissionRenderTarget[B.id] = new di(1, 1, {
        generateMipmaps: !0,
        type: j.has("EXT_color_buffer_half_float") || j.has("EXT_color_buffer_float") ? 1016 : 1009,
        minFilter: 1008,
        samples: 4,
        stencilBuffer: s,
        resolveDepthBuffer: !1,
        resolveStencilBuffer: !1,
        colorSpace: Ze.workingColorSpace
      }));
      const re = p.state.transmissionRenderTarget[B.id], de = B.viewport || x;
      re.setSize(de.z, de.w);
      const Me = S.getRenderTarget();
      S.setRenderTarget(re), S.getClearColor(z), V = S.getClearAlpha(), V < 1 && S.setClearColor(16777215, 0.5), Pe ? pe.render(N) : S.clear();
      const ye = S.toneMapping;
      S.toneMapping = 0;
      const we = B.viewport;
      if (B.viewport !== void 0 && (B.viewport = void 0), p.setupLightsView(B), k === !0 && Ie.setGlobalState(S.clippingPlanes, B), en(M, N, B), ve.updateMultisampleRenderTarget(re), ve.updateRenderTargetMipmap(re), j.has("WEBGL_multisampled_render_to_texture") === !1) {
        let Le = !1;
        for (let be = 0, qe = D.length; be < qe; be++) {
          const tt = D[be], it = tt.object, vt = tt.geometry, Ye = tt.material, Ee = tt.group;
          if (Ye.side === 2 && it.layers.test(B.layers)) {
            const ht = Ye.side;
            Ye.side = 1, Ye.needsUpdate = !0, zr(it, N, B, vt, Ye, Ee), Ye.side = ht, Ye.needsUpdate = !0, Le = !0;
          }
        }
        Le === !0 && (ve.updateMultisampleRenderTarget(re), ve.updateRenderTargetMipmap(re));
      }
      S.setRenderTarget(Me), S.setClearColor(z, V), we !== void 0 && (B.viewport = we), S.toneMapping = ye;
    }
    function en(M, D, N) {
      const B = D.isScene === !0 ? D.overrideMaterial : null;
      for (let U = 0, re = M.length; U < re; U++) {
        const de = M[U], Me = de.object, ye = de.geometry, we = B === null ? de.material : B, Le = de.group;
        Me.layers.test(N.layers) && zr(Me, D, N, ye, we, Le);
      }
    }
    function zr(M, D, N, B, U, re) {
      M.onBeforeRender(S, D, N, B, U, re), M.modelViewMatrix.multiplyMatrices(N.matrixWorldInverse, M.matrixWorld), M.normalMatrix.getNormalMatrix(M.modelViewMatrix), U.transparent === !0 && U.side === 2 && U.forceSinglePass === !1 ? (U.side = 1, U.needsUpdate = !0, S.renderBufferDirect(N, D, B, U, M, re), U.side = 0, U.needsUpdate = !0, S.renderBufferDirect(N, D, B, U, M, re), U.side = 2) : S.renderBufferDirect(N, D, B, U, M, re), M.onAfterRender(S, D, N, B, U, re);
    }
    function tn(M, D, N) {
      D.isScene !== !0 && (D = Ne);
      const B = ue.get(M), U = p.state.lights, re = p.state.shadowsArray, de = U.state.version, Me = Z.getParameters(M, U.state, re, D, N), ye = Z.getProgramCacheKey(Me);
      let we = B.programs;
      B.environment = M.isMeshStandardMaterial ? D.environment : null, B.fog = D.fog, B.envMap = (M.isMeshStandardMaterial ? _ : A).get(M.envMap || B.environment), B.envMapRotation = B.environment !== null && M.envMap === null ? D.environmentRotation : M.envMapRotation, we === void 0 && (M.addEventListener("dispose", Re), we = /* @__PURE__ */ new Map(), B.programs = we);
      let Le = we.get(ye);
      if (Le !== void 0) {
        if (B.currentProgram === Le && B.lightsStateVersion === de)
          return Vr(M, Me), Le;
      } else
        Me.uniforms = Z.getUniforms(M), M.onBeforeCompile(Me, S), Le = Z.acquireProgram(Me, ye), we.set(ye, Le), B.uniforms = Me.uniforms;
      const be = B.uniforms;
      return (!M.isShaderMaterial && !M.isRawShaderMaterial || M.clipping === !0) && (be.clippingPlanes = Ie.uniform), Vr(M, Me), B.needsLights = _a(M), B.lightsStateVersion = de, B.needsLights && (be.ambientLightColor.value = U.state.ambient, be.lightProbe.value = U.state.probe, be.directionalLights.value = U.state.directional, be.directionalLightShadows.value = U.state.directionalShadow, be.spotLights.value = U.state.spot, be.spotLightShadows.value = U.state.spotShadow, be.rectAreaLights.value = U.state.rectArea, be.ltc_1.value = U.state.rectAreaLTC1, be.ltc_2.value = U.state.rectAreaLTC2, be.pointLights.value = U.state.point, be.pointLightShadows.value = U.state.pointShadow, be.hemisphereLights.value = U.state.hemi, be.directionalShadowMap.value = U.state.directionalShadowMap, be.directionalShadowMatrix.value = U.state.directionalShadowMatrix, be.spotShadowMap.value = U.state.spotShadowMap, be.spotLightMatrix.value = U.state.spotLightMatrix, be.spotLightMap.value = U.state.spotLightMap, be.pointShadowMap.value = U.state.pointShadowMap, be.pointShadowMatrix.value = U.state.pointShadowMatrix), B.currentProgram = Le, B.uniformsList = null, Le;
    }
    function Gr(M) {
      if (M.uniformsList === null) {
        const D = M.currentProgram.getUniforms();
        M.uniformsList = Cn.seqWithValue(D.seq, M.uniforms);
      }
      return M.uniformsList;
    }
    function Vr(M, D) {
      const N = ue.get(M);
      N.outputColorSpace = D.outputColorSpace, N.batching = D.batching, N.batchingColor = D.batchingColor, N.instancing = D.instancing, N.instancingColor = D.instancingColor, N.instancingMorph = D.instancingMorph, N.skinning = D.skinning, N.morphTargets = D.morphTargets, N.morphNormals = D.morphNormals, N.morphColors = D.morphColors, N.morphTargetsCount = D.morphTargetsCount, N.numClippingPlanes = D.numClippingPlanes, N.numIntersection = D.numClipIntersection, N.vertexAlphas = D.vertexAlphas, N.vertexTangents = D.vertexTangents, N.toneMapping = D.toneMapping;
    }
    function ma(M, D, N, B, U) {
      D.isScene !== !0 && (D = Ne), ve.resetTextureUnits();
      const re = D.fog, de = B.isMeshStandardMaterial ? D.environment : null, Me = w === null ? S.outputColorSpace : w.isXRRenderTarget === !0 ? w.texture.colorSpace : Qt, ye = (B.isMeshStandardMaterial ? _ : A).get(B.envMap || de), we = B.vertexColors === !0 && !!N.attributes.color && N.attributes.color.itemSize === 4, Le = !!N.attributes.tangent && (!!B.normalMap || B.anisotropy > 0), be = !!N.morphAttributes.position, qe = !!N.morphAttributes.normal, tt = !!N.morphAttributes.color;
      let it = 0;
      B.toneMapped && (w === null || w.isXRRenderTarget === !0) && (it = S.toneMapping);
      const vt = N.morphAttributes.position || N.morphAttributes.normal || N.morphAttributes.color, Ye = vt !== void 0 ? vt.length : 0, Ee = ue.get(B), ht = p.state.lights;
      if (k === !0 && (ee === !0 || M !== E)) {
        const yt = M === E && B.id === I;
        Ie.setState(B, M, yt);
      }
      let Ke = !1;
      B.version === Ee.__version ? (Ee.needsLights && Ee.lightsStateVersion !== ht.state.version || Ee.outputColorSpace !== Me || U.isBatchedMesh && Ee.batching === !1 || !U.isBatchedMesh && Ee.batching === !0 || U.isBatchedMesh && Ee.batchingColor === !0 && U.colorTexture === null || U.isBatchedMesh && Ee.batchingColor === !1 && U.colorTexture !== null || U.isInstancedMesh && Ee.instancing === !1 || !U.isInstancedMesh && Ee.instancing === !0 || U.isSkinnedMesh && Ee.skinning === !1 || !U.isSkinnedMesh && Ee.skinning === !0 || U.isInstancedMesh && Ee.instancingColor === !0 && U.instanceColor === null || U.isInstancedMesh && Ee.instancingColor === !1 && U.instanceColor !== null || U.isInstancedMesh && Ee.instancingMorph === !0 && U.morphTexture === null || U.isInstancedMesh && Ee.instancingMorph === !1 && U.morphTexture !== null || Ee.envMap !== ye || B.fog === !0 && Ee.fog !== re || Ee.numClippingPlanes !== void 0 && (Ee.numClippingPlanes !== Ie.numPlanes || Ee.numIntersection !== Ie.numIntersection) || Ee.vertexAlphas !== we || Ee.vertexTangents !== Le || Ee.morphTargets !== be || Ee.morphNormals !== qe || Ee.morphColors !== tt || Ee.toneMapping !== it || Ee.morphTargetsCount !== Ye) && (Ke = !0) : (Ke = !0, Ee.__version = B.version);
      let At = Ee.currentProgram;
      Ke === !0 && (At = tn(B, D, U));
      let fi = !1, xt = !1, zn = !1;
      const rt = At.getUniforms(), Wt = Ee.uniforms;
      if (X.useProgram(At.program) && (fi = !0, xt = !0, zn = !0), B.id !== I && (I = B.id, xt = !0), fi || E !== M) {
        rt.setValue(y, "projectionMatrix", M.projectionMatrix), rt.setValue(y, "viewMatrix", M.matrixWorldInverse);
        const yt = rt.map.cameraPosition;
        yt !== void 0 && yt.setValue(y, ce.setFromMatrixPosition(M.matrixWorld)), he.logarithmicDepthBuffer && rt.setValue(
          y,
          "logDepthBufFC",
          2 / (Math.log(M.far + 1) / Math.LN2)
        ), (B.isMeshPhongMaterial || B.isMeshToonMaterial || B.isMeshLambertMaterial || B.isMeshBasicMaterial || B.isMeshStandardMaterial || B.isShaderMaterial) && rt.setValue(y, "isOrthographic", M.isOrthographicCamera === !0), E !== M && (E = M, xt = !0, zn = !0);
      }
      if (U.isSkinnedMesh) {
        rt.setOptional(y, U, "bindMatrix"), rt.setOptional(y, U, "bindMatrixInverse");
        const yt = U.skeleton;
        yt && (yt.boneTexture === null && yt.computeBoneTexture(), rt.setValue(y, "boneTexture", yt.boneTexture, ve));
      }
      U.isBatchedMesh && (rt.setOptional(y, U, "batchingTexture"), rt.setValue(y, "batchingTexture", U._matricesTexture, ve), rt.setOptional(y, U, "batchingIdTexture"), rt.setValue(y, "batchingIdTexture", U._indirectTexture, ve), rt.setOptional(y, U, "batchingColorTexture"), U._colorsTexture !== null && rt.setValue(y, "batchingColorTexture", U._colorsTexture, ve));
      const Gn = N.morphAttributes;
      if ((Gn.position !== void 0 || Gn.normal !== void 0 || Gn.color !== void 0) && Ge.update(U, N, At), (xt || Ee.receiveShadow !== U.receiveShadow) && (Ee.receiveShadow = U.receiveShadow, rt.setValue(y, "receiveShadow", U.receiveShadow)), B.isMeshGouraudMaterial && B.envMap !== null && (Wt.envMap.value = ye, Wt.flipEnvMap.value = ye.isCubeTexture && ye.isRenderTargetTexture === !1 ? -1 : 1), B.isMeshStandardMaterial && B.envMap === null && D.environment !== null && (Wt.envMapIntensity.value = D.environmentIntensity), xt && (rt.setValue(y, "toneMappingExposure", S.toneMappingExposure), Ee.needsLights && ga(Wt, zn), re && B.fog === !0 && Te.refreshFogUniforms(Wt, re), Te.refreshMaterialUniforms(Wt, B, Q, G, p.state.transmissionRenderTarget[M.id]), Cn.upload(y, Gr(Ee), Wt, ve)), B.isShaderMaterial && B.uniformsNeedUpdate === !0 && (Cn.upload(y, Gr(Ee), Wt, ve), B.uniformsNeedUpdate = !1), B.isSpriteMaterial && rt.setValue(y, "center", U.center), rt.setValue(y, "modelViewMatrix", U.modelViewMatrix), rt.setValue(y, "normalMatrix", U.normalMatrix), rt.setValue(y, "modelMatrix", U.matrixWorld), B.isShaderMaterial || B.isRawShaderMaterial) {
        const yt = B.uniformsGroups;
        for (let Vn = 0, va = yt.length; Vn < va; Vn++) {
          const Hr = yt[Vn];
          Qe.update(Hr, At), Qe.bind(Hr, At);
        }
      }
      return At;
    }
    function ga(M, D) {
      M.ambientLightColor.needsUpdate = D, M.lightProbe.needsUpdate = D, M.directionalLights.needsUpdate = D, M.directionalLightShadows.needsUpdate = D, M.pointLights.needsUpdate = D, M.pointLightShadows.needsUpdate = D, M.spotLights.needsUpdate = D, M.spotLightShadows.needsUpdate = D, M.rectAreaLights.needsUpdate = D, M.hemisphereLights.needsUpdate = D;
    }
    function _a(M) {
      return M.isMeshLambertMaterial || M.isMeshToonMaterial || M.isMeshPhongMaterial || M.isMeshStandardMaterial || M.isShadowMaterial || M.isShaderMaterial && M.lights === !0;
    }
    this.getActiveCubeFace = function() {
      return O;
    }, this.getActiveMipmapLevel = function() {
      return R;
    }, this.getRenderTarget = function() {
      return w;
    }, this.setRenderTargetTextures = function(M, D, N) {
      ue.get(M.texture).__webglTexture = D, ue.get(M.depthTexture).__webglTexture = N;
      const B = ue.get(M);
      B.__hasExternalTextures = !0, B.__autoAllocateDepthBuffer = N === void 0, B.__autoAllocateDepthBuffer || j.has("WEBGL_multisampled_render_to_texture") === !0 && (console.warn("THREE.WebGLRenderer: Render-to-texture extension was disabled because an external texture was provided"), B.__useRenderToTexture = !1);
    }, this.setRenderTargetFramebuffer = function(M, D) {
      const N = ue.get(M);
      N.__webglFramebuffer = D, N.__useDefaultFramebuffer = D === void 0;
    }, this.setRenderTarget = function(M, D = 0, N = 0) {
      w = M, O = D, R = N;
      let B = !0, U = null, re = !1, de = !1;
      if (M) {
        const ye = ue.get(M);
        ye.__useDefaultFramebuffer !== void 0 ? (X.bindFramebuffer(y.FRAMEBUFFER, null), B = !1) : ye.__webglFramebuffer === void 0 ? ve.setupRenderTarget(M) : ye.__hasExternalTextures && ve.rebindTextures(M, ue.get(M.texture).__webglTexture, ue.get(M.depthTexture).__webglTexture);
        const we = M.texture;
        (we.isData3DTexture || we.isDataArrayTexture || we.isCompressedArrayTexture) && (de = !0);
        const Le = ue.get(M).__webglFramebuffer;
        M.isWebGLCubeRenderTarget ? (Array.isArray(Le[D]) ? U = Le[D][N] : U = Le[D], re = !0) : M.samples > 0 && ve.useMultisampledRTT(M) === !1 ? U = ue.get(M).__webglMultisampledFramebuffer : Array.isArray(Le) ? U = Le[N] : U = Le, x.copy(M.viewport), C.copy(M.scissor), W = M.scissorTest;
      } else
        x.copy(xe).multiplyScalar(Q).floor(), C.copy(me).multiplyScalar(Q).floor(), W = Be;
      if (X.bindFramebuffer(y.FRAMEBUFFER, U) && B && X.drawBuffers(M, U), X.viewport(x), X.scissor(C), X.setScissorTest(W), re) {
        const ye = ue.get(M.texture);
        y.framebufferTexture2D(y.FRAMEBUFFER, y.COLOR_ATTACHMENT0, y.TEXTURE_CUBE_MAP_POSITIVE_X + D, ye.__webglTexture, N);
      } else if (de) {
        const ye = ue.get(M.texture), we = D || 0;
        y.framebufferTextureLayer(y.FRAMEBUFFER, y.COLOR_ATTACHMENT0, ye.__webglTexture, N || 0, we);
      }
      I = -1;
    }, this.readRenderTargetPixels = function(M, D, N, B, U, re, de) {
      if (!(M && M.isWebGLRenderTarget)) {
        console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
        return;
      }
      let Me = ue.get(M).__webglFramebuffer;
      if (M.isWebGLCubeRenderTarget && de !== void 0 && (Me = Me[de]), Me) {
        X.bindFramebuffer(y.FRAMEBUFFER, Me);
        try {
          const ye = M.texture, we = ye.format, Le = ye.type;
          if (!he.textureFormatReadable(we)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");
            return;
          }
          if (!he.textureTypeReadable(Le)) {
            console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");
            return;
          }
          D >= 0 && D <= M.width - B && N >= 0 && N <= M.height - U && y.readPixels(D, N, B, U, Ue.convert(we), Ue.convert(Le), re);
        } finally {
          const ye = w !== null ? ue.get(w).__webglFramebuffer : null;
          X.bindFramebuffer(y.FRAMEBUFFER, ye);
        }
      }
    }, this.readRenderTargetPixelsAsync = async function(M, D, N, B, U, re, de) {
      if (!(M && M.isWebGLRenderTarget))
        throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");
      let Me = ue.get(M).__webglFramebuffer;
      if (M.isWebGLCubeRenderTarget && de !== void 0 && (Me = Me[de]), Me) {
        X.bindFramebuffer(y.FRAMEBUFFER, Me);
        try {
          const ye = M.texture, we = ye.format, Le = ye.type;
          if (!he.textureFormatReadable(we))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");
          if (!he.textureTypeReadable(Le))
            throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");
          if (D >= 0 && D <= M.width - B && N >= 0 && N <= M.height - U) {
            const be = y.createBuffer();
            y.bindBuffer(y.PIXEL_PACK_BUFFER, be), y.bufferData(y.PIXEL_PACK_BUFFER, re.byteLength, y.STREAM_READ), y.readPixels(D, N, B, U, Ue.convert(we), Ue.convert(Le), 0), y.flush();
            const qe = y.fenceSync(y.SYNC_GPU_COMMANDS_COMPLETE, 0);
            await Ca(y, qe, 4);
            try {
              y.bindBuffer(y.PIXEL_PACK_BUFFER, be), y.getBufferSubData(y.PIXEL_PACK_BUFFER, 0, re);
            } finally {
              y.deleteBuffer(be), y.deleteSync(qe);
            }
            return re;
          }
        } finally {
          const ye = w !== null ? ue.get(w).__webglFramebuffer : null;
          X.bindFramebuffer(y.FRAMEBUFFER, ye);
        }
      }
    }, this.copyFramebufferToTexture = function(M, D = null, N = 0) {
      M.isTexture !== !0 && (console.warn("WebGLRenderer: copyFramebufferToTexture function signature has changed."), D = arguments[0] || null, M = arguments[1]);
      const B = Math.pow(2, -N), U = Math.floor(M.image.width * B), re = Math.floor(M.image.height * B), de = D !== null ? D.x : 0, Me = D !== null ? D.y : 0;
      ve.setTexture2D(M, 0), y.copyTexSubImage2D(y.TEXTURE_2D, N, 0, 0, de, Me, U, re), X.unbindTexture();
    }, this.copyTextureToTexture = function(M, D, N = null, B = null, U = 0) {
      M.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture function signature has changed."), B = arguments[0] || null, M = arguments[1], D = arguments[2], U = arguments[3] || 0, N = null);
      let re, de, Me, ye, we, Le;
      N !== null ? (re = N.max.x - N.min.x, de = N.max.y - N.min.y, Me = N.min.x, ye = N.min.y) : (re = M.image.width, de = M.image.height, Me = 0, ye = 0), B !== null ? (we = B.x, Le = B.y) : (we = 0, Le = 0);
      const be = Ue.convert(D.format), qe = Ue.convert(D.type);
      ve.setTexture2D(D, 0), y.pixelStorei(y.UNPACK_FLIP_Y_WEBGL, D.flipY), y.pixelStorei(y.UNPACK_PREMULTIPLY_ALPHA_WEBGL, D.premultiplyAlpha), y.pixelStorei(y.UNPACK_ALIGNMENT, D.unpackAlignment);
      const tt = y.getParameter(y.UNPACK_ROW_LENGTH), it = y.getParameter(y.UNPACK_IMAGE_HEIGHT), vt = y.getParameter(y.UNPACK_SKIP_PIXELS), Ye = y.getParameter(y.UNPACK_SKIP_ROWS), Ee = y.getParameter(y.UNPACK_SKIP_IMAGES), ht = M.isCompressedTexture ? M.mipmaps[U] : M.image;
      y.pixelStorei(y.UNPACK_ROW_LENGTH, ht.width), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, ht.height), y.pixelStorei(y.UNPACK_SKIP_PIXELS, Me), y.pixelStorei(y.UNPACK_SKIP_ROWS, ye), M.isDataTexture ? y.texSubImage2D(y.TEXTURE_2D, U, we, Le, re, de, be, qe, ht.data) : M.isCompressedTexture ? y.compressedTexSubImage2D(y.TEXTURE_2D, U, we, Le, ht.width, ht.height, be, ht.data) : y.texSubImage2D(y.TEXTURE_2D, U, we, Le, re, de, be, qe, ht), y.pixelStorei(y.UNPACK_ROW_LENGTH, tt), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, it), y.pixelStorei(y.UNPACK_SKIP_PIXELS, vt), y.pixelStorei(y.UNPACK_SKIP_ROWS, Ye), y.pixelStorei(y.UNPACK_SKIP_IMAGES, Ee), U === 0 && D.generateMipmaps && y.generateMipmap(y.TEXTURE_2D), X.unbindTexture();
    }, this.copyTextureToTexture3D = function(M, D, N = null, B = null, U = 0) {
      M.isTexture !== !0 && (console.warn("WebGLRenderer: copyTextureToTexture3D function signature has changed."), N = arguments[0] || null, B = arguments[1] || null, M = arguments[2], D = arguments[3], U = arguments[4] || 0);
      let re, de, Me, ye, we, Le, be, qe, tt;
      const it = M.isCompressedTexture ? M.mipmaps[U] : M.image;
      N !== null ? (re = N.max.x - N.min.x, de = N.max.y - N.min.y, Me = N.max.z - N.min.z, ye = N.min.x, we = N.min.y, Le = N.min.z) : (re = it.width, de = it.height, Me = it.depth, ye = 0, we = 0, Le = 0), B !== null ? (be = B.x, qe = B.y, tt = B.z) : (be = 0, qe = 0, tt = 0);
      const vt = Ue.convert(D.format), Ye = Ue.convert(D.type);
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
      const ht = y.getParameter(y.UNPACK_ROW_LENGTH), Ke = y.getParameter(y.UNPACK_IMAGE_HEIGHT), At = y.getParameter(y.UNPACK_SKIP_PIXELS), fi = y.getParameter(y.UNPACK_SKIP_ROWS), xt = y.getParameter(y.UNPACK_SKIP_IMAGES);
      y.pixelStorei(y.UNPACK_ROW_LENGTH, it.width), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, it.height), y.pixelStorei(y.UNPACK_SKIP_PIXELS, ye), y.pixelStorei(y.UNPACK_SKIP_ROWS, we), y.pixelStorei(y.UNPACK_SKIP_IMAGES, Le), M.isDataTexture || M.isData3DTexture ? y.texSubImage3D(Ee, U, be, qe, tt, re, de, Me, vt, Ye, it.data) : D.isCompressedArrayTexture ? y.compressedTexSubImage3D(Ee, U, be, qe, tt, re, de, Me, vt, it.data) : y.texSubImage3D(Ee, U, be, qe, tt, re, de, Me, vt, Ye, it), y.pixelStorei(y.UNPACK_ROW_LENGTH, ht), y.pixelStorei(y.UNPACK_IMAGE_HEIGHT, Ke), y.pixelStorei(y.UNPACK_SKIP_PIXELS, At), y.pixelStorei(y.UNPACK_SKIP_ROWS, fi), y.pixelStorei(y.UNPACK_SKIP_IMAGES, xt), U === 0 && D.generateMipmaps && y.generateMipmap(Ee), X.unbindTexture();
    }, this.initRenderTarget = function(M) {
      ue.get(M).__webglFramebuffer === void 0 && ve.setupRenderTarget(M);
    }, this.initTexture = function(M) {
      M.isCubeTexture ? ve.setTextureCube(M, 0) : M.isData3DTexture ? ve.setTexture3D(M, 0) : M.isDataArrayTexture || M.isCompressedArrayTexture ? ve.setTexture2DArray(M, 0) : ve.setTexture2D(M, 0), X.unbindTexture();
    }, this.resetState = function() {
      O = 0, R = 0, w = null, X.reset(), ze.reset();
    }, typeof __THREE_DEVTOOLS__ < "u" && __THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe", { detail: this }));
  }
  get coordinateSystem() {
    return 2e3;
  }
  get outputColorSpace() {
    return this._outputColorSpace;
  }
  set outputColorSpace(e) {
    this._outputColorSpace = e;
    const t = this.getContext();
    t.drawingBufferColorSpace = e === Rr ? "display-p3" : "srgb", t.unpackColorSpace = Ze.workingColorSpace === In ? "display-p3" : "srgb";
  }
}
class Td extends Ir {
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
class Ad {
  constructor(e) {
    this.isFont = !0, this.type = "Font", this.data = e;
  }
  generateShapes(e, t = 100) {
    const i = [], r = dd(e, t, this.data);
    for (let s = 0, a = r.length; s < a; s++)
      i.push(...r[s].toShapes());
    return i;
  }
}
function dd(n, e, t) {
  const i = Array.from(n), r = e / t.resolution, s = (t.boundingBox.yMax - t.boundingBox.yMin + t.underlineThickness) * r, a = [];
  let o = 0, l = 0;
  for (let c = 0; c < i.length; c++) {
    const h = i[c];
    if (h === `
`)
      o = 0, l -= s;
    else {
      const f = fd(h, r, o, l, t);
      o += f.offsetX, a.push(f.path);
    }
  }
  return a;
}
function fd(n, e, t, i, r) {
  const s = r.glyphs[n] || r.glyphs["?"];
  if (!s) {
    console.error('THREE.Font: character "' + n + '" does not exists in font family ' + r.familyName + ".");
    return;
  }
  const a = new Ro();
  let o, l, c, h, f, d, m, g;
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
          c = v[p++] * e + t, h = v[p++] * e + i, f = v[p++] * e + t, d = v[p++] * e + i, a.quadraticCurveTo(f, d, c, h);
          break;
        case "b":
          c = v[p++] * e + t, h = v[p++] * e + i, f = v[p++] * e + t, d = v[p++] * e + i, m = v[p++] * e + t, g = v[p++] * e + i, a.bezierCurveTo(f, d, m, g, c, h);
          break;
      }
  }
  return { offsetX: s.ha * e, path: a };
}
export {
  pd as A,
  $i as B,
  ke as C,
  vd as D,
  md as E,
  Ad as F,
  mn as G,
  gd as L,
  Ht as M,
  Zs as O,
  li as P,
  Md as R,
  yd as S,
  Td as T,
  L as V,
  Ed as W,
  xd as a,
  ji as b,
  le as c,
  Tt as d,
  _d as e,
  Sd as f,
  vs as g,
  di as h,
  jt as i,
  Fn as j,
  $e as k
};
