import { mipMapCompute } from "../shaders/MipMapCompute.js";
import * as Utils from "../utils/utils.js";

let started = false;
let pipeline, bindGroups;


async function generateMipMap(texture, device) {

    if (!started) {

        pipeline = Utils.getPipeline(mipMapCompute).pipeline;

        bindGroups = [];
        for (let i = 0; i < texture.mipLevelCount - 1; i++) {

            const bindGroup = device.createBindGroup({
                label: "bind group for mipmap",
                layout: pipeline.getBindGroupLayout(0),
                entries: [
                    {
                        binding: 0, resource: texture.createView(
                            {
                                baseMipLevel: i,
                                mipLevelCount: 1
                            }
                        )
                    },
                    {
                        binding: 1, resource: texture.createView(
                            {
                                baseMipLevel: i + 1,
                                mipLevelCount: 1
                            }
                        )
                    },
                ]
            })

            bindGroups.push(bindGroup)

        }

        started = true;
    }

    //make a command enconder to start encoding thigns
    const encoder = device.createCommandEncoder({ label: 'encoder' });

    //Run the simulation
    const computePass = encoder.beginComputePass({
        label: "mipmap pass"
    })

    computePass.setPipeline(pipeline);

    for (let i = 0; i < texture.mipLevelCount - 1; i++) {

        let size = Math.pow(2, texture.mipLevelCount - i - 2);
        computePass.setBindGroup(0, bindGroups[i]);
        computePass.dispatchWorkgroups(size, size, size);

    }

    computePass.end();

    const commandBuffer = encoder.finish();
    device.queue.submit([commandBuffer]);

}

export { generateMipMap };
