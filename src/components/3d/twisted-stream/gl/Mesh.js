// Mesh.js

class Mesh {
	constructor(vertexSize, indexSize, drawType) {
	  if (GL == undefined) return;
	  this.gl = GL.gl;
	  this.vertexSize = vertexSize;
	  this.indexSize = indexSize;
	  this.drawType = drawType;
	  this.extraAttributes = [];
  
	  this._init();
	}
  
	_init() {}
  
	bufferVertex(aryVertices) {
	  const vertices = [];
  
	  for (let i = 0; i < aryVertices.length; i++) {
		for (let j = 0; j < aryVertices[i].length; j++) vertices.push(aryVertices[i][j]);
	  }
  
	  this.vBufferPos = this.gl.createBuffer();
	  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferPos);
	  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(vertices), this.gl.STATIC_DRAW);
	  this.vBufferPos.itemSize = 3;
	}
  
	bufferTexCoords(aryTexCoords) {
	  const coords = [];
  
	  for (let i = 0; i < aryTexCoords.length; i++) {
		for (let j = 0; j < aryTexCoords[i].length; j++) coords.push(aryTexCoords[i][j]);
	  }
  
	  this.vBufferUV = this.gl.createBuffer();
	  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vBufferUV);
	  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(coords), this.gl.STATIC_DRAW);
	  this.vBufferUV.itemSize = 2;
	}
  
	bufferData(data, name, itemSize) {
	  for (let i = 0; i < this.extraAttributes.length; i++) {
		if (this.extraAttributes[i].name == name) {
		  this.extraAttributes[i].data = data;
		  return;
		}
	  }
  
	  const bufferData = [];
	  for (let i = 0; i < data.length; i++) {
		for (let j = 0; j < data[i].length; j++) bufferData.push(data[i][j]);
	  }
	  const buffer = this.gl.createBuffer();
	  this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
	  this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(bufferData), this.gl.STATIC_DRAW);
  
	  this.extraAttributes.push({ name: name, data: data, itemSize: itemSize, buffer: buffer });
	}
  
	bufferIndices(aryIndices) {
	  this.iBuffer = this.gl.createBuffer();
	  this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.iBuffer);
	  this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(aryIndices), this.gl.STATIC_DRAW);
	  this.iBuffer.itemSize = 1;
	  this.iBuffer.numItems = aryIndices.length;
	}
  }
  
  export default Mesh;