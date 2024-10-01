// View.js

class View {
	constructor(pathVert, pathFrag) {
		if (pathVert == undefined) return;
		this.shader = new GLShader(pathVert, pathFrag);
		this._init();
	}

	_init() {
		// INITIAL MESH HERE
		this.mesh = new Mesh(
			new THREE.SphereGeometry(100, 32, 32),
			new THREE.MeshBasicMaterial({ color: 0xff0000 })
		);
	}

	render() {

	}
}

class ViewCopy extends View {
	constructor(pathVert, pathFrag) {
		if (pathVert == undefined) {
			pathVert = "assets/shaders/copy.vert";
			pathFrag = "assets/shaders/copy.frag";
		}

		super(pathVert, pathFrag);
	}

	_init() {
		const positions = [];
		const coords = [];
		const indices = [0, 1, 2, 0, 2, 3];

		const size = 1;
		positions.push([-size, -size, 0]);
		positions.push([size, -size, 0]);
		positions.push([size, size, 0]);
		positions.push([-size, size, 0]);

		coords.push([0, 0]);
		coords.push([1, 0]);
		coords.push([1, 1]);
		coords.push([0, 1]);

		this.mesh = new Mesh(4, 6, GL.gl.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
	}

	render(texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texture.bind(0);
		GL.draw(this.mesh);
	}
}

export { View, ViewCopy };