// GLTools.js

import { mat4 } from 'gl-matrix';

const GL = {
  id: "GLTools",
  aspectRatio: window.innerWidth / window.innerHeight,
  fieldOfView: 45,
  zNear: 5,
  zFar: 3000,
  init(canvas) {
    console.log('INIT : ', canvas, this, this.resize);
    this.canvas = canvas;
    this.gl = this.canvas.getContext("experimental-webgl", { antialias: true });
    this.resize();

    const size = this.gl.getParameter(this.gl.SAMPLES);
    const antialias = this.gl.getContextAttributes().antialias;
    console.log("Sample size : ", size, antialias);

    this.gl.viewport(0, 0, this.gl.viewportWidth, this.gl.viewportHeight);
    this.gl.enable(this.gl.DEPTH_TEST);
    this.gl.enable(this.gl.CULL_FACE);
    this.gl.enable(this.gl.BLEND);
    this.gl.clearColor(0, 0, 0, 1);
    this.gl.clearDepth(1);

    this.matrix = mat4.create();
    mat4.identity(this.matrix);

    const that = this;
    window.addEventListener("resize", function () {
      console.log("resize");
      that.resize();
    });
  },
  resize() {
    if (this.id == undefined) return;
    this.W = window.innerWidth;
    this.H = window.innerHeight;

    this.canvas.width = this.W;
    this.canvas.height = this.H;
    this.gl.viewportWidth = this.W;
    this.gl.viewportHeight = this.H;
    this.gl.viewport(0, 0, this.W, this.H);
    this.aspectRatio = window.innerWidth / window.innerHeight;

    this.projection = mat4.perspective(this.fieldOfView, this.aspectRatio, this.zNear, this.zFar);

    this.render();
  },
  setViewport(x, y, w, h) {
    this.gl.viewport(x, y, w, h);
  },
  setMatrices(camera) {
    this.camera = camera;
  },
  rotate(rotation) {
    mat4.set(rotation, this.matrix);
  },
  render() {
    if (!this.shaderProgram) return;
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);
  },
  draw(mesh) {
    this.gl.uniformMatrix4fv(this.shaderProgram.pMatrixUniform, false, this.camera.getMatrix());
    this.gl.uniformMatrix4fv(this.shaderProgram.mvMatrixUniform, false, this.matrix);

    // VERTEX POSITIONS
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferPos);
    const vertexPositionAttribute = this.gl.getAttribLocation(this.shaderProgram, "aVertexPosition");
    this.gl.vertexAttribPointer(vertexPositionAttribute, mesh.vBufferPos.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(vertexPositionAttribute);

    // TEXTURE COORDS
    this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.vBufferUV);
    const textureCoordAttribute = this.gl.getAttribLocation(this.shaderProgram, "aTextureCoord");
    this.gl.vertexAttribPointer(textureCoordAttribute, mesh.vBufferUV.itemSize, this.gl.FLOAT, false, 0, 0);
    this.gl.enableVertexAttribArray(textureCoordAttribute);

    // INDICES
    this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, mesh.iBuffer);

    // EXTRA ATTRIBUTES
    for (let i = 0; i < mesh.extraAttributes.length; i++) {
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, mesh.extraAttributes[i].buffer);
      const attrPosition = this.gl.getAttribLocation(this.shaderProgram, mesh.extraAttributes[i].name);
      this.gl.vertexAttribPointer(attrPosition, mesh.extraAttributes[i].itemSize, this.gl.FLOAT, false, 0, 0);
      this.gl.enableVertexAttribArray(attrPosition);
    }

    // DRAWING
    this.gl.drawElements(mesh.drawType, mesh.iBuffer.numItems, this.gl.UNSIGNED_SHORT, 0);
  }
};

export default GL;