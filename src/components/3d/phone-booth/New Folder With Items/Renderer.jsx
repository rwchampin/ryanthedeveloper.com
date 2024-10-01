Promise.create = function () {
    const promise = new Promise((resolve, reject) => {
        this.temp_resolve = resolve;
        this.temp_reject = reject;
    });
    promise.resolve = this.temp_resolve;
    promise.reject = this.temp_reject;
    delete this.temp_resolve;
    delete this.temp_reject;
    return promise;
};

var device = null;

let getDevice = async _ => {
    const adapter = await navigator.gpu?.requestAdapter();
    device = await adapter?.requestDevice();
    if (!device) {
        console.log("error finding device");
        return null;
    }
    return device;
}


let getPipeline = (shader, name) => {

    //let ready = Promise.create();

    const module = device.createShaderModule({
        label: `${name} module`,
        code: shader
    })

    let pipeline = device.createComputePipeline(
        {
            label: `${name} pipeline`,
            layout: "auto",
            compute: {
                module: module,
                entryPoint: "main"
            }
        }
    )

    //ready.resolve();

    return {
        pipeline
    }
}

const random = (min, max) => {
    if (min === undefined) {
        min = 0;
        max = 1;
    } else {
        if (max === undefined) {
            max = min;
            min = 0;
        }
    }

    return min + Math.random() * (max - min);
}

class PipelineData {
    constructor() {
        this.label = null;
        this.passDescriptor = null;
        this.pipeline = null;
        this.bindGroup = null;
        this.uniformsData = null;
        this.uniformsBuffer = null;
    }

    setBindGroup = entries => {
        this.bindGroup = device.createBindGroup({
            label: `${this.label} bind group`,
            layout: this.pipeline.getBindGroupLayout(0),
            entries
        })
    }
}


async function setupRenderingPipeline(label,
    shader,
    sampleCount = 1,
    _targets = [{ format: navigator.gpu.getPreferredCanvasFormat() }],
    depthEnabled = true,
    _cullMode = "none") {

    let pipelineData = new PipelineData();

    const module = device.createShaderModule(
        {
            label: `${label} module`,
            code: shader
        }
    )

    const pipelineDescriptor = {
        label: `${label} pipeline`,
        layout: 'auto',
        vertex: {
            module,
            entryPoint: 'vs'
        },
        fragment: {
            module,
            entryPoint: 'fs',
            targets: _targets
        },
        primitive: {
            topology: 'triangle-list',
            cullMode: _cullMode
        },
        multisample: {
            count: sampleCount
        }
    }

    const attachments = _targets.map(el => {
        return {
            clearView: [1, 1, 1, 1],
            storeOp: "store",
            loadOp: "clear"
        }
    })

    const renderPassDescriptor = {
        label: `${label} rendering pass descriptor`,
        colorAttachments: attachments
    }

    if (depthEnabled) {
        pipelineDescriptor.depthStencil = {
            depthWriteEnabled: true,
            depthCompare: 'less',
            format: 'depth32float'
        }

        renderPassDescriptor.depthStencilAttachment = {
            depthClearValue: 1.0,
            depthStoreOp: 'store',
            depthLoadOp: "clear"
        }
    }

    const pipeline = device.createRenderPipeline(pipelineDescriptor)

    pipelineData.label = label;
    pipelineData.pipeline = pipeline;
    pipelineData.passDescriptor = renderPassDescriptor;

    return pipelineData;
}


async function setupPipeline(label,
    shader,
    uniforms = null,
    bindingBuffers = null) {

    let pipelineData = new PipelineData();

    pipelineData.pipeline = getPipeline(shader).pipeline;

    pipelineData.label = label;

    if (uniforms) {
        pipelineData.uniformsData = new Float32Array(uniforms);

        pipelineData.uniformsBuffer = device.createBuffer(
            {
                label: `${label} uniforms buffer`,
                size: pipelineData.uniformsData.byteLength,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
            }
        )

        device.queue.writeBuffer(pipelineData.uniformsBuffer, 0, pipelineData.uniformsData);
    }


    if (bindingBuffers) {
        let entries = bindingBuffers.map((data, index) => { return { binding: index, resource: { buffer: data == "uniforms" ? pipelineData.uniformsBuffer : data } } });

        pipelineData.bindGroup = device.createBindGroup({
            label: `${label} bind group`,
            layout: pipelineData.pipeline.getBindGroupLayout(0),
            entries
        })
    }

    // console.log(`${label} ready`);

    return pipelineData;

}

async function get(path) {

    let result;
    let ready = Promise.create();
    fetch(path).then(data => {
        data.json().then(response => {
            result = response;
            ready.resolve();
        })
    })

    await ready;
    return result;
}

async function loadGeometry(label, path) {

    let result = await get(path);

    let buffersData = {}
    let buffers = {};

    for (let id in result) {
        const data = new Float32Array(result[id]);
        let orderedData = data;

        if (id == "position" || id == "normal") {

            orderedData = [];
            for (let i = 0; i < data.length; i += 3) {
                orderedData.push(data[i + 0]);
                orderedData.push(data[i + 1]);
                orderedData.push(data[i + 2]);
                orderedData.push(1);
            }
            buffers.length = orderedData.length / 4;
            orderedData = new Float32Array(orderedData);
        }

        buffersData[id] = orderedData;

    }

    //Encode the UV into the position and normal

    let posIndex = 0;
    for (let i = 0; i < buffersData.uv.length; i += 2) {
        buffersData.position[posIndex + 3] = buffersData.uv[i + 0];
        buffersData.normal[posIndex + 3] = buffersData.uv[i + 1];
        posIndex += 4;
    }

    let ids = { position: "", normal: "" }

    for (let id in ids) {

        buffers[id] = device.createBuffer({
            label: `${label} ${id} buffer`,
            size: buffersData[id].byteLength,
            usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_DST | GPUBufferUsage.COPY_SRC
        });

        device.queue.writeBuffer(buffers[id], 0, buffersData[id]);
    }

    return buffers;
}

async function loadImageBitmap(url) {
    const res = await fetch(url);
    const blob = await res.blob();
    return await createImageBitmap(blob, { colorSpaceConversion: 'none' });
}


async function textureFromImage(url) {
    const source = await loadImageBitmap(url);
    const texture = device.createTexture({
        label: url,
        format: 'rgba8unorm',
        size: [source.width, source.height],
        usage: GPUTextureUsage.TEXTURE_BINDING |
            GPUTextureUsage.COPY_DST |
            GPUTextureUsage.RENDER_ATTACHMENT,
    });

    device.queue.copyExternalImageToTexture(
        { source, flipY: true },
        { texture },
        { width: source.width, height: source.height },
    );

    return texture;
}


export {
    getDevice, getPipeline, loadGeometry, random, setupPipeline,
    setupRenderingPipeline, textureFromImage
};


velocityTexture = device.createTexture({
    size: [window.innerWidth, window.innerHeight],
    sampleCount: 1,
    format: 'rgba8unorm',
    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
});

colorTextureMulti.view = colorTextureMulti.createView();




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
let geometryBuffers = { "position": [-0.4985125546, -0.2804133119, -0.3115703466, 0.4985125546, -0.2804133119, -0.3115703466, 0.4985125546, -0.2804133119, 0.3115703466, 0.4985125546, -0.2804133119, 0.3115703466, 0.4985125546, -0.2804133119, -0.3115703466, 0.4985125546, 0.2804133119, -0.3115703466, 0.4985125546, -0.2804133119, -0.3115703466, -0.4985125546, -0.2804133119, -0.3115703466, -0.4985125546, 0.2804133119, -0.3115703466, -0.4985125546, -0.2804133119, -0.3115703466, -0.4985125546, -0.2804133119, 0.3115703466, -0.4985125546, 0.2804133119, 0.3115703466, -0.4985125546, 0.2804133119, 0.3115703466, 0.4985125546, 0.2804133119, 0.3115703466, 0.4985125546, 0.2804133119, -0.3115703466, -0.4785125546, 0.2604133119, -0.28971927, -0.4785125546, -0.2604133119, -0.28971927, 0.4785125546, -0.2604133119, -0.28971927, -0.4785125546, 0.2604133119, 0.3115703466, 0.4785125546, 0.2604133119, 0.3115703466, 0.4985125546, 0.2804133119, 0.3115703466, 0.4785125546, 0.2604133119, 0.3115703466, 0.4785125546, -0.2604133119, 0.3115703466, 0.4985125546, -0.2804133119, 0.3115703466, 0.4785125546, -0.2604133119, 0.3115703466, -0.4785125546, -0.2604133119, 0.3115703466, -0.4985125546, -0.2804133119, 0.3115703466, -0.4785125546, -0.2604133119, 0.3115703466, -0.4785125546, 0.2604133119, 0.3115703466, -0.4985125546, 0.2804133119, 0.3115703466, -0.4785125546, 0.2604133119, -0.28971927, 0.4785125546, 0.2604133119, -0.28971927, 0.4785125546, 0.2604133119, 0.3115703466, 0.4785125546, 0.2604133119, -0.28971927, 0.4785125546, -0.2604133119, -0.28971927, 0.4785125546, -0.2604133119, 0.3115703466, 0.4785125546, -0.2604133119, -0.28971927, -0.4785125546, -0.2604133119, -0.28971927, -0.4785125546, -0.2604133119, 0.3115703466, -0.4785125546, -0.2604133119, -0.28971927, -0.4785125546, 0.2604133119, -0.28971927, -0.4785125546, 0.2604133119, 0.3115703466, -0.4985125546, -0.2804133119, -0.3115703466, 0.4985125546, -0.2804133119, 0.3115703466, -0.4985125546, -0.2804133119, 0.3115703466, 0.4985125546, -0.2804133119, 0.3115703466, 0.4985125546, 0.2804133119, -0.3115703466, 0.4985125546, 0.2804133119, 0.3115703466, 0.4985125546, -0.2804133119, -0.3115703466, -0.4985125546, 0.2804133119, -0.3115703466, 0.4985125546, 0.2804133119, -0.3115703466, -0.4985125546, -0.2804133119, -0.3115703466, -0.4985125546, 0.2804133119, 0.3115703466, -0.4985125546, 0.2804133119, -0.3115703466, -0.4985125546, 0.2804133119, 0.3115703466, 0.4985125546, 0.2804133119, -0.3115703466, -0.4985125546, 0.2804133119, -0.3115703466, -0.4785125546, 0.2604133119, -0.28971927, 0.4785125546, -0.2604133119, -0.28971927, 0.4785125546, 0.2604133119, -0.28971927, -0.4785125546, 0.2604133119, 0.3115703466, 0.4985125546, 0.2804133119, 0.3115703466, -0.4985125546, 0.2804133119, 0.3115703466, 0.4785125546, 0.2604133119, 0.3115703466, 0.4985125546, -0.2804133119, 0.3115703466, 0.4985125546, 0.2804133119, 0.3115703466, 0.4785125546, -0.2604133119, 0.3115703466, -0.4985125546, -0.2804133119, 0.3115703466, 0.4985125546, -0.2804133119, 0.3115703466, -0.4785125546, -0.2604133119, 0.3115703466, -0.4985125546, 0.2804133119, 0.3115703466, -0.4985125546, -0.2804133119, 0.3115703466, -0.4785125546, 0.2604133119, -0.28971927, 0.4785125546, 0.2604133119, 0.3115703466, -0.4785125546, 0.2604133119, 0.3115703466, 0.4785125546, 0.2604133119, -0.28971927, 0.4785125546, -0.2604133119, 0.3115703466, 0.4785125546, 0.2604133119, 0.3115703466, 0.4785125546, -0.2604133119, -0.28971927, -0.4785125546, -0.2604133119, 0.3115703466, 0.4785125546, -0.2604133119, 0.3115703466, -0.4785125546, -0.2604133119, -0.28971927, -0.4785125546, 0.2604133119, 0.3115703466, -0.4785125546, -0.2604133119, 0.3115703466], "normal": [-0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -0.0, -1.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0, -0.0, -0.0, -1.0, -0.0, -0.0, -1.0, -0.0, -0.0, -1.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -0.0, 1.0, 0.0, -0.0, 1.0, 0.0, -0.0, 1.0, 0.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -1.0, 0.0, 0.0, -1.0, 0.0, -0.0, -1.0, 0.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -0.0, 1.0, 0.0, 0.0, 1.0, 0.0, -0.0, 1.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0, -0.0, -1.0, 0.0, -0.0, -1.0, 0.0, -0.0, -1.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0, -0.0, -0.0, -1.0, -0.0, -0.0, -1.0, -0.0, -0.0, -1.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -1.0, 0.0, 0.0, -0.0, 1.0, 0.0, -0.0, 1.0, 0.0, -0.0, 1.0, 0.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, 0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -0.0, 1.0, -0.0, -1.0, 0.0, -0.0, -1.0, 0.0, -0.0, -1.0, 0.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -1.0, -0.0, 0.0, -0.0, 1.0, 0.0, -0.0, 1.0, 0.0, -0.0, 1.0, -0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0, 1.0, -0.0, 0.0], "uv": [0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.9999999404, 0.9534357563, 1.0, 0.0465643406, 0.9999999404, 0.9534357563, 0.9999999404, 0.9534357563, 0.9999999404, 0.0465643406, 1.0, 0.0, 0.9999999404, 0.0465643406, 0.9999999404, 0.9534357563, 1.0, 1.0, 0.9999999404, 0.9534357563, 1.0, 0.0465643406, 1.0, 0.0, 1.0, 0.0465643406, 0.9999999404, 0.9534357563, 1.0, 1.0, 0.9999999404, 0.9534357563, 0.9999999404, 0.0465643406, 0.9999999404, 0.0465643406, 0.9999999404, 0.0465643406, 0.9999999404, 0.9534357563, 0.9999999404, 0.9534357563, 0.9999999404, 0.9534357563, 1.0, 0.0465643406, 1.0, 0.0465643406, 1.0, 0.0465643406, 0.9999999404, 0.9534357563, 0.9999999404, 0.9534357563, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.9999999404, 0.9534357563, 0.9999999404, 0.9534357563, 0.9999999404, 0.0465643406, 0.9999999404, 0.9534357563, 1.0, 0.0, 1.0, 1.0, 0.9999999404, 0.0465643406, 1.0, 1.0, 1.0, 0.0, 0.9999999404, 0.9534357563, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0465643406, 1.0, 1.0, 1.0, 0.0, 0.9999999404, 0.9534357563, 0.9999999404, 0.0465643406, 0.9999999404, 0.9534357563, 0.9999999404, 0.0465643406, 0.9999999404, 0.9534357563, 0.9999999404, 0.0465643406, 0.9999999404, 0.9534357563, 1.0, 0.0465643406, 0.9999999404, 0.9534357563, 1.0, 0.0465643406, 0.9999999404, 0.9534357563, 1.0, 0.0465643406] }


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
export function render() {

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




