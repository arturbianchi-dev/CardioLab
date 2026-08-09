import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

function Vessel({ start, end, radius = 0.035, color = '#d85f69' }) {
  const a = new THREE.Vector3(...start);
  const b = new THREE.Vector3(...end);
  const direction = b.clone().sub(a);
  const length = direction.length();
  const midpoint = a.clone().add(b).multiplyScalar(0.5);
  return <mesh position={midpoint} scale={[radius, length / 2, radius]} rotation={new THREE.Euler(Math.PI / 2, 0, 0)}>
    <cylinderGeometry args={[1, 1, 1, 12]} />
    <meshStandardMaterial color={color} roughness={0.45} metalness={0.05} />
  </mesh>;
}

function PulsingHeart({ hr, playing }) {
  const ref = useRef();
  useFrame((state) => {
    if (!ref.current) return;
    const phase = ((state.clock.elapsedTime * hr) / 60) % 1;
    const pulse = playing ? 1 + Math.max(0, Math.sin(phase * Math.PI * 2)) * 0.055 : 1;
    ref.current.scale.setScalar(pulse);
  });
  return <group ref={ref} position={[0, 0.6, 0]}>
    <mesh position={[-0.28, 0.25, 0]} scale={[0.42, 0.48, 0.36]}>
      <sphereGeometry args={[1, 32, 20]} /><meshStandardMaterial color="#b94658" roughness={0.5}/>
    </mesh>
    <mesh position={[0.28, 0.25, 0]} scale={[0.42, 0.48, 0.36]}>
      <sphereGeometry args={[1, 32, 20]} /><meshStandardMaterial color="#b94658" roughness={0.5}/>
    </mesh>
    <mesh position={[0, -0.05, 0]} scale={[0.56, 0.75, 0.42]} rotation={[0,0,-0.12]}>
      <sphereGeometry args={[1, 32, 20]} /><meshStandardMaterial color="#8f3047" roughness={0.48}/>
    </mesh>
    <mesh position={[0, 0.72, 0]} scale={[0.28, 0.22, 0.25]}><cylinderGeometry args={[1,1,1,24]}/><meshStandardMaterial color="#9f394e"/></mesh>
  </group>;
}

function Lungs() { return <>
  <mesh position={[-1.25,0.7,0]} scale={[0.65,1.25,0.55]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#456d7b" transparent opacity={0.82}/></mesh>
  <mesh position={[1.25,0.7,0]} scale={[0.65,1.25,0.55]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#456d7b" transparent opacity={0.82}/></mesh>
</>; }
function Organ({position, scale, color}) { return <mesh position={position} scale={scale}><sphereGeometry args={[1,28,18]}/><meshStandardMaterial color={color} roughness={0.7}/></mesh>; }

function Anatomy({ hr, playing }) {
  return <group>
    <Lungs />
    <PulsingHeart hr={hr} playing={playing}/>
    <Organ position={[0,-1.35,0]} scale={[1.35,.48,.65]} color="#654c3d" />
    <Organ position={[-1.35,-1.2,0]} scale={[.35,.62,.32]} color="#5b3c58" />
    <mesh position={[0,1.65,0]} rotation={[0,0,0]}><cylinderGeometry args={[.13,.16,1.45,18]}/><meshStandardMaterial color="#a94253"/></mesh>
    <mesh position={[-.05,2.35,0]} rotation={[0,0,-.7]}><cylinderGeometry args={[.08,.08,1.1,16]}/><meshStandardMaterial color="#a94253"/></mesh>
    <mesh position={[.05,2.35,0]} rotation={[0,0,.7]}><cylinderGeometry args={[.08,.08,1.1,16]}/><meshStandardMaterial color="#a94253"/></mesh>
    <mesh position={[0,-1.95,0]} rotation={[0,0,.2]}><cylinderGeometry args={[.09,.06,1.5,16]}/><meshStandardMaterial color="#a94253"/></mesh>
    <mesh position={[-.7,-1.5,0]} rotation={[0,0,-1.3]}><cylinderGeometry args={[.055,.045,1.25,14]}/><meshStandardMaterial color="#a94253"/></mesh>
    <mesh position={[.7,-1.5,0]} rotation={[0,0,1.3]}><cylinderGeometry args={[.055,.045,1.25,14]}/><meshStandardMaterial color="#a94253"/></mesh>
  </group>;
}

export default function Model3D({ hr, playing }) {
  return <div style={{position:'absolute',inset:0}}>
    <Canvas shadows dpr={[1,2]}>
      <PerspectiveCamera makeDefault position={[0,0,8]} fov={42}/>
      <ambientLight intensity={1.5}/>
      <directionalLight position={[4,5,5]} intensity={2.2}/>
      <pointLight position={[-4,1,3]} intensity={1.2} color="#72dcb9"/>
      <Anatomy hr={hr} playing={playing}/>
      <OrbitControls enablePan={false} minDistance={5} maxDistance={12} target={[0,.1,0]}/>
    </Canvas>
  </div>;
}
