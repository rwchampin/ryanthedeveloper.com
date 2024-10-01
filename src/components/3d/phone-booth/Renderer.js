import { generateMipMap } from './CalculateMipMap.js';
import { Camera } from './camera.js';
import * as PBF from "./PBF.js";
import * as Utils from "./utils.js";

import { shadeParticles } from './PBF_shadeParticles.js';
import { postprocessing } from './Postprocessing.js';
import { renderGeometry } from './RenderGeometry.js';
import { renderParticles } from './RenderParticles.js';
import { renderToScreen } from './RenderToScreen.js';

const device = await Utils.getDevice();

//Get the context to render
const canvas = document.querySelector("canvas");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
const context = canvas.getContext('webgpu');
const presentationFormat = navigator.gpu.getPreferredCanvasFormat();
context.configure({
    device,
    format: presentationFormat
});

//Define the camera
let camera = new Camera(canvas);
let cameraDistance = 1;
let FOV = 35;
let pbfResolution = 20;

function pSize() {
    return 1 + (4 * Math.pow(Math.random(), 2.));
}


//Define the GUI
var params = {
    depthTest: 1,
    mixAlpha: 1,
    size: 600 / pbfResolution,
    deltaTime: 0.01,
    coneAngle: 0.94,
    gridRadius: 5,
    coneRotation: 90,
    particleOcclusion: 0.63,
    boxOcclusion: 0.53,
    lightIntensity: 15,
    particlesLight: 50,
    ambientLight: 0,
    separation: 0.,
    IOR: 2,
    raytrace: false,
    vertical: true,
    gaze: false,
    acceleration: 1.3
}

//For the 3d texture
/*
2^4 = 16
2^5 = 32
2^6 = 64
2^7 = 128
2^8 = 256
*/
let texturePower = 8;
let textureSize = Math.pow(2, texturePower);

let resultMatrix = mat4.create();

let scale = 1 / pbfResolution;
let scaleMatrix2 = mat4.fromValues(scale, 0., 0., 0.,
    0., scale, 0., 0.,
    0., 0., scale, 0.,
    0., 0., 0., 1.);

let currentFrame = 0;

var gui = new dat.GUI();
var rendererFolder = gui.addFolder('renderer');
rendererFolder.add(params, "raytrace").name("raytrace");
rendererFolder.add(params, "vertical");


rendererFolder.add(params, "gaze").name("camera gaze");
rendererFolder.add(params, "lightIntensity", 0, 100, 1).name("light intensity").step(1);
rendererFolder.add(params, "particlesLight", 0, 150, 1).name("particles light").step(1);
rendererFolder.add(params, "ambientLight", 0, 10, 1).name("ambient light").step(0.05);
rendererFolder.add(params, "IOR", 1, 10, 1).name("IOR").step(0.001);

// let coneFolder = rendererFolder.addFolder("cone tracing");
// coneFolder.add(params, "coneAngle", 0.1, 1, 1).name("cone angle").step(0.01);
// coneFolder.add(params, "coneRotation", 0, 90, 1).name("cone rotation").step(1);

rendererFolder.add(params, "particleOcclusion", 0, 1, 1).name("occlusion").step(0.001);
// rendererFolder.add(params, "boxOcclusion", 0, 1, 1).name("box occlusion").step(0.001);


var simulationFolder = gui.addFolder('simulation');
simulationFolder.add(params, "deltaTime", 0.001, 0.02, 0).name("delta time").step(0.001);
simulationFolder.add(params, "acceleration", 0, 10, 0).name("acceleration").step(1);


const texture3D = device.createTexture({
    size: [textureSize, textureSize, textureSize],
    format: 'rgba16float',
    dimension: '3d',
    mipLevelCount: (texturePower + 1),
    usage: GPUTextureUsage.TEXTURE_BINDING | GPUTextureUsage.STORAGE_BINDING | GPUTextureUsage.COPY_DST,
})

//transform matrix
let uniformsData = new Array(72).fill(0);

let uniforms = new Float32Array(uniformsData);
let uniforms2 = new Float32Array(uniformsData);


const uniformsBuffer = device.createBuffer(
    {
        label: "uniforms cube buffer",
        size: uniforms.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

const uniformsBuffer2 = device.createBuffer(
    {
        label: "uniforms cube buffer",
        size: uniforms.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

let uniformsCubeData = new Array(16 * 5).fill(0);

let uniformsCube = new Float32Array(uniformsCubeData);
let uniformsCube2 = new Float32Array(uniformsCubeData);


const uniformsCubeBuffer = device.createBuffer(
    {
        label: "uniforms geometry buffer",
        size: uniformsCube.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

const uniformsCubeBuffer2 = device.createBuffer(
    {
        label: "uniforms geometry buffer",
        size: uniformsCube2.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

const uniformPostData = new Float32Array([0, 1, 0, 0])

const uniformsPostBuffer = device.createBuffer(
    {
        label: "uniforms post pro buffer",
        size: uniformPostData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

const uniformPostData2 = new Float32Array([0, 1, 0, 0])

const uniformsPostBuffer2 = device.createBuffer(
    {
        label: "uniforms post pro buffer",
        size: uniformPostData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

const uniformPostData3 = new Float32Array([0, 1, 0, 0])

const uniformsPostBuffer3 = device.createBuffer(
    {
        label: "uniforms post pro buffer",
        size: uniformPostData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

const uniformPostData4 = new Float32Array([0, 1, 0, 0])

const uniformsPostBuffer4 = device.createBuffer(
    {
        label: "uniforms post pro buffer",
        size: uniformPostData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

const uniformsShadeData = new Float32Array([pbfResolution, 0, 0, 0, 0, 0, 0, 0])
const uniformsShadeBuffer = device.createBuffer(
    {
        label: "uniforms shade buffer",
        size: uniformsShadeData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

let uniformsSphereInfo = new Array(72).fill(0);

let uniformsSphereData = new Float32Array(uniformsSphereInfo);

const uniformsSphereBuffer = device.createBuffer(
    {
        label: "uniforms sphere buffer",
        size: uniformsSphereData.byteLength,
        usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
    }
)

var dd = 0;

//positions for the particles
let positionArray = [];

var initResolution = pbfResolution * 1;
var sideBorder = Math.floor(0.45 * initResolution);
var amountOfParticles = 0;
var r = 0.1;

for (let j = 0.13 * pbfResolution; j <= 9 * pbfResolution / 16; j++) {
    for (let i = 0.03 * pbfResolution; i < 0.97 * pbfResolution; i++) {
        for (let k = 0.15 * pbfResolution; k <= sideBorder; k++) {
            let x = Math.floor(1024 * (1 - i / initResolution));
            let y = Math.floor(1024 * (1 - j / initResolution));
            positionArray.push(i + Math.random() * r, j + Math.random() * r, k + Math.random() * r, pSize() + Math.random());
            dd += 4;
            amountOfParticles++;
        }
    }
}


// console.log("the PBF resolution is: " + pbfResolution);
PBF.setupPBF(pbfResolution, positionArray, texture3D, device, camera);
await PBF.ready;

const positionBuffer = PBF.positionBuffer;

let defaultDepthTexture;
let colorTextureMulti;
let colorTexture;
let colorTexture2;
let colorTexture3;

let velocityTexture;
let velocityTextureMulti;

function updateRenderTexures() {

    if (defaultDepthTexture != null) {
        defaultDepthTexture.destroy();
        colorTextureMulti.destroy();
    }

    defaultDepthTexture = device.createTexture({
        size: [window.innerWidth, window.innerHeight],
        sampleCount: 4,
        format: 'depth32float',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    colorTextureMulti = device.createTexture({
        size: [window.innerWidth, window.innerHeight],
        sampleCount: 4,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    colorTexture = device.createTexture({
        size: [window.innerWidth, window.innerHeight],
        sampleCount: 1,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    colorTexture2 = device.createTexture({
        size: [window.innerWidth, window.innerHeight],
        sampleCount: 1,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    colorTexture3 = device.createTexture({
        size: [window.innerWidth, window.innerHeight],
        sampleCount: 1,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    velocityTextureMulti = device.createTexture({
        size: [window.innerWidth, window.innerHeight],
        sampleCount: 4,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    velocityTexture = device.createTexture({
        size: [window.innerWidth, window.innerHeight],
        sampleCount: 1,
        format: 'rgba8unorm',
        usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
    });

    colorTextureMulti.view = colorTextureMulti.createView();

}


const sampler = device.createSampler({
    magFilter: "linear",
    minFilter: "linear",
    mipmapFilter: "linear",
    addressModeU: 'clamp-to-edge',
    addressModeV: 'clamp-to-edge',
    addressModeW: 'clamp-to-edge'
});


////////////////////////////////////////////////////////////////////
// For the imported geometry
////////////////////////////////////////////////////////////////////
let geometryBuffers = await Utils.loadGeometry("cube geometry", "assets/box16_9v2_thick.json");


const geometryRenderingData = await Utils.setupRenderingPipeline("render geometry",
    renderGeometry,
    4,
    [{ format: "rgba8unorm" },
    { format: "rgba8unorm" }],
    true,
    "front");

const geometryRenderingData2 = await Utils.setupRenderingPipeline("render geometry",
    renderGeometry,
    4,
    [{ format: "rgba8unorm" },
    { format: "rgba8unorm" }],
    true,
    "none");

var textureView = texture3D.createView();


//Binding for the geometry (cube);
geometryRenderingData.setBindGroup(
    [
        { binding: 0, resource: { buffer: geometryBuffers.position } },
        { binding: 1, resource: { buffer: geometryBuffers.normal } },
        { binding: 2, resource: { buffer: uniformsCubeBuffer } },
        { binding: 3, resource: textureView },
        { binding: 4, resource: sampler },
        { binding: 5, resource: { buffer: PBF.raytracingBuffer } },
        { binding: 6, resource: { buffer: PBF.positionBuffer } },
        { binding: 7, resource: { buffer: PBF.particlesColorBuffer } },
        { binding: 8, resource: { buffer: PBF.velocityBuffer } },
    ]
);

geometryRenderingData2.setBindGroup(
    [
        { binding: 0, resource: { buffer: geometryBuffers.position } },
        { binding: 1, resource: { buffer: geometryBuffers.normal } },
        { binding: 2, resource: { buffer: uniformsCubeBuffer2 } },
        { binding: 3, resource: textureView },
        { binding: 4, resource: sampler },
        { binding: 5, resource: { buffer: PBF.raytracingBuffer } },
        { binding: 6, resource: { buffer: PBF.positionBuffer } },
        { binding: 7, resource: { buffer: PBF.particlesColorBuffer } },
        { binding: 8, resource: { buffer: PBF.velocityBuffer } },
    ]
);


const particlesRenderingData = await Utils.setupRenderingPipeline("render particles",
    renderParticles,
    4,
    [{ format: "rgba8unorm" },
    { format: "rgba8unorm" }
    ]);

const particlesRenderingData2 = await Utils.setupRenderingPipeline("render particles",
    renderParticles,
    4,
    [{ format: "rgba8unorm" },
    { format: "rgba8unorm" }
    ]);


//Binding for the particles
particlesRenderingData.setBindGroup(
    [
        { binding: 0, resource: { buffer: positionBuffer } },
        { binding: 1, resource: { buffer: uniformsBuffer } },
        { binding: 2, resource: { buffer: PBF.particlesColorBuffer } },
        { binding: 3, resource: { buffer: PBF.velocityBuffer } }
    ]
);

particlesRenderingData2.setBindGroup(
    [
        { binding: 0, resource: { buffer: positionBuffer } },
        { binding: 1, resource: { buffer: uniformsBuffer2 } },
        { binding: 2, resource: { buffer: PBF.particlesColorBuffer } },
        { binding: 3, resource: { buffer: PBF.velocityBuffer } }
    ]
);

const postProcessingRenderingData = await Utils.setupRenderingPipeline("post pro",
    postprocessing,
    1,
    [{ format: "rgba8unorm" }],
    false);

const postProcessingRenderingData2 = await Utils.setupRenderingPipeline("post pro",
    postprocessing,
    1,
    [{ format: "rgba8unorm" }],
    false);

const renderToScreenData = await Utils.setupRenderingPipeline("render screen",
    renderToScreen,
    1,
    [{ format: navigator.gpu.getPreferredCanvasFormat() }],
    false);


const shadeData = await Utils.setupPipeline("shade particles",
    shadeParticles,
    new Array().fill(8));
shadeData.setBindGroup(
    [
        { binding: 0, resource: { buffer: positionBuffer } },
        { binding: 1, resource: { buffer: PBF.particlesColorBuffer } },
        { binding: 2, resource: { buffer: uniformsShadeBuffer } },
        { binding: 3, resource: textureView },
        { binding: 4, resource: sampler },
    ]
)

window.onresize = updateRenderTexures;

updateRenderTexures();



//Rendering
function render() {

    let geometryMatrix;

    /*
    Modify the parameters depending on the view
    */
    if (params.vertical) {

        let sr = Math.sin(Math.PI * 0.5);
        let cr = Math.cos(Math.PI * 0.5);
        geometryMatrix = mat4.fromValues(cr, -sr, 0, 0.,
            sr, cr, 0., 0,
            0, 0, 1, 0.,
            0.5, 0.58, 0.25, 1.);

        camera.target = [0.5, 0.6, 0.25];
        cameraDistance = 2.2;

        if (params.raytrace) {
            params.boxOcclusion = 0.25;
        } else {
            params.boxOcclusion = 0.32;
        }

    } else {

        let sr = Math.sin(Math.PI * 0.);
        let cr = Math.cos(Math.PI * 0);
        geometryMatrix = mat4.fromValues(cr, -sr, 0, 0.,
            sr, cr, 0., 0,
            0, 0, 1, 0.,
            0.5, 0.357, 0.25, 1.);

        camera.target = [0.5, 0.35, 0.25];
        cameraDistance = 1.5;

        if (params.raytrace) {
            params.boxOcclusion = 0.4;
        } else {
            params.boxOcclusion = 0.53;
        }
    }



    requestAnimationFrame(render);

    //Quick performance test to update a frame
    PBF.updateFrame({ z: 0, y: -params.acceleration, x: 0 },
        params.deltaTime,
        params.lightIntensity,
        params.separation,
        params.raytrace,
        params.particleOcclusion,
        params.boxOcclusion,
        params.particlesLight,
        params.ambientLight,
        params.vertical);

    currentFrame++;


    //Generate the mipmap for the 3d texture,
    //this call should be included into the main call to optimise?
    generateMipMap(texture3D, device);


    //Update the camera
    camera.updateCamera(FOV, window.innerWidth / window.innerHeight, cameraDistance);
    camera.gaze = params.gaze;

    var n = vec3.fromValues(0, 1, 0);
    camera.calculateReflection([0., 0.074, 0], n);


    //make a command enconder to start encoding thigns
    const encoder = device.createCommandEncoder({ label: 'encoder' });

    //////////////////////////////////////////////////////////
    //Shade the particles to fetch the color multiple times
    //////////////////////////////////////////////////////////
    {
        uniformsShadeData[0] = camera.position[0];
        uniformsShadeData[1] = camera.position[1];
        uniformsShadeData[2] = camera.position[2];
        uniformsShadeData[3] = pbfResolution;
        uniformsShadeData[4] = params.coneAngle;
        uniformsShadeData[5] = params.coneRotation;

        device.queue.writeBuffer(uniformsShadeBuffer, 0, uniformsShadeData);

        const pass = encoder.beginComputePass({ label: "shade particles pass" });
        pass.setPipeline(shadeData.pipeline);
        pass.setBindGroup(0, shadeData.bindGroup);
        pass.dispatchWorkgroups(amountOfParticles / 256);
        pass.end();
    }

    //////////////////////////////////////
    //Render the particles as normal
    //////////////////////////////////////
    {

        mat4.multiply(resultMatrix, camera.cameraTransformMatrix, scaleMatrix2);


        for (let i = 0; i < 16; i++) {
            uniforms[i] = resultMatrix[i];
        }

        for (let i = 0; i < 16; i++) {
            uniforms[i + 16] = camera.perspectiveMatrix[i];
        }

        for (let i = 0; i < 16; i++) {
            uniforms[i + 32] = camera.orientationMatrix[i];
        }

        uniforms[48] = camera.position[0];
        uniforms[49] = camera.position[1];
        uniforms[50] = camera.position[2];
        uniforms[51] = 0;

        uniforms[52] = window.innerWidth;
        uniforms[53] = window.innerHeight;
        uniforms[54] = params.size;
        uniforms[55] = pbfResolution;

        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;

        device.queue.writeBuffer(uniformsBuffer, 0, uniforms);

        //Pass the rendering view where the triangle will be displayed
        particlesRenderingData.passDescriptor.colorAttachments[0].view = colorTextureMulti.view;
        particlesRenderingData.passDescriptor.colorAttachments[0].resolveTarget = colorTexture.createView();

        particlesRenderingData.passDescriptor.colorAttachments[1].view = velocityTextureMulti.createView();
        particlesRenderingData.passDescriptor.colorAttachments[1].resolveTarget = velocityTexture.createView();

        particlesRenderingData.passDescriptor.depthStencilAttachment.view = defaultDepthTexture.createView();

        // particlesRenderingData.passDescriptor.colorAttachments[0].loadOp = "load";
        // particlesRenderingData.passDescriptor.colorAttachments[1].loadOp = "load";
        // particlesRenderingData.passDescriptor.depthStencilAttachment.depthLoadOp = "load";

        //Encode the render pass for the particles
        const pass = encoder.beginRenderPass(particlesRenderingData.passDescriptor);
        pass.setPipeline(particlesRenderingData.pipeline);
        pass.setBindGroup(0, particlesRenderingData.bindGroup);
        pass.draw(6, 256 * Math.floor(amountOfParticles / 256));
        pass.end();
    }

    //////////////////////////////////////
    //Render the reflected particles
    //////////////////////////////////////
    {

        mat4.multiply(resultMatrix, camera.cameraReflectionMatrix, scaleMatrix2);


        for (let i = 0; i < 16; i++) {
            uniforms2[i] = resultMatrix[i];
        }

        for (let i = 0; i < 16; i++) {
            uniforms2[i + 16] = camera.perspectiveMatrix[i];
        }

        for (let i = 0; i < 16; i++) {
            uniforms2[i + 32] = camera.orientationMatrix[i];
        }

        uniforms2[48] = camera.position[0];
        uniforms2[49] = camera.position[1];
        uniforms2[50] = camera.position[2];
        uniforms2[51] = 1;

        uniforms2[52] = window.innerWidth;
        uniforms2[53] = window.innerHeight;
        uniforms2[54] = params.size;
        uniforms2[55] = pbfResolution;

        device.queue.writeBuffer(uniformsBuffer2, 0, uniforms2);

        //Pass the rendering view where the triangle will be displayed
        particlesRenderingData2.passDescriptor.colorAttachments[0].view = colorTextureMulti.view;
        particlesRenderingData2.passDescriptor.colorAttachments[0].resolveTarget = colorTexture.createView();

        particlesRenderingData2.passDescriptor.colorAttachments[1].view = velocityTextureMulti.createView();
        particlesRenderingData2.passDescriptor.colorAttachments[1].resolveTarget = velocityTexture.createView();

        particlesRenderingData2.passDescriptor.depthStencilAttachment.view = defaultDepthTexture.createView();

        particlesRenderingData2.passDescriptor.colorAttachments[0].loadOp = "load";
        particlesRenderingData2.passDescriptor.colorAttachments[1].loadOp = "load";
        particlesRenderingData2.passDescriptor.depthStencilAttachment.depthLoadOp = "load";

        //Encode the render pass for the particles
        const pass2 = encoder.beginRenderPass(particlesRenderingData2.passDescriptor);
        pass2.setPipeline(particlesRenderingData2.pipeline);
        pass2.setBindGroup(0, particlesRenderingData2.bindGroup);
        pass2.draw(6, 256 * Math.floor(amountOfParticles / 256));
        pass2.end();
    }

    //////////////////////////////////////
    //Render the cylinder normally
    //////////////////////////////////////
    {
        geometryRenderingData.passDescriptor.colorAttachments[0].view = colorTextureMulti.view;
        geometryRenderingData.passDescriptor.colorAttachments[0].resolveTarget = colorTexture.createView();
        geometryRenderingData.passDescriptor.depthStencilAttachment.view = defaultDepthTexture.createView();

        geometryRenderingData.passDescriptor.colorAttachments[1].view = velocityTextureMulti.createView();
        geometryRenderingData.passDescriptor.colorAttachments[1].resolveTarget = velocityTexture.createView();

        geometryRenderingData.passDescriptor.colorAttachments[0].loadOp = "load";
        geometryRenderingData.passDescriptor.colorAttachments[1].loadOp = "load";
        geometryRenderingData.passDescriptor.depthStencilAttachment.depthLoadOp = "load";

        mat4.multiply(resultMatrix, camera.cameraTransformMatrix, geometryMatrix);

        for (let i = 0; i < 16; i++) {
            uniformsCube[i] = resultMatrix[i];
        }

        for (let i = 0; i < 16; i++) {
            uniformsCube[i + 16] = camera.perspectiveMatrix[i];
        }

        for (let i = 0; i < 16; i++) {
            uniformsCube[i + 32] = geometryMatrix[i];
        }

        //The mat3x3 is 9 units, which requires a padding of
        //3 to make it 12 units (4 x 3), hence the next
        //values should take this offset into account.
        for (let i = 0; i < 9; i++) {
            uniformsCube[i + 48] = camera.orientationMatrix[i];
        }

        uniformsCube[60] = params.coneAngle;
        uniformsCube[61] = params.coneRotation;
        uniformsCube[64] = camera.position[0];
        uniformsCube[65] = camera.position[1];
        uniformsCube[66] = camera.position[2];
        uniformsCube[67] = pbfResolution;
        uniformsCube[68] = params.IOR;
        uniformsCube[69] = Number(params.raytrace);
        uniformsCube[70] = 30;
        uniformsCube[71] = 0;
        uniformsCube[72] = params.vertical;

        device.queue.writeBuffer(uniformsCubeBuffer, 0, uniformsCube);


        //Encode the render pass for the particles
        const cubePass = encoder.beginRenderPass(geometryRenderingData.passDescriptor);
        cubePass.setPipeline(geometryRenderingData.pipeline);
        cubePass.setBindGroup(0, geometryRenderingData.bindGroup);
        cubePass.draw(geometryBuffers.length);
        cubePass.end();
    }

    //////////////////////////////////////
    //Render the cylinder reflected
    //////////////////////////////////////
    {
        geometryRenderingData2.passDescriptor.colorAttachments[0].view = colorTextureMulti.view;
        geometryRenderingData2.passDescriptor.colorAttachments[0].resolveTarget = colorTexture.createView();
        geometryRenderingData2.passDescriptor.depthStencilAttachment.view = defaultDepthTexture.createView();

        geometryRenderingData2.passDescriptor.colorAttachments[1].view = velocityTextureMulti.createView();
        geometryRenderingData2.passDescriptor.colorAttachments[1].resolveTarget = velocityTexture.createView();

        geometryRenderingData2.passDescriptor.colorAttachments[0].loadOp = "load";
        geometryRenderingData2.passDescriptor.colorAttachments[1].loadOp = "load";
        geometryRenderingData2.passDescriptor.depthStencilAttachment.depthLoadOp = "load";

        mat4.multiply(resultMatrix, camera.cameraReflectionMatrix, geometryMatrix);

        for (let i = 0; i < uniformsCube.length; i++) {
            uniformsCube2[i] = uniformsCube[i];
        }

        for (let i = 0; i < 16; i++) {
            uniformsCube2[i] = resultMatrix[i];
        }

        uniformsCube[64] = camera.position[0];
        uniformsCube[65] = camera.position[1];
        uniformsCube[66] = camera.position[2];
        uniformsCube[67] = pbfResolution;
        uniformsCube2[71] = 1;
        uniformsCube[72] = params.vertical;


        device.queue.writeBuffer(uniformsCubeBuffer2, 0, uniformsCube2);


        const cubePass2 = encoder.beginRenderPass(geometryRenderingData2.passDescriptor);
        cubePass2.setPipeline(geometryRenderingData2.pipeline);
        cubePass2.setBindGroup(0, geometryRenderingData2.bindGroup);
        cubePass2.draw(geometryBuffers.length);
        cubePass2.end();
    }

    ///////////////////////////////////////////////////
    //Render the post processing in the X direction
    ///////////////////////////////////////////////////
    {
        postProcessingRenderingData.setBindGroup(
            [
                { binding: 0, resource: colorTexture.createView() },
                { binding: 1, resource: velocityTexture.createView() },
                { binding: 2, resource: sampler },
                { binding: 3, resource: { buffer: uniformsPostBuffer } },
            ]
        );

        uniformPostData[0] = 0;
        uniformPostData[1] = 1;
        uniformPostData[2] = params.deltaTime;
        uniformPostData[3] = 1;
        device.queue.writeBuffer(uniformsPostBuffer, 0, uniformPostData);

        postProcessingRenderingData.passDescriptor.colorAttachments[0].view = colorTexture2.createView();

        const postPass = encoder.beginRenderPass(postProcessingRenderingData.passDescriptor);
        postPass.setPipeline(postProcessingRenderingData.pipeline);
        postPass.setBindGroup(0, postProcessingRenderingData.bindGroup);
        postPass.draw(6);
        postPass.end();
    }

    ///////////////////////////////////////////////////
    //Render the post processing in the Y direction
    ///////////////////////////////////////////////////
    {
        postProcessingRenderingData2.setBindGroup(
            [
                { binding: 0, resource: colorTexture2.createView() },
                { binding: 1, resource: velocityTexture.createView() },
                { binding: 2, resource: sampler },
                { binding: 3, resource: { buffer: uniformsPostBuffer2 } },
            ]
        );

        uniformPostData2[0] = 1;
        uniformPostData2[1] = 0;
        uniformPostData2[2] = params.deltaTime;
        uniformPostData2[3] = 1;

        device.queue.writeBuffer(uniformsPostBuffer2, 0, uniformPostData2);

        postProcessingRenderingData2.passDescriptor.colorAttachments[0].view = colorTexture3.createView();

        const postPass1 = encoder.beginRenderPass(postProcessingRenderingData2.passDescriptor);
        postPass1.setPipeline(postProcessingRenderingData2.pipeline);
        postPass1.setBindGroup(0, postProcessingRenderingData2.bindGroup);
        postPass1.draw(6);
        postPass1.end();
    }

    ///////////////////////////////////////////////////
    //Render to the screen
    ///////////////////////////////////////////////////
    {
        renderToScreenData.passDescriptor.colorAttachments[0].view = context.getCurrentTexture().createView();;


        renderToScreenData.setBindGroup(
            [
                { binding: 0, resource: colorTexture3.createView() },
                { binding: 1, resource: sampler },
            ]
        );

        const screenPass = encoder.beginRenderPass(renderToScreenData.passDescriptor);
        screenPass.setPipeline(renderToScreenData.pipeline);
        screenPass.setBindGroup(0, renderToScreenData.bindGroup);
        screenPass.draw(6);
        screenPass.end();
    }

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);
}

render();


