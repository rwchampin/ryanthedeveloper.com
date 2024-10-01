import View from './View'; // Assuming View is exported from another file
import { gl, draw } from './GL'; // Assuming gl and draw are exported from another file

// ViewMap.js

export default class ViewMap extends View {
	constructor(particles) {
		super("assets/shaders/map.vert", "assets/shaders/map.frag");
		this.particles = particles;
	}

	_init() {
		const positions = [];
		const coords = [];
		const indices = [];
		const extra = [];

		const numParticles = params.numParticles;

		for (let i = 0; i < this.particles.length; i++) {
			positions.push([0, 0, 0]);

			const tx = i % numParticles;
			const ty = Math.floor(i / numParticles);
			const ux = tx / numParticles;
			const uy = ty / numParticles;

			coords.push([ux, uy]);
			indices.push(i);
			extra.push([Math.random() * 3 + 0.1, Math.random() * 0.9 + 0.1, 0]);
		}

		this.mesh = new Mesh(positions.length, indices.length, gl.POINTS);
		this.mesh.bufferVertex(positions);
		this.mesh.bufferTexCoords(coords);
		this.mesh.bufferIndices(indices);
		this.mesh.bufferData(extra, "aExtra", 3);
	}

	render(texturePos, texture) {
		this.shader.bind();
		this.shader.uniform("texture", "uniform1i", 0);
		texturePos.bind(0);
		draw(this.mesh);
	}
}
