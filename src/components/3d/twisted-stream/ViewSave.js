// ViewSave.js

class ViewSave extends View {
	constructor(particles) {
		super("assets/shaders/save.vert", "assets/shaders/save.frag");
		this.particles = particles;
	}

	_init() {
		const positions = [];
		const colors = [];
		const coords = [];
		const indices = [];
		const size = 2;
		let index = 0;

		const numParticles = params.numParticles;

		for (let i = 0; i < this.particles.length; i++) {
			const p = this.particles[i];

			const tx = i % numParticles;
			const ty = Math.floor(i / numParticles);
			let ux = tx / numParticles;
			let uy = ty / numParticles;

			ux -= 1.0;
			// ux = (ux-.5) * 2.0;
			uy = (uy - 0.5) * 2.0;

			positions.push([ux, uy, 0]);
			coords.push([0, 0]);
			indices.push(index);
			colors.push([p.x, p.y, p.z]);

			index++;
		}

		this.mesh = new Mesh(positions.length, indices.length, GL.gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(colors, "aVertexColor", 3);
	}

	render = () => {
		this.shader.bind();
		// texture.bind(0);
		GL.draw(this.mesh);
	};
}

export default ViewSave;