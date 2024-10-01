
import { halfTextureFill } from "../shaders/HalfTextureFill.js";
import { applyForces } from "../shaders/PBF_applyForces.js";
import { calculateDisplacements } from "../shaders/PBF_calculateDisplacements.js";
import { integrateVelocity } from "../shaders/PBF_integrateVelocity.js";
import { mat4, vec3 } from "../utils/gl-matrix.js";
import * as Utils from "../utils/utils.js";


/////////////////////////////////////////////////////////////////////////////////////////
//Parameters for the PBF
/////////////////////////////////////////////////////////////////////////////////////////

let searchRadius = 1.8;
let constrainsIterations = 3;

let pbfResolution = null;

let _device = null;
let _bufferSize = null;

let _particlesArray, _amountOfParticles;

let currentFrame = 0;
let colorChange = 0;

const MAX_PARTICLES_PER_VOXEL = 30;

/////////////////////////////////////////////////////////////////////////////////////////
//Buffers for the PBF
/////////////////////////////////////////////////////////////////////////////////////////

let initPositionsBuffer,
    positionBuffer,
    positionBuffer1,
    positionBuffer2,
    velocityBuffer,
    counterBuffer,
    indicesBuffer,
    raytracingBuffer,
    raytracingCounterBuffer,
    paletteColorBuffer,
    particlesColorBuffer;

/////////////////////////////////////////////////////////////////////////////////////////
//Pipelines, uniforms and bindings
/////////////////////////////////////////////////////////////////////////////////////////

let forcesData;
let displacementData;
let velocityData;
let textureData;

let texture;

let colorData, colorData1, colorData2, colorData3, colorData4;
let colorSelection, colorSelected, prevSelected;

let _camera;
let mouse = vec3.create();
let prevMouse = vec3.create();
let mouseDirection = vec3.create();
let mouseForce = vec3.create();

let logoAnimation = {
    param: 0
}

let logoWave = 0;

let ready = Promise.create();


function generateBuffers(positionData) {

    positionBuffer = _device.createBuffer({
        label: "position buffer",
        size: _bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    initPositionsBuffer = _device.createBuffer({
        label: "init position buffer",
        size: _bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    //Initialize the data
    _device.queue.writeBuffer(positionBuffer, 0, positionData);
    _device.queue.writeBuffer(initPositionsBuffer, 0, positionData);



    positionBuffer1 = _device.createBuffer({
        label: "position buffer 1",
        size: _bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    positionBuffer2 = _device.createBuffer({
        label: "position buffer 2",
        size: _bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    velocityBuffer = _device.createBuffer({
        label: "velocity buffer 1",
        size: _bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    particlesColorBuffer = _device.createBuffer({
        label: "color buffer",
        size: _bufferSize,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    indicesBuffer = _device.createBuffer(
        {
            label: "indices buffer data",
            size: Math.pow(pbfResolution, 3) * 4 * MAX_PARTICLES_PER_VOXEL,//4 * 4 bytes = 4 *  32 bits single channel --> 4 channels
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        }
    )

    counterBuffer = _device.createBuffer(
        {
            label: "counterBuffer buffer",
            size: Math.pow(pbfResolution, 3) * 4,//4 bytes = 32 bits single channel
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        }
    )

    raytracingBuffer = _device.createBuffer(
        {
            label: "raytracing buffer data",
            size: Math.pow(pbfResolution, 3) * 4 * 20,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        }
    )

    raytracingCounterBuffer = _device.createBuffer(
        {
            label: "counter raytracing buffer",
            size: Math.pow(pbfResolution, 3) * 4,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        }
    )

    function setHex(hex) {
        hex = Number(String('0x').concat(hex));
        hex = Math.floor(hex);

        let r = (hex >> 16 & 255) / 255;
        let g = (hex >> 8 & 255) / 255;
        let b = (hex & 255) / 255;

        return [r, g, b, 1];
    }



    colorData = [];
    colorData.push(setHex("fc8c03"));
    colorData.push(setHex("ffffff"));
    colorData.push(setHex("fc8c03"));
    colorData.push(setHex("fc8c03"));
    colorData.push(setHex("fc8c03"));
    colorData = colorData.flat();
    colorData = new Float32Array(colorData);

    colorData1 = [];
    colorData1.push(setHex("03dffc"));
    colorData1.push(setHex("03dffc"));
    colorData1.push(setHex("03dffc"));
    colorData1.push(setHex("ffffff"));
    colorData1.push(setHex("03dffc"));
    colorData1 = colorData1.flat();
    colorData1 = new Float32Array(colorData1);

    colorData2 = [];
    colorData2.push(setHex("d47dff"));
    colorData2.push(setHex("ffffff"));
    colorData2.push(setHex("d47dff"));
    colorData2.push(setHex("d47dff"));
    colorData2.push(setHex("d47dff"));
    colorData2 = colorData2.flat();
    colorData2 = new Float32Array(colorData2);

    colorData3 = [];
    colorData3.push(setHex("f58eaf"));
    colorData3.push(setHex("f58eaf"));
    colorData3.push(setHex("ffffff"));
    colorData3.push(setHex("f58eaf"));
    colorData3.push(setHex("f58eaf"));
    colorData3 = colorData3.flat();
    colorData3 = new Float32Array(colorData3);


    colorSelection = [];
    colorSelected = 0;
    colorSelection.push(colorData);
    colorSelection.push(colorData1);
    colorSelection.push(colorData2);
    colorSelection.push(colorData3);


    paletteColorBuffer = _device.createBuffer({
        label: "palette buffer",
        size: colorData.byteLength,
        usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
    })

    _device.queue.writeBuffer(paletteColorBuffer, 0, colorData);
}

async function setupPBF(resolution, particles, texture3D, device, camera) {

    pbfResolution = resolution;
    _amountOfParticles = particles.length / 4;
    // console.log("the amount of particles is: " + _amountOfParticles);
    _particlesArray = new Float32Array(particles);
    _bufferSize = _particlesArray.byteLength;
    _device = device;
    _camera = camera;

    texture = texture3D;
    generateBuffers(_particlesArray);

    forcesData = await Utils.setupPipeline("forces",
        applyForces,
        new Array(40).fill(0),
        [initPositionsBuffer,
            positionBuffer1,
            velocityBuffer,
            counterBuffer,
            indicesBuffer,
            raytracingCounterBuffer,
            raytracingBuffer,
            "uniforms"]);


    displacementData = await Utils.setupPipeline("displacement",
        calculateDisplacements,
        [pbfResolution, searchRadius, 0, 0, MAX_PARTICLES_PER_VOXEL, 0, 0, 0],
        [positionBuffer1, positionBuffer2, indicesBuffer, "uniforms"]);


    velocityData = await Utils.setupPipeline("velocity",
        integrateVelocity,
        new Array(40).fill(0));
    //[0, 0, 0, 0, pbfResolution, 0, 4, 0, 0, 0, 0, 0]);


    velocityData.setBindGroup(
        [
            { binding: 0, resource: { buffer: positionBuffer } },
            { binding: 1, resource: { buffer: positionBuffer2 } },
            { binding: 2, resource: { buffer: velocityBuffer } },
            { binding: 3, resource: { buffer: velocityData.uniformsBuffer } },
            {
                binding: 4, resource: texture.createView(
                    {
                        baseMipLevel: 0,
                        mipLevelCount: 1
                    }
                )
            },
            { binding: 5, resource: { buffer: paletteColorBuffer } },
            { binding: 6, resource: { buffer: particlesColorBuffer } },
        ]
    )


    textureData = await Utils.setupPipeline("fill texture",
        halfTextureFill,
        [0, 0, 0, 0]);

    textureData.setBindGroup([
        {
            binding: 0, resource: texture.createView(
                {
                    baseMipLevel: 0,
                    mipLevelCount: 1
                }
            )
        },
        { binding: 1, resource: { buffer: textureData.uniformsBuffer } },
    ]
    )

    document.addEventListener("mousemove", updateProjection);
    document.addEventListener("mousedown", startListeningMouse);
    //document.addEventListener("mouseup", restoreLogo)
    ready.resolve();

}

var mouseStart = 0;
var mouseInitPos = 0;
var reset;
var mouseFluidEnabledTimeout = 0;
var isAnimatingATLogo = false;
function startListeningMouse(e) {
    mouseStart = Date.now();
    mouseInitPos = {
        x: e.clientX,
        y: e.clientY
    }
}

function updateProjection(e) {

    if (isAnimatingATLogo) {
        return;
    }

    let _x = 2 * e.clientX / window.innerWidth - 1;
    let _y = 1 - 2 * e.clientY / window.innerHeight;
    let _vNear = vec3.fromValues(_x, _y, 0);
    let _vFar = vec3.fromValues(_x, _y, 1);

    let inverseCamera = mat4.create();
    let inversePerspective = mat4.create();

    mat4.invert(inverseCamera, _camera.cameraTransformMatrix);
    mat4.invert(inversePerspective, _camera.perspectiveMatrix);

    let transform = mat4.create();
    mat4.multiply(transform, inverseCamera, inversePerspective);

    vec3.transformMat4(_vNear, _vNear, transform);
    vec3.transformMat4(_vFar, _vFar, transform);

    vec3.scale(_vNear, _vNear, pbfResolution);
    vec3.scale(_vFar, _vFar, pbfResolution);

    let direction = vec3.create();
    vec3.sub(direction, _vFar, _vNear);
    vec3.normalize(direction, direction);

    let planeNormal = vec3.fromValues(0, 0, -1);
    let planeOrigin = vec3.fromValues(0, 0, 0.35 * pbfResolution);

    vec3.transformMat4(planeNormal, planeNormal, _camera.orientationMatrix);
    vec3.transformMat4(planeOrigin, planeOrigin, _camera.orientationMatrix);

    let t = 0;
    const denom = vec3.dot(direction, planeNormal);
    if (denom > 0.0001) {
        vec3.sub(planeOrigin, planeOrigin, _vNear);
        t = vec3.dot(planeOrigin, planeNormal) / denom;
    }

    vec3.scale(direction, direction, t);
    vec3.add(_vNear, _vNear, direction);

    mouse[0] = _vNear[0];
    mouse[1] = _vNear[1];
    mouse[2] = _vNear[2];
}


async function updateFrame(acceleration = { x: 0, y: -10, z: 0 },
    deltaTime = 0.01,
    lightIntensity,
    separation,
    raytrace,
    particleOcclusion,
    boxOcclusion,
    particlesLight,
    ambientLight,
    vertical) {

    await ready;

    //Abstract compute pass generator
    function setupComputePass(pipelineData) {
        const pass = encoder.beginComputePass({ label: pipelineData.label });
        pass.setPipeline(pipelineData.pipeline);
        pass.setBindGroup(0, pipelineData.bindGroup);
        pass.dispatchWorkgroups(_amountOfParticles / 256);
        pass.end();
    }

    //Update the color
    let increase = colorChange % 1000;
    if (increase === 0) {
        let selection = colorSelected;
        while (selection == colorSelected) {
            selection = Math.floor(Math.random() * colorSelection.length);
        }
        prevSelected = colorSelected;
        colorSelected = selection;
    }
    let cm = (increase) / 1000;
    cm = Math.pow(cm, .4);
    let colors = new Float32Array(colorData.length);


    for (let i = 0; i < colorData.length; i++) {
        colors[i] = colorSelection[colorSelected][i] * cm + colorSelection[prevSelected][i] * (1 - cm);
    }

    colorChange++;

    _device.queue.writeBuffer(paletteColorBuffer, 0, colors);

    vec3.sub(mouseDirection, mouse, prevMouse);

    mouseForce[0] += (mouseDirection[0] - mouseForce[0]) * 0.1;
    mouseForce[1] += (mouseDirection[1] - mouseForce[1]) * 0.1;
    mouseForce[2] += (mouseDirection[2] - mouseForce[2]) * 0.1;

    //Sets the uniforms for the forces
    for (let i = 0; i < 16; i++) {
        forcesData.uniformsData[i] = _camera.orientationMatrix[i];
    }

    forcesData.uniformsData[16] = acceleration.x;
    forcesData.uniformsData[17] = acceleration.y;
    forcesData.uniformsData[18] = acceleration.z;
    forcesData.uniformsData[19] = deltaTime;

    forcesData.uniformsData[20] = mouse[0];
    forcesData.uniformsData[21] = mouse[1];
    forcesData.uniformsData[22] = mouse[2];
    forcesData.uniformsData[23] = pbfResolution;

    forcesData.uniformsData[24] = mouseForce[0];
    forcesData.uniformsData[25] = mouseForce[1];
    forcesData.uniformsData[26] = mouseForce[2];
    forcesData.uniformsData[27] = currentFrame;

    forcesData.uniformsData[28] = raytrace ? 8 : 0;
    forcesData.uniformsData[29] = logoWave;
    forcesData.uniformsData[30] = MAX_PARTICLES_PER_VOXEL;

    currentFrame += 1;
    prevMouse[0] = mouse[0];
    prevMouse[1] = mouse[1];
    prevMouse[2] = mouse[2];

    _device.queue.writeBuffer(forcesData.uniformsBuffer, 0, forcesData.uniformsData);

    //Sets the uniforms for the forces
    for (let i = 0; i < 16; i++) {
        velocityData.uniformsData[i] = _camera.orientationMatrix[i];
    }

    //Sets the uniforms for the velocity integration
    velocityData.uniformsData[16] = mouse[0];
    velocityData.uniformsData[17] = mouse[1];
    velocityData.uniformsData[18] = mouse[2];
    velocityData.uniformsData[19] = deltaTime;

    velocityData.uniformsData[20] = pbfResolution;
    velocityData.uniformsData[21] = lightIntensity;
    velocityData.uniformsData[22] = 4;
    velocityData.uniformsData[23] = particleOcclusion;

    velocityData.uniformsData[24] = logoWave;
    velocityData.uniformsData[25] = particlesLight;

    _device.queue.writeBuffer(velocityData.uniformsBuffer, 0, velocityData.uniformsData);


    //Sets the uniforms for the velocity integration
    displacementData.uniformsData[2] = separation;
    displacementData.uniformsData[3] = currentFrame;
    displacementData.uniformsData[5] = vertical;

    _device.queue.writeBuffer(displacementData.uniformsBuffer, 0, displacementData.uniformsData);

    //Encoder for the PBF steps
    const encoder = _device.createCommandEncoder({ label: 'encoder' });


    //Pass the actual frame to the helper buffer--> source, sourceOffset, destination, destinationOffset
    encoder.copyBufferToBuffer(positionBuffer, 0, positionBuffer1, 0, _bufferSize);


    //Set the counter and indices to 0
    encoder.clearBuffer(counterBuffer);
    encoder.clearBuffer(indicesBuffer);
    encoder.clearBuffer(raytracingBuffer);
    encoder.clearBuffer(raytracingCounterBuffer);

    textureData.uniformsData[0] = lightIntensity;
    textureData.uniformsData[1] = boxOcclusion;
    textureData.uniformsData[2] = ambientLight;
    textureData.uniformsData[3] = vertical;
    _device.queue.writeBuffer(textureData.uniformsBuffer, 0, textureData.uniformsData);

    //Apply forces over particles
    const pass = encoder.beginComputePass({ label: textureData.label });
    pass.setPipeline(textureData.pipeline);
    pass.setBindGroup(0, textureData.bindGroup);
    pass.dispatchWorkgroups(texture.width, texture.width, texture.width);
    pass.end();


    //Apply forces over particles
    setupComputePass(forcesData);

    constrainsIterations = 5;

    if (raytrace) {
        constrainsIterations = 3;

    }

    //Calculate the iterations
    for (let i = 0; i < constrainsIterations; i++) {

        //Calculate the displacements
        setupComputePass(displacementData);

        //Sets the two helpers with the same data
        encoder.copyBufferToBuffer(positionBuffer2, 0, positionBuffer1, 0, _bufferSize);

    }

    //Integrate the velocity
    setupComputePass(velocityData);


    //Update the position
    encoder.copyBufferToBuffer(positionBuffer1, 0, positionBuffer, 0, _bufferSize);


    //Send the data to the GPU
    const commandBuffer = encoder.finish();
    _device.queue.submit([commandBuffer]);

}


export {
    indicesBuffer,
    particlesColorBuffer, positionBuffer, raytracingBuffer,
    ready, setupPBF,
    updateFrame, velocityBuffer
};

