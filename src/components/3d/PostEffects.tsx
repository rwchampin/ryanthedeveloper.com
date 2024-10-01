"use client"

import { ToneMappingMode, BlendFunction, Resizer, KernelSize } from 'postprocessing'
import { useControls } from 'leva'
import { EffectComposer, SSAO, ToneMapping, N8AO, Vignette, Bloom, GodRays, SMAA } from '@react-three/postprocessing'
import { useRef, useMemo, Suspense } from 'react'
/**
 * ORDER MATTERS
 * @see https://github.com/pmndrs/postprocessing/blob/main/src/effects/ToneMappingEffect.ts
 * @see https://github.com/pmndrs/postprocessing/blob/main/src/effects/VignetteEffect.ts
 * @see https://github.com/pmndrs/postprocessing/blob/main/src/effects/ChromaticAberrationEffect.ts
 * @see https://github.com/pmndrs/postprocessing/blob/main/src/effects/NoiseEffect.ts

* The best order of all effects is:
* 1. ToneMapping
* 2. Vignette
* 3. ChromaticAberration
* 4. Noise
* 5. Bloom
* 
* Then you can add other effects in any order you want.
* 
* The order of the effects is important because some effects depend on the output of other effects.
* For example, the VignetteEffect depends on the output of the ToneMappingEffect.
* If the ToneMappingEffect is not applied first, the VignetteEffect will not work properly.
* 
* The same goes for the ChromaticAberrationEffect and the NoiseEffect.
* 
* The SSAOEffect is not affected by the order of the other effects. It is applied after all other effects.
* It is used to add depth to the scene. It is not affected by the other effects.
* The best settings for the SSAOEffect are:
* - radius: 0.5
* - intensity: 0.5
* - luminanceInfluence: 0.9
* - luminanceThreshold: 0.1
* - luminanceSmoothing: 0.025
* - distanceFalloff: 0.5
* - bias: 0.5
* - power: 0.5
* - resolution: 0.5
* - blur: 0.5
* - blurSharpness: 0.5
*
* The SMAAPass is not affected by the order of the other effects. It is applied after all other effects.
* It is used to add depth to the scene. It is not affected by the other effects.
* The differnce between the SMAAPass and the SSAOEffect is that the SMAAPass is more accurate and faster.
* 
* The FXAAEffect is not affected by the order of the other effects. It is applied after all other effects.
* 
* \
* 
 */
export default function PostEffects() {
  return (
    <Suspense fallback={null}>
      <EffectComposer multisampling={0} depthBuffer={true} stencilBuffer={false} enableNormalPass={true}  >
        <ToneMapping />
        <Vignette
          offset={0.5} // vignette offset
          darkness={0.5} // vignette darkness
          eskil={false} // Eskil's vignette technique
          blendFunction={BlendFunction.NORMAL} // blend mode
        />
        <SMAA />

        {/* <N8AO aoRadius={1} intensity={1} /> */}
        {/* <Bloom mipmapBlur luminanceThreshold={1} levels={7} intensity={1} /> */}


      </EffectComposer>
    </Suspense>
  )
}
