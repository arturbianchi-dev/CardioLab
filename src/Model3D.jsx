import React, { useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

const ROUTES = [
  [[0,0.75,0],[0,2.35,0],[1.1,2.25,0],[1.45,1.25,0],[1.15,0.1,0],[0.55,-0.85,0]],
  [[0,0.75,0],[0,2.35,0],[-1.1,2.25,0],[-1.45,1.25,0],[-1.15,0.1,0],[-0.55,-0.85,0]],
  [[0.55,-0.85,0],[0.9,-1.55,0],[0,-2.15,0],[-0.9,-1.55,0],[-0.55,-0.85,0]],
  [[-0.55,-0.85,0],[-1.25,-0.35,0],[-1.7,0.75,0],[-1.25,1.35,0],[-0.75,1.0,0],[0,0.75,0]],
];

function Tube({ points, radius=.035, color='#c95261' }) {
  const curve = useMemo(() => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p))), [points]);
  return <mesh><tubeGeometry args={[curve, 40, radius, 8, false]}/><meshStandardMaterial color={color} roughness={.45} metalness={.05}/></mesh>;
}

function BloodFlow({ playing, speed=1 }) {
  const refs = useRef([]);
  const curves = useMemo(() => ROUTES.map(points => new THREE.CatmullRomCurve3(points.map(p => new THREE.Vector3(...p)))), []);
  const particles = useMemo(() => Array.from({length:32}, (_,i) => ({route:i%curves.length, offset:(i/32)})), [curves]);
  useFrame((_, delta) => {
    if (!playing) return;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const item = particles[i];
      item.offset = (item.offset + delta * .16 * speed) % 1;
      const point = curves[item.route].getPointAt(item.offset);
      mesh.position.copy(point);
    });
  });
  return <>{particles.map((item,i) => <mesh key={i} ref={el => refs.current[i]=el} position={curves[item.route].getPointAt(item.offset)}>
    <sphereGeometry args={[.045,8,8]}/><meshBasicMaterial color={item.route===3?'#69a8ff':'#ef6d76'}/>
  </mesh>)}</>;
}

function PulsingHeart({ hr, playing }) {
  const ref = useRef();
  useFrame((state) => {
    const phase = ((state.clock.elapsedTime * hr) / 60) % 1;
    const pulse = playing ? 1 + Math.max(0, Math.sin(phase * Math.PI * 2)) * .055 : 1;
    if (ref.current) ref.current.scale.setScalar(pulse);
  });
  return <group ref={ref} position={[0,.55,0]}>
    <mesh position={[-.28,.25,0]} scale={[.42,.48,.36]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#b94658" roughness={.5}/></mesh>
    <mesh position={[.28,.25,0]} scale={[.42,.48,.36]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#b94658" roughness={.5}/></mesh>
    <mesh position={[0,-.05,0]} scale={[.56,.75,.42]} rotation={[0,0,-.12]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#8f3047" roughness={.48}/></mesh>
  </group>;
}
function Lungs(){return <><mesh position={[-1.25,.7,0]} scale={[.65,1.25,.55]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#456d7b" transparent opacity={.82}/></mesh><mesh position={[1.25,.7,0]} scale={[.65,1.25,.55]}><sphereGeometry args={[1,32,20]}/><meshStandardMaterial color="#456d7b" transparent opacity={.82}/></mesh></>}
function Organ({position,scale,color}){return <mesh position={position} scale={scale}><sphereGeometry args={[1,28,18]}/><meshStandardMaterial color={color} roughness={.7}/></mesh>}

function Anatomy({hr,playing}){return <group>
  <Lungs/><PulsingHeart hr={hr} playing={playing}/>
  <Organ position={[0,-1.35,0]} scale={[1.35,.48,.65]} color="#654c3d"/><Organ position={[-1.35,-1.2,0]} scale={[.35,.62,.32]} color="#5b3c58"/>
  <Tube points={ROUTES[0]} radius={.065}/><Tube points={ROUTES[1]} radius={.065}/><Tube points={ROUTES[2]} radius={.055}/><Tube points={ROUTES[3]} radius={.055} color="#4d82c0"/>
  <BloodFlow playing={playing} speed={Math.max(.45,Math.min(1.8,hr/72))}/>
</group>}

export default function Model3D({hr,playing}){return <div style={{position:'absolute',inset:0}}><Canvas shadows dpr={[1,2]}><PerspectiveCamera makeDefault position={[0,0,8]} fov={42}/><ambientLight intensity={1.5}/><directionalLight position={[4,5,5]} intensity={2.2}/><pointLight position={[-4,1,3]} intensity={1.2} color="#72dcb9"/><Anatomy hr={hr} playing={playing}/><OrbitControls enablePan={false} minDistance={5} maxDistance={12} target={[0,.1,0]}/></Canvas></div>}
