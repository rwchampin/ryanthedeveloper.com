"use client";
import { LOGO_URL } from "@/lib/utils/utils3d";

import { useTheme } from 'next-themes';

import { Center, Sparkles, useGLTF } from '@react-three/drei';
import { usePathname } from 'next/navigation';

import { useThree } from '@react-three/fiber';
import { useMemo, useRef } from "react";
import * as THREE from 'three';

const count=20000;

const logoMaterial=new THREE.MeshStandardMaterial({
	color: 0x000000,
	roughness: 0.5,
	metalness: 0.5,
});
logoMaterial.flatShading=true;



export const PlainLogo = () => {
  const { theme } = useTheme()
  const h = 150;
  const w = 300;
// the camera is 1 ununit away from the object
	const asp = w / h;

	const pathname = usePathname();
	const instance=useRef<any>(null);
	const { nodes } = useGLTF(LOGO_URL)
	debugger
	const homeUrls = ['', '/', 'home', 'index'];
	const isHomePage = homeUrls.includes(pathname);
	const logo= nodes.Scene.children[0];
	const { size,camera } = useThree();

console.log(theme)

	 const generatepointsWithinSize = (count=1000) => {
		const height = 150;
		const width = 300;
		const points = new Float32Array(count * 3);
		for (let i = 0; i < count; i++) {
			points[i * 3] = Math.random() * width - width / 2;
			points[i * 3 + 1] = Math.random() * height - height / 2;
			points[i * 3 + 2] = camera.position.z + Math.random() * 100;
		}
		return points;
	};

	 


	return (
		<Center position={[0,0,0]} >

	
		
			
			
				<primitive
				recieveShadow
				castShadow
				scale={[1,1,1]}
				position={[0,0,0]}
				material={new THREE.MeshStandardMaterial({ fog:true, color: 'black', roughness: 0.5, metalness: 0.15,emissive: 'white', emissiveIntensity: 0.05 })} 
			object={logo}

			/>
		 
			 	</Center>
				  
	);



}


useGLTF.preload(LOGO_URL);