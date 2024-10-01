// GLShader.js

let gl;

class GLShader {
  constructor(vertexShaderID, fragmentShaderID) {
    if (!GL) return;
    gl = GL.gl;
    this.idVertex = vertexShaderID;
    this.idFragment = fragmentShaderID;
    this.getShader(this.idVertex, true);
    this.getShader(this.idFragment, false);
    this.parameters = [];
  }

  init() {
    this.shaderProgram = gl.createProgram();
    gl.attachShader(this.shaderProgram, this.vertexShader);
    gl.attachShader(this.shaderProgram, this.fragmentShader);
    gl.linkProgram(this.shaderProgram);
    console.log("Shader program created : ", this.idVertex, this.idFragment);
  }

  getShader(id, isVertexShader) {
    const req = new XMLHttpRequest();
    req.hasCompleted = false;
    const that = this;
    req.onreadystatechange = function (e) {
      if (e.target.readyState == 4) that.createShaderProgram(e.target.responseText, isVertexShader);
    };
    req.open("GET", id, true);
    req.send(null);
  }

  createShaderProgram(str, isVertexShader) {
    const shader = isVertexShader ? gl.createShader(gl.VERTEX_SHADER) : gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      alert(gl.getShaderInfoLog(shader));
      return null;
    }

    if (isVertexShader) this.vertexShader = shader;
    else this.fragmentShader = shader;

    if (this.vertexShader != undefined && this.fragmentShader != undefined) this.init();
  }

  bind() {
    gl.useProgram(this.shaderProgram);

    this.shaderProgram.pMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uPMatrix");
    this.shaderProgram.mvMatrixUniform = gl.getUniformLocation(this.shaderProgram, "uMVMatrix");

    GL.shader = this;
    GL.shaderProgram = this.shaderProgram;

    this.uniformTextures = [];
  }

  uniform(name, type, value) {
    for (let i = 0; i < this.parameters.length; i++) {
      const oUniform = this.parameters[i];
      if (oUniform.name == name) {
        oUniform.value = value;
        return;
      }
    }
    this.parameters.push({ name: name, type: type, value: value });
    this.shaderProgram[name] = gl.getUniformLocation(this.shaderProgram, name);

    if (type.indexOf("Matrix") == -1) gl[type](gl.getUniformLocation(this.shaderProgram, name), value);
    else {
      gl.uniformMatrix3fv(gl.getUniformLocation(this.shaderProgram, name), false, value);
    }

    if (type == "uniform1i") {
      // TEXTURE
      this.uniformTextures[value] = gl.getUniformLocation(this.shaderProgram, name);
    }
  }

  unbind() {}
}

export default GLShader;