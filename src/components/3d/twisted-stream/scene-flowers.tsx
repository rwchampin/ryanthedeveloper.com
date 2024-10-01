// // SceneFlowers.js

// import Scene from './gl/Scene';
// import  GL  from './gl/GLTools';
// import GLTexture from './gl/GLTexture';
// import Framebuffer from './gl/Framebuffer';
// import ViewSave  from './ViewSave';
// import ViewMap from './ViewMap';
// import {ViewCopy,

    
// } from './gl/View';
// import ViewCalculate from './view-calculate';
// import {ViewForce} from './ViewForce';

// const random = (min, max) => Math.random() * (max - min) + min;
// export class SceneFlowers extends Scene {
//     hasSaved: boolean;
//     particles: any[];
//     tex: GLTexture;
//     texDot: GLTexture;
//     fboCurrent: Framebuffer;
//     fboTarget: Framebuffer;
//     fboForce: Framebuffer;
//     _vSave: ViewSave;
//     _vMap: ViewMap;
//     _vCopy: ViewCopy;
//     _vCopyForce: ViewCopy;
//     _vCal: ViewCalculate;
//     _vForce: ViewForce;
//     constructor(params:any) {
//         super();
//         this.camera.setPerspective(45, window.innerWidth / window.innerHeight, 5, 5000);
//         GL.gl.disable(GL.gl.DEPTH_TEST);
//         this.hasSaved = false;
//     }

//     _initParticles() {
//         const numParticles = params.numParticles * params.numParticles;
//         console.log("Total : ", numParticles);

//         this.particles = [];
//         for (let i = 0; i < numParticles; i++) {
//             const x = Math.random();
//             const y = random(.4, .6);
//             const z = random(.4, .6);

//             this.particles.push({ x, y, z });
//         }

//         window.addEventListener("keypress", this._keyPressed.bind(this));
//     }

//     _keyPressed(e) {
//         if (e.keyCode == 107) {
//             params.velOffset = 0.04;
//             params.accOffset = 0.004;
//             params.posOffset = 10.0;
//         }
//     }

//     _initTextures() {
//         console.log("Init Texture");
//         this.tex = new GLTexture(images["bg"]);
//         this.texDot = new GLTexture(images["dot"]);
//         this.fboCurrent = new Framebuffer(params.numParticles * 2.0, params.numParticles, GL.gl.NEAREST, GL.gl.NEAREST);
//         this.fboTarget = new Framebuffer(params.numParticles * 2.0, params.numParticles, GL.gl.NEAREST, GL.gl.NEAREST);
//         this.fboForce = new Framebuffer(256, 256, GL.gl.NEAREST, GL.gl.NEAREST);
//     }

//     _initViews() {
//         console.log("Init Views");

//         this._initParticles();
//         this._vSave = new ViewSave(this.particles);
//         this._vMap = new ViewMap(this.particles);
//         this._vCopy = new ViewCopy();
//         this._vCopyForce = new ViewCopy("assets/shaders/copy.vert", "assets/shaders/copyFlip.frag");
//         this._vCal = new ViewCalculate();
//         this._vForce = new ViewForce();
//     }

//     render() {
//         const easing = .05;
//         params.velOffset += (.01 - params.velOffset) * easing * .5;
//         (params as Params).accOffset += (.001 - (params as Params).accOffset) * easing * .5;
//         params.posOffset += (4.5 - params.posOffset) * easing;

//         if (!this.hasSaved) {
//             this.fboCurrent.bind();
//             GL.gl.viewport(0, 0, this.fboCurrent.width, this.fboCurrent.height);
//             GL.gl.clearColor(0.35, 0.5, 0.5, 1);
//             GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
//             GL.setMatrices(this.cameraOtho);
//             GL.rotate(this.rotationFront);
//             this._vSave.render();
//             this.fboCurrent.unbind();

//             this.fboTarget.bind();
//             GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
//             this.fboTarget.unbind();

//             this.fboForce.bind();
//             GL.gl.viewport(0, 0, this.fboForce.width, this.fboForce.height);
//             GL.gl.clearColor(0.5, 0.5, 0.5, 1);
//             GL.gl.clear(GL.gl.COLOR_BUFFER_BIT | GL.gl.DEPTH_BUFFER_BIT);
//             this.fboForce.unbind();

//             GL.gl.clearColor(0, 0, 0, 1);
//             GL.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
//             this.hasSaved = true;
//             return;
//         }

//         GL.setMatrices(this.cameraOtho);
//         GL.rotate(this.rotationFront);

//         GL.gl.viewport(0, 0, this.fboForce.width, this.fboForce.height);
//         this.fboForce.bind();
//         this._vForce.render();
//         this.fboForce.unbind();

//         GL.gl.viewport(0, 0, this.fboCurrent.width, this.fboCurrent.height);
//         this.fboTarget.bind();
//         this._vCal.render(this.fboCurrent.getTexture(), this.fboForce.getTexture());
//         this.fboTarget.unbind();

//         GL.gl.viewport(0, 0, window.innerWidth, window.innerHeight);
//         this._vCopy.render(this.tex);
//         if (params.showForceMap) this._vCopyForce.render(this.fboForce.getTexture());
//         if (params.showMap) this._vCopy.render(this.fboTarget.getTexture());
//         GL.setMatrices(this.camera);
//         GL.rotate(this.sceneRotation.matrix);
//         this._vMap.render(this.fboTarget.getTexture(), this.texDot);

//         this.swapFbos();
//     }

//     swapFbos() {
//         const tmp = this.fboTarget;
//         this.fboTarget = this.fboCurrent;
//         this.fboCurrent = tmp;
//     }

//     resetCamera() {
//         this.sceneRotation.setCameraPos(quat4.create([1, 0, 0, 0]));
//     }
// }