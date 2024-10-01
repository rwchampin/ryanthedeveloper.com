import { r3f } from '@/helpers/global';
import ky from 'kyouka';
import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { Color } from 'three';
import {
  MeshWobbleMaterial,
  MeshDistortMaterial,
  // MeshReflectorMaterial,
   } from '@react-three/drei';
import {SimplifyModifier } from "three/examples/jsm/modifiers/SimplifyModifier";
import { MeshSurfaceSampler } from 'three/examples/jsm/math/MeshSurfaceSampler';

export const LOGO_URL = "https://e8o1wwl6nfrlwzjx.public.blob.vercel-storage.com/logo-eLOHj8kgSxIRzVq8ynWc3zqXxC72LG.glb"
// const simplex = new SimplexNoise();

export const getScreenFov = ( camera ) => {
  return ky.rad2deg( 2 * Math.atan( window.innerHeight / 2 / camera.position.z ) );
}
export const scaleToViewport = ( cameraDistance, zoom, fov, aspectRatio, meshSize, currentScale ) => {
  const distance = cameraDistance - 1;
  const targetSize = meshSize * currentScale[ 0 ] * distance;
  const vFOV = ( fov * Math.PI ) / 180;
  const height = 2 * Math.tan( vFOV / 2 ) * distance;
  const width = height * aspectRatio;
  const targetZoom = Math.min( width / targetSize, height / targetSize ) * zoom;
  return targetZoom;
}

export const getInstancePosition = ( instancedMesh, instanceId ) => {
  const dummy = new THREE.Object3D();
  const position = new THREE.Vector3();

  instancedMesh.getMatrixAt( instanceId, dummy.matrix );
  position.setFromMatrixPosition( dummy.matrix );

  return position;
};

export const setInstancePosition = ( instancedMesh, instanceId, position ) => {
  const dummy = new THREE.Object3D();

  instancedMesh.getMatrixAt( instanceId, dummy.matrix );
  dummy.position.copy( position );
  dummy.updateMatrix();

  instancedMesh.setMatrixAt( instanceId, dummy.matrix );
  instancedMesh.instanceMatrix.needsUpdate = true;
};

export function colorScale( colors ) {
  let range = []
  setColors( colors )

  const dummy = new Color()

  return { setColors, getColorAt }

  function setColors( colors ) {
    range = []
    colors.forEach( color => {
      range.push( new Color( color ) )
    } )
  }

  function getColorAt( progress ) {
    const p = Math.max( 0, Math.min( 1, progress ) ) * ( colors.length - 1 )
    const i1 = Math.floor( p )
    const c1 = range[ i1 ]
    if ( i1 >= colors.length - 1 ) {
      return c1.clone()
    }
    const p1 = p - i1
    const c2 = range[ i1 + 1 ]

    dummy.r = c1.r + p1 * ( c2.r - c1.r )
    dummy.g = c1.g + p1 * ( c2.g - c1.g )
    dummy.b = c1.b + p1 * ( c2.b - c1.b )
    return dummy.clone()
  }
}

export const Three = ( { children } ) => {
  return <r3f.In>{ children }</r3f.In>
}
// Custom hook for debouncing a value
export const useDebounce = ( value, delay ) => {
  const [ debouncedValue, setDebouncedValue ] = useState( value );

  useEffect( () => {
    const timer = setTimeout( () => {
      setDebouncedValue( value );
    }, delay );

    return () => {
      clearTimeout( timer );
    };
  }, [ value, delay ] );

  return debouncedValue;
};

// Custom hook for handling window resize
export const useWindowResize = () => {
  const [ windowSize, setWindowSize ] = useState( {
    width: window.innerWidth,
    height: window.innerHeight,
  } );

  useEffect( () => {
    const handleResize = () => {
      setWindowSize( {
        width: window.innerWidth,
        height: window.innerHeight,
      } );
    };

    window.addEventListener( 'resize', handleResize );

    return () => {
      window.removeEventListener( 'resize', handleResize );
    };
  }, [] );

  return windowSize;
};

// Custom hook for fetching data
export const useFetch = ( url ) => {
  const [ data, setData ] = useState( null );
  const [ loading, setLoading ] = useState( true );
  const [ error, setError ] = useState( null );

  useEffect( () => {
    const fetchData = async () => {
      try {
        const response = await fetch( url );
        const jsonData = await response.json();
        setData( jsonData );
        setLoading( false );
      } catch ( error ) {
        setError( error );
        setLoading( false );
      }
    };

    fetchData();
  }, [ url ] );

  return { data, loading, error };
};

export const simplify = ( geometry, percentage = .5 ) => {
  const modifier = new SimplifyModifier();
  const count = Math.floor( geometry.attributes.position.count * percentage ); // number of vertices to remove
  return modifier.modify( geometry, count );

}

export const bufferGeometry = ( () => {
  let instance: THREE.BufferGeometry
  return () => {
    if ( !instance ) {
      instance = new THREE.BufferGeometry()
    }
    return instance
  }
} )()

export const vec2 = ( () => {
  let instance;
  return ( x = 0, y = 0 ) => {
    if ( !instance ) {
      instance = new THREE.Vector2( x, y );
    } else {
      instance.set( x, y );
    }
    return instance;
  };
} )();

export const vec3 = ( () => {
  let instance;
  return ( x = 0, y = 0, z = 0 ) => {
    if ( !instance ) {
      instance = new THREE.Vector3( x, y, z );
    } else {
      instance.set( x, y, z );
    }
    return instance;
  };
} )();

export const raycaster = ( () => {
  let instance;
  return () => {
    if ( !instance ) {
      instance = new THREE.Raycaster();
    }
    return instance;
  };
} )();

export const dummy = ( () => {
  let instance;
  return () => {
    if ( !instance ) {
      instance = new THREE.Object3D();
    }
    return instance;
  };
} )();

export const matrix = ( () => {
  let instance;
  return () => {
    if ( !instance ) {
      instance = new THREE.Matrix4();
    }
    return instance;
  };
} )();

export const quaternion = ( () => {
  let instance;
  return () => {
    if ( !instance ) {
      instance = new THREE.Quaternion();
    }
    return instance;
  };
} )();

export const color = ( () => {
  let instance;
  return () => {
    if ( !instance ) {
      instance = new THREE.Color();
    }
    return instance;
  };
} )();

export const boxGeometry = ( () => {
  let instance;
  return ( width, height, depth ) => {
    if ( !instance ) {
      instance = new THREE.BoxGeometry( width, height, depth );
    }
    return instance;
  };
} )();

export const sphereGeometry = ( () => {
  let instance;
  return ( radius, widthSegments, heightSegments ) => {
    if ( !instance ) {
      instance = new THREE.SphereGeometry( radius, widthSegments, heightSegments );
    }
    return instance;
  };
} )();

export const planeGeometry = ( () => {
  let instance;
  return ( width, height ) => {
    if ( !instance ) {
      instance = new THREE.PlaneGeometry( width, height );
    }
    return instance;
  };
} )();

export const icosahedronGeometry = ( () => {
  let instance;
  return ( radius ) => {
    if ( !instance ) {
      instance = new THREE.IcosahedronGeometry( radius );
    }
    return instance;
  };
} )();

export const points = ( () => {
  let instance;
  return ( points ) => {
    if ( !instance ) {
      instance = new THREE.Points( points );
    }
    return instance;
  };
} )();

export const lerp = ( a: number, b: number, n: number ) => ( 1 - n ) * a + n * b;

const elasticEaseOut = ( x: number ): number => {
  const c4 = ( 2 * Math.PI ) / 3;

  return x === 0
    ? 0
    : x === 1
      ? 1
      : Math.pow( 2, -10 * x ) * Math.sin( ( x * 10 - 0.75 ) * c4 ) + 1;
};

export const elasticLerp = ( a: number, b: number, n: number ): number => {
  const easedN = elasticEaseOut( n );
  return lerp( a, b, easedN );
};

export const getModelData = ( gltf: any ) => {
  const nodes = gltf.nodes || [];
  return {
    materials: gltf.materials || [],
    material: gltf.materials[ 0 ] || null,
    scene: gltf.scene || gltf.scenes[ 0 ] || ( nodes ? nodes.Scene : null ) || null,
    nodes: gltf.nodes,
    animations: gltf.animations,
    mesh: gltf.scene.children[ 0 ] || null,
    geometry: {
      instance: gltf.scene.children[ 0 ].geometry,
      attributes: gltf.scene.children[ 0 ].geometry.attributes,
      // morphTargets: gltf.scene.children[0].geometry.morphTargets,
      // morphNormals: gltf.scene.children[0].geometry.morphNormals,
      // morphTargetInfluences: gltf.scene.children[0].geometry.morphTargetInfluences,
      // colors: gltf.scene.children[0].geometry.attributes.color,

      positions: {
        itemSize: gltf.scene.children[ 0 ].geometry.attributes.position.itemSize,
        array: gltf.scene.children[ 0 ].geometry.attributes.position.array,
        count: gltf.scene.children[ 0 ].geometry.attributes.position.count,
      }
    },
    children: gltf.scene.children || [],
  }
}

export const getNormalizedMousePos = ( e ) => {
  return {
    x: ( e.clientX / window.innerWidth ) * 2 - 1,
    y: -( e.clientY / window.innerHeight ) * 2 + 1
  };
};
 
  

export const trackMousePos = ( m ) => {
  let mouse = { x: 0, y: 0 };
  window.addEventListener( "mousemove", ( e ) => {
    mouse = getNormalizedMousePos( e );
  } );
  window.addEventListener( "touchstart", ( e ) => {
    mouse = getNormalizedMousePos( e.touches[ 0 ] );
  }, { passive: false } );
  window.addEventListener( "touchmove", ( e ) => {
    mouse = getNormalizedMousePos( e.touches[ 0 ] );
  } );
}

export const getSamplePositions = ( mesh, size ) => {
  const number = size * size;
  const sampler = new MeshSurfaceSampler( mesh ).build();

  const particlePositions = [];

  const tempPosition: any = new THREE.Vector3();
  for ( let i = 0; i < size; i++ ) {
    sampler.sample( tempPosition );
    particlePositions.push( tempPosition.x, tempPosition.y, tempPosition.z );
  }

  return particlePositions;
};

export const getGeometry = ( type ) => {
  switch ( type ) {
    case "plane":
      return new THREE.PlaneGeometry( 10, 10 );
    case "box":
      return new THREE.BoxGeometry( 10, 10, 10 );
    case "sphere":
      return new THREE.SphereGeometry( 5, 32, 32 );
    case "torus":
      return new THREE.TorusGeometry( 5, 2, 16, 100 );
    case "cone":
      return new THREE.ConeGeometry( 5, 20, 32 );
    case "cylinder":
      return new THREE.CylinderGeometry( 5, 5, 20, 32 );
    default:
      return new THREE.PlaneGeometry( 10, 10 );
  }
}

export const getGeometries = () => [
  "plane",
  "box",
  "sphere",
  "torus",
  "cone",
  "cylinder",
  "icosahedron",
  'octahedron',
  "tetrahedron",
  "dodecahedron",
]

export const getMaterial = ( type ) => {
  switch ( type ) {
    case "standard":
      return new THREE.MeshStandardMaterial();
    case "physical":
      return new THREE.MeshPhysicalMaterial();
    case "matcap":
      return new THREE.MeshMatcapMaterial();
    case "toon":
      return new THREE.MeshToonMaterial();
    case "lambert":
      return new THREE.MeshLambertMaterial();
    case "basic":
      return new THREE.MeshBasicMaterial();
    case "wobble":
      return MeshWobbleMaterial( { color: 0x00ff00, speed: 2, factor: 0.5 } );
    case "distort":
      return MeshDistortMaterial( { color: 0x00ff00, speed: 2, distort: 1 } );
    // case "reflector":
    //   return MeshReflectorMaterial( { color: 0x00ff00 } );
    default:
      return new THREE.MeshStandardMaterial();
  }
}

export const getMaterials = () => [
  "standard",
  "physical",
  "matcap",
  "toon",
  "lambert",
  "basic",
  "wobble",
  "distort",
  // "reflector",
]

export function placeMeshOnFloor(mesh, floorY = 0) {
  // Update the world matrix to ensure the bounding box is calculated correctly
  mesh.updateWorldMatrix(true, false);

  // Calculate the bounding box of the mesh
  const boundingBox = new THREE.Box3().setFromObject(mesh);

  // Get the height of the bounding box
  const height = boundingBox.max.y - boundingBox.min.y;

  // Calculate the amount to offset the mesh so that it lies flat on the floor
  const offset = boundingBox.min.y - floorY;

  // Adjust the position of the mesh
  mesh.position.y -= offset;
}

export const getBlendFunction = ( blendMode ) => {
  switch ( blendMode ) {
    case "NoBlending":
      return [ THREE.NoBlending, null ];
    case "NormalBlending":
      return [ THREE.NormalBlending, null ];
    case "AdditiveBlending":
      return [ THREE.AdditiveBlending, null ];
    case "SubtractiveBlending":
      return [ THREE.SubtractiveBlending, null ];
    case "MultiplyBlending":
      return [ THREE.MultiplyBlending, null ];
    case "CustomBlending":
      return [ THREE.CustomBlending, null ];
    case "AddEquation":
      return [ null, THREE.AddEquation ];
    case "SubtractEquation":
      return [ null, THREE.SubtractEquation ];
    case "ReverseSubtractEquation":
      return [ null, THREE.ReverseSubtractEquation ];
    case "MinEquation":
      return [ null, THREE.MinEquation ];
    case "MaxEquation":
      return [ null, THREE.MaxEquation ];
    default:
      return [ THREE.NormalBlending, null ];
  }
}

export const blendFunctions = [
  "NoBlending",
  "NormalBlending",
  "AdditiveBlending",
  "SubtractiveBlending",
  "MultiplyBlending",
  "CustomBlending",
  "AddEquation",
  "SubtractEquation",
  "ReverseSubtractEquation",
  "MinEquation",
  "MaxEquation",
]

export function createLight( color ) {

					const intensity = 200;

					const light = new THREE.PointLight( color, intensity, 20 );
					light.castShadow = true;
					light.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects

					let geometry = new THREE.SphereGeometry( 0.063, 12, 6 );
					let material = new THREE.MeshPhongMaterial( { color: '#6495ED', emissive: 0x6495ED, emissiveIntensity: intensity } );
          light.color.multiplyScalar( intensity );
					material.color.multiplyScalar( intensity );
					let sphere = new THREE.Mesh( geometry, material );
					light.add( sphere );

				 

				 
				 

				 

					return light;

				} 
