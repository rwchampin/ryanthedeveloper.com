import { quat, vec3 } from 'gl-matrix';

class EffectComposer {
  constructor() {
    this._isMouseDown = false;
    this._isRotateZ = 0;
    this.preMouse = { x: 0, y: 0 };
    this._rotateZMargin = 50;
    this._z = 0;
    this._preZ = 0;
    this._currDiffX = 0;
    this.diffX = 0;
    this._currDiffY = 0;
    this.diffY = 0;
    this._rotation = quat.create();
  }

  getMousePos(e) {
    let mouseX, mouseY;

    if (e.changedTouches !== undefined) {
      mouseX = e.changedTouches[0].pageX;
      mouseY = e.changedTouches[0].pageY;
    } else {
      mouseX = e.clientX;
      mouseY = e.clientY;
    }

    return { x: mouseX, y: mouseY };
  }

  _onMouseDown(e) {
    if (this._isMouseDown) return;

    const mouse = this.getMousePos(e);
    const tempRotation = quat.clone(this._rotation);
    this._updateRotation(tempRotation);
    this._rotation = tempRotation;

    this._isMouseDown = true;
    this._isRotateZ = 0;
    this.preMouse = { x: mouse.x, y: mouse.y };

    if (mouse.y < this._rotateZMargin || mouse.y > (window.innerHeight - this._rotateZMargin)) {
      this._isRotateZ = 1;
    } else if (mouse.x < this._rotateZMargin || mouse.x > (window.innerWidth - this._rotateZMargin)) {
      this._isRotateZ = 2;
    }

    this._z = this._preZ;

    this._currDiffX = this.diffX = 0;
    this._currDiffY = this.diffY = 0;
  }

  _onMouseMove(e) {
    this.mouse = this.getMousePos(e);
    if (e.touches) e.preventDefault();
  }

  _updateRotation(rotation) {
    const axis = vec3.create();
    const angle = Math.sqrt(this.diffX * this.diffX + this.diffY * this.diffY) * 0.01;
    vec3.set(axis, this.diffY, this.diffX, 0);
    vec3.normalize(axis, axis);
    const tempQuat = quat.create();
    quat.setAxisAngle(tempQuat, axis, angle);
    quat.multiply(rotation, tempQuat, rotation);
  }
}

export default EffectComposer;