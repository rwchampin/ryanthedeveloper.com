// Fbo.js

class Fbo {
	constructor() {
		this.gl = GL.gl;
	}
}
Fbo.prototype.bind = function(fbo) {
	this.gl.bindFramebuffer(this.gl.FRAMEBUFFER, fbo);
}
export default Fbo;