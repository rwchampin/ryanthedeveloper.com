// This is a module worker, so we can use imports (in the browser too!)
// https://stackoverflow.com/a/39575124

import { LOGO_URL } from "@/lib/utils/utils3d";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { MeshSurfaceSampler } from "three-stdlib";
import { getNormalizedMousePos } from "@/lib/utils/utils3d";
import { useLogger } from "@/hooks/useLog";
class RepulsionParticle {
  parent: any;
  index: number
  position: THREE.Vector3;
  previousPosition: THREE.Vector3;
  velocity: THREE.Vector3;
  originalPosition: THREE.Vector3 | null;
  repelled: boolean;
  color: THREE.Color;

  constructor(position: THREE.Vector3, index: number) {
    this.parent = parent;
    this.index = index;
    this.position = position;
    this.velocity = new THREE.Vector3();
    this.originalPosition = null;
    this.repelled = false;
    this.color = new THREE.Color(0xff0500); // Default color
  }
 changeColor(color: number) {
    this.color.set(color);
    this.parent.current.setColorAt(this.index, this.color);
    this.parent.current.instanceColor.needsUpdate = true;
  }

  applyRepulsion(mousePosition: THREE.Vector3, repulsionDistance: number) {
    const mousePos2D = new THREE.Vector3(mousePosition.x, mousePosition.y, 0);
    const particlePos2D = new THREE.Vector3(this.position.x, this.position.y, 0);
    const dx = mousePos2D.x - particlePos2D.x;
    const dy = mousePos2D.y - particlePos2D.y;
    const dz = mousePos2D.z - particlePos2D.z;
    const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (distance < repulsionDistance) {
      if (!this.originalPosition) {
        this.originalPosition = this.position.clone();
      }
      const direction = particlePos2D.clone().sub(mousePos2D).normalize();
      const hitStrength = (repulsionDistance - distance) / repulsionDistance;
      this.velocity.add(direction.multiplyScalar(hitStrength));
      this.repelled = true;
      this.color.set(0x00ff00); // Change color to green when repelled
    } else {
      this.repelled = false;
      this.color.set(0xff0500); // Reset color to default
    }
  }

  applyAttraction(gravity: number) {
    if (this.repelled && this.originalPosition) {
      const direction = this.originalPosition.clone().sub(this.position).normalize();
      this.velocity.add(direction.multiplyScalar(gravity));
    }
  }

  updatePosition() {
    this.position.add(this.velocity);
    this.velocity.multiplyScalar(0.95); // Apply some damping to the velocity to simulate friction
  }

  reset(threshold: number) {
    if (this.originalPosition && this.position.distanceTo(this.originalPosition) < threshold) {
      // Reset position to original
      this.position.copy(this.originalPosition);
      this.velocity.set(0, 0, 0);
      this.originalPosition = null;
      this.repelled = false;
      this.color.set(0xff0500); // Reset color to default
    }
  }

  destroy() {
    this.parent.current.remove(this.index);
  }

  getDistanceToMouse(mousePosition: THREE.Vector3) {
    const mousePos2D = new THREE.Vector3(mousePosition.x, mousePosition.y, 0);
    const particlePos2D = new THREE.Vector3(this.position.x, this.position.y, 0);
    const dx = mousePos2D.x - particlePos2D.x;
    const dy = mousePos2D.y - particlePos2D.y;
    const dz = mousePos2D.z - particlePos2D.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  isRepelled() {
    return this.repelled;
  }

  setOriginalPosition() {
    this.originalPosition = this.position.clone();
  }

  setVelocity(velocity: THREE.Vector3) {
    this.velocity = velocity;
  }

  setPosition(position: THREE.Vector3) {
    this.position = position;
  }

  emitParticlesOnCollision() {
    // get the current mouse position
    const mousePos = new THREE.Vector3();
    mousePos.copy(mousePosition.current);
    // get the current particle position
    const particlePos = new THREE.Vector3();
    particlePos.copy(this.position);

  const dx = mousePos.x - particlePos.x;
  const dy = mousePos.y - particlePos.y;  
  const dz = mousePos.z - particlePos.z;

  const distance = Math.sqrt(dx * dx + dy * dy + dz * dz);

  if (distance < 0.1) {
    // emit particles
    const particles = 10;
    for (let i = 0; i < particles; i++) {
      const particle = new RepulsionParticle(
        new THREE.Vector3().copy(this.position),
        this.parent.current.count
      );
      particle.setVelocity(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1,
          (Math.random() - 0.5) * 0.1
        )
      );
      particle.setOriginalPosition();
      this.parent.current.add(particle);
    }
    this.destroy();
  }

  }

}



  const getPoints = () => {

    console.time("getPoints");

    console.timeLog("getPoints");
    const count = 20000;
    const { nodes } = useGLTF(LOGO_URL);
    const logo = nodes.Scene.children[0];

    const sampler = new MeshSurfaceSampler(logo).build();
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const position = new THREE.Vector3();

`  for (let i = 0; i < count; i++) {
      sampler.sample(position);
      positions[i * 3] = position.x;
      positions[i * 3 + 1] = position.y;
      positions[i * 3 + 2] = position.z;

    velocities[i * 3] = Math.random() * 0.01 - 0.005;
    velocities[i * 3 + 1] = Math.random() * 0.01 - 0.005;
    velocities[i * 3 + 2] = Math.random() * 0.01 - 0.005;
    }`

  }




addEventListener("message", (event: MessageEvent<number>) => {
  postMessage(getPoints()); 
});