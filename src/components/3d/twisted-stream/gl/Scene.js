// Scene.js

class Scene {
	constructor() {
		if (GL == undefined) return;
		gl = GL.gl;

		this._init();
	}

	_init() {
		this.camera = new CameraPersp();
		this.camera.setPerspective(45, window.innerWidth / window.innerHeight, 5, 3000);
		const eye = vec3.create([0, 0, 800]);
		const center = vec3.create([0, 0, 0]);
		const up = vec3.create([0, -1, 0]);
		this.camera.lookAt(eye, center, up);
		this.sceneRotation = new SceneRotation();
		this.rotationFront = mat4.create();
		mat4.identity(this.rotationFront);

		this.cameraOtho = new Camera();

		this._initTextures();
		this._initViews();

		window.addEventListener("resize", this.resize.bind(this));
	}

	_initTextures() {

	}

	_initViews() {

	}

	loop() {
		this.update();
		this.render();
	}

	update() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		this.sceneRotation.update();
		GL.setMatrices(this.camera);
		GL.rotate(this.sceneRotation.matrix);
	}

	render() {

	}

	resize() {
		this.camera.setPerspective(45, window.innerWidth / window.innerHeight, 5, 3000);
	}
}
 
export default Scene;
