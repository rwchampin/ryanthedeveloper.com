// Camera.js

import { mat4 } from 'gl-matrix';

class Camera {
  constructor() {
    this.matrix = mat4.create();
    mat4.identity(this.matrix);
  }

  getMatrix() {
    return this.matrix;
  }
}

export default Camera;