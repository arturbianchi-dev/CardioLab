import React, { Suspense, useMemo, useRef } from 'react';
import * as THREE from 'three';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera, useGLTF } from '@react-three/drei';

// Open/reference anatomy. We do not copy proprietary animations from commercial
// anatomy platforms; motion is recreated here from physiological timing.
const ASSETS = {
  heart: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Heart.glb',
  lungs: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Lung.glb',
  liver: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Liver.glb',
  spleen: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Spleen.glb',
  vasculature: 'https://ccf-ontology.hubmapconsortium.org/objects/v1.2/VH_M_Blood_Vasculature.glb',
};

function prepare(scene, targetHeight, opacity = 1) {
  const clone = scene.clone(true);
  clone.traverse((o) => {
    if (!o.isMesh) return;
    o.castShadow = true;
    o.receiveShadow = true;
    if (o.material) {
      o.material = o.material.clone();
      o.material.roughness = 0.58;
      o.material.metalness = 0.01;
      o.material.transparent = opacity < 1;
      o.material.opacity = opacity;
      if (opacity < 1) o.material.depthWrite = false;
    }
  });
  const box = new THREE.Box3().setFromObject(clone);
  const size = box.getSize(new THREE.Vector3());
  const center = box.getCenter(new THREE.Vector3());
  const scale = targetHeight / Math.max(size.y, 0.001);
  clone.position.sub(center);
  clone.scale.setScalar(scale);
  return clone;
}

function ReferenceAsset({ url, targetHeight, position, opacity = 1, rotation = [0, 0, 0] }) {
  const { scene } = useGLTF(url);
  const fitted = useMemo(() => prepare(scene, targetHeight, opacity), [scene, targetHeight, opacity]);
  fitted.position.set(...position);
  fitted.rotation.set(...rotation);
  return <primitive object={fitted} />;
}

function HeartMotion({ hr, playing }) {
  const ref = useRef();
  const inner = useRef();
  useFrame((state) => {
    if (!ref.current || !inner.current) return;
    const cycle = ((state.clock.elapsedTime * hr) / 60) % 1;
    // Fast systolic contraction + slower diastolic relaxation.
    const systole = cycle < 0.38 ? Math.sin((cycle / 0.38) * Math.PI) : 0;
    const active = playing ? systole : 0;
    const longitudinal = 1 - active * 0.045;
    const radial = 1 + active * 0.038;
    ref.current.scale.set(radial, longitudinal, radial);
    ref.current.rotation.z = -0.035 * active;
    inner.current.rotation.y = 0.012 * Math.sin(cycle * Math.PI * 2);
  });
  return (
    <group ref={ref}>
      <group ref={inner}>
        <ReferenceAsset url={ASSETS.heart} targetHeight={2.05} position={[0, 0.12, 0.28]} />
      </group>
    </group>
  );
}

// Major cardiovascular routes are intentionally separated from the mesh. This
// lets flow respond to physiology without deforming the reference anatomy.
const ROUTES = [
  // systemic arterial tree
  [[0, 0.2, 0.55], [0, 1.35, 0.55], [0.65, 1.85, 0.55], [1.15, 1.1, 0.55], [1.05, 0.05, 0.55], [0.6, -0.9, 0.55]],
  [[0, 0.2, 0.55], [0, 1.35, 0.55], [-0.65, 1.85, 0.55], [-1.15, 1.1, 0.55], [-1.05, 0.05, 0.55], [-0.6, -0.9, 0.55]],
  // systemic venous return
  [[0.6, -0.9, -0.05], [0.9, -1.35, -0.05], [0.55, -1.95, -0.05], [0, -1.45, -0.05], [0, 0.2, -0.05]],
  [[-0.6, -0.9, -0.05], [-0.9, -1.35, -0.05], [-0.55, -1.95, -0.05], [0, -1.45, -0.05], [0, 0.2, -0.05]],
  // pulmonary circulation
  [[0.15, 0.25, 0.35], [0.85, 0.75, 0.35], [1.15, 1.0, 0.35], [0.65, 1.35, 0.35], [0.15, 0.55, 0.35]],
  [[-0.15, 0.25, 0.35], [-0.85, 0.75, 0.35], [-1.15, 1.0, 0.35], [-0.65, 1.35, 0.35], [-0.15, 0.55, 0.35]],
];

function FlowNetwork({ playing, speed }) {
  const refs = useRef([]);
  const curves = useMemo(
    () => ROUTES.map((route) => new THREE.CatmullRomCurve3(route.map((p) => new THREE.Vector3(...p)), false, 'centripetal', 0.35)),
    []
  );
  const particles = useMemo(
    () => Array.from({ length: 96 }, (_, i) => ({ route: i % curves.length, t: (i / 96) % 1, phase: (i * 0.37) % 1 })),
    [curves]
  );

  useFrame((_, dt) => {
    if (!playing) return;
    refs.current.forEach((mesh, i) => {
      if (!mesh) return;
      const q = particles[i];
      q.t = (q.t + dt * 0.105 * speed * (0.85 + q.phase * 0.25)) % 1;
      const point = curves[q.route].getPointAt(q.t);
      mesh.position.copy(point);
      mesh.scale.setScalar(0.55 + 0.45 * Math.sin((q.t + q.phase) * Math.PI * 2) ** 2);
    });
  });

  return (
    <group>
      {particles.map((q, i) => (
        <mesh key={i} ref={(m) => { refs.current[i] = m; }}>
          <sphereGeometry args={[0.024, 8, 8]} />
          <meshBasicMaterial color={q.route < 2 || q.route >= 4 ? '#ef6671' : '#5e9cff'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

function VesselHighlight() {
  return (
    <group>
      <mesh position={[0, 1.75, 0.4]} rotation={[0, 0, 0.05]}>
        <cylinderGeometry args={[0.07, 0.095, 1.25, 16]} />
        <meshPhysicalMaterial color="#bd4d5c" roughness={0.35} transmission={0.1} clearcoat={0.35} />
      </mesh>
      <mesh position={[0.42, 1.85, 0.4]} rotation={[0, 0, -0.8]}>
        <cylinderGeometry args={[0.04, 0.055, 0.9, 14]} />
        <meshPhysicalMaterial color="#c35461" roughness={0.35} clearcoat={0.3} />
      </mesh>
      <mesh position={[-0.42, 1.85, 0.4]} rotation={[0, 0, 0.8]}>
        <cylinderGeometry args={[0.04, 0.055, 0.9, 14]} />
        <meshPhysicalMaterial color="#c35461" roughness={0.35} clearcoat={0.3} />
      </mesh>
    </group>
  );
}

function AnatomyScene({ hr, playing }) {
  const speed = Math.max(0.45, Math.min(2.1, hr / 72));
  return (
    <group>
      <ReferenceAsset url={ASSETS.vasculature} targetHeight={6.3} position={[0, 0.1, -0.25]} opacity={0.22} />
      <ReferenceAsset url={ASSETS.lungs} targetHeight={3.15} position={[0, 0.9, 0.02]} opacity={0.78} />
      <HeartMotion hr={hr} playing={playing} />
      <ReferenceAsset url={ASSETS.liver} targetHeight={1.72} position={[0.04, -1.16, 0.06]} opacity={0.88} />
      <ReferenceAsset url={ASSETS.spleen} targetHeight={1.14} position={[-0.84, -0.96, 0.06]} opacity={0.9} />
      <VesselHighlight />
      <FlowNetwork playing={playing} speed={speed} />
    </group>
  );
}

function Loading() {
  return <mesh><sphereGeometry args={[0.001, 4, 4]} /><meshBasicMaterial transparent opacity={0} /></mesh>;
}

export default function Model3D({ hr, playing }) {
  return (
    <div className="model-canvas">
      <Canvas
        shadows
        dpr={[1, 2]}
        gl={{ antialias: true, powerPreference: 'high-performance' }}
      >
        <color attach="background" args={['#030912']} />
        <fog attach="fog" args={['#030912', 7, 14]} />
        <PerspectiveCamera makeDefault position={[0, 0.15, 7.0]} fov={38} />
        <ambientLight intensity={0.95} />
        <hemisphereLight intensity={1.15} groundColor="#06111b" skyColor="#b9d8e6" />
        <directionalLight position={[4, 6, 5]} intensity={2.6} castShadow shadow-mapSize={[2048, 2048]} />
        <directionalLight position={[-4, 2, 3]} intensity={1.1} color="#77dcbc" />
        <pointLight position={[0, 0, 4]} intensity={1.0} color="#9ac7ff" />
        <Suspense fallback={<Loading />}>
          <AnatomyScene hr={hr} playing={playing} />
        </Suspense>
        <OrbitControls
          enablePan={false}
          minDistance={4.2}
          maxDistance={10.5}
          target={[0, 0, 0]}
          enableDamping
          dampingFactor={0.075}
          rotateSpeed={0.55}
          zoomSpeed={0.65}
        />
      </Canvas>
      <div className="anatomy-badge">REFERENCE ANATOMY · VISIBLE HUMAN / HuBMAP</div>
      <div className="anatomy-hint">DRAG TO ROTATE · SCROLL TO ZOOM</div>
    </div>
  );
}

Object.values(ASSETS).forEach((url) => useGLTF.preload(url));
