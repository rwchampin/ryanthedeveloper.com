import * as THREE from 'three';
import { create } from 'zustand';

interface MouseStore {
  position: THREE.Vector3;
  setPosition: (x: number, y: number, z: number) => void;
}

export const useMouseStore = create<MouseStore>((set) => ({
  position: new THREE.Vector3(0, 0, 0),
  setPosition: ( x, y, z ) => set( { position: new THREE.Vector3( x, y, z ) } ),
}));