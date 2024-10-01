import View from './View'; // Assuming View is exported from another file
import { Mesh, GL } from 'your-library'; // Assuming you have a library that exports Mesh and GL
import params from './params'; // Assuming params is exported from another file
// ViewCalculate.js

export default class ViewCalculate extends View {
	constructor() {
		super("assets/shaders/copy.vert", "assets/shaders/cal.frag");
		this.count = 0;
	}

	_init() {
		const positions = [];
		const coords = [];
		const indices = [0, 1, 2, 0, 2, 3];

		positions.push([-1, -1, 0]);
		positions.push([1, -1, 0]);
		positions.push([1, 1, 0]);
		positions.push([-1, 1, 0]);

		coords.push([0, 0]);
		coords.push([1, 0]);
		coords.push([1, 1]);
		coords.push([0, 1]);

		this.mesh = new Mesh(positions.length, indices.length, GL.gl.TRIANGLES);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
	}

	render(texture, textureForce) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		this.shader.uniform("textureForce", "uniform1i", 1);
		this.shader.uniform("time", "uniform1f", this.count++ * 0.001);

		this.shader.uniform("velOffset", "uniform1f", params.velOffset);
		this.shader.uniform("accOffset", "uniform1f", params.accOffset);
		this.shader.uniform("posOffset", "uniform1f", params.posOffset);
		texture.bind(0);
		textureForce.bind(1, true);
		GL.draw(this.mesh);
	}
}
