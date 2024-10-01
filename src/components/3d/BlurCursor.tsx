"use client";
import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { useFrame, useThree } from '@react-three/fiber';
import { useControls } from 'leva';
import { useMouseStore } from '@/stores/useMouseStore';

// import { useMouseStore } from '@/stores/useMouseStore';
const lerp = ( a, b, n ) => ( 1 - n ) * a + n * b;
export const BlurCursor = ( { theme } ) => {
  const getMaterial = ( value ) => {
    switch ( value ) {
      case 'meshBasicMaterial':
        return new THREE.MeshBasicMaterial( { color: followerSettings.color } );
      case 'meshNormalMaterial':
        return new THREE.MeshNormalMaterial();
      case 'meshPhongMaterial':
        return new THREE.MeshPhongMaterial( { color: followerSettings.color } );
      case 'meshStandardMaterial':
        return new THREE.MeshStandardMaterial( { color: followerSettings.color } );
      case 'meshToonMaterial':
        return new THREE.MeshToonMaterial( { color: followerSettings.color } );
      default:
        return new THREE.MeshBasicMaterial( { color: followerSettings.color } );
    }
  }
  const setPosition = useRef( useMouseStore.getState().setPosition );
  const lightSphereMesh = useRef<any>( null );
  const lightPlane = useRef<any>( null );
  const lightSphere = useRef<any>( null );
  const { camera, viewport, raycaster } = useThree();
  const mouse = useRef( new THREE.Vector2() );
  const followerSettings = useControls( 'Follower', {
    radius: 0.005,
    detail: 2,
    color: '#ff0000',
    castShadow: true,
    receiveShadow: true,
    showCursor: true,
    showlightPlane: false,
    intensity: 1,
    distance: 100,
    decay: 1,
    fog: true,
    material: {
      value: 'meshBasicMaterial',
      fog: true,
      options: [ 'meshBasicMaterial', 'meshNormalMaterial', 'meshPhongMaterial', 'meshStandardMaterial', 'meshToonMaterial' ],
      onChange: ( value ) => {
        const material = getMaterial( value );
        lightSphereMesh.current.material = material;
        lightSphere.current.color = new THREE.Color( followerSettings.color );
        lightSphere.current.color.multiplyScalar( followerSettings.intensity );
      }}
  } );

  useEffect(() => {
    if ( !lightSphere.current || !lightPlane.current ) return;
    const handleMouseMove = ( event: MouseEvent ) => {
const canvas = document.getElementsByTagName('canvas')[0].getBoundingClientRect();
      // Convert mouse coordinates to normalized device coordinates (-1 to +1)
      mouse.current.x = (event.clientX-canvas.left) / window.innerWidth * 2 - 1;
      mouse.current.y = -(event.clientY-canvas.top) / window.innerHeight * 2 + 1;

          // setPosition.current( mouse.current.x, mouse.current.y, 0 );

      // Convert mouse coordinates to normalized device coordinates (-1 to +1)

      // Update the position of the lightSphere
      if ( lightSphere.current ) {
        // Use raycaster to find the intersection point in the 3D scene
        raycaster.setFromCamera( mouse.current, camera );
        const intersects = raycaster.intersectObject( lightPlane.current );

        if ( intersects.length > 0 ) {
          const intersect = intersects[0];
          mouse.current.x = intersect.point.x;
          mouse.current.y = intersect.point.y;
          // ss.current.position.x = intersect.point.x;
          // ss.current.position.y = intersect.point.y;
       
          setPosition.current( intersect.point.x, intersect.point.y, intersect.point.z );
        }
      }
    };

    window.addEventListener( 'mousemove', handleMouseMove );
    return () => {
      window.removeEventListener( 'mousemove', handleMouseMove );
    }
  }, [ camera, raycaster,lightSphere, lightPlane ] );

  // let pos = new THREE.Vector3( 0, 0, 0 );


  // apply the velocity to the sphere
 
  useFrame( ( { pointer } ) => {
 
//  if ( !lightSphere.current ) return;
    // if ( pos.x !== pointer.x || pos.y !== pointer.y ) {

    // setPosition( pointer.x, pointer.y, 0 );
    

    // const dxMouse = ( pointer.x - lightSphere.current.position.x );
    // const dyMouse = ( -pointer.y - lightSphere.current.position.y );


    // const mouseDist = Math.sqrt( dxMouse * dxMouse + dyMouse * dyMouse );
    // const repulsionForce = ( 1 - mouseDist ) * 0.1;
    // if the mouse is close to the sphere, repel it

  //     if (mouseDist < 0.05) {
  //       const direction = pointer.clone().sub( ss.current.position );

  //                       ss.current.position.x -= (dxMouse / mouseDist) * repulsionForce;
  //               ss.current.position.y -= (dyMouse / mouseDist) * repulsionForce
  // return;
  //     }  

  lightSphere.current.position.x = mouse.current.x;
  lightSphere.current.position.y = mouse.current.y;
    // } else {

    // }/

  } );

  if(followerSettings.showCursor === false) return null;
  return (
    <>
      <mesh
        position={ [ 0, 0, 0 ] }
        ref={ lightPlane }
        visible={followerSettings.showlightPlane}


        // onPointerMove={
        //   ( e ) => {


        //     const x = e.point.x;
        //     const y = e.point.y;
        //     setPosition( x, y, 0 );
        //     const z = 0;



        //     pos = new THREE.Vector3( x, y, z );


        //     const s = ss.current.position;
        //     const soriginale = s.clone();

        //     const gravity = new THREE.Vector3( 0, -0.1, 0 );
        //     const velocity = new THREE.Vector3( 0, 0, 0 );

        //     const direction = position.clone().sub( s );

        //     const dx = pos.x - s.x;
        //     const dy = pos.y - s.y;
        //     const dist = Math.sqrt( dx * dx + dy * dy );

        //     const distToSphere = s.distanceTo( pos ); 
        //     if ( distToSphere < 0.1 ) {
        //       const vel = direction.normalize().add( gravity );
        //       velocity.lerp( vel, 0.1 );
        //       s.lerp( soriginale.clone().add( velocity ), 0.1 );
        //     } else {
        //       velocity.lerp( gravity.clone().multiplyScalar( distToSphere ), 0.1 );
        //       s.lerp( soriginale, 0.1 );
        //     }
        //     // const repelSphere = () => {
        //     //   const distToSphere = s.distanceTo( pos );
        //     //   if ( distToSphere < 0.1 ) {
        //     //     const vel = direction.normalize().multiplyScalar( -1 );
        //     //     s.lerp( soriginale.clone().add( vel ), 0.1 );
        //     //   } else {
        //     //     s.lerp( soriginale, 0.1 );
        //     //   }
        //     // };

          
        //     // const dx = pos.x - prv.x;
        //     // const dy = pos.y - prv.y;
        //     // const dist = Math.sqrt( dx * dx + dy * dy );

        //     const repelSphere = () => {
        //       const distToSphere = s.distanceTo( pos );
        //       if ( distToSphere < 0.1 ) {
        //         const vel = direction.normalize().multiplyScalar( -1 );
        //         s.lerp( soriginale.clone().add( vel ), 0.1 );
        //       } else {
        //         s.lerp( soriginale, 0.1 );
        //       }
        //     };

        //     repelSphere();

        //     // Repel from the left
        //     const left = new THREE.Vector3( -1, 0, 0 );
        //     const distToLeft = s.distanceTo( pos.clone().add( left ) );
        //     if ( distToLeft < 0.1 ) {
        //       const vel = left.clone().normalize();
        //       s.lerp( soriginale.clone().add( vel ), 0.1 );
        //     }

        //     // Repel from the top
        //     const top = new THREE.Vector3( 0, 1, 0 );
        //     const distToTop = s.distanceTo( pos.clone().add( top ) );
        //     if ( distToTop < 0.1 ) {
        //       const vel = top.clone().normalize();
        //       s.lerp( soriginale.clone().add( vel ), 0.1 );
        //     }

        //     // get the distance between the two points

        //     for ( let i = 0; i < n; i++ ) {
        //       const x = prv.x + dx * ( i / n );
        //       const y = prv.y + dy * ( i / n );
        //       setPosition( x, y, 0 );
        //     }

        //     if ( distToSphere < 0.1 ) {
        //       const vel = new THREE.Vector3( dx, dy, 0 ).normalize()
        //       s.lerp( soriginale.add( vel ), 0.1 );
        //     }
        //     else {
        //       s.lerp( soriginale, 0.1 );
        //     }

        //     // get the distance between the two points
        //     const n = Math.min( 10, Math.floor( dist ) );
        //     for ( let i = 0; i < n; i++ ) {
        //       const x = prv.x + dx * ( i / n );
        //       const y = prv.y + dy * ( i / n );
        //       setPosition( x, y, z );
        //     }
        //   }
        // } 
  
        receiveShadow
        scale={[
        viewport.width,
        viewport.height,
        viewport.distance
        
      ]}>

        <planeGeometry args={ [ 10, 10 ] }  />
        <meshBasicMaterial
        side={ THREE.DoubleSide } 
         color={ theme === 'dark' ? '#000000' : '#ff00ff' } ref={ lightPlane } />
      </mesh>
       
       <pointLight ref={ lightSphere }

        intensity={ followerSettings.intensity }
        color={ followerSettings.color }
        distance={ followerSettings.distance }
        decay={ followerSettings.decay }
        castShadow={ followerSettings.castShadow } receiveShadow={ followerSettings.receiveShadow }>
      <mesh    ref={ lightSphereMesh } 
      castShadow={ followerSettings.castShadow }
      receiveShadow={ followerSettings.receiveShadow }
      
      >

     
        <icosahedronGeometry args={ [ followerSettings.radius, followerSettings.detail ] } />
        <meshBasicMaterial color={ followerSettings.color } />
        </mesh>
</pointLight>
    </>
  );
};



